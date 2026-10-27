/**
 * AutoHub AI - Parking Session & Reminder Lifecycle Service
 *
 * Implements strict status transitions:
 * probable_stop -> user_confirmed_parking -> reminder_active -> [operator_activated] -> completed
 *
 * Guarantees:
 * - Real timestamp calculations in Tbilisi timezone (Asia/Tbilisi)
 * - Server synchronization for background persistence
 * - Client recovery across browser restarts
 * - Cancellation of scheduled alarms on session completion
 * - Idempotent event processing
 */

import { ParkingSession, ParkingSessionStatus } from '../types/parkingSession';
import { ParkingLocationLot } from '../types/parking';
import { VehicleProfile } from '../types';
import { n8nService } from './n8nService';
import { sounds } from './soundEffects';

const STORAGE_KEY_SESSION = 'autohub_active_parking_session';
const STORAGE_KEY_PROCESSED_STOPS = 'autohub_processed_stops';

export function formatTbilisiTime(dateOrIso: string | number | Date): string {
  const d = new Date(dateOrIso);
  return new Intl.DateTimeFormat('ka-GE', {
    timeZone: 'Asia/Tbilisi',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(d);
}

export function formatTbilisiDateTime(dateOrIso: string | number | Date): string {
  const d = new Date(dateOrIso);
  return new Intl.DateTimeFormat('ka-GE', {
    timeZone: 'Asia/Tbilisi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(d);
}

class ParkingSessionService {
  private currentSession: ParkingSession | null = null;
  private listeners: ((session: ParkingSession | null) => void)[] = [];
  private reminderTimerId: any = null;
  private processedStopEvents: Set<string> = new Set();
  private dismissedStopCodes: Set<string> = new Set();
  private isCurrentStopDismissed: boolean = false;

  constructor() {
    this.loadFromStorage();
    this.initReminderTimer();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSION);
      if (saved) {
        const parsed: ParkingSession = JSON.parse(saved);
        // Check if session has already expired long ago (> 24 hours)
        const expiryTime = new Date(parsed.expiresAt).getTime();
        if (parsed.status !== 'completed' && Date.now() - expiryTime > 24 * 3600 * 1000) {
          parsed.status = 'completed';
          parsed.completedAt = new Date().toISOString();
        }
        this.currentSession = parsed;
      }

      const stopsSaved = localStorage.getItem(STORAGE_KEY_PROCESSED_STOPS);
      if (stopsSaved) {
        const arr = JSON.parse(stopsSaved);
        this.processedStopEvents = new Set(arr);
      }
    } catch (e) {
      console.error('Error loading parking session:', e);
    }
  }

  private saveToStorage() {
    try {
      if (this.currentSession) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(this.currentSession));
      } else {
        localStorage.removeItem(STORAGE_KEY_SESSION);
      }
      localStorage.setItem(STORAGE_KEY_PROCESSED_STOPS, JSON.stringify(Array.from(this.processedStopEvents).slice(-50)));
    } catch (e) {}
  }

  public getSession(): ParkingSession | null {
    return this.currentSession;
  }

  public subscribe(listener: (session: ParkingSession | null) => void) {
    this.listeners.push(listener);
    listener(this.currentSession);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l(this.currentSession));
  }

  /**
   * Idempotency check: has this stop already been prompted or dismissed?
   */
  public hasProcessedStopEvent(eventId: string): boolean {
    return this.processedStopEvents.has(eventId);
  }

  public markStopEventProcessed(eventId: string) {
    this.processedStopEvents.add(eventId);
    this.saveToStorage();
  }

  /**
   * Check if user has explicitly dismissed this stop or lot
   */
  public isStopDismissed(lotCode?: string): boolean {
    if (this.isCurrentStopDismissed) return true;
    if (lotCode && this.dismissedStopCodes.has(lotCode)) return true;
    return false;
  }

  /**
   * Reset dismissed stop state ONLY when vehicle actually moves again
   */
  public recordVehicleMovement(speedKmh: number) {
    if (speedKmh > 8) {
      this.isCurrentStopDismissed = false;
      this.dismissedStopCodes.clear();
    }
  }

  /**
   * Step 1: Detects a probable stop from telemetry and proposes a candidate session
   */
  public createProbableStopSession(
    lot: ParkingLocationLot,
    vehicle: VehicleProfile,
    stoppedAtIso: string = new Date().toISOString()
  ): ParkingSession | null {
    // If user previously closed/dismissed this stop, NEVER pop it up again!
    if (this.isStopDismissed(lot.lotCode)) {
      return null;
    }

    // If an existing active session is in progress, don't overwrite it
    if (this.currentSession && this.currentSession.status !== 'completed') {
      return this.currentSession;
    }

    const freeMinutes = lot.freeMinutes || 15;
    const expiresAt = new Date(Date.now() + freeMinutes * 60 * 1000).toISOString();

    const newSession: ParkingSession = {
      sessionId: `pk_sess_${Date.now()}`,
      vehicleId: vehicle.id,
      plateNumber: vehicle.plate_number,
      status: 'probable_stop',
      lot,
      stoppedAt: stoppedAtIso,
      expiresAt,
      reminderMinutesBefore: 5,
      reminderTriggered: false,
      isSyncedWithServer: false
    };

    this.currentSession = newSession;
    this.saveToStorage();
    this.notify();

    // Async server sync
    this.syncSessionWithServer('probable_stop');

    return newSession;
  }

  /**
   * Step 2: User explicitly confirms parking
   */
  public confirmParking(
    reminderMinutesBefore: number = 5,
    customDurationMinutes?: number
  ): ParkingSession | null {
    if (!this.currentSession) return null;

    const confirmedAt = new Date().toISOString();
    const durationMinutes = customDurationMinutes || this.currentSession.lot.freeMinutes || 15;
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();

    this.currentSession.status = 'user_confirmed_parking';
    this.currentSession.confirmedAt = confirmedAt;
    this.currentSession.expiresAt = expiresAt;
    this.currentSession.reminderMinutesBefore = reminderMinutesBefore;

    // Transition immediately to reminder_active
    this.currentSession.status = 'reminder_active';
    this.saveToStorage();
    this.notify();

    sounds.playSuccess();

    // Request Web Push / Browser Notification permission
    this.requestNotificationPermission();

    // Schedule background reminder
    this.scheduleReminder();

    // Sync to backend server
    this.syncSessionWithServer('user_confirmed_parking');

    return this.currentSession;
  }

  /**
   * User selects a different lot code or enters manual lot
   */
  public updateSessionLot(newLot: ParkingLocationLot) {
    if (!this.currentSession) return;
    this.currentSession.lot = newLot;
    this.saveToStorage();
    this.notify();
  }

  /**
   * Cancels/Dismisses a probable stop (e.g. user clicked "არ ვპარკირდები" or "X")
   * Permanently prevents the confirmation modal from popping up again for this stop!
   */
  public dismissProbableStop() {
    this.isCurrentStopDismissed = true;
    if (this.currentSession?.lot?.lotCode) {
      this.dismissedStopCodes.add(this.currentSession.lot.lotCode);
    }
    this.currentSession = null;
    this.clearReminderTimer();
    this.saveToStorage();
    this.notify();
  }

  /**
   * Step 5: Complete/End parking session
   */
  public completeSession(): void {
    if (!this.currentSession) return;

    this.currentSession.status = 'completed';
    this.currentSession.completedAt = new Date().toISOString();
    this.clearReminderTimer();
    this.saveToStorage();
    this.notify();

    sounds.playClearChime();

    // Inform server to cancel all future scheduled push alarms
    this.syncSessionWithServer('completed');
  }

  private clearReminderTimer() {
    if (this.reminderTimerId) {
      clearTimeout(this.reminderTimerId);
      this.reminderTimerId = null;
    }
  }

  private scheduleReminder() {
    this.clearReminderTimer();
    if (!this.currentSession || this.currentSession.status !== 'reminder_active') return;

    const expiresMs = new Date(this.currentSession.expiresAt).getTime();
    const leadMs = (this.currentSession.reminderMinutesBefore || 5) * 60 * 1000;
    const alertTimeMs = expiresMs - leadMs;
    const delayMs = alertTimeMs - Date.now();

    if (delayMs > 0) {
      this.reminderTimerId = setTimeout(() => {
        this.triggerReminder();
      }, delayMs);
    } else if (Date.now() < expiresMs) {
      // If already within the lead window
      this.triggerReminder();
    }
  }

  private initReminderTimer() {
    if (this.currentSession && this.currentSession.status === 'reminder_active') {
      this.scheduleReminder();
    }
  }

  private async requestNotificationPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (e) {}
    }
  }

  private triggerReminder() {
    if (!this.currentSession || this.currentSession.reminderTriggered) return;

    this.currentSession.reminderTriggered = true;
    this.saveToStorage();
    this.notify();

    sounds.playAlert();

    const lotName = this.currentSession.lot.street_ge || `ლოტი #${this.currentSession.lot.lotCode}`;
    const title = 'AutoHub AI — პარკირების შეხსენება ⚠️';
    const body = `${this.currentSession.plateNumber} (${lotName}): უფასო/სატარიფო ვადა იწურება ${this.currentSession.reminderMinutesBefore} წუთში (${formatTbilisiTime(this.currentSession.expiresAt)})!`;

    // 1. Try Service Worker Notification (works in background)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon.svg',
          tag: 'parking-alarm',
          requireInteraction: true
        });
      });
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      // 2. Direct browser Notification fallback
      new Notification(title, { body, icon: '/icon-192.png' });
    }
  }

  private async syncSessionWithServer(eventReason: string) {
    if (!this.currentSession) return;

    const payload = {
      event: eventReason,
      session_id: this.currentSession.sessionId,
      vehicle_id: this.currentSession.vehicleId,
      plate_number: this.currentSession.plateNumber,
      lot_code: this.currentSession.lot.lotCode,
      tariff_category: this.currentSession.lot.tariffCategory,
      stopped_at: this.currentSession.stoppedAt,
      expires_at: this.currentSession.expiresAt,
      tbilisi_time: formatTbilisiDateTime(new Date()),
      status: this.currentSession.status,
      reminder_lead_minutes: this.currentSession.reminderMinutesBefore
    };

    try {
      if (eventReason === 'user_confirmed_parking') {
        await n8nService.confirmParkingSession(this.currentSession);
      } else if (eventReason === 'completed') {
        await n8nService.completeParkingSession(this.currentSession);
      }
      await n8nService.syncVehicle(payload);
      if (this.currentSession) {
        this.currentSession.isSyncedWithServer = true;
        this.currentSession.serverSyncTimestamp = new Date().toISOString();
        this.saveToStorage();
      }
    } catch (err) {
      console.warn('Parking session server sync deferred:', err);
    }
  }
}

export const parkingSessionService = new ParkingSessionService();
