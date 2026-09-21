import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { Home, ArrowLeft, FileQuestion } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-sm">
          <FileQuestion className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <h2 className="text-xl font-bold text-slate-800">Page not found</h2>
          <p className="text-sm text-slate-500">
            The page you are looking for doesn't exist, has been moved, or the assessment access code is invalid.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Go Back
          </Button>
          <Link to="/">
            <Button variant="primary" size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
