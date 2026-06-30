'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  const closeToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Global Alert Modal (Consistent with Confirmation Modal) */}
      {toast.show && (
        <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 shadow-luxury rounded-[2.5rem] p-6 text-center space-y-4 animate-scaleIn">
            {/* Icon Box */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-inner ${
              toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
              toast.type === 'error' ? 'bg-red-500/10 text-red-500' :
              'bg-blue-500/10 text-blue-500'
            }`}>
              {toast.type === 'success' && <CheckCircle2 className="w-6 h-6 stroke-[2.5px]" />}
              {toast.type === 'error' && <AlertCircle className="w-6 h-6 stroke-[2.5px]" />}
              {toast.type === 'info' && <Info className="w-6 h-6 stroke-[2.5px]" />}
            </div>

            {/* Title and Message */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                {toast.type === 'success' ? 'Berhasil' : toast.type === 'error' ? 'Gagal' : 'Informasi'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed px-2">
                {toast.message}
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={closeToast}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary via-primary/95 to-accent text-white font-bold text-xs uppercase tracking-wider shadow-premium hover:shadow-accent/25 active:scale-[0.98] transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast harus digunakan di dalam ToastProvider');
  return ctx;
};
