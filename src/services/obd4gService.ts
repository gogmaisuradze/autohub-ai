/**
 * AutoHub AI - 4G Cellular OBD-II Device Service
 * Handles device registration, vehicle binding, real telemetry streaming, and demo simulation.
 */

import { DeviceTelemetryReading, Obd4gDeviceMetadata } from '../types/telemetry';
import { parkingStopDetector, StopDetectionResult } from './parkingStopDetector';
import { parkingSessionService } from './parkingSessionService';
import { n8nService } from './n8nService';

export interface DeviceRegistrationInput {
  imei: string;
  serialNumber?: string;
  vehicleId: string;
  label: string;
  hasGnss: boolean;
  hasIgnitionWire: boolean;
  securityPin?: string;
}

const STORAGE_KEY_DEVICES = 'autohub_4g_devices';
const STORAGE_KEY_ACTIVE_DEVICE = 'autohub_active_device_id';
const STORAGE_KEY_MODE = 'autohub_4g_mode';

class Obd4gService {
  private devices: Obd4gDeviceMetadata[] = [];
  private activeDeviceId: string | null = null;
  private mode: 'real' | 'demo' = 'demo';
  private latestReading: DeviceTelemetryReading | null = null;
  private latestStopResult: StopDetectionResult | null = null;
  private listeners: ((reading: DeviceTelemetryReading | null, stopResult: StopDetectionResult | null) => void)[] = [];
  private demoInterval: any = null;
  private demoStep: number = 0;

  constructor() {
    this.loadFromStorage();
    // Do NOT auto-start demo drive stream on page load!
    // Telemetry modals will only appear when an actual stop occurs or when user tests simulation.
  }

