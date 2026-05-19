import * as React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--color-muted)]/30 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-[var(--color-primary)] ${className}`.trim()}
      {...props}
    />
  );
}
