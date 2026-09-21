import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button, Card, Input, Badge } from '../../components/ui';
import { UserCheck, Mail, Building, ShieldCheck, Save, Sparkles } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { success } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [organization, setOrganization] = useState(user?.organization || 'AssessPulse Academy');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUser({ name, email, organization });
      success('Profile information saved successfully');
      setIsSaving(false);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your administrator identity and organization credentials.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`
            }
            alt=""
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-50 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <Badge variant="primary" size="sm">
                {user?.role || 'ADMIN'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user?.organization}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserCheck className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          <Input
            label="Organization / Department"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            leftIcon={<Building className="w-4 h-4 text-slate-400" />}
          />

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Update Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
