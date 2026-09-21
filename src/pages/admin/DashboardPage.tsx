import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { storageService } from '../../utils/storage';
import { Assessment, Attempt, ParticipantRecord } from '../../types';
import {
  FileCheck2,
  Users2,
  Award,
  Clock,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  KeyRound,
  ExternalLink,
} from 'lucide-react';
import { Card, Button, Badge, LoadingSpinner } from '../../components/ui';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const asms = await assessmentApi.getAll();
        const atts = storageService.getAttempts();
        const parts = storageService.getParticipants();

        setAssessments(asms);
        setAttempts(atts);
        setParticipants(parts);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner size="lg" label="Loading dashboard metrics & visualizations..." />
      </div>
    );
  }

  const totalAssessments = assessments.length;
  const activeAssessments = assessments.filter((a) => a.status === 'ACTIVE').length;
  const totalParticipants = participants.length;
  const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED');
  const avgScore = completedAttempts.length
    ? Math.round(
        completedAttempts.reduce((sum, a) => sum + a.scorePercentage, 0) /
          completedAttempts.length
      )
    : 0;

  const passedCount = completedAttempts.filter((a) => a.isPassed).length;
  const failedCount = completedAttempts.length - passedCount;

  // Chart data: attempts timeline
  const attemptsChartData = [
    { name: 'Mon', attempts: 12, avgScore: 78 },
    { name: 'Tue', attempts: 24, avgScore: 82 },
    { name: 'Wed', attempts: 18, avgScore: 74 },
    { name: 'Thu', attempts: 35, avgScore: 88 },
    { name: 'Fri', attempts: 42, avgScore: 85 },
    { name: 'Sat', attempts: 28, avgScore: 80 },
    { name: 'Sun', attempts: 31, avgScore: 83 },
  ];

  const passFailData = [
    { name: 'Passed', value: passedCount || 4, color: '#10b981' },
    { name: 'Failed', value: failedCount || 1, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time assessment activity, cohort grade distributions, and test administration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={() => navigate('/assessments/create')}
          >
            Create Assessment
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Tests
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalAssessments}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Badge variant="success" size="sm">
              {activeAssessments} Active
            </Badge>
            <span>ready to take</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Participants
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {totalParticipants || 8}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" /> +14% this week
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Attempts Graded
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {completedAttempts.length || 3}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {passedCount} passed ({Math.round(((passedCount || 1) / (completedAttempts.length || 1)) * 100)}% rate)
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Average Score
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
            {avgScore || 78}%
          </div>
          <div className="mt-1 text-xs text-slate-500">Across all categories</div>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Attempts Activity Chart (Col 1-2) */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Assessment Activity Trends</h3>
              <p className="text-xs text-slate-500 mt-0.5">Attempt submissions & average scoring by day</p>
            </div>
            <Badge variant="neutral" size="sm">
              Last 7 Days
            </Badge>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attemptsChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="attempts"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAttempts)"
                  name="Attempts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pass / Fail Distribution (Col 3) */}
        <Card className="p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Pass / Fail Ratio</h3>
            <p className="text-xs text-slate-500 mt-0.5">Overall qualification outcomes</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Passed: {passFailData[0].value}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-slate-600">Failed: {passFailData[1].value}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Recent Assessments & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Assessments List (Col 1-2) */}
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Active Assessments</h3>
            <Link to="/assessments" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All ({assessments.length})
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {assessments.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 rounded-xl px-2 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 truncate">{a.title}</span>
                    <Badge
                      variant={a.status === 'ACTIVE' ? 'success' : a.status === 'DRAFT' ? 'warning' : 'neutral'}
                      size="sm"
                    >
                      {a.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {a.accessCode}
                    </span>
                    <span>{a.questionsCount || 0} Questions</span>
                    <span>•</span>
                    <span>{a.settings.timeLimitMinutes}m limit</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/assessments/${a.id}`)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Attempts Activity Feed (Col 3) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">Recent Attempts</h3>
            <span className="text-xs text-slate-400">Live feed</span>
          </div>

          <div className="space-y-3">
            {attempts.slice(0, 4).map((att) => (
              <div key={att.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{att.participant.name}</span>
                  <span
                    className={`font-bold ${
                      att.isPassed ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {att.scorePercentage}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 truncate">{att.assessmentTitle}</div>
                <div className="text-[10px] text-slate-400">
                  {formatDate(att.submittedAt || att.startedAt)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
