import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { storageService } from '../../utils/storage';
import { Assessment, AssessmentAnalytics } from '../../types';
import {
  Button,
  Card,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
} from '../../components/ui';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { formatSecondsToTime } from '../../utils/formatters';

export const AssessmentAnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [analytics, setAnalytics] = useState<AssessmentAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const asm = await assessmentApi.getById(id);
        const anlys = storageService.getAssessmentAnalytics(id);
        setAssessment(asm);
        setAnalytics(anlys);
      } catch {
        navigate('/assessments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (isLoading || !assessment || !analytics) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner size="lg" label="Computing psychometric and difficulty analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/assessments/${id}`)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Assessment Hub
          </button>
          <h1 className="text-2xl font-bold text-slate-900">
            Analytics: {assessment.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Statistical item discrimination, score distribution curves, and cohort trends.
          </p>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Total Submissions
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {analytics.completedAttempts}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {analytics.passedAttempts} passed • {analytics.failedAttempts} failed
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Pass Percentage
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {analytics.passRatePercentage}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Required: {assessment.settings.passingScorePercentage}%
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Average Score
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">
            {analytics.averageScore}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            High: {analytics.highestScore}% • Low: {analytics.lowestScore}%
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            Avg Time Spent
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatSecondsToTime(analytics.averageTimeSpentSeconds)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Limit: {assessment.settings.timeLimitMinutes} mins
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Histogram */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Score Distribution Histogram</h3>
            <p className="text-xs text-slate-500 mt-0.5">Candidate counts grouped by score ranges</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} name="Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Submissions Timeline */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Submissions & Score Trajectory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Average score percentage over time</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.attemptsTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Avg Score (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Question Item Difficulty & Performance Table */}
      <Card className="p-6 space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900">Item Analysis & Question Difficulty</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify which questions candidates struggle with the most
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Question Prompt</TableHead>
              <TableHead>Success Rate</TableHead>
              <TableHead>Difficulty Index</TableHead>
              <TableHead className="text-right">Avg Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics.questionPerformance.map((qp) => {
              let diffBadge = 'Moderate';
              let diffVariant: 'success' | 'warning' | 'danger' = 'warning';

              if (qp.successRate >= 75) {
                diffBadge = 'Easy';
                diffVariant = 'success';
              } else if (qp.successRate < 50) {
                diffBadge = 'Hard';
                diffVariant = 'danger';
              }

              return (
                <TableRow key={qp.questionId}>
                  <TableCell className="font-bold text-slate-600">{qp.order}</TableCell>
                  <TableCell className="max-w-md font-medium text-slate-900 truncate">
                    {qp.questionText}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${qp.successRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-xs text-slate-700">{qp.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={diffVariant} size="sm">
                      {diffBadge}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-500">
                    {formatSecondsToTime(qp.avgTimeSeconds)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
