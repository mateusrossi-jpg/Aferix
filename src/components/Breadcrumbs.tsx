import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { ActiveTab } from '../types';
import { useTheme } from '../context/ThemeContext';

export interface ActiveSubContext {
  title: string;
  subtitle?: string;
  onBack: () => void;
  statusConfig?: {
    label: string;
    color: string;
    bg: string;
    border: string;
  };
}

interface BreadcrumbsProps {
  currentTab: ActiveTab;
  onNavigate?: (tab: ActiveTab) => void;
  activeSubContext?: ActiveSubContext | null;
}

const TAB_LABELS: Record<ActiveTab, string> = {
  resumo: 'Cockpit',
  operacao: 'Ordens de Serviço',
  financeiro: 'Financeiro & DRE',
  agenda: 'Agenda & Visitas',
  clientes: 'Clientes',
  catalogo: 'Tabela de Preços',
  relatorios: 'Relatórios',
  configuracoes: 'Configurações',
  clp_facil: 'CLP-Fácil (Ladder)',
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentTab,
  onNavigate,
  activeSubContext,
}) => {
  const { isDark } = useTheme();

  const handleNavigateHome = () => {
    if (activeSubContext) {
      activeSubContext.onBack();
    }
    onNavigate?.('resumo');
  };

  const handleNavigateTab = () => {
    if (activeSubContext) {
      activeSubContext.onBack();
    }
  };

  // If in Home (resumo) with no sub-context, show a clean, refined single indicator
  if (currentTab === 'resumo' && !activeSubContext) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
        <span
          className={`text-xs font-semibold tracking-tight ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          Visão Geral
        </span>
      </div>
    );
  }

  return (
    <nav
      aria-label="Navegação estrutural"
      className="flex items-center min-w-0 text-xs font-medium"
    >
      {/* Mobile view (< sm): Quick back + Current context */}
      <div className="flex sm:hidden items-center gap-1.5 min-w-0">
        <button
          type="button"
          onClick={activeSubContext ? activeSubContext.onBack : handleNavigateHome}
          className={`p-1 rounded-md transition-colors ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title={activeSubContext ? 'Voltar' : 'Ir para o Início'}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        <span className="text-slate-400 dark:text-slate-600 font-light">/</span>

        <span
          className={`truncate font-semibold tracking-tight ${
            isDark ? 'text-slate-100' : 'text-slate-900'
          }`}
        >
          {activeSubContext ? activeSubContext.title : TAB_LABELS[currentTab]}
        </span>

        {activeSubContext?.statusConfig && (
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${activeSubContext.statusConfig.color} ${activeSubContext.statusConfig.bg}`}
          >
            {activeSubContext.statusConfig.label}
          </span>
        )}
      </div>

      {/* Desktop view (>= sm): Minimalist, precise, high-end breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5 min-w-0">
        {/* Root: Início */}
        <button
          type="button"
          onClick={handleNavigateHome}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors duration-150 ${
            isDark
              ? 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Home className="w-3.5 h-3.5 opacity-75" />
          <span>Início</span>
        </button>

        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />

        {/* Current Tab */}
        {activeSubContext ? (
          <button
            type="button"
            onClick={handleNavigateTab}
            className={`px-1.5 py-0.5 rounded transition-colors duration-150 ${
              isDark
                ? 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {TAB_LABELS[currentTab]}
          </button>
        ) : (
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold tracking-tight ${
              isDark ? 'text-slate-100 bg-white/[0.04]' : 'text-slate-900 bg-slate-100'
            }`}
          >
            <span>{TAB_LABELS[currentTab]}</span>
          </div>
        )}

        {/* Sub-context (e.g. Work Order code or Modal) */}
        {activeSubContext && (
          <>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
            <div
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold tracking-tight ${
                isDark ? 'text-blue-300 bg-blue-500/10' : 'text-blue-700 bg-blue-50'
              }`}
            >
              <span className="truncate max-w-[160px]">{activeSubContext.title}</span>

              {activeSubContext.statusConfig && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${activeSubContext.statusConfig.color} ${activeSubContext.statusConfig.bg}`}
                >
                  {activeSubContext.statusConfig.label}
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
};
