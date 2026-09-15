import React, { useState } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { aferixStore } from '../storage/store';
import { Client } from '../types';
import { useTheme } from '../context/ThemeContext';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
}

export const QuickEntryModal: React.FC<QuickEntryModalProps> = ({
  isOpen,
  onClose,
  clients,
}) => {
  const { isDark } = useTheme();
  const [type, setType] = useState<'entrada' | 'saida'>('entrada');
  const [amountStr, setAmountStr] = useState('3450.00');
  const [description, setDescription] = useState('Instalação de Quadro de Distribuição Trifásico');
  const [clientName, setClientName] = useState(clients[0]?.name || 'Cliente Particular');
  const [category, setCategory] = useState('Serviços Prestados / OS');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Boleto' | 'Cartão' | 'Transferência'>('PIX');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const numericValue = parseFloat(amountStr) || 0;
  // Brazilian Autonomous Tax Estimate (e.g. 6% Simples Nacional / Anexo III ou MEI)
  const estimatedTax = type === 'entrada' ? numericValue * 0.06 : 0;
  const netValue = type === 'entrada' ? numericValue - estimatedTax : numericValue;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericValue <= 0 || !description.trim()) return;

    aferixStore.addTransaction({
      type,
      category,
      description: `${description.trim()} (${clientName})`,
      value: numericValue,
      date,
    });

    aferixStore.addNotification({
      title: type === 'entrada' ? 'Receita Registrada!' : 'Despesa Registrada!',
      message: `${type === 'entrada' ? 'Entrada' : 'Saída'} de R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${description.trim()}`,
      type: type === 'entrada' ? 'success' : 'warning',
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const categories =
    type === 'entrada'
      ? [
          'Serviços Prestados / OS',
          'Consultoria Técnica',
          'Manutenção Preventiva',
          'Instalação & Montagem',
          'Outras Receitas',
        ]
      : [
          'Peças & Materiais',
          'Ferramental & Equipamentos',
          'Combustível & Transporte',
          'Impostos & Taxas (DAS/MEI)',
          'Aluguel & Custos Fixos',
          'Alimentação em Campo',
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog (Raycast / Linear style) */}
      <div
        className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col transition-all duration-200 animate-fade-in-up ${
          isDark
            ? 'bg-[#1E293B] border-[#334155] text-white shadow-black/60'
            : 'bg-white border-[#E2E8F0] text-[#0F172A] shadow-slate-300/50'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-5 py-4 ${
            isDark ? 'border-[#334155] bg-[#0B1120]/60' : 'border-[#E2E8F0] bg-[#F8FAFC]'
          }`}
        >
          <div>
            <h2 className="text-base font-bold tracking-tight">Lançamento Rápido</h2>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Registro financeiro com conciliação e projeção tributária
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-150 active:scale-95 ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-400 hover:text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {savedSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold">Lançamento Salvo com Sucesso!</h3>
            <p className="text-xs text-slate-500">
              O fluxo de caixa e o saldo foram atualizados em tempo real.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Segmented Entry Type Toggle */}
            <div>
              <div
                className={`grid grid-cols-2 gap-1.5 p-1 rounded-xl border ${
                  isDark
                    ? 'bg-[#0B1120] border-slate-800'
                    : 'bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setType('entrada')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    type === 'entrada'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                  <span>Receita (Entrada)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('saida')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    type === 'saida'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                  <span>Despesa (Saída)</span>
                </button>
              </div>
            </div>

            {/* Large Prominent Value Input */}
            <div
              className={`p-4 rounded-xl border text-center space-y-1 ${
                isDark
                  ? 'bg-[#0B1120]/70 border-slate-800'
                  : 'bg-[#F8FAFC] border-slate-200'
              }`}
            >
              <span
                className={`text-[11px] font-semibold block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Valor da Transação
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-48 bg-transparent text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-center focus:outline-none focus:border-b-2 focus:border-blue-500 pb-1"
                  placeholder="0,00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                className={`block text-xs font-medium mb-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Descrição do Lançamento
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Instalação de Inverter, Compra de cabos..."
                className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                  isDark
                    ? 'bg-[#0B1120] border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-[#0F172A]'
                }`}
              />
            </div>

            {/* 2-Column Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {type === 'entrada' ? 'Cliente / Pagador' : 'Fornecedor / Beneficiário'}
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Nome do cliente ou loja"
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isDark
                      ? 'bg-[#0B1120] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-[#0F172A]'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isDark
                      ? 'bg-[#0B1120] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-[#0F172A]'
                  }`}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Forma de Pagamento & Data */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Forma de Pagamento
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isDark
                      ? 'bg-[#0B1120] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-[#0F172A]'
                  }`}
                >
                  <option value="PIX">⚡ PIX Instantâneo</option>
                  <option value="Boleto">📄 Boleto Bancário</option>
                  <option value="Cartão">💳 Cartão de Crédito/Débito</option>
                  <option value="Transferência">🏦 Transferência TED/DOC</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Data
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    isDark
                      ? 'bg-[#0B1120] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-[#0F172A]'
                  }`}
                />
              </div>
            </div>

            {/* Real-time Brazilian Tax Projection Box */}
            {type === 'entrada' && numericValue > 0 && (
              <div
                className={`p-3.5 rounded-xl border space-y-1.5 text-xs ${
                  isDark
                    ? 'bg-blue-950/20 border-blue-800/40 text-blue-200'
                    : 'bg-blue-50/70 border-blue-200 text-blue-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[11px]">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-3.5 h-3.5" /> Projeção Tributária (Simples Nacional ~6%)
                  </span>
                  <span>
                    - R${' '}
                    {estimatedTax.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-semibold opacity-95">
                  <span>Lucro Líquido Real Projetado:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    R$ {netValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (94.0%)
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all duration-150 ${
                  isDark
                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all duration-150 active:scale-[0.98]"
              >
                Salvar Lançamento
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
