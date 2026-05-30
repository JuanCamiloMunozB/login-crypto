/**
 * login/page.tsx — Login page
 *
 * Split-panel layout:
 *   Left  — authentication form (username + password)
 *   Right — decorative cybersecurity visual with CSS animations (desktop only)
 *
 * Authentication flow:
 *   1. The user enters credentials and submits the form.
 *   2. POST /api/auth/login is called on the backend.
 *   3. On success the JWT and role are stored in localStorage (auth.ts).
 *   4. The user is redirected based on their role:
 *        ADMIN → /admin
 *        USER  → /dashboard
 *
 * If the user already has an active session they are redirected immediately
 * on mount via the initial useEffect check.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { saveAuth, getUser } from '@/lib/auth';
import { translateError } from '@/lib/errors';
import PasswordInput from '@/components/PasswordInput';

const DARK_INPUT =
  'block w-full bg-transparent border-0 border-b border-slate-600 px-0 py-2.5 pr-8 text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-0 transition-colors';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const registered = params.get('registered') === '1';

  useEffect(() => {
    const user = getUser();
    if (user) router.replace(user.role === 'ADMIN' ? '/admin' : '/dashboard');
  }, [router]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      saveAuth(data.token, { username: data.username, role: data.role as 'ADMIN' | 'USER' });
      router.replace(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#07091a' }}>

      {/* ── Left panel: form ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-14 xl:px-20 py-12"
           style={{ background: '#0a0d20' }}>

        <div className="max-w-sm w-full mx-auto">
          {/* Back / logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm font-medium">SecureAuth</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">Iniciar sesión</h1>
          <p className="text-slate-400 text-sm mb-8">
            Ingresa tus credenciales para acceder al sistema
          </p>

          {registered && (
            <div className="mb-6 flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Cuenta creada exitosamente. Ahora puedes ingresar.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Nombre de usuario"
                className="block w-full bg-transparent border-0 border-b border-slate-600 px-0 py-2.5 text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Contraseña
              </label>
              <PasswordInput
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Tu contraseña"
                inputClassName={DARK_INPUT}
                className="[&_button]:text-slate-500 [&_button:hover]:text-slate-300"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm text-red-400 border border-red-500/30 bg-red-500/10">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0a0d20] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)' }}
            >
              {loading ? 'Verificando...' : 'Ingresar al sistema'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right panel: cybersecurity visual ── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center"
           style={{ background: '#06081a' }}>

        {/* Animated glowing blobs */}
        <div className="absolute w-96 h-96 rounded-full blur-3xl animate-blob opacity-40"
             style={{ background: '#3b5bdb', top: '5%', left: '5%' }} />
        <div className="absolute w-80 h-80 rounded-full blur-3xl animate-blob-delay-2 opacity-30"
             style={{ background: '#7c3aed', top: '45%', right: '5%' }} />
        <div className="absolute w-72 h-72 rounded-full blur-3xl animate-blob-delay-4 opacity-25"
             style={{ background: '#db2777', bottom: '5%', left: '25%' }} />
        <div className="absolute w-56 h-56 rounded-full blur-3xl animate-blob opacity-20"
             style={{ background: '#06b6d4', top: '30%', right: '30%' }} />

        {/* Rotating ring */}
        <div className="absolute w-[420px] h-[420px] rounded-full border border-blue-500/20 animate-spin-slow" />
        <div className="absolute w-[520px] h-[520px] rounded-full border border-violet-500/10 animate-spin-slow"
             style={{ animationDirection: 'reverse', animationDuration: '30s' }} />

        {/* Central shield */}
        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <div className="relative mb-8 animate-pulse-glow">
            {/* Glow halo */}
            <div className="absolute inset-0 blur-2xl opacity-60 scale-150"
                 style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)' }} />
            <svg className="w-32 h-32 relative" viewBox="0 0 100 100" fill="none">
              {/* Outer shield */}
              <path d="M50 5 L90 20 L90 50 C90 72 72 88 50 95 C28 88 10 72 10 50 L10 20 Z"
                    fill="none" stroke="url(#shieldGrad)" strokeWidth="2.5" strokeLinejoin="round" />
              {/* Inner shield */}
              <path d="M50 15 L82 27 L82 50 C82 67 67 80 50 87 C33 80 18 67 18 50 L18 27 Z"
                    fill="url(#shieldFill)" />
              {/* Lock body */}
              <rect x="37" y="52" width="26" height="20" rx="3" fill="none" stroke="#93c5fd" strokeWidth="2" />
              {/* Lock shackle */}
              <path d="M41 52 L41 44 C41 38 59 38 59 44 L59 52"
                    fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
              {/* Lock keyhole */}
              <circle cx="50" cy="61" r="3" fill="#93c5fd" />
              <rect x="48.5" y="62" width="3" height="4" rx="1" fill="#93c5fd" />

              <defs>
                <linearGradient id="shieldGrad" x1="10" y1="5" x2="90" y2="95" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#818cf8" />
                </linearGradient>
                <linearGradient id="shieldFill" x1="18" y1="15" x2="82" y2="87" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#2e1065" stopOpacity="0.3" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">Seguridad Avanzada</h2>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
            Tus credenciales están protegidas con cifrado PBKDF2, salt aleatorio y autenticación JWT.
          </p>

          {/* Tech badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-7">
            {['PBKDF2', 'Salt', 'JWT', 'AES-256'].map(tag => (
              <span key={tag}
                    className="px-3 py-1 rounded-full text-xs font-semibold text-blue-300 border border-blue-500/30 bg-blue-500/10">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
