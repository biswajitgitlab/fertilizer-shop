import React from 'react';
import { Loader2 } from 'lucide-react';

import { useSiteSettingsStore } from '../../store/siteSettingsStore';

export const Loader: React.FC<{ text?: string; fullScreen?: boolean }> = ({
  text,
  fullScreen = false
}) => {
  const { appName } = useSiteSettingsStore();
  const loadingText = text || `Loading ${appName}...`;

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-gray-600">{loadingText}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};
