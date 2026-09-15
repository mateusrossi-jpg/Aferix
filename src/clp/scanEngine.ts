// Motor de Varredura Determinístico de CLP (Scan Cycle Engine)
// Executa em milissegundos seguindo a arquitetura clássica de CLP Industrial:
// 1. Leitura de Entradas (%I)
// 2. Resolução da Lógica Ladder (Rung por Rung)
// 3. Atualização de Memórias (%M), Temporizadores (TON/TOF) e Saídas (%Q)

import { LadderProgram, ScanCycleState, LadderElement } from './types';

export const INITIAL_INPUTS: Record<string, boolean> = {
  '%I0.0': false,
  '%I0.1': false,
  '%I0.2': false,
  '%I0.3': false,
  '%I0.4': false,
  '%I0.5': false,
  '%I0.6': false,
  '%I0.7': false,
};

export const INITIAL_OUTPUTS: Record<string, boolean> = {
  '%Q0.0': false,
  '%Q0.1': false,
  '%Q0.2': false,
  '%Q0.3': false,
  '%Q0.4': false,
  '%Q0.5': false,
  '%Q0.6': false,
  '%Q0.7': false,
};

export const INITIAL_MEMORY: Record<string, boolean> = {
  '%M0.0': false,
  '%M0.1': false,
  '%M0.2': false,
  '%M0.3': false,
  '%M0.4': false,
  '%M0.5': false,
  '%M0.6': false,
  '%M0.7': false,
};

export function createInitialScanState(): ScanCycleState {
  return {
    inputs: { ...INITIAL_INPUTS },
    outputs: { ...INITIAL_OUTPUTS },
    memory: { ...INITIAL_MEMORY },
    timers: {
      T0: { enabled: false, done: false, elapsed: 0, preset: 5.0, type: 'ton' },
      T1: { enabled: false, done: false, elapsed: 0, preset: 3.0, type: 'ton' },
      T2: { enabled: false, done: false, elapsed: 0, preset: 2.0, type: 'ton' },
      T3: { enabled: false, done: false, elapsed: 0, preset: 5.0, type: 'ton' },
    },
    prevInputs: { ...INITIAL_INPUTS },
    conductance: {
      rungs: {},
      branches: {},
      elements: {},
      outputEnergized: {},
    },
    mode: 'RUN',
    scanTimeMs: 50,
    cycleCount: 0,
  };
}

/**
 * Lê o valor booleano de um determinado endereço (%I, %Q, %M, ou status .Q de temporizador T)
 */
export function readVariableValue(address: string, state: ScanCycleState): boolean {
  if (address.startsWith('%I')) {
    return state.inputs[address] ?? false;
  }
  if (address.startsWith('%Q')) {
    return state.outputs[address] ?? false;
  }
  if (address.startsWith('%M')) {
    return state.memory[address] ?? false;
  }
  if (address.startsWith('T')) {
    const timerId = address.split('.')[0];
    return state.timers[timerId]?.done ?? false;
  }
  return false;
}

/**
 * Escreve um valor booleano no endereço correspondente (%Q ou %M)
 */
export function writeVariableValue(address: string, value: boolean, state: ScanCycleState): void {
  if (address.startsWith('%Q')) {
    state.outputs[address] = value;
  } else if (address.startsWith('%M')) {
    state.memory[address] = value;
  }
}

/**
 * Executa um ciclo determinístico de varredura completo (Scan Cycle)
 * @param program Programa Ladder a ser resolvido
 * @param currentState Estado atual das tabelas de dados
 * @param deltaSeconds Intervalo de tempo do ciclo em segundos (ex: 0.05 para 50ms)
 * @returns Novo estado imutável com condutâncias e valores recalculados
 */
