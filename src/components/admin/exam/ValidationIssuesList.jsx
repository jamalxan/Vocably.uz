'use client';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function ValidationIssuesList({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-success font-semibold">
        <CheckCircle2 size={14} /> Hech qanday muammo topilmadi
      </p>
    );
  }
  return (
    <ul className="space-y-1">
      {issues.map((issue, i) => (
        <li
          key={i}
          className={`flex items-start gap-1.5 text-xs ${issue.severity === 'error' ? 'text-danger' : 'text-warning'}`}
        >
          {issue.severity === 'error' ? (
            <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
          )}
          <span>
            <span className="font-semibold">{issue.path}:</span> {issue.message}
          </span>
        </li>
      ))}
    </ul>
  );
}
