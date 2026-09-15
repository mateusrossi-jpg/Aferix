import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Calendar,
  Users,
  Plus,
  Moon,
  Sun,
  Search,
  MoreHorizontal,
  Cpu,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useTheme } from '../context/ThemeContext';
import { AferixWordmark, AferixMonogram, AferixEmblem } from './AferixLogo';

interface SidebarProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onOpenQuickEntry: () => void;
  onOpenNewBudget: () => void;
  onOpenSearch: () => void;
  onOpenDrawer?: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  onOpenQuickEntry,
  onOpenNewBudget,
  onOpenSearch,
  onOpenDrawer,
  unreadCount = 0,
}) => {
  const { toggleTheme, isDark } = useTheme();

  // Daily primary actions for field & business execution
  const dailyNavItems: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'resumo', label: 'Início & Cockpit', icon: LayoutDashboard },
    { id: 'operacao', label: 'Ordens de Serviço', icon: ClipboardList },
    { id: 'clp_facil', label: 'CLP-Fácil (Ladder)', icon: Cpu },
    { id: 'agenda', label: 'Agenda & Visitas', icon: Calendar },
    { id: 'financeiro', label: 'Fluxo Financeiro & DRE', icon: DollarSign },
    { id: 'clientes', label: 'Carteira de Clientes', icon: Users },
  ];

  const secondaryTabNames: Partial<Record<ActiveTab, string>> = {
    catalogo: 'Tabela de Preços',
    relatorios: 'Relatórios & DRE',
    configuracoes: 'Configurações',
  };

  const isSecondaryActive = Boolean(secondaryTabNames[currentTab]);

  return (
    <aside
      className={`hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r z-30 shrink-0 select-none transition-colors duration-200 ${
        isDark
          ? 'bg-[#161619] border-white/[0.08] text-zinc-200 shadow-xl shadow-black/40'
          : 'bg-white border-slate-200/80 text-[#0F172A]'
      }`}
    >
      {/* Brand Header */}
      <div className="px-4 py-4 border-b border-inherit flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <AferixMonogram size={32} />
          <AferixWordmark size="sm" showSubtitle />
        </div>
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
            isDark
              ? 'bg-amber-400/10 text-amber-400 border-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.15)]'
              : 'bg-amber-50 text-amber-800 border-amber-200/90'
          }`}
        >
          PRO
        </span>
      </div>

      {/* Quick Search Trigger (Raycast style) */}
      <div className="px-3 pt-3.5 pb-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all duration-150 ${
            isDark
              ? 'bg-[#1F1F24] border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:border-white/20 shadow-xs'
              : 'bg-slate-50 border-slate-200/80 text-slate-500 hover:text-slate-900 hover:border-slate-300 shadow-xs'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <span className="flex-1 text-left text-xs truncate">Buscar clientes, OS...</span>
          <kbd
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${
              isDark
                ? 'bg-[#141416] border-white/10 text-zinc-400'
                : 'bg-white border-slate-200 text-slate-500 shadow-xs'
            }`}
          >
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="px-3 py-1 space-y-1.5">
        <button
          type="button"
          onClick={onOpenNewBudget}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-[0_1px_2px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.25)] border border-cyan-400/30 transition-all duration-150 active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Novo Orçamento / OS</span>
        </button>

        <button
          type="button"
          onClick={onOpenQuickEntry}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
            isDark
              ? 'bg-[#1F1F24] border-white/[0.08] hover:bg-[#27272E] hover:border-white/15 text-zinc-300 shadow-xs'
              : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-700 shadow-xs'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
          <span>Lançamento Rápido</span>
        </button>
      </div>

      {/* Main Navigation List (Linear Style with 3px Glowing Indicator) */}
      <nav className="flex-1 px-3 py-2 space-y-3 overflow-y-auto">
        <div className="space-y-1">
          <div
            className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1 ${
              isDark ? 'text-zinc-500' : 'text-slate-400'
            }`}
          >
            Ações Diárias
          </div>
          {dailyNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150 relative ${
                  isActive
                    ? isDark
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-cyan-400 before:shadow-[0_0_8px_rgba(34,211,238,0.6)]'
                      : 'bg-sky-50 text-sky-700 font-semibold border border-sky-200/80 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-r-full before:bg-sky-600'
                    : isDark
                    ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] font-medium border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-medium border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? 'text-cyan-400 dark:text-cyan-300'
                      : 'text-zinc-400 dark:text-zinc-500'
                  }`}
                />
                <span className="flex-1 text-left truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Mais (Secondary Modules & System Tools) Trigger */}
        {onOpenDrawer && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onOpenDrawer}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 border ${
                isSecondaryActive
                  ? isDark
                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border-cyan-500/30'
                    : 'bg-sky-50 text-sky-700 font-semibold border-sky-200/80'
                  : isDark
                  ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <MoreHorizontal className="w-4 h-4 shrink-0 text-zinc-400" />
                <span className="font-medium truncate">
                  {isSecondaryActive ? secondaryTabNames[currentTab] : 'Mais opções...'}
                </span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                  isSecondaryActive
                    ? isDark
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-sky-100 text-sky-800'
                    : isDark
                    ? 'bg-white/[0.06] text-zinc-400'
                    : 'bg-slate-200/70 text-slate-600'
                }`}
              >
                {isSecondaryActive ? 'Ativo' : 'Menu'}
              </span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer & User Profile */}
      <div
        className={`p-3 border-t space-y-2 ${
          isDark ? 'border-white/[0.08] bg-[#161619]' : 'border-slate-200/80 bg-slate-50/70'
        }`}
      >
        <button
          type="button"
          onClick={toggleTheme}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-150 ${
            isDark
              ? 'border-white/[0.08] bg-[#1F1F24] text-zinc-300 hover:text-white hover:border-white/15'
              : 'border-slate-200/80 bg-white text-slate-700 hover:text-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {isDark ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>Tema {isDark ? 'Escuro' : 'Claro'}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-zinc-400">
            {isDark ? 'Dark' : 'Light'}
          </span>
        </button>

        <div
          className={`flex items-center gap-2.5 p-2 rounded-xl border ${
            isDark ? 'bg-[#1F1F24] border-white/[0.08]' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-700 to-teal-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              M
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1F1F24]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold truncate">Mateus Rossi</div>
            <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Autônomo Pro
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
