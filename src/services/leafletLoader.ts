/**
 * CarMe — Leaflet loader (ჩაშენებული, CDN-ის გარეშე)
 *
 * ადრე Leaflet CDN-იდან იტვირთებოდა, რაც iOS/Capacitor WebView-ზე ხშირად
 * ვერ ხერხდებოდა (რუკა არ ჩანდა). ახლა Leaflet npm-პაკეტიდან იბანდლება —
 * საიმედოდ მუშაობს iOS/Android ნატიურ აპში და ინტერნეტის გარეშეც (ბიბლიოთეკა).
 * API იგივე რჩება: load() → L, getState(), retry().
 */

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type LoaderState = 'idle' | 'loading' | 'ready' | 'error';

class LeafletLoader {
  private state: LoaderState = 'ready';

  public getState(): LoaderState {
    return 'ready';
  }

  public getErrorMessage(): string | null {
    return null;
  }

  public async load(): Promise<any> {
    // კომპონენტები ზოგან `window.L`-ს ელოდებიან — დავაყენოთ გლობალურად
    if (typeof window !== 'undefined') {
      (window as any).L = L;
    }
    this.state = 'ready';
    return L;
  }

  public retry(): Promise<any> {
    return this.load();
  }
}

export const leafletLoader = new LeafletLoader();
