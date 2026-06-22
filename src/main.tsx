import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from "./routes";
import './index.css';
import './i18n';


// ============================================================================
// REMOVED DEV ENDPOINT MAPPINGS TO PREVENT PORT 3002 CONFLICTS
// ============================================================================


// ============================================================================
// REACT ERROR BOUNDARY FOR BULLETPROOF RENDERING
// ============================================================================
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught react component error:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="fallback-error-boundary-screen" className="min-h-screen flex items-center justify-center bg-black text-white p-6 font-sans antialiased">
          <div className="max-w-md w-full liquid-glass-card rounded-2xl p-6 lg:p-8 shadow-xl shadow-black/30 text-center space-y-6">
            <div className="h-12 w-12 rounded-full border border-white/10 text-white/50 flex items-center justify-center mx-auto text-xl font-semibold backdrop-blur-md">
              !
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-white">Application Error</h1>
              <p className="text-sm text-zinc-400 leading-relaxed font-normal">
                Sistem mendeteksi error tak terduga pada antarmuka pengguna.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 max-h-32 overflow-y-auto text-left backdrop-blur-sm">
              <code className="text-xs text-red-300 font-mono break-all leading-relaxed whitespace-pre-wrap">
                {this.state.error?.toString() || "Unknown layout processing error"}
              </code>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl btn-primary text-sm font-semibold transition-all duration-300 ease-out cursor-pointer shadow-lg active:scale-95"
            >
              Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  </StrictMode>,
);
