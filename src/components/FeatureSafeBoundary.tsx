// Force vite full reload
import { Component, ReactNode, ErrorInfo } from 'react';

// ============================================================================
// REACT ERROR BOUNDARY FOR FEATURE-LEVEL BULLETPROOF RENDERING
// ============================================================================
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FeatureSafeBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[FeatureSafeBoundary] Uncaught react component error:", error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 lg:p-8 liquid-glass-card border border-white/5 rounded-[24px] text-center mt-4">
          <div className="h-12 w-12 rounded-full bg-[#FF453A]/15 text-[#FF453A] flex items-center justify-center mb-4 text-xl font-semibold">
            !
          </div>
          <h3 className="text-[18px] font-medium text-white tracking-tight mb-2">
            {this.props.fallbackMessage || "Gagal Memuat Komponen"}
          </h3>
          <p className="text-[14px] text-zinc-400 font-light max-w-[400px] mb-6">
            Terjadi masalah saat memproses bagian antarmuka ini. Data Anda tetap aman.
          </p>
          <code className="text-[10px] text-red-400 font-mono break-all leading-relaxed whitespace-pre-wrap block max-w-full text-left bg-black/40 p-3 rounded-xl mb-6">
            {this.state.error?.toString() || "Unknown layout processing error"}
          </code>
          <button
            onClick={this.handleRetry}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold uppercase tracking-wider transition-all duration-300 ease-out cursor-pointer"
          >
            Muat Ulang Komponen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
