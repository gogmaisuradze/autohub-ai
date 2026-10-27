/**
 * AutoHub AI - 4G OBD Stop Detection & Parking Inference Engine
 *
 * Algorithm:
 * 1. Collects sliding window of telemetry readings.
 * 2. Filters out stale telemetry (age > maxStaleSec) and low accuracy GNSS (accuracy > maxAccuracyMeters).
 * 3. Distinguishes traffic jam / red light (short stop with ignition ON) vs actual parking.
 * 4. Resolves spatial proximity to known parking lots with multi-candidate disambiguation.
 */

import { DeviceTelemetryReading } from '../types/telemetry';
import { ParkingLocationLot } from '../types/parking';
import { DELINEATED_PARKING_ZONES, DelineatedParkingZone } from '../constants/parkingZones';

export interface StopDetectorConfig {
  minDwellSeconds: number; // Duration vehicle must be stopped before parking hypothesis (default: 180s = 3 min)
  maxStopSpeedKmh: number; // Speed below which vehicle is considered stationary (default: 2.5 km/h)
  minConsecutiveReadings: number; // Minimum stationary readings needed (default: 3)
  maxStaleDataAgeSec: number; // Max age of reading before discarded as stale (default: 120s)
  maxGpsAccuracyMeters: number; // Max horizontal GPS accuracy threshold (default: 45m)
  candidateSearchRadiusMeters: number; // Radius to search for nearby parking lots (default: 65m)
}

export const DEFAULT_DETECTOR_CONFIG: StopDetectorConfig = {
  minDwellSeconds: 180,
  maxStopSpeedKmh: 2.5,
  minConsecutiveReadings: 3,
  maxStaleDataAgeSec: 120,
  maxGpsAccuracyMeters: 45,
  candidateSearchRadiusMeters: 65
};

export type StopClassification = 'moving' | 'traffic_stop' | 'probable_stop';

export interface StopDetectionResult {
  status: StopClassification;
  confidence: 'none' | 'low' | 'medium' | 'high';
  stationaryDurationSeconds: number;
  stoppedLocation: { lat: number; lng: number } | null;
  matchedLot: DelineatedParkingZone | null;
  candidateLots: DelineatedParkingZone[];
  isAmbiguous: boolean;
  reason: string;
  readingTimestamp: string;
}

// Haversine distance in meters
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Ray-casting point in polygon
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  if (!polygon || polygon.length < 3) return false;
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

export class ParkingStopDetector {
  private config: StopDetectorConfig;
  private history: DeviceTelemetryReading[] = [];
  private firstStopTimestamp: number | null = null;
  private lastKnownStopLocation: { lat: number; lng: number } | null = null;

  constructor(config: Partial<StopDetectorConfig> = {}) {
    this.config = { ...DEFAULT_DETECTOR_CONFIG, ...config };
  }

  public reset() {
    this.history = [];
    this.firstStopTimestamp = null;
    this.lastKnownStopLocation = null;
  }

