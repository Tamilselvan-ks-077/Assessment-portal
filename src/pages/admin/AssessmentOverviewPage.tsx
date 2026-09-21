import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { storageService } from '../../utils/storage';
import { Assessment, Attempt, AssessmentStatus } from '../../types';
import {
  FileCheck2,
  KeyRound,
  Users2,
  BarChart3,
  Settings,
  Edit,
  Play,
  Share2,
  Copy,
  Check,
  Clock,
  Award,
  Calendar,
  Layers,
  ArrowLeft,
  FileQuestion,
} from 'lucide-react';
import { Button, Card, Badge, LoadingSpinner, Tabs } from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AssessmentOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await assessmentApi.getById(id);
        const atts = storageService.getAttemptsByAssessmentId(id);
        setAssessment(data);
        setAttempts(atts);
      } catch {
        navigate('/assessments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: AssessmentStatus) => {
    if (!assessment) return;
    try {
      const updated = await assessmentApi.update(assessment.id, { status: newStatus });
      setAssessment(updated);
      success(`Assessment status changed to ${newStatus}`);
    } catch {
      toastError('Could not update status');
    }
  };

  const copyTestLink = () => {
    if (!assessment) return;
    navigator.clipboard.writeText(`${window.location.origin}/test/${assessment.accessCode}`);
    setHasCopied(true);
    success('Candidate test link copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2500);
  };

  if (isLoading || !assessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner size="lg" label="Loading assessment overview..." />
      </div>
    );
  }

  const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED');
  const avgScore = completedAttempts.length
    ? Math.round(
        completedAttempts.reduce((s, a) => s + a.scorePercentage, 0) / completedAttempts.length
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/assessments')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assessments
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyTestLink}
            leftIcon={hasCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          >
            {hasCopied ? 'Copied Link' : 'Copy Test Link'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/test/${assessment.accessCode}`, '_blank')}
            leftIcon={<Play className="w-4 h-4 text-indigo-600" />}
          >
            Preview Candidate View
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/assessments/${assessment.id}/questions`)}
            leftIcon={<FileQuestion className="w-4 h-4" />}
          >
            Manage Questions
          </Button>
        </div>
      </div>

      {/* Main Hub Header Card */}
      <Card className="p-6 sm:p-8 border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="md">
                {assessment.category}
              </Badge>
              <Badge
                variant={
                  assessment.status === 'ACTIVE'
                    ? 'success'
                    : assessment.status === 'DRAFT'
                    ? 'warning'
                    : 'neutral'
                }
                size="md"
              >
                {assessment.status}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {assessment.title}
            </h1>
            <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
              {assessment.description}
            </p>
          </div>

          {/* Access Code Box */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-center space-y-1 shrink-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Access Code
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-black text-indigo-900 tracking-widest">
              {assessment.accessCode}
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Questions
            </div>
            <div className="text-xl font-bold text-slate-900">
              {assessment.questionsCount || 0} Questions
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{assessment.totalMarks || 0} Total Marks</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Time Limit
            </div>
            <div className="text-xl font-bold text-slate-900">
              {assessment.settings.timeLimitMinutes} Mins
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Passing: {assessment.settings.passingScorePercentage}%</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Attempts Graded
            </div>
            <div className="text-xl font-bold text-slate-900">
              {completedAttempts.length} Attempts
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Avg: {avgScore}%</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Status Control
            </div>
            <select
              value={assessment.status}
              onChange={(e) => handleStatusChange(e.target.value as AssessmentStatus)}
              className="w-full bg-white border border-slate-200 rounded-lg text-xs font-semibold p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Quick Navigation Hub Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={`/assessments/${assessment.id}/questions`}>
          <Card hover className="p-5 border-slate-200 flex flex-col justify-between h-full">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl w-fit mb-3">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Question Manager</h3>
              <p className="text-xs text-slate-500 mt-1">
                Add, reorder, edit single & multi-choice questions and scoring weights.
              </p>
            </div>
          </Card>
        </Link>

        <Link to={`/assessments/${assessment.id}/results`}>
          <Card hover className="p-5 border-slate-200 flex flex-col justify-between h-full">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Candidate Results</h3>
              <p className="text-xs text-slate-500 mt-1">
                Inspect scores, view individual answers, and export grade rosters.
              </p>
            </div>
          </Card>
        </Link>

        <Link to={`/assessments/${assessment.id}/analytics`}>
          <Card hover className="p-5 border-slate-200 flex flex-col justify-between h-full">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Deep Analytics</h3>
              <p className="text-xs text-slate-500 mt-1">
                Score distribution histograms, pass rate curves, and question difficulty.
              </p>
            </div>
          </Card>
        </Link>

        <Link to={`/assessments/${assessment.id}/settings`}>
          <Card hover className="p-5 border-slate-200 flex flex-col justify-between h-full">
            <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl w-fit mb-3">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Assessment Settings</h3>
              <p className="text-xs text-slate-500 mt-1">
                Modify duration, anti-cheat limits, shuffling, and review permissions.
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
};
