import React from 'react';
import {
  FileBarChart2,
  Download,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { Budget, Client, FinancialTransaction } from '../types';
import { useTheme } from '../context/ThemeContext';

interface RelatoriosViewProps {
  budgets: Budget[];
  clients: Client[];
  transactions: FinancialTransaction[];
  stats: {
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    overallMargin: number;
    pendingReceivables: number;
  };
}

export const RelatoriosView: React.FC<RelatoriosViewProps> = ({
  budgets,
  clients,
  transactions,
  stats,
}) => {
  const { isDark } = useTheme();

  const handleExportJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      budgets,
      clients,
      transactions,
      stats,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aferix_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = 'Codigo,Titulo,Cliente,Status,Total(R$),Custo(R$),Lucro(R$),Margem(%)\n';
    const rows = budgets
      .map(
        (b) =>
          `"${b.code}","${b.title}","${b.clientName}","${b.status}",${b.totalValue},${b.totalCost},${b.netProfit},${b.marginPercent}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aferix_orcamentos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-28 text-left animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">Relatórios & Inteligência</h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Exportação de dados e análise de performance autônoma
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-95 ${
              isDark
                ? 'bg-[#0F1626] border-white/[0.07] text-slate-300 hover:text-white hover:bg-white/5'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all duration-150 active:scale-95 shadow-sm shadow-blue-600/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`rounded-2xl p-5 sm:p-6 border aferix-card space-y-2 transition-all duration-200 ${
            isDark
              ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
              : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
          }`}
        >
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Faturamento Acumulado
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
            R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Em {budgets.length} propostas emitidas
          </p>
        </div>

        <div
          className={`rounded-2xl p-5 sm:p-6 border aferix-card space-y-2 transition-all duration-200 ${
            isDark
              ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
              : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
          }`}
        >
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Margem de Lucro Média
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
            {stats.overallMargin.toFixed(1)}%
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Após abatimento de custos diretos
          </p>
        </div>

        <div
          className={`rounded-2xl p-5 sm:p-6 border aferix-card space-y-2 transition-all duration-200 ${
            isDark
              ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
              : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
          }`}
        >
          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Contas a Receber
          </span>
          <div className="text-2xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
            R$ {stats.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Previsão para os próximos 30 dias
          </p>
        </div>
      </div>

      {/* Local Storage Privacy Badge */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border flex items-center gap-3 ${
          isDark
            ? 'bg-blue-950/20 border-blue-500/20 text-blue-200'
            : 'bg-blue-50/70 border-blue-200 text-blue-900'
        }`}
      >
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
        <div className="text-xs">
          <span className="font-bold block">Privacidade & Arquitetura Local-First</span>
          <p className="opacity-90">
            Seus orçamentos, clientes e transações ficam armazenados no seu próprio navegador com
            persistência local e backups instantâneos.
          </p>
        </div>
      </div>
    </div>
  );
};
