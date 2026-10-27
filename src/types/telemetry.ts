/**
 * AutoHub AI - 4G OBD Unified Telemetry Format
 * Strictly follows specification:
 * deviceId, vehicleId, recordedAt, receivedAt, latitude, longitude, accuracyMeters, speedKmh, ignition.
 * Missing/unsupported hardware sensors must be null, never fabricated!
 */

export interface DeviceTelemetryReading {
  deviceId: string; // e.g. "OBD4G-IMEI-863412059123456"
  vehicleId: string; // e.g. "CAR_01"
  recordedAt: string; // ISO 8601 UTC timestamp on device
  receivedAt: string; // ISO 8601 UTC timestamp on server
  latitude: number | null; // GNSS latitude (null if no fix or no GPS module)
  longitude: number | null; // GNSS longitude (null if no fix or no GPS module)
  accuracyMeters: number | null; // Dilution of precision / horizontal accuracy
  speedKmh: number | null; // Vehicle OBD speed or GNSS ground speed
  ignition: boolean | null; // true: Engine/ACC ON, false: OFF, null: unsupported

  // Optional auxiliary metrics (if supported by OBD chipset)
  batteryVoltage?: number | null; // OBD pin 16 supply voltage (e.g. 12.6V or 14.2V)
  rpm?: number | null;
  gsmSignalDbm?: number | null; // e.g. -75 dBm
  satellitesCount?: number | null;
}

export interface Obd4gDeviceMetadata {
  deviceId: string;
  imei: string; // 15-digit international mobile equipment identity
  serialNumber: string;
  vehicleId: string;
  label: string;
  hasGnss: boolean; // Does device hardware include GPS/GNSS receiver?
  hasIgnitionWire: boolean; // Does it detect ACC wire or calculate via voltage surge?
  firmwareVersion: string;
  registeredAt: string;
  lastHeartbeatAt: string | null;
  status: 'online' | 'offline' | 'unpaired';
  mode: 'real' | 'demo';
}