  public updateConfig(newConfig: Partial<StopDetectorConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Process a single incoming telemetry reading from 4G OBD
   */
  public processReading(reading: DeviceTelemetryReading, nowMs: number = Date.now()): StopDetectionResult {
    const recordedMs = new Date(reading.recordedAt).getTime();
    const ageSeconds = (nowMs - recordedMs) / 1000;

    // 1. Stale Data Filter
    if (ageSeconds > this.config.maxStaleDataAgeSec) {
      return {
        status: 'moving',
        confidence: 'none',
        stationaryDurationSeconds: 0,
        stoppedLocation: null,
        matchedLot: null,
        candidateLots: [],
        isAmbiguous: false,
        reason: `ძველი მონაცემი (${Math.round(ageSeconds)} წმ-ის წინანდელი). უარყოფილია.`,
        readingTimestamp: reading.recordedAt
      };
    }

    // 2. GNSS Availability & Accuracy Check
    if (reading.latitude === null || reading.longitude === null) {
      return {
        status: 'moving',
        confidence: 'none',
        stationaryDurationSeconds: 0,
        stoppedLocation: null,
        matchedLot: null,
        candidateLots: [],
        isAmbiguous: false,
        reason: 'GNSS/GPS ლოკაცია მიუწვდომელია მოწყობილობისგან.',
        readingTimestamp: reading.recordedAt
      };
    }

    if (reading.accuracyMeters !== null && reading.accuracyMeters > this.config.maxGpsAccuracyMeters) {
      return {
        status: 'moving',
        confidence: 'none',
        stationaryDurationSeconds: 0,
        stoppedLocation: null,
        matchedLot: null,
        candidateLots: [],
        isAmbiguous: false,
        reason: `GPS ცდომილება მაღალია (±${Math.round(reading.accuracyMeters)}მ > ${this.config.maxGpsAccuracyMeters}მ ზღვარზე).`,
        readingTimestamp: reading.recordedAt
      };
    }

    // Add to sliding window (keep last 20 readings)
    this.history = [...this.history.slice(-19), reading];

    const currentSpeed = reading.speedKmh ?? 0;
    const isSpeedZero = currentSpeed <= this.config.maxStopSpeedKmh;

    // 3. Movement check
    if (!isSpeedZero) {
      this.firstStopTimestamp = null;
      this.lastKnownStopLocation = null;
      return {
        status: 'moving',
        confidence: 'none',
        stationaryDurationSeconds: 0,
        stoppedLocation: null,
        matchedLot: null,
        candidateLots: [],
        isAmbiguous: false,
        reason: `მანქანა მოძრაობს (${currentSpeed.toFixed(1)} კმ/სთ).`,
        readingTimestamp: reading.recordedAt
      };
    }

    // 4. Vehicle is stationary (speed <= maxStopSpeedKmh)
    if (!this.firstStopTimestamp) {
      this.firstStopTimestamp = recordedMs;
      this.lastKnownStopLocation = { lat: reading.latitude, lng: reading.longitude };
    }

    const stationaryDuration = Math.max(0, (recordedMs - this.firstStopTimestamp) / 1000);
    const stoppedPoint: [number, number] = [reading.latitude, reading.longitude];

    // Check consecutive stationary readings
    const stationaryReadingsCount = this.history.filter(
      r => (r.speedKmh ?? 0) <= this.config.maxStopSpeedKmh
    ).length;

    // 5. Traffic Jam / Red Light Filter:
    // If ignition is true and duration < minDwellSeconds, it is classified as traffic stop
    if (reading.ignition === true && stationaryDuration < this.config.minDwellSeconds) {
      return {
        status: 'traffic_stop',
        confidence: 'low',
        stationaryDurationSeconds: Math.round(stationaryDuration),
        stoppedLocation: this.lastKnownStopLocation,
        matchedLot: null,
        candidateLots: [],
        isAmbiguous: false,
        reason: `საცობი / შუქნიშანი (ანთება ჩართულია, გაჩერებულია ${Math.round(stationaryDuration)} წმ < ${this.config.minDwellSeconds} წმ ზღვარზე).`,
        readingTimestamp: reading.recordedAt
      };
    }

    // 6. Check if qualifies for Probable Parking Stop:
    // Either ignition is OFF (instant high confidence) OR duration >= minDwellSeconds with enough readings
    const isIgnitionOff = reading.ignition === false;
    const isDwellMet = stationaryDuration >= this.config.minDwellSeconds;
    const hasEnoughReadings = stationaryReadingsCount >= this.config.minConsecutiveReadings;

    if (!isIgnitionOff && (!isDwellMet || !hasEnoughReadings)) {
      return {
        status: 'traffic_stop',
        confidence: 'low',
        stationaryDurationSeconds: Math.round(stationaryDuration),
        stoppedLocation: this.lastKnownStopLocation,
        matchedLot: null,
        candidateLots: [],
        isAmbiguous: false,
        reason: `გაჩერების ხანგრძლივობა (${Math.round(stationaryDuration)} წმ) ჯერ არ აღწევს პარკირების ზღვარს (${this.config.minDwellSeconds} წმ).`,
        readingTimestamp: reading.recordedAt
      };
    }

    // 7. Spatial Matching with Known Parking Lots
    const candidateLots: { lot: DelineatedParkingZone; distance: number; isInside: boolean }[] = [];

    for (const lot of DELINEATED_PARKING_ZONES) {
      let isInside = false;
      if (lot.geometry?.polygon && lot.geometry.polygon.length >= 3) {
        isInside = isPointInPolygon(stoppedPoint, lot.geometry.polygon);
      }

      const dist = calculateDistanceMeters(
        stoppedPoint[0],
        stoppedPoint[1],
        lot.geometry.center[0],
        lot.geometry.center[1]
      );

      if (isInside || dist <= this.config.candidateSearchRadiusMeters) {
        candidateLots.push({ lot, distance: dist, isInside });
      }
    }

    // Sort by containment first, then distance
    candidateLots.sort((a, b) => {
      if (a.isInside && !b.isInside) return -1;
      if (!a.isInside && b.isInside) return 1;
      return a.distance - b.distance;
    });

    const isAmbiguous = candidateLots.length > 1;
    const matchedLot = candidateLots.length > 0 ? candidateLots[0].lot : null;

    let confidence: 'low' | 'medium' | 'high' = 'medium';
    if (isIgnitionOff && matchedLot && !isAmbiguous) {
      confidence = 'high';
    } else if (!isIgnitionOff && isAmbiguous) {
      confidence = 'low';
    }

    return {
      status: 'probable_stop',
      confidence,
      stationaryDurationSeconds: Math.round(stationaryDuration),
      stoppedLocation: this.lastKnownStopLocation,
      matchedLot,
      candidateLots: candidateLots.map(c => c.lot),
      isAmbiguous,
      reason: isIgnitionOff
        ? `ძრავი/ანთება გამოირთო (${Math.round(stationaryDuration)} წმ გაჩერებული). სავარაუდო პარკირება.`
        : `ავტომობილი უძრავია ${Math.round(stationaryDuration / 60)} წუთის განმავლობაში. სავარაუდო პარკირება.`,
      readingTimestamp: reading.recordedAt
    };
  }
}

export const parkingStopDetector = new ParkingStopDetector();
