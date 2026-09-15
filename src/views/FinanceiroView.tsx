import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  DollarSign,
  Plus,
  Calendar,
  Layers,
  X,
  Check,
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Receivable, FinancialTransaction, Budget } from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/UIStates';
import { RevenueTrendChart } from '../components/RevenueTrendChart';

interface FinanceiroViewProps {
  budgets: Budget[];
  receivables: Receivable[];
  transactions: FinancialTransaction[];
  stats: {
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    overallMargin: number;
    pendingReceivables: number;
  };
}

export const FinanceiroView: React.FC<FinanceiroViewProps> = ({
  budgets,
  receivables,
  transactions,
  stats,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'dre' | 'receber' | 'extrato'>('dre');
  const [showNewTxModal, setShowNewTxModal] = useState(false);

  // New Transaction Form State
  const [txType, setTxType] = useState<'entrada' | 'saida'>('saida');
  const [txDesc, setTxDesc] = useState('');
  const [txCategory, setTxCategory] = useState('Materiais & Peças');
  const [txValue, setTxValue] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(txValue);
    if (!val || !txDesc.trim()) return;

    aferixStore.addTransaction({
      type: txType,
      category: txCategory,
      description: txDesc.trim(),
      value: val,
      date: txDate,
    });

    setShowNewTxModal(false);
    setTxDesc('');
    setTxValue('');
  };

  const handleReceivePayment = (id: string) => {
    aferixStore.markReceivablePaid(id);
  };

  const totalEntradas = transactions
    .filter((t) => t.type === 'entrada')
    .reduce((acc, t) => acc + t.value, 0);

  const totalSaidas = transactions
    .filter((t) => t.type === 'saida')
    .reduce((acc, t) => acc + t.value, 0);

  const saldoCaixa = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6 sm:space-y-8 pb-28 text-left animate-fade-in-up">
      {/* Top Balance Banner with Strong Hierarchy */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border aferix-card space-y-4 relative overflow-hidden transition-all duration-200 ${
          isDark
            ? 'bg-gradient-to-b from-[#131C31] to-[#0D1525] border-blue-500/30 text-white shadow-[0_1px_3px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-gradient-to-b from-white to-blue-50/30 border-blue-200/90 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}
      >
        <div className="flex items-center justify-between relative z-10">
          <span
            className={`text-xs font-semibold tracking-tight ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Saldo Disponível em Caixa
          </span>
          <button
            type="button"
            onClick={() => setShowNewTxModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-xl transition-all duration-150 active:scale-[0.98] shadow-sm border border-blue-400/20"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Novo Lançamento
          </button>
        </div>

        <div className="flex items-baseline relative z-10">
          <span className="text-sm font-medium text-slate-400 mr-2">R$</span>
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono">
            {saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Quick summary strip */}
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3.5 border-t text-xs ${
            isDark ? 'border-white/[0.06]' : 'border-slate-100'
          }`}
        >
          <div>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Entradas:</span>
            <div className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              + R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total Saídas:</span>
            <div className="font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
              - R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>A Receber:</span>
            <div className="font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              R$ {stats.pendingReceivables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div
        className={`flex items-center gap-1.5 p-1 rounded-xl border max-w-fit ${
          isDark ? 'bg-[#0F1626] border-white/[0.07]' : 'bg-slate-100/80 border-slate-200'
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('dre')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            activeTab === 'dre'
              ? 'bg-blue-600 text-white shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          DRE & Lucratividade
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('receber')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            activeTab === 'receber'
              ? 'bg-blue-600 text-white shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Contas a Receber ({receivables.filter((r) => r.status === 'pendente').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('extrato')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
            activeTab === 'extrato'
              ? 'bg-blue-600 text-white shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Extrato Completo ({transactions.length})
        </button>
      </div>

      {/* Tab 1: DRE Simplificado */}
      {activeTab === 'dre' && (
        <div className="space-y-5">
          {/* Revenue Trend Chart */}
          <RevenueTrendChart
            budgets={budgets}
            totalRevenue={stats.totalRevenue}
            netProfit={stats.netProfit}
          />

          <div
            className={`rounded-2xl p-5 sm:p-6 border space-y-4 aferix-card transition-all duration-200 ${
              isDark
                ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
                : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
            }`}
          >
            <h3 className="text-sm font-bold tracking-tight">Demonstrativo de Resultado do Exercício (DRE)</h3>

            <div className={`space-y-2 text-xs divide-y ${isDark ? 'divide-white/[0.05]' : 'divide-slate-100'}`}>
              <div className="flex justify-between py-2">
                <span className="font-semibold">(+) Faturamento Bruto de Serviços</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">(-) Custos Diretos (Peças & Mão de Obra)</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                  - R$ {stats.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">(-) Impostos Estimados (Simples/DAS ~6%)</span>
                <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                  - R${' '}
                  {(stats.totalRevenue * 0.06).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div
                className={`flex justify-between pt-3 text-sm font-extrabold ${
                  isDark ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                <span>(=) Lucro Líquido Real</span>
                <span className="font-mono">
                  R${' '}
                  {(stats.netProfit - stats.totalRevenue * 0.06).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Contas a Receber */}
      {activeTab === 'receber' && (
        <div className="space-y-3">
          {receivables.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Nenhum valor a receber no momento"
              description="Todas as parcelas e orçamentos foram quitados."
            />
          ) : (
            receivables.map((rec) => (
              <div
                key={rec.id}
                className={`rounded-2xl p-4 sm:p-5 border flex items-center justify-between gap-3 aferix-card transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold truncate">{rec.clientName}</h4>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {rec.description} • Vencimento:{' '}
                    {rec.dueDate.split('-').reverse().slice(0, 2).join('/')}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-extrabold tracking-tight font-mono">
                      R$ {rec.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                        rec.status === 'recebido'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {rec.status === 'recebido' ? 'Recebido' : 'Pendente'}
                    </span>
                  </div>

                  {rec.status === 'pendente' && (
                    <button
                      type="button"
                      onClick={() => handleReceivePayment(rec.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all duration-150 active:scale-95 shadow-xs"
                    >
                      Baixar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Extrato Completo */}
      {activeTab === 'extrato' && (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="Nenhuma transação registrada"
              description="Registre suas receitas e despesas para acompanhar seu fluxo de caixa."
              actionLabel="Novo Lançamento"
              onAction={() => setShowNewTxModal(true)}
            />
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className={`rounded-2xl p-3.5 sm:p-4 border flex items-center justify-between gap-3 aferix-card transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      tx.type === 'entrada'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {tx.type === 'entrada' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold truncate">{tx.description}</h4>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tx.category} • {tx.date.split('-').reverse().slice(0, 2).join('/')}
                    </p>
                  </div>
                </div>

                <div
                  className={`text-xs sm:text-sm font-extrabold tracking-tight shrink-0 font-mono ${
                    tx.type === 'entrada'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {tx.type === 'entrada' ? '+' : '-'} R${' '}
                  {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal Novo Lançamento */}
      {showNewTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowNewTxModal(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 z-10 space-y-4 animate-fade-in-up ${
              isDark
                ? 'bg-[#0F1626] border-white/10 text-white shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'bg-white border-slate-200/90 text-[#0F172A] shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">Novo Lançamento Financeiro</h3>
              <button
                type="button"
                onClick={() => setShowNewTxModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
              <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${
                isDark ? 'bg-[#090E17] border-white/10' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setTxType('entrada')}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    txType === 'entrada'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('saida')}
                  className={`py-2 rounded-lg font-bold transition-all ${
                    txType === 'saida'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Saída
                </button>
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Descrição</label>
                <input
                  type="text"
                  required
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="Ex: Pagamento Fornecedor, Combustível..."
                  className={`w-full rounded-xl px-3 py-2.5 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    isDark ? 'border-white/10 bg-white/[0.02] text-white' : 'border-slate-200 bg-white text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={txValue}
                  onChange={(e) => setTxValue(e.target.value)}
                  placeholder="0,00"
                  className="w-full rounded-xl px-3 py-2 border bg-transparent font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTxModal(false)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
