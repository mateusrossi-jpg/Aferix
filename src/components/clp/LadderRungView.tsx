import React from 'react';
import {
  LadderRung,
  LadderElement,
  LadderParallelBranch,
  ScanCycleState,
  ContactType,
  CoilType,
} from '../../clp/types';
import { Plus, Trash2, Edit2, Clock, Split } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LadderRungViewProps {
  rung: LadderRung;
  rungIndex: number;
  scanState: ScanCycleState;
  onUpdateRung: (updatedRung: LadderRung) => void;
  onDeleteRung: (rungId: string) => void;
  onEditElement: (element: LadderElement, branchId?: string, isOutput?: boolean) => void;
  onAddContact: (branchId: string) => void;
  onAddParallelBranch: (rungId: string) => void;
}

export const LadderRungView: React.FC<LadderRungViewProps> = ({
  rung,
  rungIndex,
  scanState,
  onUpdateRung,
  onDeleteRung,
  onEditElement,
  onAddContact,
  onAddParallelBranch,
}) => {
  const { isDark } = useTheme();

  const isRungConducting = scanState.conductance.rungs[rung.id] ?? false;
  const isOutputActive = scanState.conductance.outputEnergized[rung.output?.id] ?? false;

  const wireActiveColor = '#22C55E'; // Verde condutância viva
  const wireInactiveColor = isDark ? '#475569' : '#94A3B8'; // Cinza neutro repouso

  return (
    <div
      className={`relative rounded-xl border mb-4 transition-all duration-150 ${
        isDark
          ? 'bg-[#151D2A] border-white/[0.08] shadow-md'
          : 'bg-white border-slate-200/80 shadow-xs'
      }`}
    >
      {/* Cabeçalho do Rung / Linha */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 border-b text-xs font-mono select-none ${
          isDark
            ? 'bg-[#0E1522] border-white/[0.06] text-slate-400'
            : 'bg-slate-50 border-slate-200 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
              isRungConducting
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : isDark
                ? 'bg-slate-800 text-slate-400'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            RUNG #{rungIndex}
          </span>
          <span className="text-xs font-sans text-slate-400 truncate max-w-xs sm:max-w-md">
            {rung.comment || 'Lógica de comando'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddParallelBranch(rung.id)}
            title="Adicionar Ramo Paralelo (Selo / OR)"
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-sans font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
          >
            <Split className="w-3 h-3" />
            <span className="hidden sm:inline">+ Ramo Selo</span>
          </button>
          <button
            type="button"
            onClick={() => onDeleteRung(rung.id)}
            title="Excluir este Rung"
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Área da Grade Ladder com Barramentos L1 e L2 */}
      <div className="flex items-stretch overflow-x-auto py-4 px-2 min-h-[120px]">
        {/* Barramento Esquerdo (L1 - Positivo / Fase) */}
        <div className="flex flex-col items-center justify-center shrink-0 w-6">
          <div
            className="w-1.5 h-full rounded-full transition-colors duration-150"
            style={{
              backgroundColor: scanState.mode === 'RUN' ? wireActiveColor : wireInactiveColor,
              boxShadow:
                scanState.mode === 'RUN'
                  ? '0 0 10px rgba(34, 197, 94, 0.7)'
                  : 'none',
            }}
          />
        </div>

        {/* Corpo dos Ramos em Paralelo */}
        <div className="flex-1 flex flex-col justify-center gap-3 px-2 min-w-[340px]">
          {rung.branches.map((branch, branchIdx) => {
            const isBranchConducting = scanState.conductance.branches[branch.id] ?? false;

            return (
              <div
                key={branch.id}
                className="relative flex items-center justify-between border-l-2 border-r-2 pl-2 pr-2"
                style={{
                  borderColor: isBranchConducting ? wireActiveColor : wireInactiveColor,
                }}
              >
                {/* Linha de Conexão Horizontal Esquerda */}
                <div
                  className="h-0.5 w-4 shrink-0 transition-colors duration-150"
                  style={{
                    backgroundColor: isBranchConducting ? wireActiveColor : wireInactiveColor,
                  }}
                />

                {/* Lista de Contatos em Série */}
                <div className="flex-1 flex items-center gap-2 flex-wrap">
                  {branch.elements.map((el) => {
                    const isElConducting = scanState.conductance.elements[el.id] ?? false;

                    return (
                      <div key={el.id} className="flex items-center">
                        {/* Contato Gráfico */}
                        <div
                          onClick={() => onEditElement(el, branch.id, false)}
                          className={`group relative flex flex-col items-center justify-center cursor-pointer p-1.5 rounded-lg border transition-all active:scale-95 ${
                            isElConducting
                              ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                              : isDark
                              ? 'border-white/10 bg-[#0E1624] hover:border-blue-500/40'
                              : 'border-slate-200 bg-slate-50 hover:border-blue-400'
                          }`}
                        >
                          {/* Tag Mnemônica / Nome */}
                          <span className="text-[10px] text-slate-400 font-sans max-w-[80px] truncate mb-0.5">
                            {el.tag || el.address}
                          </span>

                          {/* Símbolo Ladder */}
                          <div className="flex items-center font-mono font-bold text-sm tracking-widest px-1">
                            {el.type === 'contact_no' && (
                              <span
                                style={{
                                  color: isElConducting ? wireActiveColor : wireInactiveColor,
                                }}
                              >
                                —[ ]—
                              </span>
                            )}
                            {el.type === 'contact_nc' && (
                              <span
                                style={{
                                  color: isElConducting ? wireActiveColor : wireInactiveColor,
                                }}
                              >
                                —[/]—
                              </span>
                            )}
                            {el.type === 'rising_edge' && (
                              <span
                                style={{
                                  color: isElConducting ? wireActiveColor : wireInactiveColor,
                                }}
                              >
                                —[P]—
                              </span>
                            )}
                            {el.type === 'falling_edge' && (
                              <span
                                style={{
                                  color: isElConducting ? wireActiveColor : wireInactiveColor,
                                }}
                              >
                                —[N]—
                              </span>
                            )}
                          </div>

                          {/* Endereço IEC (%I0.X, %Q0.X, %M0.X) */}
                          <span
                            className={`text-[10px] font-mono font-bold mt-0.5 ${
                              isElConducting
                                ? 'text-emerald-400'
                                : isDark
                                ? 'text-blue-400'
                                : 'text-blue-600'
                            }`}
                          >
                            {el.address}
                          </span>
                        </div>

                        {/* Fio de união entre contatos */}
                        <div
                          className="h-0.5 w-3 transition-colors duration-150"
                          style={{
                            backgroundColor: isElConducting ? wireActiveColor : wireInactiveColor,
                          }}
                        />
                      </div>
                    );
                  })}

                  {/* Botão + Contato neste Ramo */}
                  <button
                    type="button"
                    onClick={() => onAddContact(branch.id)}
                    title="Adicionar Contato em Série neste Ramo"
                    className={`h-7 w-7 flex items-center justify-center rounded-lg border border-dashed text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-all ${
                      isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-white'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Linha de Conexão Horizontal Direita */}
                <div
                  className="h-0.5 w-4 shrink-0 transition-colors duration-150"
                  style={{
                    backgroundColor: isBranchConducting ? wireActiveColor : wireInactiveColor,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Fio Conector até a Bobina/Saída */}
        <div className="flex items-center shrink-0 w-8">
          <div
            className="w-full h-0.5 transition-colors duration-150"
            style={{
              backgroundColor: isRungConducting ? wireActiveColor : wireInactiveColor,
            }}
          />
        </div>

        {/* Bloco de Saída (Bobina, Set/Reset ou Temporizador TON/TOF) */}
        <div className="flex items-center shrink-0 pr-2">
          {rung.output && (
            <div
              onClick={() => onEditElement(rung.output, undefined, true)}
              className={`cursor-pointer p-2 rounded-xl border transition-all active:scale-95 flex flex-col items-center justify-center min-w-[100px] ${
                isOutputActive
                  ? 'border-emerald-500 bg-emerald-500/15 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                  : isDark
                  ? 'border-white/10 bg-[#0E1624] hover:border-blue-500/40'
                  : 'border-slate-200 bg-slate-50 hover:border-blue-400'
              }`}
            >
              {/* Tag Mnemônica */}
              <span className="text-[10px] text-slate-400 font-sans max-w-[90px] truncate mb-0.5">
                {rung.output.tag || rung.output.address}
              </span>

              {/* Símbolo da Bobina ou Bloco */}
              {rung.output.type === 'ton' || rung.output.type === 'tof' ? (
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 font-mono font-bold text-xs">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-400">
                      [{rung.output.type.toUpperCase()}]
                    </span>
                  </div>
                  {/* Barra de Tempo Decorrido do Temporizador */}
                  {(() => {
                    const timerId = rung.output.address.split('.')[0];
                    const timerData = scanState.timers[timerId];
                    const elapsed = timerData?.elapsed ?? 0;
                    const preset = rung.output.presetTime ?? 5.0;
                    const pct = Math.min(100, Math.round((elapsed / preset) * 100));

                    return (
                      <div className="w-16 mt-1">
                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                          <span>{elapsed.toFixed(1)}s</span>
                          <span>{preset.toFixed(1)}s</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden mt-0.5">
                          <div
                            className={`h-full transition-all duration-75 ${
                              timerData?.done ? 'bg-emerald-500' : 'bg-amber-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="font-mono font-bold text-sm tracking-widest">
                  {rung.output.type === 'coil' && (
                    <span
                      style={{
                        color: isOutputActive ? wireActiveColor : wireInactiveColor,
                      }}
                    >
                      —( )—
                    </span>
                  )}
                  {rung.output.type === 'coil_not' && (
                    <span
                      style={{
                        color: isOutputActive ? wireActiveColor : wireInactiveColor,
                      }}
                    >
                      —(/)—
                    </span>
                  )}
                  {rung.output.type === 'coil_set' && (
                    <span
                      style={{
                        color: isOutputActive ? wireActiveColor : wireInactiveColor,
                      }}
                    >
                      —(S)—
                    </span>
                  )}
                  {rung.output.type === 'coil_reset' && (
                    <span
                      style={{
                        color: isOutputActive ? wireActiveColor : wireInactiveColor,
                      }}
                    >
                      —(R)—
                    </span>
                  )}
                </div>
              )}

              {/* Endereço da Saída */}
              <span
                className={`text-[11px] font-mono font-bold mt-0.5 ${
                  isOutputActive
                    ? 'text-emerald-400'
                    : isDark
                    ? 'text-amber-400'
                    : 'text-amber-600'
                }`}
              >
                {rung.output.address}
              </span>
            </div>
          )}
        </div>

        {/* Barramento Direito (L2 - Neutro / Retorno) */}
        <div className="flex flex-col items-center justify-center shrink-0 w-6">
          <div
            className="w-1.5 h-full rounded-full transition-colors duration-150"
            style={{
              backgroundColor: isDark ? '#334155' : '#CBD5E1',
            }}
          />
        </div>
      </div>
    </div>
  );
};
