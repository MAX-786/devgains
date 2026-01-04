import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  unit: string;
  colorClass: string;
}

export const CircularProgress: React.FC<ProgressBarProps> = ({ current, target, label, unit, colorClass }) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const radius = 30;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700/50">
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="text-slate-700"
          />
          <circle
            stroke="currentColor"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={colorClass}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-xs font-bold text-slate-200">{Math.round(percentage)}%</span>
      </div>
      <div className="mt-2 text-center">
        <div className="text-xl font-bold text-white leading-none">{current}</div>
        <div className="text-xs text-slate-400">/ {target} {unit}</div>
        <div className="text-xs font-medium uppercase tracking-wider text-slate-500 mt-1">{label}</div>
      </div>
    </div>
  );
};
