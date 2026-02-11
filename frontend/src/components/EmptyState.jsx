import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data found', message = 'There are no records to display.', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-slate-100 rounded-full p-4 mb-4">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm max-w-sm">{message}</p>
    </div>
  );
}
