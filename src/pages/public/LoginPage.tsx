import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Card } from '../../components/ui';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, UserCheck, User } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';

    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 4) newErrors.password = 'Password must be at least 4 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await login({ email, password });
      success('Logged in successfully', 'Welcome back!');
      navigate(from, { replace: true });
    } catch {
      toastError('Invalid email or password', 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    try {
      await loginAsDemo(role);
      success(`Logged in as demo ${role.toLowerCase().replace('_', ' ')}`, 'Demo Session Active');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign in to AssessPulse
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage online assessments, evaluate participants, and view reports.
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-indigo-600" defaultChecked />
                <span>Remember me</span>
              </label>
              <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-indigo-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
              One-Click Demo Access
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />}
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={isLoading}
              >
                Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                onClick={() => handleDemoLogin('TEST_CREATOR')}
                disabled={isLoading}
              >
                Creator
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<User className="w-3.5 h-3.5 text-amber-600" />}
                onClick={() => handleDemoLogin('PARTICIPANT')}
                disabled={isLoading}
              >
                Student
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs sm:text-sm text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
};
