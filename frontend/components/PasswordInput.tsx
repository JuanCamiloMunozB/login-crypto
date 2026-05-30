/**
 * PasswordInput.tsx — Password field with show/hide toggle
 *
 * Reusable component that wraps a password <input> and adds an eye icon
 * button to toggle text visibility.
 *
 * Accepts all standard HTML input props (except "type", which is managed
 * internally). Use the `inputClassName` prop to fully replace the default
 * input styles — useful for applying the dark theme on login/register forms.
 */

'use client';

import { useState, InputHTMLAttributes } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /**
   * Fully replaces the <input> className when provided.
   * Used to apply the dark underline style on auth pages without
   * inheriting the default light-theme border and background.
   */
  inputClassName?: string;
};

/** Default styles for the light theme (dashboard). */
const DEFAULT_CLASS =
  'block w-full rounded-lg border border-slate-200 px-3.5 py-2.5 pr-11 text-slate-900 placeholder-slate-400 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';

export default function PasswordInput({ inputClassName, className = '', ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={inputClassName ?? DEFAULT_CLASS}
      />

      {/* tabIndex=-1 keeps the toggle out of the tab order so it does not interrupt form navigation */}
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 transition-colors"
      >
        {visible ? (
          /* Slashed eye — password is currently visible */
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          /* Open eye — password is currently hidden */
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
