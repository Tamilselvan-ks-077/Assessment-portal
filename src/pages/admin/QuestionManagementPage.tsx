import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { questionApi } from '../../api/questionApi';
import { Assessment, Question, QuestionType, Option } from '../../types';
import {
  Button,
  Card,
  Badge,
  Input,
  Textarea,
  Select,
  Modal,
  ConfirmDialog,
  LoadingSpinner,
  EmptyState,
} from '../../components/ui';
import {
  Plus,
  ArrowLeft,
  MoveUp,
  MoveDown,
  Copy,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Award,
  Layers,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const QuestionManagementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Question Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>('SINGLE_CHOICE');
  const [qMarks, setQMarks] = useState(5);
  const [qExplanation, setQExplanation] = useState('');
  const [qOptions, setQOptions] = useState<Option[]>([]);

  // Delete confirm state
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQuestionsData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const asm = await assessmentApi.getById(id);
      const qList = await questionApi.getByAssessmentId(id);
      setAssessment(asm);
      setQuestions(qList);
    } catch {
      navigate('/assessments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, [id]);

  const openAddModal = () => {
    setEditingQuestion(null);
    setQText('');
    setQType('SINGLE_CHOICE');
    setQMarks(5);
    setQExplanation('');
    setQOptions([
      { id: `opt-${Date.now()}-1`, text: 'Option A', isCorrect: true },
      { id: `opt-${Date.now()}-2`, text: 'Option B', isCorrect: false },
      { id: `opt-${Date.now()}-3`, text: 'Option C', isCorrect: false },
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setQText(q.text);
    setQType(q.type);
    setQMarks(q.marks);
    setQExplanation(q.explanation || '');
    setQOptions(q.options || []);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async () => {
    if (!id || !qText.trim()) {
      toastError('Please enter the question text');
      return;
    }

    try {
      const payload: Omit<Question, 'id'> = {
        assessmentId: id,
        text: qText.trim(),
        type: qType,
        marks: qMarks || 1,
        order: editingQuestion ? editingQuestion.order : questions.length + 1,
        isRequired: true,
        explanation: qExplanation.trim() || undefined,
        options:
          qType === 'SHORT_ANSWER' || qType === 'LONG_ANSWER'
            ? undefined
            : qOptions,
        correctAnswers:
          qType === 'SHORT_ANSWER' || qType === 'LONG_ANSWER'
            ? []
            : qOptions.filter((o) => o.isCorrect).map((o) => o.id),
      };

      if (editingQuestion) {
        await questionApi.update({ ...payload, id: editingQuestion.id });
        success('Question updated successfully');
      } else {
        await questionApi.create(id, payload);
        success('New question added to assessment');
      }

      setIsModalOpen(false);
      fetchQuestionsData();
    } catch {
      toastError('Could not save question');
    }
  };

  const handleDuplicate = async (q: Question) => {
    if (!id) return;
    try {
      const duplicatePayload: Omit<Question, 'id'> = {
        ...q,
        text: `${q.text} (Copy)`,
        order: questions.length + 1,
      };
      await questionApi.create(id, duplicatePayload);
      success('Question duplicated');
      fetchQuestionsData();
    } catch {
      toastError('Could not duplicate question');
    }
  };

  const handleDelete = async () => {
    if (!id || !deleteQuestionId) return;
    setIsDeleting(true);
    try {
      await questionApi.delete(id, deleteQuestionId);
      success('Question removed');
      setDeleteQuestionId(null);
      fetchQuestionsData();
    } catch {
      toastError('Failed to delete question');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReorder = async (fromIdx: number, toIdx: number) => {
    if (!id || toIdx < 0 || toIdx >= questions.length) return;
    const reordered = [...questions];
    const item = reordered.splice(fromIdx, 1)[0];
    reordered.splice(toIdx, 0, item);
    const updated = reordered.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(updated);

    try {
      await questionApi.saveOrder(id, updated);
      success('Question order updated');
    } catch {
      toastError('Could not save new order');
    }
  };

  if (isLoading || !assessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner size="lg" label="Loading question inventory..." />
      </div>
    );
  }

  const totalMarks = questions.reduce((s, q) => s + (q.marks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
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
            Questions: {assessment.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {questions.length} Questions configured • {totalMarks} Total marks
          </p>
        </div>

        <Button
          variant="primary"
          onClick={openAddModal}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Question
        </Button>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <EmptyState
          title="No questions in this assessment"
          description="Create your first question with single-choice, multi-choice, true/false, or essay inputs."
          actionLabel="Add First Question"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id} className="p-5 sm:p-6 border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="primary" size="sm">
                        {q.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-500">
                        {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900 leading-snug">
                      {q.text}
                    </h3>

                    {/* Options Preview */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt) => {
                          const isCorrect =
                            opt.isCorrect || q.correctAnswers?.includes(opt.id);
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                                  : 'bg-slate-50 border-slate-100 text-slate-600'
                              }`}
                            >
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                                  Correct
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">Rationale: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Actions */}
                <div className="flex items-center gap-1 sm:self-start shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg"
                    title="Move Up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, idx + 1)}
                    disabled={idx === questions.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg"
                    title="Move Down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(q)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                    title="Duplicate Question"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(q)}>
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => setDeleteQuestionId(q.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-1">
          <Select
            label="Question Type"
            value={qType}
            onChange={(e) => {
              const newType = e.target.value as QuestionType;
              setQType(newType);
              if (newType === 'TRUE_FALSE') {
                setQOptions([
                  { id: 'opt-tf-1', text: 'True', isCorrect: true },
                  { id: 'opt-tf-2', text: 'False', isCorrect: false },
                ]);
              }
            }}
            options={[
              { value: 'SINGLE_CHOICE', label: 'Single Choice (Radio button)' },
              { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (Checkboxes)' },
              { value: 'TRUE_FALSE', label: 'True / False' },
              { value: 'SHORT_ANSWER', label: 'Short Answer (Text match)' },
              { value: 'LONG_ANSWER', label: 'Long Answer (Essay/Reasoning)' },
            ]}
          />

          <Textarea
            label="Question Text *"
            placeholder="e.g. Which layer of the OSI model does TLS encryption operate on?"
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            rows={3}
          />

          <Input
            label="Marks Awarded"
            type="number"
            min={1}
            max={100}
            value={qMarks}
            onChange={(e) => setQMarks(parseInt(e.target.value) || 1)}
          />

          {/* Options for Choices & True/False */}
          {(qType === 'SINGLE_CHOICE' || qType === 'MULTIPLE_CHOICE' || qType === 'TRUE_FALSE') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Options & Correct Answer Markers
                </span>
                {qType !== 'TRUE_FALSE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setQOptions((prev) => [
                        ...prev,
                        { id: `opt-${Date.now()}`, text: `Option ${prev.length + 1}`, isCorrect: false },
                      ])
                    }
                  >
                    + Add Option
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                {qOptions.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type={qType === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                      name="correct-opt"
                      checked={!!opt.isCorrect}
                      onChange={(e) => {
                        if (qType === 'MULTIPLE_CHOICE') {
                          setQOptions((prev) =>
                            prev.map((o) => (o.id === opt.id ? { ...o, isCorrect: e.target.checked } : o))
                          );
                        } else {
                          setQOptions((prev) =>
                            prev.map((o) => ({ ...o, isCorrect: o.id === opt.id }))
                          );
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 shrink-0"
                    />
                    <Input
                      value={opt.text}
                      onChange={(e) =>
                        setQOptions((prev) =>
                          prev.map((o) => (o.id === opt.id ? { ...o, text: e.target.value } : o))
                        )
                      }
                      className="text-xs sm:text-sm"
                    />
                    {qOptions.length > 2 && qType !== 'TRUE_FALSE' && (
                      <button
                        type="button"
                        onClick={() => setQOptions((prev) => prev.filter((o) => o.id !== opt.id))}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Textarea
            label="Explanation (Shown in result review)"
            placeholder="Explain why the correct answer is right..."
            value={qExplanation}
            onChange={(e) => setQExplanation(e.target.value)}
            rows={2}
          />

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveQuestion}>
              Save Question
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteQuestionId}
        onClose={() => setDeleteQuestionId(null)}
        onConfirm={handleDelete}
        title="Delete Question?"
        message="This will remove this question from the assessment. Are you sure you want to proceed?"
        confirmLabel="Yes, Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
