import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../api/assessmentApi';
import { Assessment, AssessmentSettings } from '../../types';
import { Button, Card, Switch, Input, LoadingSpinner } from '../../components/ui';
import { ArrowLeft, Save, Settings, ShieldCheck, Shuffle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AssessmentSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [settings, setSettings] = useState<AssessmentSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAssessment = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await assessmentApi.getById(id);
        setAssessment(data);
        setSettings(data.settings);
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
    if (!id || !settings || !assessment) return;

    setIsSaving(true);
    try {
      await assessmentApi.update(id, { settings });
      success('Assessment delivery settings updated!');
      navigate(`/assessments/${id}`);
    } catch {
      toastError('Could not save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !assessment || !settings) {
    return (
      <div className="flex-1 flex items-center justify-center p-12">
        <LoadingSpinner size="lg" label="Loading configuration settings..." />
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
          <h1 className="text-2xl font-bold text-slate-900">Assessment Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure examination rules, anti-cheat mechanisms, and result accessibility.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Randomization & Delivery
            </h3>
            <div className="divide-y divide-slate-100">
              <Switch
                checked={settings.shuffleQuestions}
                onChange={(val) => setSettings({ ...settings, shuffleQuestions: val })}
                label="Shuffle Questions"
                description="Present questions in random order for every candidate attempt."
              />
              <Switch
                checked={settings.shuffleOptions}
                onChange={(val) => setSettings({ ...settings, shuffleOptions: val })}
                label="Shuffle Options"
                description="Randomize answer option letters (A, B, C, D) within questions."
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Candidate Security & Validation
            </h3>
            <div className="divide-y divide-slate-100">
              <Switch
                checked={settings.enableAntiCheatWarnings}
                onChange={(val) => setSettings({ ...settings, enableAntiCheatWarnings: val })}
                label="Anti-Cheat Tab Switch Warnings"
                description="Trigger alerts and increment violation counters if the user switches away."
              />
              <Switch
                checked={settings.requireParticipantEmail}
                onChange={(val) => setSettings({ ...settings, requireParticipantEmail: val })}
                label="Require Candidate Email"
                description="Mandate a valid email before examination access is granted."
              />
              <Switch
                checked={settings.requireParticipantId}
                onChange={(val) => setSettings({ ...settings, requireParticipantId: val })}
                label="Require Student / Candidate ID"
                description="Collect institutional identification code during check-in."
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Grading & Post-Exam Policies
            </h3>
            <div className="divide-y divide-slate-100">
              <Switch
                checked={settings.showImmediateResults}
                onChange={(val) => setSettings({ ...settings, showImmediateResults: val })}
                label="Release Instant Score"
                description="Show score percentage and Pass/Fail badge right after submission."
              />
              <Switch
                checked={settings.allowAnswerReview}
                onChange={(val) => setSettings({ ...settings, allowAnswerReview: val })}
                label="Enable Answer Review & Explanations"
                description="Permit candidates to view the answer key and question rationale."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Input
              label="Max Attempts Permitted"
              type="number"
              min={1}
              max={10}
              value={settings.maxAttempts}
              onChange={(e) =>
                setSettings({ ...settings, maxAttempts: parseInt(e.target.value) || 1 })
              }
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
              Save Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
