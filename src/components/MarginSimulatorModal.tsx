import React, { useState } from 'react';
import { X, Calculator, Percent, DollarSign, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface MarginSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToNewBudget?: (data: { title: string; cost: number; price: number; margin: number }) => void;
}

export const MarginSimulatorModal: React.FC<MarginSimulatorModalProps> = ({
  isOpen,
  onClose,
  onApplyToNewBudget,
}) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState('Serviço Especial');
  const [materialCost, setMaterialCost] = useState('450');
  const [laborHours, setLaborHours] = useState('6');
  const [laborHourRate, setLaborHourRate] = useState('60');
  const [travelCost, setTravelCost] = useState('80');
  const [otherCost, setOtherCost] = useState('0');
  const [targetMargin, setTargetMargin] = useState('45'); // %

  if (!isOpen) return null;

  const mat = parseFloat(materialCost) || 0;
  const hours = parseFloat(laborHours) || 0;
  const hourRate = parseFloat(laborHourRate) || 0;
  const labor = hours * hourRate;
  const travel = parseFloat(travelCost) || 0;
  const other = parseFloat(otherCost) || 0;

  const totalDirectCost = mat + labor + travel + other;
  const marginPct = (parseFloat(targetMargin) || 0) / 100;

  // Formula: Preço de Venda = Custo Direto / (1 - Margem Alvo)
  const safeMargin = Math.min(Math.max(marginPct, 0.05), 0.90);
  const suggestedPrice = totalDirectCost > 0 ? totalDirectCost / (1 - safeMargin) : 0;
  const netProfit = suggestedPrice - totalDirectCost;
  const markupMultiplier = totalDirectCost > 0 ? suggestedPrice / totalDirectCost : 1;

  const handleCreateBudgetWithSimulation = () => {
    if (onApplyToNewBudget) {
      onApplyToNewBudget({
        title,
        cost: totalDirectCost,
        price: suggestedPrice,
        margin: Math.round(safeMargin * 100),
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-fade-in-up transition-all ${
          isDark
            ? 'bg-[#0F1626] border-white/10 text-white shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-white border-slate-200/90 text-[#0F172A] shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-4 shrink-0 ${
            isDark ? 'border-white/[0.08] bg-[#0A0F1D]/70' : 'border-slate-200/80 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base tracking-tight leading-tight">
                Simulador de Margem & Preço Ideal
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Calcule o preço exato para nunca pagar para trabalhar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              isDark
                ? 'border-white/10 bg-[#090E17] text-slate-400 hover:text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Service Title */}
          <div>
            <label className={`block font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Título do Serviço / OS
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDark
                  ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                  : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
              }`}
            />
          </div>

          {/* Direct Costs Inputs Grid */}
          <div
            className={`space-y-3 p-4 rounded-xl border ${
              isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <h3 className={`font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              1. Levantamento de Custos Diretos
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Materiais & Peças (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={materialCost}
                  onChange={(e) => setMaterialCost(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark
                      ? 'bg-[#090E17] border-white/10 text-white'
                      : 'bg-white border-slate-200/90 text-[#0F172A]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Deslocamento / Combustível (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={travelCost}
                  onChange={(e) => setTravelCost(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark
                      ? 'bg-[#090E17] border-white/10 text-white'
                      : 'bg-white border-slate-200/90 text-[#0F172A]'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Tempo Estimado (Horas)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={laborHours}
                  onChange={(e) => setLaborHours(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark
                      ? 'bg-[#090E17] border-white/10 text-white'
                      : 'bg-white border-slate-200/90 text-[#0F172A]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Custo/Hora Técnica (R$)
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  value={laborHourRate}
                  onChange={(e) => setLaborHourRate(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark
                      ? 'bg-[#090E17] border-white/10 text-white'
                      : 'bg-white border-slate-200/90 text-[#0F172A]'
                  }`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-between pt-2 border-t text-xs ${
              isDark ? 'border-white/[0.06]' : 'border-slate-200/80'
            }`}>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Total de Custos Diretos:</span>
              <span className="font-bold text-rose-500 dark:text-rose-400">
                R$ {totalDirectCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Target Margin Slider */}
          <div
            className={`space-y-3 p-4 rounded-xl border ${
              isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className={`font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                2. Margem Líquida Alvo no Bolso
              </h3>
              <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                {targetMargin}%
              </span>
            </div>

            <input
              type="range"
              min="15"
              max="75"
              step="1"
              value={targetMargin}
              onChange={(e) => setTargetMargin(e.target.value)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-slate-200 dark:bg-slate-800"
            />

            <div className={`flex justify-between text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <span>15% (Baixa)</span>
              <span>45% (Recomendada)</span>
              <span>75% (Alta)</span>
            </div>
          </div>

          {/* Calculated Output Result Card */}
          <div
            className={`p-5 rounded-2xl border space-y-4 transition-all ${
              isDark
                ? 'bg-gradient-to-br from-[#0F1626] to-[#0A0F1D] border-blue-500/30'
                : 'bg-gradient-to-br from-blue-50/70 to-slate-50 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Preço Mínimo Recomendado
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Markup: {markupMultiplier.toFixed(2)}x
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400">
              R$ {suggestedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>

            <div className={`grid grid-cols-2 gap-3 pt-3 border-t text-center ${
              isDark ? 'border-white/[0.06]' : 'border-slate-200/80'
            }`}>
              <div className={`p-3 rounded-xl border ${
                isDark ? 'bg-[#090E17] border-white/[0.06]' : 'bg-white border-slate-200/80'
              }`}>
                <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Custos Totais
                </span>
                <span className="text-sm font-bold text-rose-500 dark:text-rose-400">
                  R$ {totalDirectCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                  Lucro Líquido
                </span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {onApplyToNewBudget && (
            <button
              type="button"
              onClick={handleCreateBudgetWithSimulation}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white transition-all duration-150 active:scale-[0.98] shadow-md shadow-blue-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Preencher Novo Orçamento com Estes Valores</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
