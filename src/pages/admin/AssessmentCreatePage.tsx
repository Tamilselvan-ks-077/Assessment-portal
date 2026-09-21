import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { questionApi } from '../../api/questionApi';
import { Assessment, Question, QuestionType, Option } from '../../types';
import { ASSESSMENT_CATEGORIES } from '../../constants';
import { generateAccessCode } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Switch,
  Badge,
  Modal,
  ConfirmDialog,
} from '../../components/ui';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  KeyRound,
  FileQuestion,
  Settings,
  BookOpen,
  Share2,
} from 'lucide-react';

export const AssessmentCreatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(ASSESSMENT_CATEGORIES[0]);
  const [instructions, setInstructions] = useState(
    '1. Answer all questions within the allocated time.\n2. Do not switch browser tabs.\n3. Verify all responses before submitting.'
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Step 2: Questions
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q-temp-1`,
      assessmentId: '',
      text: 'What is the primary benefit of component-driven architecture?',
      type: 'SINGLE_CHOICE',
      marks: 5,
      order: 1,
      isRequired: true,
      explanation: 'Component architecture promotes reusability, testability, and isolated state management.',
      options: [
        { id: 'opt-1', text: 'Reusability, isolation, and modular maintainability', isCorrect: true },
        { id: 'opt-2', text: 'Elimination of all network requests' },
        { id: 'opt-3', text: 'Faster hardware processing speed' },
      ],
      correctAnswers: ['opt-1'],
    },
  ]);

  // Question Modal state
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [qText, setQText] = useState('');
  const [qType, setQType] = useState<QuestionType>('SINGLE_CHOICE');
  const [qMarks, setQMarks] = useState(5);
  const [qExplanation, setQExplanation] = useState('');
  const [qOptions, setQOptions] = useState<Option[]>([
    { id: 'opt-1', text: 'Option A', isCorrect: true },
    { id: 'opt-2', text: 'Option B', isCorrect: false },
  ]);

  // Step 3: Settings
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showImmediateResults, setShowImmediateResults] = useState(true);
  const [allowAnswerReview, setAllowAnswerReview] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [enableAntiCheat, setEnableAntiCheat] = useState(true);

  // Step 4: Published Data
  const [createdAssessment, setCreatedAssessment] = useState<Assessment | null>(null);

  // Step validation
  const handleNextStep = () => {
    if (currentStep === 1) {
      const errs: { [key: string]: string } = {};
      if (!title.trim()) errs.title = 'Assessment title is required';
      if (!description.trim()) errs.description = 'Description is required';
      if (durationMinutes <= 0) errs.duration = 'Duration must be greater than 0';
      if (passingScore <= 0 || passingScore > 100) errs.passing = 'Passing score must be between 1 and 100';

      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setErrors({});
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (questions.length === 0) {
        toastError('Please add at least one question before proceeding');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      handleFinalPublish();
    }
  };

  const handleFinalPublish = async () => {
    setIsSaving(true);
    try {
      const accessCode = generateAccessCode();
      const newAssessmentData: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        description: description.trim(),
        category,
        instructions: instructions.trim(),
        accessCode,
        creatorId: user?.id || 'admin',
        creatorName: user?.name || 'Administrator',
        status: 'ACTIVE',
        questionsCount: questions.length,
        totalMarks: questions.reduce((s, q) => s + (q.marks || 0), 0),
        settings: {
          shuffleQuestions,
          shuffleOptions,
          showImmediateResults,
          allowAnswerReview,
          maxAttempts,
          timeLimitMinutes: durationMinutes,
          passingScorePercentage: passingScore,
          requireParticipantEmail: true,
          requireParticipantId: true,
          enableAntiCheatWarnings: enableAntiCheat,
        },
      };

      const savedAssessment = await assessmentApi.create(newAssessmentData);

      // Save questions
      const finalQuestions = questions.map((q, idx) => ({
        ...q,
        assessmentId: savedAssessment.id,
        order: idx + 1,
      }));
      await questionApi.saveOrder(savedAssessment.id, finalQuestions);

      setCreatedAssessment(savedAssessment);
      success('Assessment created & published successfully!');
      setCurrentStep(4);
    } catch {
      toastError('Could not publish assessment');
    } finally {
      setIsSaving(false);
    }
  };

  // Question editing helper
  const openNewQuestionModal = () => {
    setEditingQuestionIndex(null);
    setQText('');
    setQType('SINGLE_CHOICE');
    setQMarks(5);
    setQExplanation('');
    setQOptions([
      { id: `opt-${Date.now()}-1`, text: 'Option 1', isCorrect: true },
      { id: `opt-${Date.now()}-2`, text: 'Option 2', isCorrect: false },
    ]);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (index: number) => {
    const q = questions[index];
    setEditingQuestionIndex(index);
    setQText(q.text);
    setQType(q.type);
    setQMarks(q.marks);
    setQExplanation(q.explanation || '');
    setQOptions(q.options || []);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = () => {
    if (!qText.trim()) {
      toastError('Please enter the question text');
      return;
    }

    const questionObj: Question = {
      id: editingQuestionIndex !== null ? questions[editingQuestionIndex].id : `q-${Date.now()}`,
      assessmentId: '',
      text: qText.trim(),
      type: qType,
      marks: qMarks || 1,
      order: editingQuestionIndex !== null ? editingQuestionIndex + 1 : questions.length + 1,
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

    if (editingQuestionIndex !== null) {
      setQuestions((prev) => {
        const next = [...prev];
        next[editingQuestionIndex] = questionObj;
        return next;
      });
    } else {
      setQuestions((prev) => [...prev, questionObj]);
    }

    setIsQuestionModalOpen(false);
  };

  const deleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveQuestion = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= questions.length) return;
    setQuestions((prev) => {
      const next = [...prev];
      const item = next.splice(fromIdx, 1)[0];
      next.splice(toIdx, 0, item);
      return next.map((q, idx) => ({ ...q, order: idx + 1 }));
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Step Progress Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Create New Assessment
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Step {currentStep} of 4: {['Basic Information', 'Questions', 'Settings', 'Publish'][currentStep - 1]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === step
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : currentStep > step
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {currentStep > step ? '✓' : step}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Information */}
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Basic Assessment Details
          </div>

          <Input
            label="Assessment Title *"
            placeholder="e.g. Advanced PostgreSQL & Systems Architecture"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={ASSESSMENT_CATEGORIES}
          />

          <Textarea
            label="Assessment Description *"
            placeholder="Describe the topics tested, target audience, and certification criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            rows={3}
          />

          <Textarea
            label="Candidate Instructions"
            placeholder="Step-by-step examination guidelines shown before starting..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Time Limit (Minutes) *"
              type="number"
              min={1}
              max={300}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 15)}
              error={errors.duration}
            />

            <Input
              label="Passing Score Percentage (%) *"
              type="number"
              min={1}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
              error={errors.passing}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Configure Questions
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Questions Management */}
      {currentStep === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="text-base font-bold text-slate-900">Question Builder</div>
              <p className="text-xs text-slate-500">
                Total {questions.length} questions • {questions.reduce((s, q) => s + (q.marks || 0), 0)} Marks total
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={openNewQuestionModal}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Question
            </Button>
          </div>

          {/* Question Items List */}
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="primary" size="sm">
                        {q.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-500">
                        {q.marks} {q.marks === 1 ? 'mark' : 'marks'}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 leading-snug">{q.text}</h4>
                    {q.options && (
                      <div className="text-xs text-slate-500 mt-1">
                        {q.options.length} options defined • Correct:{' '}
                        {q.options.find((o) => o.isCorrect)?.text || 'Multiple'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Question Row Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => moveQuestion(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg"
                    title="Move Up"
                  >
                    <MoveUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(idx, idx + 1)}
                    disabled={idx === questions.length - 1}
                    className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-lg"
                    title="Move Down"
                  >
                    <MoveDown className="w-4 h-4" />
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => openEditQuestionModal(idx)}>
                    Edit
                  </Button>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back: Basic Info
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleNextStep}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Assessment Settings
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Assessment Settings */}
      {currentStep === 3 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-indigo-600" /> Delivery & Anti-Cheat Rules
          </div>

          <div className="divide-y divide-slate-100 space-y-3">
            <Switch
              checked={shuffleQuestions}
              onChange={setShuffleQuestions}
              label="Shuffle Question Order"
              description="Randomize question sequence for each individual test attempt."
            />

            <Switch
              checked={shuffleOptions}
              onChange={setShuffleOptions}
              label="Shuffle Option Positions"
              description="Randomize multiple choice options (A, B, C, D) order."
            />

            <Switch
              checked={showImmediateResults}
              onChange={setShowImmediateResults}
              label="Instant Results Release"
              description="Display score percentage and Pass/Fail status immediately upon submission."
            />

            <Switch
              checked={allowAnswerReview}
              onChange={setAllowAnswerReview}
              label="Allow Detailed Answer Review"
              description="Let candidates inspect correct answers and explanations after test submission."
            />

            <Switch
              checked={enableAntiCheat}
              onChange={setEnableAntiCheat}
              label="Enable Anti-Cheat Tab Tracking"
              description="Log and alert candidate if they switch away or minimize their browser window."
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back: Questions
            </Button>
            <Button
              variant="primary"
              size="lg"
              isLoading={isSaving}
              onClick={handleNextStep}
              rightIcon={<Sparkles className="w-4 h-4" />}
            >
              Publish Assessment
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Final Success & Share */}
      {currentStep === 4 && createdAssessment && (
        <Card className="p-8 sm:p-12 text-center space-y-6 border-slate-200 shadow-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Assessment Published!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Your assessment is now active and ready to receive candidate attempts.
            </p>
          </div>

          {/* Access Code Box */}
          <div className="p-6 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl max-w-md mx-auto space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Candidate Access Code
            </div>
            <div className="text-4xl font-mono font-black text-indigo-900 tracking-widest">
              {createdAssessment.accessCode}
            </div>
            <div className="text-xs text-slate-500 pt-1">
              Direct Link: <span className="font-mono text-indigo-600 font-semibold">{window.location.origin}/test/{createdAssessment.accessCode}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/test/${createdAssessment.accessCode}`);
                success('Link copied!');
              }}
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Copy Candidate Link
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => navigate(`/assessments/${createdAssessment.id}`)}
            >
              Go to Assessment Hub
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        title={editingQuestionIndex !== null ? 'Edit Question' : 'Add New Question'}
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-1">
          <Select
            label="Question Type"
            value={qType}
            onChange={(e) => setQType(e.target.value as QuestionType)}
            options={[
              { value: 'SINGLE_CHOICE', label: 'Single Choice (Radio button)' },
              { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (Checkboxes)' },
              { value: 'TRUE_FALSE', label: 'True / False' },
              { value: 'SHORT_ANSWER', label: 'Short Answer (Text match)' },
              { value: 'LONG_ANSWER', label: 'Long Answer (Essay/Reasoning)' },
            ]}
          />

          <Textarea
            label="Question Prompt *"
            placeholder="Type your question prompt clearly..."
            value={qText}
            onChange={(e) => setQText(e.target.value)}
            rows={3}
          />

          <Input
            label="Marks Awarded"
            type="number"
            min={1}
            max={50}
            value={qMarks}
            onChange={(e) => setQMarks(parseInt(e.target.value) || 1)}
          />

          {/* Options Editor for Choice/True-False */}
          {(qType === 'SINGLE_CHOICE' || qType === 'MULTIPLE_CHOICE' || qType === 'TRUE_FALSE') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Options & Correct Answer(s)
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
                {qOptions.map((opt, idx) => (
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
            <Button variant="outline" onClick={() => setIsQuestionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveQuestion}>
              Save Question
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
