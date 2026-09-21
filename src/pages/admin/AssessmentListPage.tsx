import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { Assessment, AssessmentStatus } from '../../types';
import { ASSESSMENT_CATEGORIES } from '../../constants';
import {
  PlusCircle,
  Search,
  Filter,
  MoreVertical,
  KeyRound,
  Copy,
  ExternalLink,
  Edit,
  Trash2,
  FileQuestion,
  BarChart3,
  Users2,
  Settings,
  Share2,
  Check,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Dropdown,
  ConfirmDialog,
  Modal,
  LoadingSpinner,
  EmptyState,
} from '../../components/ui';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AssessmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Share Modal state
  const [shareModalAssessment, setShareModalAssessment] = useState<Assessment | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Delete Confirm Dialog state
  const [deleteAssessmentId, setDeleteAssessmentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const data = await assessmentApi.getAll();
      setAssessments(data);
    } catch {
      toastError('Failed to fetch assessments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async () => {
    if (!deleteAssessmentId) return;
    setIsDeleting(true);
    try {
      await assessmentApi.delete(deleteAssessmentId);
      success('Assessment removed successfully');
      setAssessments((prev) => prev.filter((a) => a.id !== deleteAssessmentId));
      setDeleteAssessmentId(null);
    } catch {
      toastError('Could not delete assessment');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyShareLink = (code: string) => {
    const url = `${window.location.origin}/test/${code}`;
    navigator.clipboard.writeText(url);
    setHasCopied(true);
    success('Assessment link copied to clipboard!');
    setTimeout(() => setHasCopied(false), 2500);
  };

  // Filtering
  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.accessCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your evaluation tests, access codes, questions, and participant results.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/assessments/create')}
        >
          Create Assessment
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by title, code, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              ...ASSESSMENT_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
          />

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active (Available)' },
              { value: 'DRAFT', label: 'Draft (In preparation)' },
              { value: 'ARCHIVED', label: 'Archived (Closed)' },
            ]}
          />
        </div>
      </Card>

      {/* Assessments Grid / List */}
      {isLoading ? (
        <div className="p-12 flex justify-center">
          <LoadingSpinner size="lg" label="Loading assessment catalog..." />
        </div>
      ) : filteredAssessments.length === 0 ? (
        <EmptyState
          title="No assessments found"
          description="Try adjusting your search query or create a new assessment from scratch."
          actionLabel="Create Assessment"
          onAction={() => navigate('/assessments/create')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssessments.map((assessment) => (
            <Card
              key={assessment.id}
              hover
              className="flex flex-col justify-between p-5 border-slate-200"
            >
              <div>
                {/* Top badges & Actions */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge
                    variant={
                      assessment.status === 'ACTIVE'
                        ? 'success'
                        : assessment.status === 'DRAFT'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {assessment.status}
                  </Badge>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShareModalAssessment(assessment)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Share Assessment Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <Dropdown
                      trigger={
                        <button
                          type="button"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                      items={[
                        {
                          id: 'overview',
                          label: 'Overview Hub',
                          onClick: () => navigate(`/assessments/${assessment.id}`),
                        },
                        {
                          id: 'questions',
                          label: 'Manage Questions',
                          icon: <FileQuestion className="w-4 h-4" />,
                          onClick: () => navigate(`/assessments/${assessment.id}/questions`),
                        },
                        {
                          id: 'results',
                          label: 'View Results',
                          icon: <Users2 className="w-4 h-4" />,
                          onClick: () => navigate(`/assessments/${assessment.id}/results`),
                        },
                        {
                          id: 'analytics',
                          label: 'Analytics',
                          icon: <BarChart3 className="w-4 h-4" />,
                          onClick: () => navigate(`/assessments/${assessment.id}/analytics`),
                        },
                        {
                          id: 'settings',
                          label: 'Settings',
                          icon: <Settings className="w-4 h-4" />,
                          onClick: () => navigate(`/assessments/${assessment.id}/settings`),
                        },
                        {
                          id: 'delete',
                          label: 'Delete',
                          icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                          danger: true,
                          divider: true,
                          onClick: () => setDeleteAssessmentId(assessment.id),
                        },
                      ]}
                    />
                  </div>
                </div>

                {/* Title & Category */}
                <div className="text-xs font-semibold text-indigo-600 mb-1">{assessment.category}</div>
                <h3
                  onClick={() => navigate(`/assessments/${assessment.id}`)}
                  className="font-bold text-base text-slate-900 line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                  {assessment.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {assessment.description}
                </p>

                {/* Key specs badge strip */}
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    <KeyRound className="w-3.5 h-3.5" /> {assessment.accessCode}
                  </span>
                  <span>{assessment.questionsCount || 0} Questions</span>
                  <span>•</span>
                  <span>{assessment.settings.timeLimitMinutes}m</span>
                  <span>•</span>
                  <span>Pass: {assessment.settings.passingScorePercentage}%</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/assessments/${assessment.id}/questions`)}
                  leftIcon={<FileQuestion className="w-3.5 h-3.5" />}
                >
                  Questions
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/assessments/${assessment.id}`)}
                >
                  Manage Hub
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Share Assessment Modal */}
      {shareModalAssessment && (
        <Modal
          isOpen={!!shareModalAssessment}
          onClose={() => setShareModalAssessment(null)}
          title="Share Assessment Link"
          description="Candidates can use either the direct URL or type the access code on the homepage."
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl text-center space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Access Code
              </div>
              <div className="text-3xl font-mono font-extrabold text-indigo-900 tracking-widest">
                {shareModalAssessment.accessCode}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Direct Candidate Test URL
              </label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/test/${shareModalAssessment.accessCode}`}
                  className="font-mono text-xs select-all bg-slate-50"
                />
                <Button
                  variant="primary"
                  onClick={() => copyShareLink(shareModalAssessment.accessCode)}
                  leftIcon={hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {hasCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" onClick={() => setShareModalAssessment(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteAssessmentId}
        onClose={() => setDeleteAssessmentId(null)}
        onConfirm={handleDelete}
        title="Delete Assessment?"
        message="This action will permanently delete this assessment and all associated questions. This action cannot be undone."
        confirmLabel="Yes, Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
