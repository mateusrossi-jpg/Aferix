// Presets de Lógicas Clássicas da Automação Industrial e Predial
import { LadderProgram } from './types';

export const LADDER_PRESETS: Record<string, LadderProgram> = {
  partida_direta: {
    id: 'partida_direta',
    name: 'Partida Direta de Motor (Com Selo)',
    description: 'Comando clássico Start/Stop com retenção por contato auxiliar NA da contatora.',
    rungs: [
      {
        id: 'rung-0',
        comment: 'Comando Liga/Desliga do Motor K1 com retenção por selo',
        branches: [
          {
            id: 'b-0-0',
            elements: [
              {
                id: 'el-stop',
                type: 'contact_nc',
                address: '%I0.0',
                tag: 'Botoeira Desliga (S0)',
              },
              {
                id: 'el-start',
                type: 'contact_no',
                address: '%I0.1',
                tag: 'Botoeira Liga (S1)',
              },
            ],
          },
          {
            id: 'b-0-1',
            elements: [
              {
                id: 'el-selo-stop',
                type: 'contact_nc',
                address: '%I0.0',
                tag: 'Botoeira Desliga (S0)',
              },
              {
                id: 'el-selo',
                type: 'contact_no',
                address: '%Q0.0',
                tag: 'Selo Auxiliar (K1)',
              },
            ],
          },
        ],
        output: {
          id: 'out-k1',
          type: 'coil',
          address: '%Q0.0',
          tag: 'Contatora K1 (Motor)',
        },
      },
    ],
  },

  estrela_triangulo: {
    id: 'estrela_triangulo',
    name: 'Partida Estrela-Triângulo (Y-Δ)',
    description: 'Redução de pico de corrente na partida. Inicia em Estrela (K3) e comuta para Triângulo (K2) via Temporizador TON.',
    rungs: [
      {
        id: 'rung-yd-0',
        comment: '1. Comando Geral K1 (Contatora Principal)',
        branches: [
          {
            id: 'b-yd-0',
            elements: [
              {
                id: 'el-yd-stop',
                type: 'contact_nc',
                address: '%I0.0',
                tag: 'Desliga (S0)',
              },
              {
                id: 'el-yd-start',
                type: 'contact_no',
                address: '%I0.1',
                tag: 'Liga (S1)',
              },
            ],
          },
          {
            id: 'b-yd-1',
            elements: [
              {
                id: 'el-yd-selo-stop',
                type: 'contact_nc',
                address: '%I0.0',
                tag: 'Desliga (S0)',
              },
              {
                id: 'el-yd-selo',
                type: 'contact_no',
                address: '%Q0.0',
                tag: 'Selo K1',
              },
            ],
          },
        ],
        output: {
          id: 'out-yd-k1',
          type: 'coil',
          address: '%Q0.0',
          tag: 'K1 (Principal)',
        },
      },
      {
        id: 'rung-yd-1',
        comment: '2. Temporizador de Transição (TON 4s)',
        branches: [
          {
            id: 'b-yd-t0',
            elements: [
              {
                id: 'el-t0-in',
                type: 'contact_no',
                address: '%Q0.0',
                tag: 'K1 Ativo',
              },
            ],
          },
        ],
        output: {
          id: 'out-yd-t0',
          type: 'ton',
          address: 'T0',
          tag: 'Tempo Y-Δ (4s)',
          presetTime: 4.0,
        },
      },
      {
        id: 'rung-yd-2',
        comment: '3. Contatora Estrela K3 (Ativa durante partida)',
        branches: [
          {
            id: 'b-yd-k3',
            elements: [
              {
                id: 'el-k3-k1',
                type: 'contact_no',
                address: '%Q0.0',
                tag: 'K1 Ligado',
              },
              {
                id: 'el-k3-t0',
                type: 'contact_nc',
                address: 'T0',
                tag: 'Tempo T0 NF',
              },
              {
                id: 'el-k3-int',
                type: 'contact_nc',
                address: '%Q0.1',
                tag: 'Trava K2 NF',
              },
            ],
          },
        ],
        output: {
          id: 'out-yd-k3',
          type: 'coil',
          address: '%Q0.2',
          tag: 'K3 (Estrela)',
        },
      },
      {
        id: 'rung-yd-3',
        comment: '4. Contatora Triângulo K2 (Ativa após o tempo)',
        branches: [
          {
            id: 'b-yd-k2',
            elements: [
              {
                id: 'el-k2-k1',
                type: 'contact_no',
                address: '%Q0.0',
                tag: 'K1 Ligado',
              },
              {
                id: 'el-k2-t0',
                type: 'contact_no',
                address: 'T0',
                tag: 'Tempo T0 NA',
              },
              {
                id: 'el-k2-int',
                type: 'contact_nc',
                address: '%Q0.2',
                tag: 'Trava K3 NF',
              },
            ],
          },
        ],
        output: {
          id: 'out-yd-k2',
          type: 'coil',
          address: '%Q0.1',
          tag: 'K2 (Triângulo)',
        },
      },
    ],
  },

  reversao_motor: {
    id: 'reversao_motor',
    name: 'Reversão de Motor com Intertravamento',
    description: 'Acionamento horário e anti-horário com travas elétricas cruzadas de segurança contra curto-circuito entre fases.',
    rungs: [
      {
        id: 'rung-rev-0',
        comment: '1. Sentido Horário (K1) com trava elétrica de K2',
        branches: [
          {
            id: 'b-rev-0',
            elements: [
              {
                id: 'el-rev-stop1',
                type: 'contact_nc',
                address: '%I0.0',
                tag: 'Parada (S0)',
              },
              {
                id: 'el-rev-start1',
                type: 'contact_no',
                address: '%I0.1',
                tag: 'Liga Horário (S1)',
              },
              {
                id: 'el-rev-lock2',
                type: 'contact_nc',
                address: '%Q0.1',
                tag: 'Trava K2 (NF)',
              },
            ],
          },
          {
            id: 'b-rev-1',
            elements: [
              {
                id: 'el-rev-stop1-selo',
                type: 'contact_nc',
                address: '%I0.0',
                tag: 'Parada (S0)',
              },
              {
                id: 'el-rev-selo1',
                type: 'contact_no',
                address: '%Q0.0',
                tag: 'Selo K1 (NA)',
              },
              {
                id: 'el-rev-lock2-selo',
                type: 'contact_nc',
                address: '%Q0.1',
                tag: 'Trava K2 (NF)',
              },
            ],
          },
        ],
        output: {
          id: 'out-rev-k1',
          type: 'coil',
          address: '%Q0.0',
          tag: 'K1 (Sentido Horário)',
        },
      },
      {
        id: 'rung-rev-1',
        comment: '2. Sentido Anti-Horário (K2) com trava elétrica de K1',
        branches: [
          {
            id: 'b-rev-2',
            elements: [
              {
                id: 'el-rev-stop2',
                type: 'contact_nc',
                address: '%I0.0',
                tag: 'Parada (S0)',
              },
              {
                id: 'el-rev-start2',
                type: 'contact_no',
                address: '%I0.2',
                tag: 'Liga Anti-Horário (S2)',
              },
              {
                id: 'el-rev-lock1',
                type: 'contact_nc',
                address: '%Q0.0',
                tag: 'Trava K1 (NF)',
              },
            ],
          },
          {
            id: 'b-rev-3',
            elements: [
              {
                id: 'el-rev-stop2-selo',
                type: 'contact_nc',
                address: '%I0.0',
                tag: 'Parada (S0)',
              },
              {
                id: 'el-rev-selo2',
                type: 'contact_no',
                address: '%Q0.1',
                tag: 'Selo K2 (NA)',
              },
              {
                id: 'el-rev-lock1-selo',
                type: 'contact_nc',
                address: '%Q0.0',
                tag: 'Trava K1 (NF)',
              },
            ],
          },
        ],
        output: {
          id: 'out-rev-k2',
          type: 'coil',
          address: '%Q0.1',
          tag: 'K2 (Anti-Horário)',
        },
      },
    ],
  },

  controle_nivel: {
    id: 'controle_nivel',
    name: 'Controle de Nível Automático (Caixa d\'Água)',
    description: 'Comando de bomba com boias de nível mínimo e nível máximo com histerese segura.',
    rungs: [
      {
        id: 'rung-niv-0',
        comment: 'Bomba d\'água liga em nível baixo e desliga em nível alto',
        branches: [
          {
            id: 'b-niv-0',
            elements: [
              {
                id: 'el-niv-max',
                type: 'contact_nc',
                address: '%I0.3',
                tag: 'Boia Nível Alto (Cheio)',
              },
              {
                id: 'el-niv-min',
                type: 'contact_no',
                address: '%I0.2',
                tag: 'Boia Nível Baixo (Seco)',
              },
            ],
          },
          {
            id: 'b-niv-1',
            elements: [
              {
                id: 'el-niv-max-selo',
                type: 'contact_nc',
                address: '%I0.3',
                tag: 'Boia Nível Alto (Cheio)',
              },
              {
                id: 'el-niv-selo',
                type: 'contact_no',
                address: '%Q0.3',
                tag: 'Selo Bomba Ativa',
              },
            ],
          },
        ],
        output: {
          id: 'out-niv-bomba',
          type: 'coil',
          address: '%Q0.3',
          tag: 'Bomba de Recalque (K1)',
        },
      },
    ],
  },
};
