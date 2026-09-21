import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Input, Select, Card } from '../../components/ui';
import { Sparkles, User, Mail, Lock, Building, ArrowRight } from 'lucide-react';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await register({ name, email, password, organization, role });
      success('Account created successfully!', 'Welcome to AssessPulse');
      navigate('/dashboard');
    } catch {
      toastError('Could not register account', 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Start creating assessments and testing candidates in minutes.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Dr. Jane Foster"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Work Email"
              type="email"
              placeholder="jane@academy.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label="Organization / Academy"
              placeholder="e.g. Stanford University or Apex Bootcamp"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              leftIcon={<Building className="w-4 h-4 text-slate-400" />}
            />

            <Select
              label="Primary Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'TEST_CREATOR', label: 'Test Creator / Instructor (Create & grade)' },
                { value: 'ADMIN', label: 'Administrator (Full platform & user control)' },
                { value: 'PARTICIPANT', label: 'Participant / Student (Take tests & view results)' },
              ]}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started Free
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs sm:text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
