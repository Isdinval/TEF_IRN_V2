import * as React from 'react';

type SliderProps = {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  className?: string;
};

export function Slider({ min = 0, max = 100, step = 1, value = [0], onValueChange, className = '' }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0] ?? min}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
      className={`w-full accent-[var(--color-primary)] ${className}`.trim()}
    />
  );
}
