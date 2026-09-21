import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { Assessment } from '../../types';
import { ASSESSMENT_CATEGORIES } from '../../constants';
import { Button, Card, Input, Textarea, Select, LoadingSpinner } from '../../components/ui';
import { ArrowLeft, Save, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AssessmentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(ASSESSMENT_CATEGORIES[0]);
  const [instructions, setInstructions] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [passingScore, setPassingScore] = useState<number>(70);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await assessmentApi.getById(id);
        setAssessment(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setInstructions(data.instructions || '');
        setDurationMinutes(data.settings.timeLimitMinutes);
        setPassingScore(data.settings.passingScorePercentage);
      } catch {
        navigate('/assessments');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssessment();
  }, [id, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !assessment) return;

    setIsSaving(true);
    try {
      await assessmentApi.update(id, {
        title: title.trim(),
        description: description.trim(),
        category,
        instructions: instructions.trim(),
        settings: {
          ...assessment.settings,
          timeLimitMinutes: durationMinutes,
          passingScorePercentage: passingScore,
        },
      });
      success('Assessment details updated successfully');
      navigate(`/assessments/${id}`);
    } catch {
      toastError('Failed to save assessment changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !assessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner size="lg" label="Loading assessment settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(`/assessments/${id}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assessment Hub
        </button>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-bold text-slate-900">Edit Assessment</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Modify core titles, descriptions, categories, and duration.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Assessment Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={ASSESSMENT_CATEGORIES}
          />

          <Textarea
            label="Description *"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />

          <Textarea
            label="Candidate Instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Time Limit (Minutes) *"
              type="number"
              min={1}
              max={300}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 1)}
              required
            />

            <Input
              label="Passing Score Percentage (%) *"
              type="number"
              min={1}
              max={100}
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
              required
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/assessments/${id}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