export function executeScanCycle(
  program: LadderProgram,
  currentState: ScanCycleState,
  deltaSeconds: number = 0.05
): ScanCycleState {
  // Cria cópia rasa para mutação contida no ciclo
  const nextOutputs = { ...currentState.outputs };
  const nextMemory = { ...currentState.memory };
  const nextTimers = { ...currentState.timers };
  const conductanceRungs: Record<string, boolean> = {};
  const conductanceBranches: Record<string, boolean> = {};
  const conductanceElements: Record<string, boolean> = {};
  const outputEnergized: Record<string, boolean> = {};

  const tempState: ScanCycleState = {
    ...currentState,
    outputs: nextOutputs,
    memory: nextMemory,
    timers: nextTimers,
  };

  for (const rung of program.rungs) {
    let rungHasConductance = false;

    // Se o rung não possui ramos de contato, a condução é direta (True)
    if (!rung.branches || rung.branches.length === 0) {
      rungHasConductance = true;
    } else {
      // Lógica OR entre ramos paralelos
      for (const branch of rung.branches) {
        let branchConductance = true;

        // Se o ramo está vazio, conduz direto
        if (!branch.elements || branch.elements.length === 0) {
          branchConductance = true;
        } else {
          // Lógica AND em série dentro do ramo
          for (const el of branch.elements) {
            const rawVal = readVariableValue(el.address, tempState);
            let elState = false;

            if (el.type === 'contact_no') {
              elState = rawVal;
            } else if (el.type === 'contact_nc') {
              elState = !rawVal;
            } else if (el.type === 'rising_edge') {
              const prevVal = currentState.prevInputs[el.address] ?? false;
              elState = rawVal && !prevVal;
            } else if (el.type === 'falling_edge') {
              const prevVal = currentState.prevInputs[el.address] ?? false;
              elState = !rawVal && prevVal;
            }

            // O elemento conduz se seu estado for true E a corrente até ele estava fluindo
            conductanceElements[el.id] = elState && branchConductance;
            branchConductance = branchConductance && elState;
          }
        }

        conductanceBranches[branch.id] = branchConductance;
        if (branchConductance) {
          rungHasConductance = true;
        }
      }
    }

    conductanceRungs[rung.id] = rungHasConductance;

    // Resolução da Saída do Rung
    const out = rung.output;
    if (out) {
      outputEnergized[out.id] = rungHasConductance;

      if (out.type === 'coil') {
        writeVariableValue(out.address, rungHasConductance, tempState);
      } else if (out.type === 'coil_not') {
        writeVariableValue(out.address, !rungHasConductance, tempState);
      } else if (out.type === 'coil_set') {
        if (rungHasConductance) {
          writeVariableValue(out.address, true, tempState);
        }
      } else if (out.type === 'coil_reset') {
        if (rungHasConductance) {
          writeVariableValue(out.address, false, tempState);
        }
      } else if (out.type === 'ton') {
        // Temporizador On-Delay
        const timerId = out.address.split('.')[0];
        const preset = out.presetTime ?? 5.0;
        const currentTimer = nextTimers[timerId] || {
          enabled: false,
          done: false,
          elapsed: 0,
          preset,
          type: 'ton',
        };

        if (rungHasConductance) {
          // Enquanto energizado, incrementa tempo
          const newElapsed = Math.min(preset, currentTimer.elapsed + deltaSeconds);
          const done = newElapsed >= preset;
          nextTimers[timerId] = {
            enabled: true,
            done,
            elapsed: newElapsed,
            preset,
            type: 'ton',
          };
        } else {
          // Desenergizado: zera imediatamente
          nextTimers[timerId] = {
            enabled: false,
            done: false,
            elapsed: 0,
            preset,
            type: 'ton',
          };
        }
      } else if (out.type === 'tof') {
        // Temporizador Off-Delay
        const timerId = out.address.split('.')[0];
        const preset = out.presetTime ?? 5.0;
        const currentTimer = nextTimers[timerId] || {
          enabled: false,
          done: false,
          elapsed: 0,
          preset,
          type: 'tof',
        };

        if (rungHasConductance) {
          // Energizado: saída ativa e tempo zerado
          nextTimers[timerId] = {
            enabled: true,
            done: true,
            elapsed: 0,
            preset,
            type: 'tof',
          };
        } else {
          // Desenergizado: conta tempo antes de desarmar
          if (currentTimer.done) {
            const newElapsed = currentTimer.elapsed + deltaSeconds;
            const done = newElapsed < preset;
            nextTimers[timerId] = {
              enabled: false,
              done,
              elapsed: Math.min(preset, newElapsed),
              preset,
              type: 'tof',
            };
          }
        }
      }
    }
  }

  return {
    ...currentState,
    outputs: nextOutputs,
    memory: nextMemory,
    timers: nextTimers,
    prevInputs: { ...currentState.inputs },
    conductance: {
      rungs: conductanceRungs,
      branches: conductanceBranches,
      elements: conductanceElements,
      outputEnergized,
    },
    cycleCount: currentState.cycleCount + 1,
  };
}
