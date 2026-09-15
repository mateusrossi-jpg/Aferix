import React, { useState } from 'react';
import { ScanCycleState } from '../../clp/types';
import { Power, ToggleLeft, ToggleRight, Radio, Activity, Clock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface IoDockProps {
  scanState: ScanCycleState;
  onToggleInput: (address: string, forceValue?: boolean) => void;
  inputTags?: Record<string, string>;
  outputTags?: Record<string, string>;
}

export const IoDock: React.FC<IoDockProps> = ({
  scanState,
  onToggleInput,
  inputTags = {},
  outputTags = {},
}) => {
  const { isDark } = useTheme();

  // Guarda se cada entrada opera em modo 'pulsador' (momentary) ou 'chave' (toggle)
  const [inputModes, setInputModes] = useState<Record<string, 'momentary' | 'toggle'>>({
    '%I0.0': 'momentary',
    '%I0.1': 'momentary',
    '%I0.2': 'toggle',
    '%I0.3': 'toggle',
    '%I0.4': 'momentary',
    '%I0.5': 'momentary',
    '%I0.6': 'toggle',
    '%I0.7': 'toggle',
  });

  const toggleInputMode = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInputModes((prev) => ({
      ...prev,
      [address]: prev[address] === 'momentary' ? 'toggle' : 'momentary',
    }));
  };

  const inputs = ['%I0.0', '%I0.1', '%I0.2', '%I0.3', '%I0.4', '%I0.5', '%I0.6', '%I0.7'];
  const outputs = ['%Q0.0', '%Q0.1', '%Q0.2', '%Q0.3', '%Q0.4', '%Q0.5', '%Q0.6', '%Q0.7'];

  return (
    <div
      className={`rounded-2xl border p-3 sm:p-4 shadow-xl transition-all duration-150 ${
        isDark
          ? 'bg-[#0E1524] border-white/10 text-slate-200 shadow-black/40'
          : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Painel de Entradas Virtuais (%I) */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-blue-400">
              <Radio className="w-3.5 h-3.5" />
              <span>Entradas Digitais (%I) — Toque / Botoeiras</span>
            </div>
            <span className="text-[10px] text-slate-400">
              Clique no ícone de chave para alternar Pulsador/Chave
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {inputs.map((addr) => {
              const isActive = scanState.inputs[addr] ?? false;
              const mode = inputModes[addr] || 'momentary';
              const tag = inputTags[addr];

              return (
                <div
                  key={addr}
                  className="flex flex-col items-center select-none"
                >
                  <button
                    type="button"
                    title={`${addr} - ${tag || 'Entrada Digital'}`}
                    onMouseDown={() => {
                      if (mode === 'momentary') onToggleInput(addr, true);
                    }}
                    onMouseUp={() => {
                      if (mode === 'momentary') onToggleInput(addr, false);
                    }}
                    onMouseLeave={() => {
                      if (mode === 'momentary' && isActive) onToggleInput(addr, false);
                    }}
                    onTouchStart={(e) => {
                      if (mode === 'momentary') {
                        e.preventDefault();
                        onToggleInput(addr, true);
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (mode === 'momentary') {
                        e.preventDefault();
                        onToggleInput(addr, false);
                      }
                    }}
                    onClick={() => {
                      if (mode === 'toggle') onToggleInput(addr);
                    }}
                    className={`relative w-full h-14 rounded-xl flex flex-col items-center justify-center p-1 border transition-all active:scale-95 touch-manipulation ${
                      isActive
                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]'
                        : isDark
                        ? 'bg-[#151E30] border-white/10 text-slate-300 hover:border-white/20'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {/* Led indicador de ativação no botão */}
                    <div
                      className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full transition-all ${
                        isActive
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34D399]'
                          : 'bg-slate-600'
                      }`}
                    />

                    <span className="font-mono font-bold text-xs tracking-tight">
                      {addr.replace('%I0.', 'I.')}
                    </span>

                    {tag && (
                      <span className="text-[9px] font-sans truncate w-full text-center px-0.5 opacity-80">
                        {tag}
                      </span>
                    )}
                  </button>

                  {/* Seletor de Modo (Pulsador vs Chave) */}
                  <button
                    type="button"
                    onClick={(e) => toggleInputMode(addr, e)}
                    title={`Modo atual: ${mode === 'momentary' ? 'Pulsador (Segura)' : 'Chave (Alterna)'}`}
                    className="flex items-center gap-0.5 mt-1 text-[9px] text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {mode === 'momentary' ? (
                      <ToggleLeft className="w-3 h-3 text-slate-500" />
                    ) : (
                      <ToggleRight className="w-3 h-3 text-blue-400" />
                    )}
                    <span>{mode === 'momentary' ? 'Puls' : 'Chave'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divisor vertical em telas grandes */}
        <div className="hidden lg:block w-px h-28 bg-white/10" />

        {/* Painel de Saídas Virtuais (%Q) */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>Saídas a Relé / Carga (%Q) — Leds Reais</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Status Operacional
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {outputs.map((addr) => {
              const isActive = scanState.outputs[addr] ?? false;
              const tag = outputTags[addr];

              return (
                <div
                  key={addr}
                  className={`w-full h-14 rounded-xl flex flex-col items-center justify-center p-1 border transition-all ${
                    isActive
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : isDark
                      ? 'bg-[#151E30]/60 border-white/5 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  {/* Lâmpada Piloto Industrial LED */}
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-100 mb-1 ${
                      isActive
                        ? 'bg-emerald-400 border-white shadow-[0_0_10px_#10B981]'
                        : 'bg-slate-700/60 border-slate-600'
                    }`}
                  />

                  <span className="font-mono font-bold text-xs tracking-tight">
                    {addr.replace('%Q0.', 'Q.')}
                  </span>

                  {tag && (
                    <span className="text-[9px] font-sans truncate w-full text-center px-0.5 opacity-80">
                      {tag}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monitor de Temporizadores TON/TOF em Execução */}
      {Object.keys(scanState.timers).length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Temporizadores:</span>
          </div>

          {Object.entries(scanState.timers).map(([id, t]) => (
            <div
              key={id}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono ${
                t.done
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : t.enabled
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400 animate-pulse'
                  : isDark
                  ? 'border-white/5 bg-slate-800/40 text-slate-400'
                  : 'border-slate-200 bg-slate-100 text-slate-600'
              }`}
            >
              <span className="font-bold">{id} ({t.type.toUpperCase()}):</span>
              <span>{t.elapsed.toFixed(1)}s / {t.preset.toFixed(1)}s</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  t.done ? 'bg-emerald-400' : t.enabled ? 'bg-amber-400' : 'bg-slate-600'
                }`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
