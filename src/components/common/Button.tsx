import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-300',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 disabled:text-slate-400',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100 disabled:text-red-300',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-300',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  className = '',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
