import React from 'react';
import { DiagnosisWizard } from '../components/diagnose/DiagnosisWizard';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';

export const Diagnose: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-gray-500">AI Agriculture Lab</span>
        <Link
          to="/diagnose/history"
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
        >
          <History className="w-4 h-4" />
          <span>View Past Diagnosis Reports</span>
        </Link>
      </div>

      <DiagnosisWizard />
    </div>
  );
};
