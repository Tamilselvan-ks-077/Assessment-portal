import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Button, Card, Input, Switch, ConfirmDialog } from '../../components/ui';
import { Settings, Server, Shield, RotateCcw, Save } from 'lucide-react';
import { initSeedData } from '../../utils/storage';

export const SettingsPage: React.FC = () => {
  const { success } = useToast();

  const [apiBaseUrl, setApiBaseUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'https://api.assesspulse.io/v1');
  const [defaultDuration, setDefaultDuration] = useState(15);
  const [defaultPassingScore, setDefaultPassingScore] = useState(70);
  const [enforceAntiCheatByDefault, setEnforceAntiCheatByDefault] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Platform settings saved successfully');
  };

  const handleResetData = () => {
    localStorage.clear();
    initSeedData();
    setShowResetConfirm(false);
    success('Demo seed data restored to initial state!');
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Global assessment defaults, backend API integration endpoints, and database seed controls.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Backend API Configuration */}
        <Card className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Server className="w-5 h-5 text-indigo-600" /> Backend REST API
          </div>

          <Input
            label="API Base URL (VITE_API_BASE_URL)"
            value={apiBaseUrl}
            onChange={(e) => setApiBaseUrl(e.target.value)}
            hint="Frontend makes Axios requests with fallback to local state when backend is disconnected."
          />
        </Card>

        {/* Global Assessment Defaults */}
        <Card className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Shield className="w-5 h-5 text-indigo-600" /> Default Test Rules
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Default Duration (Minutes)"
              type="number"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 15)}
            />

            <Input
              label="Default Passing Score (%)"
              type="number"
              value={defaultPassingScore}
              onChange={(e) => setDefaultPassingScore(parseInt(e.target.value) || 70)}
            />
          </div>

          <div className="pt-2">
            <Switch
              checked={enforceAntiCheatByDefault}
              onChange={setEnforceAntiCheatByDefault}
              label="Anti-Cheat Active by Default"
              description="Automatically enable tab switch monitor for newly created assessments."
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" leftIcon={<Save className="w-4 h-4" />}>
              Save Preferences
            </Button>
          </div>
        </Card>

        {/* Developer / Seed Reset Box */}
        <Card className="p-6 border-rose-100 bg-rose-50/20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Reset Demo Database</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Restores sample tests (REACT99, CLOUD44, SQL2024), question pools, and candidate analytics.
              </p>
            </div>

            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Seed Data
            </Button>
          </div>
        </Card>
      </form>

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetData}
        title="Reset All Local Data?"
        message="This will clear your local mock attempts and assessments, restoring initial seed fixtures."
        variant="danger"
        confirmLabel="Yes, Reset Everything"
      />
    </div>
  );
};
