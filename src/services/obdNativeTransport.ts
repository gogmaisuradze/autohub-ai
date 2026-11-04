/**
 * CarMe — ნატიური TCP transport (OBD-WiFi-სთვის)
 *
 * აკავშირებს `obdWifiService`-ს ნატიურ Capacitor პლაგინთან `CarmeObdTcp`,
 * რომელიც iOS (Swift) და Android (Kotlin) მხარეს ხსნის რეალურ TCP socket-ს
 * ELM327 ადაპტერთან. ბრაუზერში `Capacitor.isNativePlatform()` = false, ამიტომ
 * transport არ რეგისტრირდება და აპი მშვიდად მუშაობს (OBD-ღილაკი „მხოლოდ აპში").
 */

import { Capacitor, registerPlugin } from '@capacitor/core';
import { ObdTransport, setObdTransport } from './obdWifiService';

interface CarmeObdTcpPlugin {
  connect(options: { host: string; port: number }): Promise<void>;
  send(options: { command: string; timeoutMs?: number }): Promise<{ response: string }>;
  close(): Promise<void>;
  isConnected(): Promise<{ connected: boolean }>;
}

const CarmeObdTcp = registerPlugin<CarmeObdTcpPlugin>('CarmeObdTcp');

class NativeObdTransport implements ObdTransport {
  private connected = false;

  async connect(host: string, port: number): Promise<void> {
    await CarmeObdTcp.connect({ host, port });
    this.connected = true;
  }

  async send(command: string): Promise<string> {
    const r = await CarmeObdTcp.send({ command, timeoutMs: 4000 });
    return r.response;
  }

  async close(): Promise<void> {
    try {
      await CarmeObdTcp.close();
    } finally {
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}

/** bootstrap-ზე გამოსაძახებელი — ნატიურ აპში TCP transport-ის ჩართვა */
export function initObdTransport(): void {
  if (Capacitor.isNativePlatform()) {
    setObdTransport(new NativeObdTransport());
  }
}
