import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader: React.FC = () => (
  <div className="flex items-center justify-center h-screen w-full fixed inset-0 bg-background">
    <div className="flex flex-col items-center gap-3 text-accent">
      <Loader2 className="animate-spin" size={32} />
      <p className="text-sm text-text-secondary">Carregando...</p>
    </div>
  </div>
);
