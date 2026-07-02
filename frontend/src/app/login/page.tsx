'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, remember);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#070b13] via-primary/10 to-[#070b13] relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
 
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-950/45 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 shadow-premium border border-slate-200/50 dark:border-slate-800/30 relative z-10">
        <div className="text-center mb-8">
          <img src="/logo.svg" alt="Smart Notes Logo" className="w-14 h-14 rounded-2xl shadow-premium mx-auto mb-4 object-cover" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-primary to-accent dark:from-white dark:to-emerald-400 bg-clip-text text-transparent tracking-tight">Smart Notes</h1>
          <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-1">
            Enterprise Management System
          </p>
        </div>
 
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
 
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smart.id"
                className="w-full pl-11 pr-4 py-3 text-xs font-semibold tracking-wide border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-100 rounded-xl transition-all duration-200 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              />
            </div>
          </div>
 
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 text-xs font-semibold tracking-wide border border-slate-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/20 text-slate-800 dark:text-slate-100 rounded-xl transition-all duration-200 outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 focus:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              />
            </div>
          </div>
 
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-slate-200 dark:border-slate-800 text-accent focus:ring-accent/30 w-3.5 h-3.5"
              />
              <span>Remember Login</span>
            </label>
            <a href="#forgot" className="text-accent hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
              Forgot Password?
            </a>
          </div>
 
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In ke Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
