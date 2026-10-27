/**
 * AutoHub AI - Resilient Leaflet CDN Loader
 * Guarantees reliable, independent loading of Leaflet CSS and JS across all components
 * (ParkingZonesMap, LiveTrafficMap, etc.) without relying on prior tab visits.
 */

type LoaderState = 'idle' | 'loading' | 'ready' | 'error';

class LeafletLoader {
  private state: LoaderState = 'idle';
  private loadPromise: Promise<any> | null = null;
  private errorMessage: string | null = null;

  public getState(): LoaderState {
    if (typeof window !== 'undefined' && (window as any).L) {
      return 'ready';
    }
    return this.state;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  public async load(): Promise<any> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('Window is not available'));
    }

    // 1. If already globally available
    if ((window as any).L) {
      this.state = 'ready';
      return (window as any).L;
    }

    // 2. If load already in progress, return existing promise
    if (this.loadPromise && this.state === 'loading') {
      return this.loadPromise;
    }

    this.state = 'loading';
    this.errorMessage = null;

    this.loadPromise = new Promise((resolve, reject) => {
      try {
        // Ensure CSS is present
        const CSS_HREF = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        let existingLink = document.querySelector(`link[href*="leaflet.css"]`) as HTMLLinkElement | null;
        if (!existingLink) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = CSS_HREF;
          link.crossOrigin = '';
          document.head.appendChild(link);
        }

        // Check if script element already exists
        const SCRIPT_SRC = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        let existingScript = document.querySelector(`script[src*="leaflet.js"]`) as HTMLScriptElement | null;

        const checkReadyInterval = setInterval(() => {
          if ((window as any).L) {
            clearInterval(checkReadyInterval);
            clearTimeout(timeoutId);
            this.state = 'ready';
            resolve((window as any).L);
          }
        }, 80);

        const timeoutId = setTimeout(() => {
          clearInterval(checkReadyInterval);
          if ((window as any).L) {
            this.state = 'ready';
            resolve((window as any).L);
          } else {
            this.state = 'error';
            this.errorMessage = 'Leaflet რუკის ბიბლიოთეკის ჩატვირთვა დროში გაიწელა. გთხოვთ შეამოწმოთ ინტერნეტ-კავშირი.';
            this.loadPromise = null;
            reject(new Error(this.errorMessage));
          }
        }, 12000);

        if (!existingScript) {
          const script = document.createElement('script');
          script.src = SCRIPT_SRC;
          script.crossOrigin = '';
          script.async = true;

          script.onload = () => {
            if ((window as any).L) {
              clearInterval(checkReadyInterval);
              clearTimeout(timeoutId);
              this.state = 'ready';
              resolve((window as any).L);
            }
          };

          script.onerror = () => {
            clearInterval(checkReadyInterval);
            clearTimeout(timeoutId);
            this.state = 'error';
            this.errorMessage = 'Leaflet CDN-დან რუკის ფაილების ჩატვირთვა ვერ მოხერხდა.';
            this.loadPromise = null;
            reject(new Error(this.errorMessage));
          };

          document.head.appendChild(script);
        }
      } catch (err: any) {
        this.state = 'error';
        this.errorMessage = err?.message || 'რუკის ინიციალიზაციის შეცდომა';
        this.loadPromise = null;
        reject(err);
      }
    });

    return this.loadPromise;
  }

  public retry(): Promise<any> {
    this.state = 'idle';
    this.loadPromise = null;
    this.errorMessage = null;

    // Remove any broken script tags if present
    const existingScript = document.querySelector(`script[src*="leaflet.js"]`);
    if (existingScript && !(window as any).L) {
      existingScript.remove();
    }

    return this.load();
  }
}

export const leafletLoader = new LeafletLoader();
