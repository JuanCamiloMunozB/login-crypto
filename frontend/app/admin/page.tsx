/**
 * admin/page.tsx — Administration panel (role ADMIN)
 *
 * Admin-exclusive features:
 *   1. List all registered users      (GET    /api/admin/users)
 *   2. Delete a user account          (DELETE /api/admin/users/{username})
 *      The backend prevents deleting the admin account itself.
 *   3. Clear a user's credentials     (PUT    /api/admin/users/{username}/clear-password)
 *      Sets passwordHash, salt and iterations to NULL in the database,
 *      locking the user out until their account is managed by the admin.
 *
 * User search is client-side only (useMemo) since the full list is already
 * loaded into memory after the initial fetch.
 *
 * Route protection:
 *   - No active session → redirects to /login.
 *   - Role USER         → redirects to /dashboard.
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUser, clearAuth } from '@/lib/auth';
import { adminApi } from '@/lib/api';
import { translateError } from '@/lib/errors';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const user = getUser();
    const token = getToken();
    if (!user || !token) { router.replace('/login'); return; }
    if (user.role !== 'ADMIN') { router.replace('/dashboard'); return; }
    loadUsers(token);
  }, [router]);

  const currentUser = getUser();
  const token = getToken();

  async function loadUsers(t = token) {
    if (!t) return;
    setLoading(true); setFetchError('');
    try { setUsers(await adminApi.listUsers(t)); }
    catch { setFetchError('No se pudo cargar la lista de usuarios'); }
    finally { setLoading(false); }
  }

  function clearMessages() { setActionMsg(''); setActionError(''); }

  async function handleDelete(username: string) {
    if (!confirm(`¿Eliminar al usuario "${username}"?\nEsta acción no se puede deshacer.`)) return;
    clearMessages(); setBusy(`${username}:delete`);
    try {
      await adminApi.deleteUser(token!, username);
      setActionMsg(`Usuario "${username}" eliminado exitosamente`);
      setUsers(prev => prev.filter(u => u !== username));
    } catch (err) {
      setActionError(translateError(err instanceof Error ? err.message : ''));
    } finally { setBusy(null); }
  }

  async function handleClearPassword(username: string) {
    if (!confirm(`¿Poner en blanco la contraseña de "${username}"?\nEl usuario no podrá iniciar sesión.`)) return;
    clearMessages(); setBusy(`${username}:clear`);
    try {
      await adminApi.clearPassword(token!, username);
      setActionMsg(`Contraseña de "${username}" eliminada`);
    } catch (err) {
      setActionError(translateError(err instanceof Error ? err.message : ''));
    } finally { setBusy(null); }
  }

  function handleLogout() { clearAuth(); router.replace('/login'); }

  const regularUsers = users.filter(u => u !== currentUser?.username);

  const filtered = useMemo(() =>
    users.filter(u => u.toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  function avatarBg(_name: string) {
    return 'rgba(99,102,241,0.25)';
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen" style={{ background: '#07091a' }}>

      {/* Blobs */}
      <div className="fixed w-[500px] h-[500px] rounded-full blur-3xl animate-blob opacity-10 pointer-events-none"
           style={{ background: '#3b5bdb', top: '-15%', left: '-5%' }} />
      <div className="fixed w-96 h-96 rounded-full blur-3xl animate-blob-delay-2 opacity-10 pointer-events-none"
           style={{ background: '#7c3aed', bottom: '-5%', right: '0%' }} />
      <div className="fixed w-72 h-72 rounded-full blur-3xl animate-blob-delay-4 opacity-8 pointer-events-none"
           style={{ background: '#0891b2', top: '40%', right: '15%' }} />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-700/50" style={{ background: '#0a0d20' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{currentUser.username}</p>
              <p className="text-xs font-medium" style={{ color: '#a78bfa' }}>Administrador del sistema</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 relative z-10">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-white">Panel de administración</h1>
          <p className="text-sm text-slate-400 mt-1">Gestiona los usuarios y credenciales del sistema</p>
        </div>

        {/* Feedback messages */}
        {actionMsg && (
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {actionMsg}
          </div>
        )}
        {actionError && (
          <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-red-400 border border-red-500/30 bg-red-500/10">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {actionError}
          </div>
        )}

        {/* Users table */}
        <div className="rounded-2xl border border-slate-700/50 overflow-hidden" style={{ background: '#0a0d20' }}>

          {/* Table header with search */}
          <div className="px-6 py-4 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Gestión de usuarios</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {loading ? 'Cargando...' : `${regularUsers.length} ${regularUsers.length === 1 ? 'usuario registrado' : 'usuarios registrados'}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="pl-9 pr-4 py-2 text-sm rounded-lg text-white placeholder-slate-500 border border-slate-600 bg-slate-800/50 focus:outline-none focus:border-violet-500 transition-colors w-44"
                />
              </div>
              {/* Refresh */}
              <button
                onClick={() => loadUsers()}
                disabled={loading || busy !== null}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-slate-600 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 disabled:opacity-40 transition-colors"
              >
                <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>

          {/* Column labels */}
          {!loading && users.length > 0 && (
            <div className="px-6 py-2 flex items-center justify-between border-b border-slate-700/30">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Usuario</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Acciones</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Cargando usuarios...
            </div>
          ) : fetchError ? (
            <p className="py-16 text-center text-sm text-red-400">{fetchError}</p>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <svg className="w-10 h-10 text-slate-700 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
              <p className="text-sm text-slate-500">No se encontraron usuarios</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-700/30">
              {filtered.map(username => {
                const isMe = username === currentUser.username;
                return (
                  <li key={username}
                      className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.025]">

                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-indigo-300"
                             style={{ background: avatarBg(username), border: '1px solid rgba(99,102,241,0.3)' }}>
                          {username[0].toUpperCase()}
                        </div>
                        {isMe && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0a0d20] flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-indigo-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{username}</span>
                          {isMe && (
                            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                                  style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                              tú
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {isMe ? 'Administrador' : 'Usuario registrado'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isMe ? (
                      <div className="flex shrink-0 gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleClearPassword(username)}
                          disabled={busy !== null}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:opacity-40 transition-all"
                        >
                          {busy === `${username}:clear` ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          )}
                          {busy === `${username}:clear` ? 'Limpiando...' : 'Limpiar contraseña'}
                        </button>

                        <button
                          onClick={() => handleDelete(username)}
                          disabled={busy !== null}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-all"
                        >
                          {busy === `${username}:delete` ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          )}
                          {busy === `${username}:delete` ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-600 italic shrink-0">Cuenta protegida</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Security info */}
        <div className="rounded-2xl border border-slate-700/50 p-5" style={{ background: '#0a0d20' }}>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Configuración de seguridad</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Algoritmo', value: 'PBKDF2' },
              { label: 'Iteraciones', value: '600,000' },
              { label: 'Autenticación', value: 'JWT' },
              { label: 'Salt', value: '16 bytes' },
            ].map(item => (
              <div key={item.label}
                   className="rounded-xl px-4 py-3 border border-slate-700/50"
                   style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-sm font-bold text-indigo-400">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
