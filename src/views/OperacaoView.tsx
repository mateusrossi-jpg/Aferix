import React, { useState } from 'react';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Clock,
  Navigation,
  MessageCircle,
  FileText,
  Calculator,
  ClipboardCheck,
  Shield,
  Layers,
} from 'lucide-react';
import { VirtualList } from '../components/VirtualList';
import { Budget, JobStatus, STATUS_CONFIG } from '../types';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/UIStates';

interface BudgetOperationRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    budgets: Budget[];
    isDark: boolean;
    onSelectBudget: (b: Budget) => void;
    handleStartRoute: (e: React.MouseEvent, address?: string) => void;
    handleSendWhatsApp: (e: React.MouseEvent, b: Budget) => void;
  };
}

const BudgetOperationRow: React.FC<BudgetOperationRowProps> = ({ index, style, data }) => {
  const { budgets, isDark, onSelectBudget, handleStartRoute, handleSendWhatsApp } = data;
  const budget = budgets[index];
  const cfg = STATUS_CONFIG[budget.status] || STATUS_CONFIG.iniciado;
  return (
    <div style={{ ...style, paddingBottom: 12 }}>
      <div
        onClick={() => onSelectBudget(budget)}
        className={`rounded-2xl p-4 sm:p-5 border aferix-card transition-all duration-200 cursor-pointer space-y-3.5 h-[98%] ${
          isDark
            ? 'bg-[#0F1626] border-white/[0.07] text-white hover:border-blue-500/40 shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
            : 'bg-white border-slate-200/80 text-[#0F172A] hover:border-blue-300 shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                  isDark
                    ? 'bg-blue-950/40 text-blue-400 border-blue-800/40'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {budget.code}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color} border ${cfg.border} flex items-center gap-1`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {cfg.label}
              </span>
              {budget.syncStatus === 'pending_sync' && (
                <span
                  title="Salvo offline no dispositivo. Será sincronizado ao reconectar."
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Offline
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold truncate leading-snug tracking-tight">
              {budget.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span>{budget.clientName}</span>
              {budget.clientAddress && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  {budget.clientAddress.split('-')[0]}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base sm:text-lg font-extrabold tracking-tight font-mono">
              R$ {budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="inline-block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md mt-0.5">
              +{budget.marginPercent}% margem
            </span>
          </div>
        </div>

        {/* Bottom action row */}
        <div
          className={`flex items-center gap-2 pt-2.5 border-t ${
            isDark ? 'border-white/[0.06]' : 'border-slate-100'
          }`}
        >
          {budget.clientAddress && (
            <button
              type="button"
              onClick={(e) => handleStartRoute(e, budget.clientAddress)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all duration-150 active:scale-98 ${
                isDark
                  ? 'bg-white/[0.04] border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.08]'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-blue-500" />
              <span>Iniciar Rota</span>
            </button>
          )}
          {budget.clientPhone && (
            <button
              type="button"
              onClick={(e) => handleSendWhatsApp(e, budget)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all duration-150 border border-emerald-500/20 active:scale-98"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface OperacaoViewProps {
  budgets: Budget[];
  onOpenNewBudget: () => void;
  onSelectBudget: (budget: Budget) => void;
  onOpenMarginSimulator?: () => void;
  onOpenPmocChecklist?: () => void;
  onOpenEquipments?: () => void;
}

export const OperacaoView: React.FC<OperacaoViewProps> = ({
  budgets,
  onOpenNewBudget,
  onSelectBudget,
  onOpenMarginSimulator,
  onOpenPmocChecklist,
  onOpenEquipments,
}) => {
  const { isDark } = useTheme();
  const [activeFilter, setActiveFilter] = useState<JobStatus | 'todos'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs: { key: JobStatus | 'todos'; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'iniciado', label: 'Iniciados' },
    { key: 'enviado', label: 'Enviados' },
    { key: 'aprovado', label: 'Aprovados' },
    { key: 'execucao', label: 'Em Execução' },
    { key: 'finalizado', label: 'Finalizados' },
  ];

  const filteredBudgets = budgets.filter((budget) => {
    const matchesFilter = activeFilter === 'todos' || budget.status === activeFilter;
    const matchesSearch =
      budget.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      budget.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeJobsCount = budgets.filter((b) => b.status === 'execucao').length;
  const approvedJobsCount = budgets.filter((b) => b.status === 'aprovado').length;
  const totalInExecution = budgets
    .filter((b) => b.status === 'execucao' || b.status === 'aprovado')
    .reduce((acc, b) => acc + b.totalValue, 0);

  const handleStartRoute = (e: React.MouseEvent, address?: string) => {
    e.stopPropagation();
    if (!address) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      '_blank'
    );
  };

  const handleSendWhatsApp = (e: React.MouseEvent, job: Budget) => {
    e.stopPropagation();
    const cleanPhone = job.clientPhone ? job.clientPhone.replace(/\D/g, '') : '';
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${job.clientName}, sou Mateus da Aferix. Estou acompanhando a OS ${job.code} (${job.title}).`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-28 text-left animate-fade-in-up">
      {/* Operational KPI & Tools Banner */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border aferix-card space-y-4 transition-all duration-200 ${
          isDark
            ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
            : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className={`text-xs font-semibold tracking-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Em Execução & Aprovado
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5 font-mono">
              R$ {totalInExecution.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {activeJobsCount + approvedJobsCount} ordens ativas de {budgets.length} registros
            </p>
          </div>

          {/* Dedicated Field Utility Shortcuts */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenMarginSimulator && (
              <button
                type="button"
                onClick={onOpenMarginSimulator}
                title="Calcula a margem real antes de enviar ao cliente"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-white/[0.04] border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.08]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-blue-500" />
                <span>Simulador de Margem</span>
              </button>
            )}

            {onOpenPmocChecklist && (
              <button
                type="button"
                onClick={onOpenPmocChecklist}
                title="Plano de Manutenção Preventiva (PMP, PGM e PMOC) para elétrica, HVAC, hidráulica e máquinas"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-white/[0.04] border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.08]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Planos de Manutenção (PMP/PMOC)</span>
              </button>
            )}

            {onOpenEquipments && (
              <button
                type="button"
                onClick={onOpenEquipments}
                title="Cadastro e histórico de equipamentos dos clientes"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-white/[0.04] border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.08]'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-500" />
                <span>Equipamentos</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, título ou código #OS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-150 ${
              isDark
                ? 'bg-[#0F1626] border-white/[0.08] text-white placeholder-slate-500'
                : 'bg-white border-slate-200/80 text-[#0F172A] placeholder-slate-400 shadow-xs'
            }`}
          />
        </div>
        <button
          id="btn-operacao-new"
          type="button"
          onClick={onOpenNewBudget}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-150 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25)] border border-blue-400/30 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Orçamento / OS</span>
        </button>
      </div>

      {/* Filter Tabs (Linear Style) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          const count =
            tab.key === 'todos'
              ? budgets.length
              : budgets.filter((b) => b.status === tab.key).length;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-[#0F1626] text-slate-400 hover:text-slate-200 border border-white/[0.07]'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 shadow-xs'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : isDark
                    ? 'bg-white/10 text-slate-300'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Budget List */}
      <div>
        {filteredBudgets.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum orçamento encontrado"
            description="Não encontramos registros para o filtro ou termo de busca selecionado."
            actionLabel="Criar Novo Orçamento"
            onAction={onOpenNewBudget}
          />
        ) : (
          <VirtualList
            height={Math.min(filteredBudgets.length * 175, 650)}
            itemCount={filteredBudgets.length}
            itemSize={170}
            width="100%"
            itemData={{
              budgets: filteredBudgets,
              isDark,
              onSelectBudget,
              handleStartRoute,
              handleSendWhatsApp,
            }}
            className="pr-2"
          >
            {BudgetOperationRow}
          </VirtualList>
        )}
      </div>
    </div>
  );
};
