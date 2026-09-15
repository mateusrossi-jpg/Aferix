import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LadderProgram,
  LadderRung,
  LadderElement,
  ScanCycleState,
} from '../clp/types';
import {
  createInitialScanState,
  executeScanCycle,
} from '../clp/scanEngine';
import { LADDER_PRESETS } from '../clp/presets';
import { generateEndapFirmwareCHeader } from '../clp/bytecodeGenerator';
import { LadderRungView } from '../components/clp/LadderRungView';
import { IoDock } from '../components/clp/IoDock';
import { ElementEditorModal } from '../components/clp/ElementEditorModal';
import { CExportModal } from '../components/clp/CExportModal';
import {
  Play,
  Square,
  Pause,
  SkipForward,
  Plus,
  RotateCcw,
  Download,
  Cpu,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ClpFacilView: React.FC = () => {
  const { isDark } = useTheme();

  // Estado do Programa Ladder (inicia com Partida Direta com Selo)
  const [program, setProgram] = useState<LadderProgram>(() => {
    const saved = localStorage.getItem('aferix_clp_program');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return LADDER_PRESETS.partida_direta;
  });

  // Salva no localStorage para persistência offline
  useEffect(() => {
    localStorage.setItem('aferix_clp_program', JSON.stringify(program));
  }, [program]);

  // Estado do Ciclo de Varredura (Scan State)
  const [scanState, setScanState] = useState<ScanCycleState>(() => createInitialScanState());

  // Frequência de Varredura em ms (50ms = 20Hz, 25ms = 40Hz)
  const [scanIntervalMs, setScanIntervalMs] = useState<number>(50);

  // Modais de Edição e Exportação
  const [editingElement, setEditingElement] = useState<{
    element: LadderElement;
    branchId?: string;
    isOutput?: boolean;
    rungId?: string;
  } | null>(null);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Loop de Varredura Determinístico
  const lastScanTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    if (scanState.mode !== 'RUN') return;

    const interval = setInterval(() => {
      const now = performance.now();
      const deltaSec = Math.max(0.01, (now - lastScanTimeRef.current) / 1000);
      lastScanTimeRef.current = now;

      setScanState((prev) => executeScanCycle(program, prev, deltaSec));
    }, scanIntervalMs);

    return () => clearInterval(interval);
  }, [scanState.mode, program, scanIntervalMs]);

  // Ações do Painel de Controle de Simulação
  const handleStartRun = () => {
    lastScanTimeRef.current = performance.now();
    setScanState((prev) => ({ ...prev, mode: 'RUN' }));
  };

  const handleStop = () => {
    // Parada Segura: zera todas as saídas (%Q) e temporizadores
    setScanState((prev) => {
      const resetOutputs: Record<string, boolean> = {};
      Object.keys(prev.outputs).forEach((k) => (resetOutputs[k] = false));
      const resetTimers: typeof prev.timers = {};
      Object.keys(prev.timers).forEach((k) => {
        resetTimers[k] = { ...prev.timers[k], enabled: false, done: false, elapsed: 0 };
      });

      return {
        ...prev,
        mode: 'STOP',
        outputs: resetOutputs,
        timers: resetTimers,
        conductance: {
          rungs: {},
          branches: {},
          elements: {},
          outputEnergized: {},
        },
      };
    });
  };

  const handlePause = () => {
    setScanState((prev) => ({ ...prev, mode: 'PAUSE' }));
  };

  const handleSingleStep = () => {
    // Executa exatamente 1 ciclo de varredura
    const deltaSec = scanIntervalMs / 1000;
    setScanState((prev) => executeScanCycle(program, { ...prev, mode: 'PAUSE' }, deltaSec));
  };

  const handleResetInputs = () => {
    setScanState(createInitialScanState());
  };

  // Carregar Preset
  const handleLoadPreset = (presetKey: string) => {
    const p = LADDER_PRESETS[presetKey];
    if (p) {
      setProgram(p);
      handleStop();
    }
  };

  // Manipulação de Entradas Virtuais (%I)
  const handleToggleInput = (address: string, forceValue?: boolean) => {
    setScanState((prev) => {
      const nextVal = forceValue !== undefined ? forceValue : !prev.inputs[address];
      const updated = {
        ...prev,
        inputs: {
          ...prev.inputs,
          [address]: nextVal,
        },
      };
      // Se estiver em PAUSE ou STOP, reavalia 1 ciclo para feedback visual imediato
      if (prev.mode !== 'RUN') {
        return executeScanCycle(program, updated, 0.05);
      }
      return updated;
    });
  };

  // Edição do Programa Ladder
  const handleAddRung = () => {
    const newRungId = `rung-${Date.now()}`;
    const newRung: LadderRung = {
      id: newRungId,
      comment: `Linha de Comando ${program.rungs.length + 1}`,
      branches: [
        {
          id: `b-${newRungId}-0`,
          elements: [
            {
              id: `el-${Date.now()}-1`,
              type: 'contact_no',
              address: '%I0.1',
              tag: 'Entrada NA',
            },
          ],
        },
      ],
      output: {
        id: `out-${newRungId}`,
        type: 'coil',
        address: `%Q0.${Math.min(7, program.rungs.length)}`,
        tag: `Saída Q${program.rungs.length}`,
      },
    };

    setProgram((prev) => ({
      ...prev,
      rungs: [...prev.rungs, newRung],
    }));
  };

  const handleDeleteRung = (rungId: string) => {
    setProgram((prev) => ({
      ...prev,
      rungs: prev.rungs.filter((r) => r.id !== rungId),
    }));
  };

  const handleAddParallelBranch = (rungId: string) => {
    setProgram((prev) => ({
      ...prev,
      rungs: prev.rungs.map((r) => {
        if (r.id !== rungId) return r;
        const newBranchId = `branch-${Date.now()}`;
        return {
          ...r,
          branches: [
            ...r.branches,
            {
              id: newBranchId,
              elements: [
                {
                  id: `el-${Date.now()}`,
                  type: 'contact_no',
                  address: r.output.address, // Sugere contato de selo da própria saída
                  tag: 'Contato de Selo',
                },
              ],
            },
          ],
        };
      }),
    }));
  };

  const handleAddContactToBranch = (branchId: string) => {
    setProgram((prev) => ({
      ...prev,
      rungs: prev.rungs.map((r) => ({
        ...r,
        branches: r.branches.map((b) => {
          if (b.id !== branchId) return b;
          return {
            ...b,
            elements: [
              ...b.elements,
              {
                id: `el-${Date.now()}`,
                type: 'contact_no',
                address: '%I0.0',
                tag: 'Novo Contato',
              },
            ],
          };
        }),
      })),
    }));
  };

  const handleSaveEditedElement = (updatedElement: LadderElement) => {
    if (!editingElement) return;

    setProgram((prev) => ({
      ...prev,
      rungs: prev.rungs.map((r) => {
        if (editingElement.isOutput) {
          if (r.output.id === updatedElement.id) {
            return { ...r, output: updatedElement };
          }
          return r;
        }

        return {
          ...r,
          branches: r.branches.map((b) => ({
            ...b,
            elements: b.elements.map((el) => (el.id === updatedElement.id ? updatedElement : el)),
          })),
        };
      }),
    }));
  };

  const handleDeleteElement = (elementId: string) => {
    setProgram((prev) => ({
      ...prev,
      rungs: prev.rungs.map((r) => ({
        ...r,
        branches: r.branches.map((b) => ({
          ...b,
          elements: b.elements.filter((el) => el.id !== elementId),
        })),
      })),
    }));
  };

  // Coleta tags descritivas para o Dock de I/O
  const { inputTags, outputTags } = useMemo(() => {
    const inTags: Record<string, string> = {};
    const outTags: Record<string, string> = {};

    program.rungs.forEach((r) => {
      if (r.output && r.output.address.startsWith('%Q')) {
        outTags[r.output.address] = r.output.tag || '';
      }
      r.branches.forEach((b) => {
        b.elements.forEach((el) => {
          if (el.address.startsWith('%I')) {
            inTags[el.address] = el.tag || '';
          }
          if (el.address.startsWith('%Q')) {
            outTags[el.address] = el.tag || outTags[el.address] || '';
          }
        });
      });
    });

    return { inputTags: inTags, outputTags: outTags };
  }, [program]);

  // Gera código C compilado para exportação
  const compiledCCode = useMemo(() => {
    return generateEndapFirmwareCHeader(program);
  }, [program]);

  return (
    <div className="space-y-4 pb-20">
      {/* Barra de Controle de Simulação (Toolbar Principal) */}
      <div
        className={`rounded-2xl border p-3 sm:p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
          isDark
            ? 'bg-[#0F1626] border-white/10 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/60'
        }`}
      >
        {/* Identificação e Status da Simulação */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              scanState.mode === 'RUN'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : scanState.mode === 'PAUSE'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : isDark
                ? 'bg-slate-800 border-white/10 text-slate-400'
                : 'bg-slate-100 border-slate-300 text-slate-600'
            }`}
          >
            <Cpu className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg">CLP-Fácil</h1>
              {/* Badge de Status de Execução */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider ${
                  scanState.mode === 'RUN'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse'
                    : scanState.mode === 'PAUSE'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : isDark
                    ? 'bg-slate-800 text-slate-400 border border-white/10'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    scanState.mode === 'RUN'
                      ? 'bg-emerald-400 shadow-[0_0_6px_#34D399]'
                      : scanState.mode === 'PAUSE'
                      ? 'bg-amber-400'
                      : 'bg-slate-500'
                  }`}
                />
                {scanState.mode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Simulador Ladder Determinístico • Ciclo: {scanIntervalMs}ms • Varreduras:{' '}
              {scanState.cycleCount}
            </p>
          </div>
        </div>

        {/* Botões de Comando (Play / Stop / Pause / Step) */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {scanState.mode !== 'RUN' ? (
            <button
              type="button"
              onClick={handleStartRun}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>RUN (Simular)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePause}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all active:scale-95"
            >
              <Pause className="w-4 h-4" />
              <span>Pausar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleStop}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-all active:scale-95"
          >
            <Square className="w-4 h-4 fill-red-400" />
            <span>STOP</span>
          </button>

          <button
            type="button"
            onClick={handleSingleStep}
            title="Avançar 1 ciclo de varredura (Passo a passo)"
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
              isDark
                ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Step</span>
          </button>

          <button
            type="button"
            onClick={handleResetInputs}
            title="Resetar entradas para nível de repouso"
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-400'
                : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barra Secundária: Lógicas Prontas (Presets) & Exportação */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Seletor de Presets Clássicos */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Exemplos Prontos:</span>
          </span>
          <button
            type="button"
            onClick={() => handleLoadPreset('partida_direta')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all ${
              program.id === 'partida_direta'
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : isDark
                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Partida Direta com Selo
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('estrela_triangulo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all ${
              program.id === 'estrela_triangulo'
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : isDark
                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Estrela-Triângulo (TON)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('reversao_motor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all ${
              program.id === 'reversao_motor'
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : isDark
                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Reversão com Trava
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('controle_nivel')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition-all ${
              program.id === 'controle_nivel'
                ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                : isDark
                ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Controle de Nível
          </button>
        </div>

        {/* Botão de Exportar Lógica Ladder */}
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-all active:scale-95"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Exportar Código C (.h)</span>
          </button>
        </div>
      </div>

      {/* Grade Ladder Interativa (Área de Rungs) */}
      <div className="space-y-3">
        {program.rungs.map((rung, idx) => (
          <LadderRungView
            key={rung.id}
            rung={rung}
            rungIndex={idx}
            scanState={scanState}
            onUpdateRung={(updated) => {
              setProgram((prev) => ({
                ...prev,
                rungs: prev.rungs.map((r) => (r.id === updated.id ? updated : r)),
              }));
            }}
            onDeleteRung={handleDeleteRung}
            onEditElement={(element, branchId, isOutput) => {
              setEditingElement({
                element,
                branchId,
                isOutput,
                rungId: rung.id,
              });
            }}
            onAddContact={handleAddContactToBranch}
            onAddParallelBranch={handleAddParallelBranch}
          />
        ))}

        {/* Botão Adicionar Nova Linha / Rung */}
        <button
          type="button"
          onClick={handleAddRung}
          className={`w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-98 ${
            isDark
              ? 'border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white'
              : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Plus className="w-4 h-4 text-blue-500" />
          <span>Adicionar Linha Ladder (Novo Rung)</span>
        </button>
      </div>

      {/* Dock Inferior de I/O Virtual (Botoeiras e Leds Reais) */}
      <IoDock
        scanState={scanState}
        onToggleInput={handleToggleInput}
        inputTags={inputTags}
        outputTags={outputTags}
      />

      {/* Modais */}
      <ElementEditorModal
        isOpen={Boolean(editingElement)}
        element={editingElement?.element || null}
        isOutput={editingElement?.isOutput}
        onClose={() => setEditingElement(null)}
        onSave={handleSaveEditedElement}
        onDelete={
          editingElement && !editingElement.isOutput
            ? () => handleDeleteElement(editingElement.element.id)
            : undefined
        }
      />

      <CExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        cCode={compiledCCode}
        programName={program.name}
      />
    </div>
  );
};
