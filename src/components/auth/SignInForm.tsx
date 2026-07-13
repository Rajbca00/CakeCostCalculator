import { useState } from 'react';
import { TextInput } from '../common/TextInput';
import { Button } from '../common/Button';
import { useAuth } from '../../state/AuthContext';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

export function SignInForm({ onSwitchToSignUp }: SignInFormProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div className="text-center">
        <p className="text-2xl">🎂</p>
        <h1 className="mt-2 text-lg font-semibold text-slate-900">Sign in</h1>
      </div>
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <TextInput
          type="email"
          label="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(undefined);
          }}
          autoFocus
          required
        />
        <TextInput
          type="password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(undefined);
          }}
          error={error}
          required
        />
        <Button type="submit" disabled={submitting} className="mt-1">
          Sign in
        </Button>
      </form>
      <button
        type="button"
        onClick={onSwitchToSignUp}
        className="text-center text-sm text-slate-500 hover:text-slate-700 hover:underline"
      >
        Need an account? Sign up
      </button>
    </div>
  );
}
