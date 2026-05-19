import * as React from 'react';

type CalendarProps = {
  selected?: Date;
  onSelect?: (date?: Date) => void;
  className?: string;
  mode?: 'single';
};

export function Calendar({ selected, onSelect, className = '' }: CalendarProps) {
  return (
    <input
      type="date"
      value={selected ? selected.toISOString().split('T')[0] : ''}
      onChange={(e) => onSelect?.(e.target.value ? new Date(`${e.target.value}T00:00:00`) : undefined)}
      className={`w-full rounded-xl border border-[var(--color-muted)]/30 bg-white px-4 py-3 outline-none focus:border-[var(--color-primary)] ${className}`.trim()}
    />
  );
}
