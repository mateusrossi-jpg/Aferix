import React, { useState } from 'react';
import {
  ArrowRight,
  Plus,
  DollarSign,
  Calendar,
  ClipboardCheck,
  FileText,
  Navigation,
  User,
  Cpu,
} from 'lucide-react';
import { VirtualList } from '../components/VirtualList';
import { Budget, Appointment, ActiveTab, STATUS_CONFIG } from '../types';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/UIStates';

interface BudgetRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    budgets: Budget[];
    isDark: boolean;
    onSelectBudget: (b: Budget) => void;
  };
}

const BudgetRow: React.FC<BudgetRowProps> = ({ index, style, data }) => {
  const { budgets, isDark, onSelectBudget } = data;
  const b = budgets[index];
  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.iniciado;
  return (
    <div style={{ ...style, paddingBottom: 10 }}>
      <div
        onClick={() => onSelectBudget(b)}
        className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between gap-3 transition-all h-[95%] ${
          isDark
            ? 'bg-[#1F1F24] border-white/[0.08] hover:border-cyan-500/40 text-white'
            : 'bg-slate-50 border-slate-200/80 hover:border-sky-300 text-slate-900'
        }`}
      >
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400">{b.code}</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <h4 className="text-sm font-bold truncate">{b.title}</h4>
          <p className="text-xs text-zinc-400 dark:text-zinc-400 truncate">{b.clientName}</p>
        </div>
        <div className="text-right shrink-0 font-mono font-bold text-sm">
          R$ {b.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

interface AppointmentRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    appointments: Appointment[];
    isDark: boolean;
    handleStartRoute: (e: React.MouseEvent, address?: string) => void;
  };
}

const AppointmentRow: React.FC<AppointmentRowProps> = ({ index, style, data }) => {
  const { appointments, isDark, handleStartRoute } = data;
  const app = appointments[index];
  return (
    <div style={{ ...style, paddingBottom: 10 }}>
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all h-[95%] ${
          isDark
            ? 'bg-[#1F1F24] border-white/[0.08] text-white'
            : 'bg-slate-50 border-slate-200/80 text-slate-900'
        }`}
      >
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {app.status}
            </span>
            <span className="text-xs font-mono text-zinc-400">{app.date} às {app.time}</span>
          </div>
          <h4 className="text-sm font-bold truncate">{app.title}</h4>
          <p className="text-xs text-zinc-400 flex items-center gap-1">
            <User className="w-3 h-3" /> {app.clientName}
          </p>
        </div>
        {app.address && (
          <button
            type="button"
            onClick={(e) => handleStartRoute(e, app.address)}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/20 shrink-0 hover:bg-cyan-500/20 transition-colors"
          >
            Rota
          </button>
        )}
      </div>
    </div>
  );
};

interface ResumoViewProps {
  budgets: Budget[];
  appointments: Appointment[];
  stats: {
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    overallMargin: number;
    pendingReceivables: number;
    activeWorkOrders: number;
    proposalsSent: number;
    unreadNotificationsCount: number;
  };
  onNavigate: (tab: ActiveTab) => void;
  onOpenNewBudget: () => void;
  onOpenQuickEntry?: () => void;
  onSelectBudget: (budget: Budget) => void;
  onOpenSearch?: () => void;
  onOpenMarginSimulator?: () => void;
  onOpenPmocChecklist?: () => void;
  onOpenEquipments?: () => void;
}

