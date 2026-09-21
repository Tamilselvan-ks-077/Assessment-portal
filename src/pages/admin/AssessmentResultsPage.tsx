import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { storageService } from '../../utils/storage';
import { Assessment, Attempt } from '../../types';
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
} from '../../components/ui';
import {
  ArrowLeft,
  Download,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Award,
} from 'lucide-react';
import { formatDate, formatDateTime, formatSecondsToTime } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const AssessmentResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');

  // Selected attempt for detailed inspect modal
  const [inspectAttempt, setInspectAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const asm = await assessmentApi.getById(id);
        const atts = storageService.getAttemptsByAssessmentId(id);
        setAssessment(asm);
        setAttempts(atts);
      } catch {
        navigate('/assessments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleExportCSV = () => {
    if (!assessment || attempts.length === 0) return;

    const headers = [
      'Attempt ID',
      'Candidate Name',
      'Email',
      'Student ID',
      'Earned Marks',
      'Total Marks',
      'Percentage (%)',
      'Outcome',
      'Time Spent (s)',
      'Tab Switches',
      'Submitted At',
    ];

    const rows = attempts.map((att) => [
      att.id,
      `"${att.participant.name}"`,
      att.participant.email,
      att.participant.studentId || 'N/A',
      att.earnedMarks,
      att.totalMarks,
      att.scorePercentage,
      att.isPassed ? 'PASSED' : 'FAILED',
      att.timeSpentSeconds,
      att.tabSwitchCount || 0,
      att.submittedAt || att.startedAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `results_${assessment.accessCode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Candidate results exported to CSV!');
  };

  if (isLoading || !assessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner size="lg" label="Loading candidate submissions..." />
      </div>
    );
  }

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      att.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.participant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (att.participant.studentId &&
        att.participant.studentId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PASSED' && att.isPassed) ||
      (statusFilter === 'FAILED' && !att.isPassed);

    return matchesSearch && matchesStatus;
  });

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
            Results: {assessment.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {attempts.length} Total Submissions Graded
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          disabled={attempts.length === 0}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export CSV Roster
        </Button>
      </div>

      {/* Filter bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            placeholder="Search candidates by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            options={[
              { value: 'ALL', label: 'All Outcomes' },
              { value: 'PASSED', label: 'Passed Candidates Only' },
              { value: 'FAILED', label: 'Failed Candidates Only' },
            ]}
          />
        </div>
      </Card>

      {/* Results Table */}
      {filteredAttempts.length === 0 ? (
        <EmptyState
          title="No candidate submissions match your query"
          description="Candidates who complete this assessment will appear here with automatic grade breakdowns."
        />
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time Spent</TableHead>
                <TableHead>Anti-Cheat</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttempts.map((att) => (
                <TableRow key={att.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{att.participant.name}</div>
                    <div className="text-xs text-slate-500">{att.participant.email}</div>
                    {att.participant.studentId && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        ID: {att.participant.studentId}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900">{att.scorePercentage}%</div>
                    <div className="text-xs text-slate-400">
                      {att.earnedMarks} / {att.totalMarks} marks
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={att.isPassed ? 'success' : 'danger'} size="sm">
                      {att.isPassed ? 'Passed' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 font-mono">
                    {formatSecondsToTime(att.timeSpentSeconds)}
                  </TableCell>
                  <TableCell>
                    {(att.tabSwitchCount || 0) > 0 ? (
                      <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {att.tabSwitchCount} {att.tabSwitchCount === 1 ? 'switch' : 'switches'}
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Clean
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDateTime(att.submittedAt || att.startedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectAttempt(att)}
                      leftIcon={<Eye className="w-3.5 h-3.5 text-indigo-600" />}
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Inspect Candidate Attempt Modal */}
      {inspectAttempt && (
        <Modal
          isOpen={!!inspectAttempt}
          onClose={() => setInspectAttempt(null)}
          title={`Candidate Submission: ${inspectAttempt.participant.name}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Final Score</div>
                <div className="text-lg font-bold text-slate-900">
                  {inspectAttempt.scorePercentage}%
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Outcome</div>
                <Badge variant={inspectAttempt.isPassed ? 'success' : 'danger'} size="sm" className="mt-1">
                  {inspectAttempt.isPassed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Time Spent</div>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {formatSecondsToTime(inspectAttempt.timeSpentSeconds)}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Anti-Cheat</div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {inspectAttempt.tabSwitchCount || 0} Tab Switches
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Answered Questions Breakdown
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.values(inspectAttempt.answers || {}).map((ans, idx) => (
                  <div
                    key={ans.questionId}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      ans.isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                        : 'bg-rose-50/50 border-rose-200 text-rose-950'
                    }`}
                  >
                    <div>
                      <span className="font-bold">Item {idx + 1}: </span>
                      <span>
                        {ans.textAnswer
                          ? `"${ans.textAnswer}"`
                          : ans.selectedOptionIds?.join(', ') || 'No answer'}
                      </span>
                    </div>
                    <span className="font-bold">
                      {ans.marksAwarded || 0} Marks
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button variant="outline" onClick={() => setInspectAttempt(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
