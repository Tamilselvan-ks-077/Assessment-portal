import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { attemptApi } from '../../api/attemptApi';
import { Assessment } from '../../types';
import { Button, Input, Checkbox, Card, LoadingSpinner } from '../../components/ui';
import {
  UserCheck,
  Sparkles,
  ShieldCheck,
  Clock,
  Play,
  ArrowLeft,
  Mail,
  User,
  Hash,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const TestStartPage: React.FC = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!accessCode) return;
      setIsLoading(true);
      try {
        const data = await assessmentApi.getByAccessCode(accessCode);
        setAssessment(data);
      } catch {
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [accessCode, navigate]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (assessment?.settings.requireParticipantEmail) {
      if (!email.trim()) newErrors.email = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
    }
    if (assessment?.settings.requireParticipantId && !studentId.trim()) {
      newErrors.studentId = 'Student / Candidate ID is required';
    }
    if (!agreedToRules) {
      newErrors.agreed = 'You must confirm the examination rules to proceed';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsStarting(true);
    try {
      const { attempt } = await attemptApi.startAttempt({
        accessCode: accessCode!,
        participant: {
          name: name.trim(),
          email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@candidate.local`,
          studentId: studentId.trim() || undefined,
        },
      });

      // Navigate to taking UI
      navigate(`/test/${accessCode}/attempt/${attempt.id}`);
    } catch (err: any) {
      toastError(err.message || 'Could not start examination', 'Start Failed');
      setIsStarting(false);
    }
  };

  if (isLoading || !assessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <LoadingSpinner size="lg" label="Preparing candidate registration..." />
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 max-w-xl mx-auto w-full">
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(`/test/${accessCode}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </button>

        <Card className="p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          <div className="space-y-2 mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Candidate Check-In
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              {assessment.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Please provide your identification details before launching the assessment timer.
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-4">
            <Input
              label="Candidate Full Name *"
              placeholder="e.g. Jordan Lee"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              autoFocus
            />

            <Input
              label={`Email Address ${assessment.settings.requireParticipantEmail ? '*' : '(Optional)'}`}
              type="email"
              placeholder="jordan.lee@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
            />

            <Input
              label={`Student / Employee ID ${assessment.settings.requireParticipantId ? '*' : '(Optional)'}`}
              placeholder="e.g. ST-2024-884"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              error={errors.studentId}
              leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
            />

            {/* Test Summary Box */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between font-medium">
                <span>Duration:</span>
                <span className="text-slate-900 font-bold">
                  {assessment.settings.timeLimitMinutes > 0
                    ? `${assessment.settings.timeLimitMinutes} Minutes`
                    : 'Unlimited'}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Questions:</span>
                <span className="text-slate-900 font-bold">{assessment.questionsCount || 5} Questions</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Passing Mark:</span>
                <span className="text-slate-900 font-bold">{assessment.settings.passingScorePercentage}%</span>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="pt-2">
              <Checkbox
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                label={
                  <span className="text-xs sm:text-sm">
                    I confirm that I will complete this assessment independently and adhere to anti-cheat integrity guidelines.
                  </span>
                }
                error={errors.agreed}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isStarting}
              className="w-full mt-4"
              rightIcon={<Play className="w-4 h-4 fill-white" />}
            >
              Start Assessment Now
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