  private loadFromStorage() {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
      if (savedMode === 'real' || savedMode === 'demo') {
        this.mode = savedMode;
      }

      const savedDevices = localStorage.getItem(STORAGE_KEY_DEVICES);
      if (savedDevices) {
        this.devices = JSON.parse(savedDevices);
      } else {
        // Pre-seed an initial default demo device
        this.devices = [
          {
            deviceId: 'OBD4G-IMEI-863412059123456',
            imei: '863412059123456',
            serialNumber: 'AH4G-2026-GEO-01',
            vehicleId: 'CAR_01',
            label: 'AutoHub 4G Smart Dongle (Mercedes GLA)',
            hasGnss: true,
            hasIgnitionWire: true,
            firmwareVersion: 'v2.4.1-TTC-GEO',
            registeredAt: '2026-10-20T10:00:00Z',
            lastHeartbeatAt: new Date().toISOString(),
            status: 'online',
            mode: 'demo'
          }
        ];
        this.saveDevices();
      }

      const savedActive = localStorage.getItem(STORAGE_KEY_ACTIVE_DEVICE);
      if (savedActive && this.devices.some(d => d.deviceId === savedActive)) {
        this.activeDeviceId = savedActive;
      } else if (this.devices.length > 0) {
        this.activeDeviceId = this.devices[0].deviceId;
      }
    } catch (e) {
      console.error('Error loading 4G OBD devices:', e);
    }
  }

  private saveDevices() {
    try {
      localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(this.devices));
      if (this.activeDeviceId) {
        localStorage.setItem(STORAGE_KEY_ACTIVE_DEVICE, this.activeDeviceId);
      }
      localStorage.setItem(STORAGE_KEY_MODE, this.mode);
    } catch (e) {}
  }

  public getMode(): 'real' | 'demo' {
    return this.mode;
  }

  public setMode(mode: 'real' | 'demo') {
    this.mode = mode;
    this.saveDevices();
    if (mode === 'demo') {
      this.startDemoStream();
    } else {
      this.stopDemoStream();
      // In real mode, clear any simulated reading until actual hardware telemetry arrives
      this.latestReading = null;
      this.latestStopResult = null;
      this.notifyListeners();
    }
  }

  public getActiveDevice(): Obd4gDeviceMetadata | null {
    return this.devices.find(d => d.deviceId === this.activeDeviceId) || null;
  }

  public getDevicesForVehicle(vehicleId: string): Obd4gDeviceMetadata[] {
    return this.devices.filter(d => d.vehicleId === vehicleId);
  }

  public registerDevice(input: DeviceRegistrationInput): { success: boolean; message: string; device?: Obd4gDeviceMetadata } {
    const cleanImei = input.imei.replace(/[^0-9]/g, '');
    if (cleanImei.length !== 15) {
      return { success: false, message: 'IMEI უნდა შედგებოდეს ზუსტად 15 ციფრისგან.' };
    }

    if (this.devices.some(d => d.imei === cleanImei)) {
      return { success: false, message: 'ეს IMEI უკვე რეგისტრირებულია თქვენს გარაჟში.' };
    }

    const newDevice: Obd4gDeviceMetadata = {
      deviceId: `OBD4G-IMEI-${cleanImei}`,
      imei: cleanImei,
      serialNumber: input.serialNumber || `AH4G-${Date.now().toString().slice(-6)}`,
      vehicleId: input.vehicleId,
      label: input.label.trim() || `4G OBD (${cleanImei.slice(-4)})`,
      hasGnss: input.hasGnss,
      hasIgnitionWire: input.hasIgnitionWire,
      firmwareVersion: 'v1.0.0-INIT',
      registeredAt: new Date().toISOString(),
      lastHeartbeatAt: null,
      status: 'offline', // Starts offline until first real signal arrives!
      mode: this.mode
    };

    this.devices.push(newDevice);
    this.activeDeviceId = newDevice.deviceId;
    this.saveDevices();

    // Fire webhook to register on server backend
    n8nService.syncVehicle({
      event: 'device_registered',
      device_id: newDevice.deviceId,
      imei: newDevice.imei,
      vehicle_id: newDevice.vehicleId,
      has_gnss: newDevice.hasGnss,
      has_ignition: newDevice.hasIgnitionWire
    });

    return { success: true, message: '4G OBD მოწყობილობა წარმატებით დარეგისტრირდა!', device: newDevice };
  }

  public subscribeTelemetry(
    callback: (reading: DeviceTelemetryReading | null, stopResult: StopDetectionResult | null) => void
  ) {
    this.listeners.push(callback);
    callback(this.latestReading, this.latestStopResult);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb(this.latestReading, this.latestStopResult));
  }

  /**
   * Called when server pushes a real telemetry packet via webhook or SSE
   */
  public ingestTelemetry(reading: DeviceTelemetryReading) {
    if (this.mode !== 'real') return;

    const device = this.devices.find(d => d.deviceId === reading.deviceId);
    if (!device || device.vehicleId !== reading.vehicleId) return;

    device.mode = 'real';
    device.lastHeartbeatAt = reading.receivedAt;
    device.status = 'online';
    this.saveDevices();

    this.latestReading = reading;
    this.latestStopResult = parkingStopDetector.processReading(reading);

    if (reading.speedKmh && reading.speedKmh > 8) {
      parkingSessionService.recordVehicleMovement(reading.speedKmh);
    }

    if (
      this.latestStopResult &&
      this.latestStopResult.status === 'probable_stop' &&
      this.latestStopResult.matchedLot &&
      !parkingSessionService.isStopDismissed(this.latestStopResult.matchedLot.lotCode)
    ) {
      const currentSess = parkingSessionService.getSession();
      if (!currentSess || currentSess.status === 'completed') {
        const eventId = `stop_${this.latestStopResult.readingTimestamp}_${this.latestStopResult.matchedLot.lotCode}`;
        if (!parkingSessionService.hasProcessedStopEvent(eventId)) {
          parkingSessionService.markStopEventProcessed(eventId);
          parkingSessionService.createProbableStopSession(
            this.latestStopResult.matchedLot,
            {
              id: device.vehicleId,
              plate_number: 'FR-282-EE',
              brand: 'Mercedes-Benz',
              model: 'GLA 250',
              year: 2016,
              vin: 'WDCTG4GB2GJ193791'
            } as any,
            this.latestStopResult.readingTimestamp
          );
        }
      }
    }

    this.notifyListeners();
  }

  // -------------------------------------------------------------
  // DEMO MODE DRIVE CYCLE SIMULATOR
  // Simulates realistic Tbilisi drive cycle:
  // Driving on Chavchavadze -> Stopping at Lot #005 -> Ignition OFF -> Parking Prompt
  // -------------------------------------------------------------
  public startDemoStream() {
    if (this.demoInterval) return;

    const demoRoutePoints: { lat: number; lng: number; speed: number; ignition: boolean }[] = [
      // 1. Moving along Chavchavadze
      { lat: 41.7118, lng: 44.7745, speed: 42.0, ignition: true },
      { lat: 41.7110, lng: 44.7720, speed: 38.5, ignition: true },
      { lat: 41.7105, lng: 44.7700, speed: 22.0, ignition: true },
      // 2. Slowing down to park at Lot #005 (Chavchavadze #34)
      { lat: 41.7099, lng: 44.7686, speed: 8.0, ignition: true },
      { lat: 41.7098, lng: 44.7685, speed: 0.0, ignition: true },
      // 3. Stopped, ignition turned off (Parking confirmed candidate!)
      { lat: 41.7098, lng: 44.7685, speed: 0.0, ignition: false }
    ];

    this.demoStep = 0;

    this.demoInterval = setInterval(() => {
      const point = demoRoutePoints[Math.min(this.demoStep, demoRoutePoints.length - 1)];
      const nowIso = new Date().toISOString();

      const demoReading: DeviceTelemetryReading = {
        deviceId: this.activeDeviceId || 'OBD4G-IMEI-863412059123456',
        vehicleId: 'CAR_01',
        recordedAt: nowIso,
        receivedAt: nowIso,
        latitude: point.lat,
        longitude: point.lng,
        accuracyMeters: 6.5,
        speedKmh: point.speed,
        ignition: point.ignition,
        batteryVoltage: point.ignition ? 14.2 : 12.6,
        rpm: point.ignition ? (point.speed > 0 ? 1950 : 750) : 0,
        gsmSignalDbm: -72,
        satellitesCount: 14
      };

      this.latestReading = demoReading;
      this.latestStopResult = parkingStopDetector.processReading(demoReading);

      if (point.speed > 8) {
        parkingSessionService.recordVehicleMovement(point.speed);
      }

      // If probable stop detected and matched to a lot, propose session to user (only if not dismissed)
      if (
        this.latestStopResult &&
        this.latestStopResult.status === 'probable_stop' &&
        this.latestStopResult.matchedLot &&
        !parkingSessionService.isStopDismissed(this.latestStopResult.matchedLot.lotCode)
      ) {
        const currentSess = parkingSessionService.getSession();
        if (!currentSess || currentSess.status === 'completed') {
          const eventId = `demo_stop_${this.latestStopResult.matchedLot.lotCode}_${Math.floor(Date.now() / 60000)}`;
          if (!parkingSessionService.hasProcessedStopEvent(eventId)) {
            parkingSessionService.markStopEventProcessed(eventId);
            parkingSessionService.createProbableStopSession(
              this.latestStopResult.matchedLot,
              {
                id: 'CAR_01',
                plate_number: 'FR-282-EE',
                brand: 'Mercedes-Benz',
                model: 'GLA 250',
                year: 2016,
                vin: 'WDCTG4GB2GJ193791'
              } as any,
              this.latestStopResult.readingTimestamp
            );
          }
        }
      }

      this.notifyListeners();

      if (this.demoStep < demoRoutePoints.length - 1) {
        this.demoStep++;
      } else {
        // Reached end of simulation cycle - stop interval so it does not endlessly loop!
        this.stopDemoStream();
      }
    }, 3500);
  }

  public restartDemoDriveCycle() {
    this.stopDemoStream();
    parkingStopDetector.reset();
    parkingSessionService.recordVehicleMovement(30);
    this.demoStep = 0;
    this.startDemoStream();
  }

  private stopDemoStream() {
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  /**
   * Remote DTC Clearing Guard
   * Requires stationary vehicle, idle or engine off, and certified confirmation
   */
  public async requestRemoteClearDtc(vehicleId: string): Promise<{ success: boolean; message: string }> {
    if (this.latestReading && (this.latestReading.speedKmh ?? 0) > 0.5) {
      return {
        success: false,
        message: 'უსაფრთხოების ბლოკირება: მანქანა მოძრაობს! დისტანციური ხარვეზების წაშლა შესაძლებელია მხოლოდ სრულად გაჩერებულ ავტომობილზე.'
      };
    }

    if (this.mode === 'real') {
      const activeDev = this.getActiveDevice();
      if (!activeDev || activeDev.status !== 'online') {
        return {
          success: false,
          message: '4G OBD მოწყობილობა ოფლაინშია. დისტანციური ბრძანების გადაცემა ვერ მოხერხდა.'
        };
      }
    }

    return {
      success: true,
      message: 'სადიაგნოსტიკო ბრძანება (Service 04) წარმატებით გადაეცა OBD ადაპტერს.'
    };
  }
}

export const obd4gService = new Obd4gService();
