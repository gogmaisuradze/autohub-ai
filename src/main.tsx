import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AutoHub Application Crash Caught:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('autohub_vehicle_profile');
      localStorage.removeItem('autohub_dtc_codes');
      localStorage.removeItem('autohub_fines');
      localStorage.removeItem('autohub_parking_fines_v2');
      localStorage.removeItem('autohub_parking_permits_v2');
      localStorage.removeItem('autohub_active_tab');
      localStorage.removeItem('autohub_garage_vehicles');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#ECEAE5] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-lg font-black text-slate-800">
              აპლიკაციის ჩატვირთვის შეფერხება
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              {this.state.error?.message || 'დაფიქსირდა მოულოდნელი შეცდომა'}
            </p>
            <div className="pt-2">
              <button
                onClick={this.handleReset}
                className="btn-stitch-primary w-full py-3.5 px-6 text-xs font-black"
              >
                🔄 გადატვირთვა & ქეშის გასუფთავება
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
