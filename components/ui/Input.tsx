'use client';

import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`min-h-11 w-full rounded-xl border bg-white/[0.055] px-4 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,.04)] backdrop-blur-xl placeholder:text-slate-500 transition-all duration-200 focus:border-[#9CB4CB] focus:outline-none focus:ring-2 focus:ring-[#9CB4CB]/20 ${error ? 'border-red-500 ring-1 ring-red-500/20' : 'border-white/10 hover:border-white/20'} ${className}`}
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
