import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { Assessment } from '../../types';
import { Button, Card, Badge, LoadingSpinner } from '../../components/ui';
import {
  Clock,
  Award,
  FileQuestion,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  BookOpen,
  Info,
  Calendar,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const TestAccessPage: React.FC = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!accessCode) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await assessmentApi.getByAccessCode(accessCode);
        setAssessment(data);
      } catch (err: any) {
        setError(err.message || 'Assessment not found. Please check your access code.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [accessCode]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <LoadingSpinner size="lg" label="Validating assessment access code..." />
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Assessment Not Found</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            {error || `The access code "${accessCode}" is either inactive or does not exist.`}
          </p>
          <div className="pt-2">
            <Link to="/">
              <Button variant="primary" size="sm">
                Return to Home
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 sm:py-12 px-4 sm:px-6 max-w-4xl mx-auto w-full">
      <div className="space-y-6">
        {/* Top Header Card */}
        <Card className="p-6 sm:p-8 border-slate-200 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Badge variant="primary" size="md">
              {assessment.category}
            </Badge>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-lg">
              CODE: {assessment.accessCode}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            {assessment.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {assessment.description}
          </p>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 text-indigo-500" /> Time Limit
              </div>
              <div className="text-base font-bold text-slate-900">
                {assessment.settings.timeLimitMinutes > 0
                  ? `${assessment.settings.timeLimitMinutes} Minutes`
                  : 'Unlimited'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <FileQuestion className="w-4 h-4 text-indigo-500" /> Questions
              </div>
              <div className="text-base font-bold text-slate-900">
                {assessment.questionsCount || 5} Questions
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Award className="w-4 h-4 text-indigo-500" /> Pass Score
              </div>
              <div className="text-base font-bold text-slate-900">
                {assessment.settings.passingScorePercentage}%
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Calendar className="w-4 h-4 text-indigo-500" /> Attempts
              </div>
              <div className="text-base font-bold text-slate-900">
                {assessment.settings.maxAttempts || 1} Allowed
              </div>
            </div>
          </div>
        </Card>

        {/* Instructions & Guidelines */}
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Assessment Instructions
          </div>

          <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono">
            {assessment.instructions ||
              '1. Read every question carefully before choosing your response.\n2. You can navigate back and forth between questions using the bottom navigation palette.\n3. Anti-cheat system is active: switching browser tabs or minimizing the test window is monitored.\n4. Click Submit once you have reviewed all your answers.'}
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs sm:text-sm text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">System Recommendation:</span> Close all unnecessary background tabs and applications. Keep your browser in full view throughout the test.
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              Exit
            </Button>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              onClick={() => navigate(`/test/${assessment.accessCode}/start`)}
            >
              Continue to Candidate Check-in
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
