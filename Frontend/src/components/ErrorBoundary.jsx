import React from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught UI error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // If an inline fallback was provided (e.g. for widgets/launchers)
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || 'Unknown render exception';
      const componentStack = this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={28} />
            </div>
            
            <h2 className="text-xl font-black text-slate-900 font-display mb-2">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              An unexpected display issue occurred in this section. Your trip context and saved data are safe.
            </p>

            {/* Collapsible Error Diagnosis Box */}
            <div className="mb-6 text-left">
              <button
                type="button"
                onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                className="w-full px-3 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-between border border-slate-200 transition-colors"
              >
                <span>🔍 Diagnostic Details</span>
                {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
                  <p className="text-rose-400 font-bold mb-1">{errorMessage}</p>
                  {componentStack && (
                    <pre className="text-slate-400 text-[10px] whitespace-pre-wrap">{componentStack}</pre>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw size={14} /> Try Reloading
              </button>
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#0f3d2e] hover:bg-[#144c3a] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <Home size={14} /> Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
