import { useState } from 'react';
import { TextInput } from '../common/TextInput';
import { Button } from '../common/Button';
import { useAuth } from '../../state/AuthContext';

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const errors = {
    password: password.length >= 6 ? undefined : 'Use at least 6 characters',
    confirm: confirm === password ? undefined : "Passwords don't match",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(undefined);
    if (hasErrors) return;
    setSubmitting(true);
    const result = await signUp(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else if (result.needsEmailConfirmation) {
      setCheckEmail(true);
    }
  }

  if (checkEmail) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 text-center">
        <p className="text-2xl">📧</p>
        <h1 className="text-lg font-semibold text-slate-900">Check your email</h1>
        <p className="text-sm text-slate-500">
          We sent a confirmation link to {email}. Confirm your address, then sign in.
        </p>
        <Button variant="secondary" onClick={onSwitchToSignIn}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div className="text-center">
        <p className="text-2xl">🎂</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Create an account</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your ingredients and recipes will sync to any device you sign in on.
        </p>
      </div>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />
        <TextInput
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={touched ? errors.password : undefined}
        />
        <TextInput
          type="password"
          label="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={touched ? errors.confirm : undefined}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" disabled={submitting} className="mt-1">
          Sign up
        </Button>
      </form>
      <button
        type="button"
        onClick={onSwitchToSignIn}
        className="text-center text-sm text-slate-500 hover:text-slate-700 hover:underline"
      >
        Already have an account? Sign in
      </button>
    </div>
  );
}
