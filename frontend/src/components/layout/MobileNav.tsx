'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  FileText,
  Users,
  CheckSquare,
  Calendar,
  Sparkles,
  Plus,
  Grid,
  TrendingUp,
  BarChart3,
  Database,
  Bot,
  X,
  ChevronRight,
  Zap,
  LogOut,
} from 'lucide-react';

interface MoreMenuItem {
  label: string;
  href: string;
  icon: any;
  color: string;
  bg: string;
  badge?: string;
  roles?: string[];
}

export const MobileNav = () => {
  const pathname = usePathname() || '/';
  const { hasRole, logout } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const mainNavItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Catatan', href: '/notes', icon: FileText },
    { label: 'Rapat', href: '/meetings', icon: Users },
  ];

  const moreMenuItems: MoreMenuItem[] = [
    { label: 'Tugas & Kanban', href: '/tasks', icon: CheckSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Kalender', href: '/calendar', icon: Calendar, color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { label: 'AI Assistant', href: '/ai-assistant', icon: Bot, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', badge: 'New' },
    { label: 'Dashboard', href: '/monitoring', icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    { label: 'Laporan', href: '/reports', icon: BarChart3, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    { label: 'Master Data', href: '/master', icon: Database, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)', roles: ['Admin'] },
  ];

  const quickActions = [
    { label: 'Catatan Baru', href: '/notes?new=true', icon: FileText, desc: 'Tulis ide atau notulen' },
    { label: 'Jadwalkan Rapat', href: '/meetings?new=true', icon: Users, desc: 'Buat agenda rapat baru' },
    { label: 'Tanya AI', href: '/ai-assistant', icon: Sparkles, desc: 'Rangkum transkrip otomatis' },
  ];

  const isOnMorePage = ['/tasks', '/calendar', '/ai-assistant', '/monitoring', '/reports', '/master'].some(p => pathname.startsWith(p));
  const closeAll = () => { setShowMoreMenu(false); setShowQuickAdd(false); };
  const checkActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '52px',
    padding: '6px 0',
    borderRadius: '12px',
    textDecoration: 'none',
    color: active ? '#14532D' : '#94a3b8',
    fontWeight: active ? 700 : 400,
    background: active ? 'rgba(22,163,74,0.1)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
  });

  return (
    <>
      {/* Backdrop overlay */}
      {(showMoreMenu || showQuickAdd) && (
        <div className="mobile-dock-overlay" onClick={closeAll} />
      )}

      {/* Quick Add Drawer */}
      {showQuickAdd && (
        <div className="mobile-dock-drawer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '12px', background: 'linear-gradient(135deg, #14532D, #16A34A)', color: 'white' }}>
                <Zap style={{ width: 16, height: 16 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Aksi Cepat</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Pintasan data baru</div>
              </div>
            </div>
            <button onClick={() => setShowQuickAdd(false)} style={{ padding: 6, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: 16, height: 16, color: '#64748b' }} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quickActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <Link key={idx} href={act.href} onClick={closeAll} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, background: '#f8fafc', border: '1px solid #e2e8f0', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(22,163,74,0.1)', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon style={{ width: 20, height: 20 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{act.label}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{act.desc}</div>
                    </div>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: '#94a3b8' }} />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* More Menu Drawer */}
      {showMoreMenu && (
        <div className="mobile-dock-drawer" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>
                <Grid style={{ width: 16, height: 16 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Menu & Modul</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>Akses seluruh fitur</div>
              </div>
            </div>
            <button onClick={() => setShowMoreMenu(false)} style={{ padding: 6, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>
              <X style={{ width: 16, height: 16, color: '#64748b' }} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {moreMenuItems.filter(item => !item.roles || hasRole(item.roles)).map((item, idx) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link key={idx} href={item.href} onClick={closeAll} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: 14, borderRadius: 16, textDecoration: 'none', position: 'relative', overflow: 'hidden',
                  background: active ? 'linear-gradient(135deg, #14532D, #16A34A)' : '#f8fafc',
                  color: active ? 'white' : '#1e293b',
                  border: active ? 'none' : '1px solid #e2e8f0',
                  boxShadow: active ? '0 4px 15px rgba(22,163,74,0.3)' : 'none',
                }}>
                  {item.badge && !active && (
                    <span style={{ position: 'absolute', top: 8, right: 8, padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 800, background: '#16A34A', color: 'white' }}>
                      {item.badge}
                    </span>
                  )}
                  <div style={{ padding: 8, borderRadius: 12, marginBottom: 8, background: active ? 'rgba(255,255,255,0.2)' : item.bg, color: active ? 'white' : item.color }}>
                    <Icon style={{ width: 20, height: 20 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3 }}>{item.label}</span>
                </Link>
              );
            })}
          </div>
          <button 
            onClick={() => { closeAll(); logout(); }}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
            <span>Keluar / Logout</span>
          </button>
        </div>
      )}

      {/* ===== NAVBAR DOCK ===== */}
      <nav className="mobile-dock">
        {/* Left: Home + Catatan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {mainNavItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={closeAll} style={navItemStyle(active)}>
                <Icon style={{ width: 20, height: 20, strokeWidth: active ? 2.5 : 2 }} />
                <span style={{ fontSize: 10, marginTop: 3 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Center: FAB */}
        <div style={{ position: 'relative', marginTop: -24 }}>
          <button
            onClick={() => { setShowQuickAdd(!showQuickAdd); setShowMoreMenu(false); }}
            style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'linear-gradient(135deg, #14532D, #166534, #16A34A)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(22,163,74,0.4)',
              border: '3px solid white', cursor: 'pointer',
              transition: 'transform 0.2s',
              transform: showQuickAdd ? 'rotate(45deg)' : 'none',
            }}
          >
            <Plus style={{ width: 24, height: 24, strokeWidth: 3 }} />
          </button>
        </div>

        {/* Right: Rapat + Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {mainNavItems.slice(2).map((item) => {
            const Icon = item.icon;
            const active = checkActive(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={closeAll} style={navItemStyle(active)}>
                <Icon style={{ width: 20, height: 20, strokeWidth: active ? 2.5 : 2 }} />
                <span style={{ fontSize: 10, marginTop: 3 }}>{item.label}</span>
              </Link>
            );
          })}
          <button onClick={() => { setShowMoreMenu(!showMoreMenu); setShowQuickAdd(false); }} style={navItemStyle(showMoreMenu || isOnMorePage)}>
            <Grid style={{ width: 20, height: 20 }} />
            <span style={{ fontSize: 10, marginTop: 3 }}>Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};
