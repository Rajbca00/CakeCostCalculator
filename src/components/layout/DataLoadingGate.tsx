import type { ReactNode } from 'react';
import { useAppDataContext } from '../../state/useAppData';

export function DataLoadingGate({ children }: { children: ReactNode }) {
  const { isLoading } = useAppDataContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading your data…</p>
      </div>
    );
  }

  return <>{children}</>;
}
