import React, { useState } from 'react';
import {
  X,
  LayoutDashboard,
  ClipboardList,
  Wallet,
  CalendarDays,
  Users,
  Layers,
  FileBarChart2,
  Settings,
  PlusCircle,
  Calculator,
  ClipboardCheck,
  Wrench,
  Sun,
  Moon,
  MoreHorizontal,
  ChevronDown,
  Cpu,
} from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';
import { AferixWordmark, AferixMonogram } from './AferixLogo';
import { useTheme } from '../context/ThemeContext';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  onOpenNewBudget: () => void;
  onOpenMarginSimulator: () => void;
  onOpenPmocChecklist: () => void;
  onOpenEquipments: () => void;
}

export const NavigationDrawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  profile,
  onOpenNewBudget,
  onOpenMarginSimulator,
  onOpenPmocChecklist,
  onOpenEquipments,
}) => {
  const { toggleTheme, isDark } = useTheme();

  const isSecondaryTabActive = ['catalogo', 'relatorios', 'configuracoes'].includes(currentTab);
  const [isMoreOpen, setIsMoreOpen] = useState(true);

  if (!isOpen) return null;

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    onClose();
  };

  // 1. Daily Core Actions (Foco Diário em Campo e Gestão)
  const dailyMenuItems: { tab: ActiveTab; label: string; icon: React.ElementType }[] = [
    { tab: 'resumo', label: 'Início', icon: LayoutDashboard },
    { tab: 'operacao', label: 'Ordens de Serviço', icon: ClipboardList },
    { tab: 'clp_facil', label: 'CLP-Fácil (Ladder)', icon: Cpu },
    { tab: 'agenda', label: 'Agenda & Visitas', icon: CalendarDays },
    { tab: 'financeiro', label: 'Financeiro', icon: Wallet },
    { tab: 'clientes', label: 'Clientes & CRM', icon: Users },
  ];

  // 2. Menu Mais: Secondary Modules (moved from sidebar)
  const moreMenuItems: { tab: ActiveTab; label: string; icon: React.ElementType }[] = [
    { tab: 'catalogo', label: 'Tabela de Preços', icon: Layers },
    { tab: 'relatorios', label: 'Relatórios & DRE', icon: FileBarChart2 },
    { tab: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`relative flex w-full max-w-[300px] flex-col border-r shadow-2xl transition-colors ${
          isDark
            ? 'bg-[#161619] border-white/[0.08] text-zinc-100'
            : 'bg-white border-slate-200 text-[#0F172A]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-4 ${
            isDark ? 'border-white/[0.08] bg-[#161619]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AferixMonogram size={30} />
            <AferixWordmark size="sm" showSubtitle />
          </div>
          <button
            id="btn-close-drawer"
            type="button"
            onClick={onClose}
            aria-label="Fechar Menu"
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              isDark
                ? 'bg-[#1F1F24] border-white/[0.08] text-zinc-400 hover:text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Primary CTA */}
        <div
          className={`p-3.5 border-b ${
            isDark ? 'border-white/[0.08] bg-[#161619]/50' : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <button
            id="btn-drawer-new-budget"
            type="button"
            onClick={() => {
              onClose();
              onOpenNewBudget();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 py-2.5 px-4 font-bold text-white text-xs shadow-md shadow-cyan-900/20 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            <span>Novo Orçamento / OS</span>
          </button>
        </div>

        {/* Main Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Section 1: Ações Diárias */}
          <div className="space-y-1">
            <div className="px-2.5 py-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isDark ? 'text-zinc-500' : 'text-slate-400'
                }`}
              >
                Principal
              </span>
            </div>

            {dailyMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.tab;
              return (
                <button
                  key={item.tab}
                  type="button"
                  onClick={() => handleSelect(item.tab)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isActive
                      ? isDark
                        ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold'
                        : 'bg-sky-50 border border-sky-200 text-sky-700 font-bold'
                      : isDark
                      ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive
                        ? 'text-cyan-400 dark:text-cyan-300'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  <span className="text-xs font-semibold truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 2: Menu Mais (Módulos Secundários e Ferramentas) */}
          <div className="pt-1">
            <div
              className={`rounded-2xl border p-2 space-y-1 transition-colors ${
                isDark
                  ? 'bg-white/[0.02] border-white/[0.08]'
                  : 'bg-slate-50/70 border-slate-200/80'
              }`}
            >
              {/* Menu Mais Header / Toggle */}
              <button
                type="button"
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                  isDark
                    ? 'hover:bg-white/[0.04] text-zinc-300'
                    : 'hover:bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">Mais Ferramentas</span>
                  {isSecondaryTabActive && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                      Ativo
                    </span>
                  )}
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isMoreOpen ? 'rotate-180 text-cyan-400' : 'text-zinc-400'
                  }`}
                />
              </button>

              {/* Menu Mais Content */}
              {isMoreOpen && (
                <div className="space-y-0.5 pt-1 border-t border-slate-200/60 dark:border-white/[0.06]">
                  {moreMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        type="button"
                        onClick={() => handleSelect(item.tab)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                          isActive
                            ? isDark
                              ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-bold'
                              : 'bg-sky-50 border border-sky-200 text-sky-700 font-bold'
                            : isDark
                            ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 ${
                            isActive
                              ? 'text-cyan-400 dark:text-cyan-300'
                              : 'text-zinc-400 dark:text-zinc-500'
                          }`}
                        />
                        <span className="text-xs font-medium truncate">{item.label}</span>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenMarginSimulator();
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                      isDark
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Calculator className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium">Simulador de Margem</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPmocChecklist();
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                      isDark
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <ClipboardCheck className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span className="text-xs font-medium">Planos de Manutenção (PMP/PMOC)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEquipments();
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-all ${
                      isDark
                        ? 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Wrench className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-xs font-medium">Equipamentos</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Theme toggle & Profile */}
        <div
          className={`border-t p-3 space-y-2 ${
            isDark ? 'border-white/[0.08] bg-[#161619]' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between px-2 py-1">
            <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Tema</span>
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                isDark
                  ? 'bg-[#1F1F24] border-white/[0.08] text-zinc-300 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isDark ? 'Claro' : 'Escuro'}</span>
            </button>
          </div>

          <div className={`p-2 rounded-xl flex items-center gap-2.5 ${isDark ? 'bg-[#1F1F24] border border-white/[0.08]' : 'bg-white border border-slate-200'}`}>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-700 to-teal-500 text-white font-bold flex items-center justify-center text-xs shrink-0">
              {profile.businessName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate">{profile.businessName}</div>
              <div className={`text-[10px] truncate ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                {profile.ownerName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
