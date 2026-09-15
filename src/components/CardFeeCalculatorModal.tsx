import React, { useState, useMemo } from 'react';
import {
  X,
  CreditCard,
  Percent,
  Check,
  Share2,
  Copy,
  Shield,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Budget } from '../types';
import { useTheme } from '../context/ThemeContext';
import {
  calculateInstallmentPlan,
  POPULAR_MACHINES,
  MachinePreset,
  formatPaymentOptionsWhatsApp,
} from '../utils/cardFeeCalculator';
import { aferixStore } from '../storage/store';

interface CardFeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
  onSaveTerms?: (terms: string) => void;
}

export const CardFeeCalculatorModal: React.FC<CardFeeCalculatorModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSaveTerms,
}) => {
  if (!isOpen) return null;

  const { isDark } = useTheme();

  const [selectedMachineId, setSelectedMachineId] = useState<string>('padrao');
  const [passFeeToCustomer, setPassFeeToCustomer] = useState<boolean>(true);
  const [pixDiscountPercent, setPixDiscountPercent] = useState<number>(5);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);

  const selectedMachine = useMemo(
    () => POPULAR_MACHINES.find((m) => m.id === selectedMachineId) || POPULAR_MACHINES[0],
    [selectedMachineId]
  );

  const plan = useMemo(
    () =>
      calculateInstallmentPlan(
        budget.totalValue,
        passFeeToCustomer,
        selectedMachine,
        pixDiscountPercent
      ),
    [budget.totalValue, passFeeToCustomer, selectedMachine, pixDiscountPercent]
  );

  const whatsAppText = useMemo(
    () =>
      formatPaymentOptionsWhatsApp(
        budget.clientName,
        budget.code,
        budget.title,
        plan,
        passFeeToCustomer
      ),
    [budget, plan, passFeeToCustomer]
  );

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsAppText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const cleanPhone = budget.clientPhone.replace(/\D/g, '');
    const encoded = encodeURIComponent(whatsAppText);
    const url = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleSaveToBudget = () => {
    const t1 = plan.installments[0];
    const t3 = plan.installments[2];
    const t6 = plan.installments[5];
    const t12 = plan.installments[11];

    const termsSummary = `À vista no Pix: R$ ${plan.pixAmount.toFixed(2)} (${pixDiscountPercent}% desc) | Cartão 1x: R$ ${t1.customerTotalValue.toFixed(2)} | 3x: R$ ${t3?.customerInstallmentValue.toFixed(2)} | 6x: R$ ${t6?.customerInstallmentValue.toFixed(2)} | 12x: R$ ${t12?.customerInstallmentValue.toFixed(2)}`;

    aferixStore.updateBudget(budget.id, {
      notes: budget.notes ? `${budget.notes}\n\n[Condições de Pagamento]: ${termsSummary}` : `[Condições de Pagamento]: ${termsSummary}`,
    });

    if (onSaveTerms) onSaveTerms(termsSummary);

    aferixStore.addNotification({
      title: 'Condições Salvas no Orçamento',
      message: `Opções de parcelamento salvas para ${budget.code}.`,
      type: 'success',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDark ? 'bg-[#0F1626] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Calculadora de Maquininha & Margem Blindada
              </h3>
              <p className="text-xs text-slate-400">
                Simulador de parcelamento em até 12x para {budget.code}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Valor Base e Modo Margem Blindada */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Valor Base */}
            <div
              className={`p-3.5 rounded-xl border space-y-1 ${
                isDark ? 'bg-white/[0.03] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Valor do Serviço
              </span>
              <div className="text-lg font-black font-mono text-emerald-400">
                R$ {budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Seletor de Repasse da Taxa */}
            <div
              className={`sm:col-span-2 p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                passFeeToCustomer
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-amber-500/10 border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">
                    {passFeeToCustomer ? 'Margem Blindada (Taxa Repassada)' : 'Taxa Absorvida pelo Prestador'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPassFeeToCustomer(!passFeeToCustomer)}
                  className={`text-[11px] font-bold px-2 py-0.5 rounded border transition-all ${
                    passFeeToCustomer
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  Alternar
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {passFeeToCustomer
                  ? 'Você recebe 100% do valor da sua mão de obra na conta. A taxa da maquininha é somada na parcela do cliente.'
                  : 'O cliente paga o valor original, mas você receberá o valor com desconto da taxa da operadora.'}
              </p>
            </div>
          </div>

          {/* Maquininha e Desconto Pix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Maquininha */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Taxas da Maquininha</label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                  isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              >
                {POPULAR_MACHINES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Desconto Pix */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400">Desconto para Pix à Vista</label>
              <div className="flex items-center gap-2">
                {[0, 3, 5, 10].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPixDiscountPercent(pct)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      pixDiscountPercent === pct
                        ? 'border-blue-500 bg-blue-500/15 text-blue-400 shadow-sm'
                        : isDark
                        ? 'border-white/10 bg-white/[0.02] text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Destaque À Vista no Pix */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            <div>
              <span className="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5">
                ⚡ Melhor Opção: À Vista no Pix ({pixDiscountPercent}% de Desconto)
              </span>
              <p className="text-[11px] text-slate-400">Dinheiro imediato na conta sem taxas de operadora</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black font-mono text-emerald-400">
                R$ {plan.pixAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              {pixDiscountPercent > 0 && (
                <div className="text-[10px] text-slate-400 line-through">
                  R$ {budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>
          </div>

          {/* Tabela de Parcelamento de 1x a 12x */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tabela de Parcelamento no Cartão de Crédito
            </span>
            <div
              className={`rounded-xl border overflow-hidden ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <div
                className={`grid grid-cols-4 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                <span>Parcelamento</span>
                <span className="text-right">Total Cliente</span>
                <span className="text-right">Taxa ({selectedMachine.name.split(' ')[0]})</span>
                <span className="text-right">Líquido Prestador</span>
              </div>

              <div className="divide-y divide-inherit max-h-56 overflow-y-auto font-mono text-xs">
                {plan.installments.map((t) => (
                  <div
                    key={t.installments}
                    className={`grid grid-cols-4 px-3 py-2 items-center hover:bg-white/5 transition-colors ${
                      t.installments <= 3 ? 'bg-blue-500/[0.03]' : ''
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>{t.installments}x</span>
                      <span className="text-slate-400 text-[11px] font-normal">
                        de R$ {t.customerInstallmentValue.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right font-semibold">
                      R$ {t.customerTotalValue.toFixed(2)}
                    </div>
                    <div className="text-right text-[11px] text-red-400">
                      - R$ {t.feeAmount.toFixed(2)} ({t.feePercent}%)
                    </div>
                    <div className="text-right font-bold text-emerald-400">
                      R$ {t.technicianNetValue.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-2 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                  copiedMessage
                    ? 'bg-blue-500 border-blue-400 text-white'
                    : isDark
                    ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                }`}
              >
                {copiedMessage ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Opções Copiadas!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Texto para WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveToBudget}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Condições nas Observações da Proposta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
