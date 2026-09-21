import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const TestLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Test Minimal Top Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-slate-900 tracking-tight">
              Assess<span className="text-indigo-600">Pulse</span> Test Portal
            </span>
          </Link>
          <div className="text-xs text-slate-400 font-medium hidden sm:block">
            Secure Assessment Environment
          </div>
        </div>
      </header>

      {/* Main Test View */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};
