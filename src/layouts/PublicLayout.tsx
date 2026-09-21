import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Modal } from '../components/ui';
import {
  Sparkles,
  Menu,
  X,
  KeyRound,
  Layers,
  ShieldCheck,
  BarChart3,
  Users,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accessCodeModalOpen, setAccessCodeModalOpen] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  const handleJoinAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCodeInput.trim()) {
      setCodeError('Please enter an assessment access code');
      return;
    }
    setCodeError('');
    setAccessCodeModalOpen(false);
    navigate(`/test/${accessCodeInput.trim().toUpperCase()}`);
    setAccessCodeInput('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white/20" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-slate-900 tracking-tight leading-none">
                Assess<span className="text-indigo-600">Pulse</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Assessment SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">
              Solutions
            </a>
            <a href="#analytics" className="hover:text-indigo-600 transition-colors">
              Analytics
            </a>
          </nav>

          {/* Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<KeyRound className="w-4 h-4 text-indigo-600" />}
              onClick={() => setAccessCodeModalOpen(true)}
            >
              Enter Code
            </Button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  Log out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="px-2.5"
              onClick={() => {
                setMobileMenuOpen(false);
                setAccessCodeModalOpen(true);
              }}
              aria-label="Enter code"
            >
              <KeyRound className="w-4 h-4 text-indigo-600" />
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4 space-y-3 animate-slide-down">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                Features <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                How It Works <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
              >
                Solutions <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                leftIcon={<KeyRound className="w-4 h-4 text-indigo-600" />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAccessCodeModalOpen(true);
                }}
              >
                Enter Access Code
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                  >
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    Log In
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Public Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Quick Access Code Modal */}
      <Modal
        isOpen={accessCodeModalOpen}
        onClose={() => setAccessCodeModalOpen(false)}
        title="Enter Assessment Code"
        description="Type the 6 to 8 character access code provided by your instructor or test administrator."
        maxWidth="md"
      >
        <form onSubmit={handleJoinAssessment} className="space-y-4 pt-1">
          <Input
            label="Access Code"
            placeholder="e.g. REACT99"
            value={accessCodeInput}
            onChange={(e) => {
              setAccessCodeInput(e.target.value.toUpperCase());
              setCodeError('');
            }}
            error={codeError}
            autoFocus
            className="text-center font-mono text-lg tracking-widest uppercase font-bold"
            leftIcon={<KeyRound className="w-5 h-5 text-slate-400" />}
          />
          <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 border border-slate-100 flex items-center gap-2">
            <span className="font-semibold text-slate-700">Quick Demo Code:</span>
            <button
              type="button"
              onClick={() => setAccessCodeInput('REACT99')}
              className="text-indigo-600 hover:underline font-mono font-bold"
            >
              REACT99
            </button>
            <span>or</span>
            <button
              type="button"
              onClick={() => setAccessCodeInput('CLOUD44')}
              className="text-indigo-600 hover:underline font-mono font-bold"
            >
              CLOUD44
            </button>
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAccessCodeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Open Test
            </Button>
          </div>
        </form>
      </Modal>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-slate-900 tracking-tight">
                  Assess<span className="text-indigo-600">Pulse</span>
                </span>
              </Link>
              <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-4">
                Enterprise-grade online assessment engine with mobile-first examination experience, automated grading, and real-time candidate analytics.
              </p>
              <div className="text-xs text-slate-400">
                © {new Date().getFullYear()} AssessPulse SaaS Inc. All rights reserved.
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-indigo-600">Assessment Engine</a></li>
                <li><a href="#features" className="hover:text-indigo-600">Question Bank</a></li>
                <li><a href="#analytics" className="hover:text-indigo-600">Analytics & Insights</a></li>
                <li><a href="#security" className="hover:text-indigo-600">Anti-Cheat System</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                Solutions
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><span className="hover:text-indigo-600 cursor-pointer">Universities & Schools</span></li>
                <li><span className="hover:text-indigo-600 cursor-pointer">Tech Bootcamps</span></li>
                <li><span className="hover:text-indigo-600 cursor-pointer">Corporate Recruitment</span></li>
                <li><span className="hover:text-indigo-600 cursor-pointer">Certification Programs</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
                Quick Access
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <button
                    type="button"
                    onClick={() => setAccessCodeModalOpen(true)}
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Take a Test (Enter Code)
                  </button>
                </li>
                <li><Link to="/login" className="hover:text-indigo-600">Admin Login</Link></li>
                <li><Link to="/register" className="hover:text-indigo-600">Create Free Account</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
