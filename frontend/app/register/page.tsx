'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { translateError } from '@/lib/errors';
import PasswordInput from '@/components/PasswordInput';

const DARK_INPUT =
  'block w-full bg-transparent border-0 border-b border-slate-600 px-0 py-2.5 pr-8 text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-0 transition-colors';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await authApi.register(username, password);
      router.push('/login?registered=1');
    } catch (err) {
      setError(translateError(err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4"
         style={{ background: '#07091a' }}>

      {/* Blobs de fondo */}
      <div className="fixed w-96 h-96 rounded-full blur-3xl animate-blob opacity-20 pointer-events-none"
           style={{ background: '#3b5bdb', top: '-5%', right: '5%' }} />
      <div className="fixed w-80 h-80 rounded-full blur-3xl animate-blob-delay-2 opacity-15 pointer-events-none"
           style={{ background: '#7c3aed', bottom: '0%', left: '5%' }} />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span className="text-slate-400 text-sm font-medium">SecureAuth</span>
        </div>

        <div className="rounded-2xl border border-slate-700/50 p-8" style={{ background: '#0a0d20' }}>
          <h1 className="text-2xl font-bold text-white mb-1">Crear cuenta</h1>
          <p className="text-slate-400 text-sm mb-8">Regístrate para acceder al sistema</p>

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
                placeholder="Elige un nombre de usuario"
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
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                inputClassName={DARK_INPUT}
                className="[&_button]:text-slate-500 [&_button:hover]:text-slate-300"
              />
              <p className="mt-2 text-xs text-slate-500">
                Debe contener mayúscula, minúscula y un número
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Confirmar contraseña
              </label>
              <PasswordInput
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repite la contraseña"
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
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
