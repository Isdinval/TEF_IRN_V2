import * as React from 'react';

type ButtonVariant = 'default' | 'outline';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className = '', variant = 'default', ...props }: ButtonProps) {
  const base =
    'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  const variants: Record<ButtonVariant, string> = {
    default: 'bg-[var(--color-primary)] text-white hover:opacity-90',
    outline: 'border border-[var(--color-muted)]/30 bg-transparent hover:bg-[var(--color-background)]',
  };

  return <button className={`${base} ${variants[variant]} ${className}`.trim()} {...props} />;
}
