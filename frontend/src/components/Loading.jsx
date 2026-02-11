import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
      <p className="text-slate-500 text-sm font-medium">{message}</p>
    </div>
  );
}
