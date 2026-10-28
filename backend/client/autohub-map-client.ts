/** UI-independent client. Set baseUrl to your backend's HTTPS origin. */
export class AutoHubMapClient {
  constructor(private baseUrl: string) {}
  private async get(path: string, signal?: AbortSignal) {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {signal});
    if (!response.ok) throw new Error(`AutoHub API: ${response.status}`);
    return response.json();
  }
  layers(signal?: AbortSignal) { return this.get('/api/v1/layers', signal); }
  pois(options: {layers: string[]; bbox?: [number, number, number, number]; lat?: number; lng?: number; radius_m?: number; q?: string; limit?: number; offset?: number}, signal?: AbortSignal) {
    const params = new URLSearchParams({layers: options.layers.join(',')});
    for (const [key, value] of Object.entries(options)) if (key !== 'layers' && value !== undefined) params.set(key, String(value));
    return this.get(`/api/v1/pois?${params}`, signal);
  }
}
