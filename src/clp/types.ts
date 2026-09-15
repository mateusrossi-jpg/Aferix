// CLP-Fácil: Tipos e Definições da Lógica Ladder e Varredura
// Compatível com padrão IEC 61131-3 e arquitetura de firmware ENDAP

export type ContactType = 'contact_no' | 'contact_nc' | 'rising_edge' | 'falling_edge';
export type CoilType = 'coil' | 'coil_not' | 'coil_set' | 'coil_reset' | 'ton' | 'tof';
export type ElementType = ContactType | CoilType;

export type VariableType = 'input' | 'output' | 'memory' | 'timer';

export interface LadderElement {
  id: string;
  type: ElementType;
  address: string; // Ex: %I0.0, %Q0.0, %M0.0, T0
  tag?: string; // Nome mnemônico (Ex: "Botoeira Liga", "K1 Motor")
  presetTime?: number; // Para TON/TOF em segundos (Ex: 5.0)
  elapsedTime?: number; // Tempo decorrido atual
}

export interface LadderParallelBranch {
  id: string;
  elements: LadderElement[]; // Contatos em série dentro deste ramo paralelo
}

export interface LadderRung {
  id: string;
  comment?: string;
  branches: LadderParallelBranch[]; // Ramos em paralelo (lógica OR entre ramos, lógica AND dentro de cada ramo)
  output: LadderElement; // Bobina ou Temporizador de saída
}

export interface LadderProgram {
  id: string;
  name: string;
  description?: string;
  rungs: LadderRung[];
}

export interface ScanCycleState {
  inputs: Record<string, boolean>;
  outputs: Record<string, boolean>;
  memory: Record<string, boolean>;
  timers: Record<string, {
    enabled: boolean;
    done: boolean;
    elapsed: number;
    preset: number;
    type: 'ton' | 'tof';
  }>;
  prevInputs: Record<string, boolean>;
  // Armazena a condução de corrente em tempo real para renderização visual
  conductance: {
    rungs: Record<string, boolean>;
    branches: Record<string, boolean>;
    elements: Record<string, boolean>;
    outputEnergized: Record<string, boolean>;
  };
  mode: 'RUN' | 'STOP' | 'PAUSE';
  scanTimeMs: number;
  cycleCount: number;
}
