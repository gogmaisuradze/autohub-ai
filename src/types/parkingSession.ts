/**
 * AutoHub AI - Parking Session State Machine
 * Strictly separates:
 * 1. probable_stop (სავარაუდო გაჩერება - telemetry detected)
 * 2. user_confirmed_parking (მომხმარებლის მიერ დადასტურებული პარკირება)
 * 3. reminder_active (შიდა შეხსენება ჩართულია - AutoHub timer)
 * 4. operator_activated (ოპერატორთან ოფიციალურად გააქტიურებულია - ONLY with signed operator response!)
 * 5. completed (დასრულებულია)
 */

import { ParkingLocationLot } from './parking';

export type ParkingSessionStatus =
  | 'probable_stop'
  | 'user_confirmed_parking'
  | 'reminder_active'
  | 'operator_activated'
  | 'completed';

export interface OperatorActivationRecord {
  isActivated: boolean;
  operatorName: string; // e.g. "თბილისის სატრანსპორტო კომპანია (TTC)"
  transactionId: string;
  responseTimestamp: string;
  paidAmountGel: number;
  receiptNumber: string;
  officialExpiresAt?: string;
}

export interface ParkingSession {
  sessionId: string;
  vehicleId: string;
  plateNumber: string;
  status: ParkingSessionStatus;
  lot: ParkingLocationLot;
  manualLotCode?: string;

  // Timestamps (ISO UTC)
  stoppedAt: string;
  confirmedAt?: string;
  expiresAt: string; // Free 15 min or 1-hour interval expiration
  completedAt?: string;

  // Reminders Configuration
  reminderMinutesBefore: number; // e.g. 5, 10, or 15 minutes
  reminderScheduledAt?: string;
  reminderTriggered: boolean;

  // Official Operator Status (ONLY valid if verified by municipal API)
  operatorActivation?: OperatorActivationRecord;

  // Client / Server synchronization
  isSyncedWithServer: boolean;
  serverSyncTimestamp?: string;
}