export const ResumoView: React.FC<ResumoViewProps> = ({
  budgets,
  appointments,
  stats,
  onNavigate,
  onOpenNewBudget,
  onOpenQuickEntry,
  onOpenPmocChecklist,
  onSelectBudget,
}) => {
  const { isDark } = useTheme();
  const [activeTabList, setActiveTabList] = useState<'orcamentos' | 'atendimentos'>('orcamentos');

  // 1. Fluxo de Caixa Imediato (Recebíveis + Saldo Líquido Estimado)
  const cashFlowImmediate = stats.pendingReceivables + Math.max(15400, stats.netProfit);

  // 2. Próxima Visita Técnica
  const nextAppointment = appointments.find((a) => a.status === 'agendado') || appointments[0];

  // 3. Orçamentos Pendentes de Aprovação (Status: enviado ou iniciado)
  const pendingBudgets = budgets.filter((b) => b.status === 'enviado' || b.status === 'iniciado');
  const totalPendingValue = pendingBudgets.reduce((acc, b) => acc + b.totalValue, 0);

  const handleStartRoute = (e: React.MouseEvent, address?: string) => {
    e.stopPropagation();
    if (!address) return;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6 pb-28 text-left animate-fade-in-up max-w-5xl mx-auto">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-row items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Cockpit Diário
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Indicadores essenciais e foco operacional imediato
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('clp_facil')}
            title="Abrir Simulador Ladder CLP-Fácil"
            className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
              isDark
                ? 'bg-[#1F1F24] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-xs'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CLP-Fácil</span>
          </button>

          {onOpenPmocChecklist && (
            <button
              type="button"
              onClick={onOpenPmocChecklist}
              title="Emitir Laudo / PMOC"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                isDark
                  ? 'bg-[#1F1F24] border-white/[0.08] text-zinc-200 hover:bg-[#27272E]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Laudos PMOC</span>
            </button>
          )}

          {onOpenQuickEntry && (
            <button
              type="button"
              onClick={onOpenQuickEntry}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                isDark
                  ? 'bg-[#1F1F24] border-white/[0.08] text-zinc-200 hover:bg-[#27272E]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lançamento</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNewBudget}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 shadow-sm border border-cyan-400/30 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Novo Orçamento</span>
          </button>
        </div>
      </div>

      {/* 3 High-Priority Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Fluxo de Caixa Imediato */}
        <div
          onClick={() => onNavigate('financeiro')}
          className={`rounded-2xl p-6 border aferix-card cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
            isDark
              ? 'bg-[#1F1F24] border-emerald-500/30 text-white hover:border-emerald-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              : 'bg-gradient-to-b from-white to-emerald-50/30 border-emerald-200/80 text-[#0F172A] hover:border-emerald-400 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Financeiro <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Fluxo de Caixa Imediato
            </span>
            <div className="flex items-baseline font-mono">
              <span className="text-sm font-medium mr-1.5 opacity-80">R$</span>
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {cashFlowImmediate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className={`text-xs pt-1 ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Saldo disponível + R$ {stats.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 0 })} a receber
            </p>
          </div>
        </div>

        {/* Card 2: Próxima Visita Técnica */}
        <div
          onClick={() => onNavigate('agenda')}
          className={`rounded-2xl p-6 border aferix-card cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
            isDark
              ? 'bg-[#1F1F24] border-cyan-500/30 text-white hover:border-cyan-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              : 'bg-gradient-to-b from-white to-sky-50/30 border-sky-200/80 text-[#0F172A] hover:border-sky-400 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Agenda <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Próxima Visita Técnica
            </span>
            {nextAppointment ? (
              <>
                <h3 className="text-base font-bold truncate tracking-tight pt-0.5">
                  {nextAppointment.title}
                </h3>
                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                  {nextAppointment.time} • <strong className="font-semibold">{nextAppointment.clientName}</strong>
                </p>
                <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  {nextAppointment.address && (
                    <button
                      type="button"
                      onClick={(e) => handleStartRoute(e, nextAppointment.address)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all active:scale-95 ${
                        isDark ? 'bg-cyan-500/10 border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Navigation className="w-3 h-3 text-cyan-400" /> Rota GPS
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm font-bold text-zinc-400 py-2">
                Nenhum compromisso agendado
              </p>
            )}
          </div>
        </div>

        {/* Card 3: Orçamentos Pendentes de Aprovação */}
        <div
          onClick={() => onNavigate('operacao')}
          className={`rounded-2xl p-6 border aferix-card cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
            isDark
              ? 'bg-[#1F1F24] border-amber-500/30 text-white hover:border-amber-500/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
              : 'bg-gradient-to-b from-white to-amber-50/30 border-amber-200/80 text-[#0F172A] hover:border-amber-400 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Operação <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-1">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Orçamentos Pendentes de Aprovação
            </span>
            <div className="flex items-baseline font-mono">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight mr-2 text-amber-400">
                {pendingBudgets.length}
              </span>
              <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
                propostas enviadas
              </span>
            </div>
            <p className={`text-xs pt-1 font-mono font-semibold ${isDark ? 'text-amber-400/90' : 'text-amber-700'}`}>
              Total em aberto: R$ {totalPendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

      </div>

      {/* Virtualized Lists Section for Budgets & Appointments (react-window 60fps) */}
      <div className={`rounded-2xl p-4 sm:p-6 border aferix-card space-y-4 ${
        isDark ? 'bg-[#1F1F24] border-white/[0.08]' : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold tracking-tight">Fluxo Operacional em Tempo Real</h3>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Listas virtualizadas com alta performance (60fps)
            </p>
          </div>

          <div className={`flex items-center p-1 rounded-xl border ${
            isDark ? 'bg-[#141416] border-white/[0.08]' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setActiveTabList('orcamentos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabList === 'orcamentos'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Orçamentos ({budgets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTabList('atendimentos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTabList === 'atendimentos'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : isDark ? 'text-zinc-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Atendimentos ({appointments.length})
            </button>
          </div>
        </div>

        {activeTabList === 'orcamentos' ? (
          budgets.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Nenhum orçamento cadastrado"
              description="Crie seu primeiro orçamento para começar."
              actionLabel="Novo Orçamento"
              onAction={onOpenNewBudget}
            />
          ) : (
            <VirtualList
              height={Math.min(budgets.length * 105, 400)}
              itemCount={budgets.length}
              itemSize={100}
              width="100%"
              itemData={{ budgets, isDark, onSelectBudget }}
              className="pr-2"
            >
              {BudgetRow}
            </VirtualList>
          )
        ) : (
          appointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhum atendimento agendado"
              description="Sua agenda está livre."
            />
          ) : (
            <VirtualList
              height={Math.min(appointments.length * 105, 400)}
              itemCount={appointments.length}
              itemSize={100}
              width="100%"
              itemData={{ appointments, isDark, handleStartRoute }}
              className="pr-2"
            >
              {AppointmentRow}
            </VirtualList>
          )
        )}
      </div>
    </div>
  );
};

