'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, clearAuth } from '@/lib/auth';
import { userApi } from '@/lib/api';
import { translateError } from '@/lib/errors';
import PasswordInput from '@/components/PasswordInput';

const DARK_INPUT =
  'block w-full bg-transparent border-0 border-b border-slate-600 px-0 py-2.5 pr-8 text-white placeholder-slate-500 focus:border-violet-400 focus:outline-none focus:ring-0 transition-colors';

export default function DashboardPage() {
  const router = useRouter();
  const [lastLogin, setLastLogin] = useState<string | null | undefined>(undefined);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    if (!user || !token) { router.replace('/login'); return; }
    if (user.role === 'ADMIN') { router.replace('/admin'); return; }
    userApi.lastLogin(token)
      .then(data => setLastLogin(data.lastLogin))
      .catch(() => setFetchError('No se pudo cargar la información de sesión'));
  }, [router]);

  const user = getUser();
  const token = getToken();

  function handleLogout() { clearAuth(); router.replace('/login'); }

  async function handleChangePassword(e: { preventDefault(): void }) {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (newPassword !== confirm) { setPwError('Las contraseñas no coinciden'); return; }
    setPwLoading(true);
    try {
      await userApi.changePassword(token!, newPassword);
      setPwSuccess('Contraseña actualizada correctamente');
      setNewPassword(''); setConfirm('');
    } catch (err) {
      setPwError(translateError(err instanceof Error ? err.message : ''));
    } finally {
      setPwLoading(false);
    }
  }

  function formatDate(dt: string | null | undefined): string {
    if (dt === undefined) return 'Cargando...';
    if (!dt) return 'Este es tu primer inicio de sesión';
    return new Date(dt).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
  }

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: '#07091a' }}>

      {/* Blobs decorativos de fondo */}
      <div className="fixed w-96 h-96 rounded-full blur-3xl animate-blob opacity-10 pointer-events-none"
           style={{ background: '#3b5bdb', top: '-10%', right: '10%' }} />
      <div className="fixed w-80 h-80 rounded-full blur-3xl animate-blob-delay-4 opacity-10 pointer-events-none"
           style={{ background: '#7c3aed', bottom: '0%', left: '0%' }} />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-700/50" style={{ background: '#0a0d20' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                 style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user.username}</p>
              <p className="text-xs text-slate-400">Usuario</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-xs text-violet-300 font-medium">Sesión activa</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5 relative z-10">
        {fetchError && (
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-red-400 border border-red-500/30 bg-red-500/10">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {fetchError}
          </div>
        )}

        {/* Último login */}
        <div className="rounded-2xl border border-slate-700/50 p-6" style={{ background: '#0a0d20' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Último inicio de sesión
            </span>
          </div>
          <p className="text-white font-medium text-base pl-12">{formatDate(lastLogin)}</p>
        </div>

        {/* Cambiar contraseña */}
        <div className="rounded-2xl border border-slate-700/50 p-6" style={{ background: '#0a0d20' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
              <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <span className="text-base font-semibold text-white">Cambiar contraseña</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-7">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                Nueva contraseña
              </label>
              <PasswordInput
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
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

            {pwError && (
              <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm text-red-400 border border-red-500/30 bg-red-500/10">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {pwError}
              </div>
            )}
            {pwSuccess && (
              <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {pwSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0a0d20] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)' }}
            >
              {pwLoading ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
