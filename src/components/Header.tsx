import React from 'react';
import { Menu, Bell, Search, Sun, Moon } from 'lucide-react';
import { ActiveTab } from '../types';
import { AferixWordmark, AferixMonogram } from './AferixLogo';
import { useTheme } from '../context/ThemeContext';
import { Breadcrumbs, ActiveSubContext } from './Breadcrumbs';
import { SyncStatusPill } from './OfflineSyncBanner';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentTab: ActiveTab;
  onNavigate?: (tab: ActiveTab) => void;
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenSearch?: () => void;
  unreadCount: number;
  activeSubContext?: ActiveSubContext | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onOpenDrawer,
  onOpenNotifications,
  onOpenSearch,
  unreadCount,
  activeSubContext,
}) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 border-b px-3 sm:px-6 py-2.5 sm:py-3 backdrop-blur-xl transition-all duration-200 ${
        isDark
          ? 'bg-[#141416]/90 border-white/[0.08] text-zinc-100 shadow-sm shadow-black/40'
          : 'bg-white/90 border-slate-200/80 text-[#0F172A] shadow-xs'
      }`}
    >
      {/* Left: Drawer Button (Mobile/Tablet) & Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <button
          id="btn-open-drawer"
          type="button"
          onClick={onOpenDrawer}
          aria-label="Menu Lateral"
          className={`flex lg:hidden h-8.5 w-8.5 items-center justify-center rounded-lg border transition-all duration-150 active:scale-95 ${
            isDark
              ? 'border-white/[0.08] bg-[#1E1E24] text-zinc-300 hover:text-white hover:border-white/20'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
          }`}
        >
          <Menu className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('resumo')}
          className="flex items-center gap-2 text-left focus:outline-hidden group"
          title="Ir para Início"
        >
          <AferixMonogram size={28} />
          <div className="hidden sm:block">
            <AferixWordmark size="xs" />
          </div>
        </button>
      </div>

      {/* Center: Dynamic Hierarchical Breadcrumbs */}
      <div className="flex-1 min-w-0 flex items-center justify-start md:justify-center px-1 sm:px-2">
        <Breadcrumbs
          currentTab={currentTab}
          onNavigate={onNavigate}
          activeSubContext={activeSubContext}
        />
      </div>

      {/* Right: Theme toggle, Search & Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Offline / Sync Status Pill */}
        <SyncStatusPill />

        {/* PWA In-App Install Prompt */}
        <PWAInstallButton compact />

        {/* Theme Switcher */}
        <button
          id="btn-header-theme"
          type="button"
          onClick={toggleTheme}
          aria-label="Alternar Tema"
          title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
          className={`flex h-8.5 w-8.5 items-center justify-center rounded-lg border transition-all duration-150 active:scale-95 ${
            isDark
              ? 'border-white/[0.08] bg-[#1E1E24] text-amber-400 hover:text-amber-300 hover:border-white/20 shadow-xs'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs'
          }`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {onOpenSearch && (
          <button
            id="btn-header-search"
            type="button"
            onClick={onOpenSearch}
            aria-label="Busca Global"
            className={`flex h-8.5 w-8.5 items-center justify-center rounded-lg border transition-all duration-150 active:scale-95 ${
              isDark
                ? 'border-white/[0.08] bg-[#1E1E24] text-zinc-400 hover:text-white hover:border-white/20 shadow-xs'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs'
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
        )}

        <button
          id="btn-open-notifications"
          type="button"
          onClick={onOpenNotifications}
          aria-label="Notificações"
          className={`relative flex h-8.5 w-8.5 items-center justify-center rounded-lg border transition-all duration-150 active:scale-95 ${
            isDark
              ? 'border-white/[0.08] bg-[#1E1E24] text-zinc-400 hover:text-white hover:border-white/20 shadow-xs'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:border-slate-300 shadow-xs'
          }`}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

