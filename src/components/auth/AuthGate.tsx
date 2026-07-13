import { useState, type ReactNode } from 'react';
import { useAuth } from '../../state/AuthContext';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  if (status === 'signedIn') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      {mode === 'signIn' ? (
        <SignInForm onSwitchToSignUp={() => setMode('signUp')} />
      ) : (
        <SignUpForm onSwitchToSignIn={() => setMode('signIn')} />
      )}
    </div>
  );
}
