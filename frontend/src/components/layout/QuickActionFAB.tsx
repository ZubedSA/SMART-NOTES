'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Users, CheckSquare, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickActionFAB = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const actions = [
    { label: 'Tambah Catatan', icon: FileText, color: 'bg-emerald-600', href: '/notes?new=true' },
    { label: 'Tambah Meeting', icon: Users, color: 'bg-blue-600', href: '/meetings?new=true' },
    { label: 'Tambah Task', icon: CheckSquare, color: 'bg-amber-600', href: '/tasks?new=true' },
    { label: 'Tambah Agenda', icon: Calendar, color: 'bg-purple-600', href: '/calendar?new=true' },
  ];

  const handleAction = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className="hidden lg:flex fixed bottom-8 right-8 z-[9999] flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-4 space-y-2 flex flex-col items-end"
          >
            {actions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                  onClick={() => handleAction(act.href)}
                  className="flex items-center gap-3 px-4.5 py-2.5 rounded-2xl shadow-premium hover:shadow-soft bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/60 hover:scale-[1.03] transition-all duration-200"
                >
                  <span className="text-xs font-bold tracking-wide">{act.label}</span>
                  <div className={`w-8 h-8 rounded-xl ${act.color} text-white flex items-center justify-center shadow-sm`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-primary/95 to-accent text-white flex items-center justify-center shadow-premium hover:shadow-accent/30 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/10"
        title="Quick Action"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          {open ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </button>
    </div>
  );
};
