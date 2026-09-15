import { MaintenanceDiscipline, MaintenancePlanType } from '../types';

export interface DisciplineConfig {
  id: MaintenanceDiscipline;
  name: string;
  icon: string;
  description: string;
  defaultPlanType: MaintenancePlanType;
  items: { label: string; category: string }[];
}

export const MAINTENANCE_PLAN_TYPES: {
  id: MaintenancePlanType;
  name: string;
  acronym: string;
  scope: string;
}[] = [
  {
    id: 'pmp',
    name: 'Plano de Manutenção Preventiva',
    acronym: 'PMP',
    scope: 'Universal para equipamentos, subestações, máquinas e instalações prediais ou industriais.',
  },
  {
    id: 'pgm',
    name: 'Plano de Gerenciamento de Manutenção',
    acronym: 'PGM',
    scope: 'Gestão estratégica integrada de manutenção para edifícios, indústrias e condomínios.',
  },
  {
    id: 'pmoc',
    name: 'Plano de Manutenção, Operação e Controle',
    acronym: 'PMOC',
    scope: 'Específico para sistemas de climatização e qualidade do ar interior (Lei Federal 13.589/2018).',
  },
];

export const MAINTENANCE_DISCIPLINES: Record<MaintenanceDiscipline, DisciplineConfig> = {
  eletrica: {
    id: 'eletrica',
    name: 'Elétrica & Subestações',
    icon: 'Zap',
    description: 'QGBTs, quadros de distribuição, disjuntores, barramentos, DPS e aterramento.',
    defaultPlanType: 'pmp',
    items: [
      { label: 'Reaperto torquimétrico de conexões, bornes e barramentos principais (QGBT)', category: 'Conexões' },
      { label: 'Inspeção e teste de integridade dos Protetores de Surto (DPS)', category: 'Proteção' },
      { label: 'Teste funcional de atuação de disjuntores e dispositivos DR', category: 'Dispositivos' },
      { label: 'Termografia infravermelha para detecção de pontos quentes sob carga nominal', category: 'Termografia' },
      { label: 'Medição da resistência de aterramento e continuidade da malha SPDA', category: 'Aterramento' },
      { label: 'Limpeza interna, despoeiramento e desumidificação de painéis elétricos', category: 'Limpeza' },
      { label: 'Vistoria visual de isolação, cabos alimentadores e calhas de fiação', category: 'Cabos' },
      { label: 'Verificação da sinalização de risco, diagramas unifilares e identificação de circuitos', category: 'Normas' },
    ],
  },
  climatizacao: {
    id: 'climatizacao',
    name: 'Climatização & Refrigeração (PMOC)',
    icon: 'Snowflake',
    description: 'Sistemas VRF, chillers, splits, dutos, renovação de ar e filtros (Lei 13.589).',
    defaultPlanType: 'pmoc',
    items: [
      { label: 'Higienização e aspersão bactericida nas serpentinas evaporadoras', category: 'Evaporadora' },
      { label: 'Limpeza química ou substituição periódica de filtros de ar (G4/F7)', category: 'Filtros' },
      { label: 'Desobstrução, lavagem e tratamento antibacteriano de bandejas e drenos', category: 'Drenagem' },
      { label: 'Medição das pressões de sucção/descarga e superaquecimento/sub-resfriamento', category: 'Ciclo Frigorigêneo' },
      { label: 'Medição da corrente elétrica nominal de compressores e motoventiladores', category: 'Motores' },
      { label: 'Limpeza mecânica e alinhamento das aletas das unidades condensadoras', category: 'Condensadora' },
      { label: 'Inspeção de dampers, tomada de ar externo e taxa de renovação de ar ambiente', category: 'Qualidade do Ar' },
      { label: 'Checagem de isolamento térmico das linhas de fluido e vibrações mecânicas', category: 'Estrutura' },
    ],
  },
  hidraulica: {
    id: 'hidraulica',
    name: 'Hidráulica & Incêndio',
    icon: 'Droplets',
    description: 'Bombas de recalque, caixas d\'água, pressurizadores, hidrantes e barriletes.',
    defaultPlanType: 'pmp',
    items: [
      { label: 'Teste operacional, rodízio e comutação automática das bombas de recalque', category: 'Bombas' },
      { label: 'Verificação de selos mecânicos, gaxetas e estanqueidade de carcaças', category: 'Estanqueidade' },
      { label: 'Inspeção e teste de pressostatos, vasos de expansão e manômetros', category: 'Pressurização' },
      { label: 'Vistoria de boias elétricas e sensores de nível dos reservatórios superior e inferior', category: 'Automação' },
      { label: 'Teste de estanqueidade e manobra de registros e válvulas de retenção do barrilete', category: 'Válvulas' },
      { label: 'Inspeção de bombas de combate a incêndio e pressurização de hidrantes/sprinklers', category: 'Incêndio' },
      { label: 'Checagem de desobstrução de ralos pluviais, bombas de esgoto e fossas sépticas', category: 'Drenagem' },
    ],
  },
  mecanica: {
    id: 'mecanica',
    name: 'Mecânica & Máquinas',
    icon: 'Wrench',
    description: 'Motores elétricos, redutores, compressores, esteiras e pontes rolantes.',
    defaultPlanType: 'pmp',
    items: [
      { label: 'Lubrificação e engraxamento de mancais, rolamentos e guias lineares', category: 'Lubrificação' },
      { label: 'Checagem de tensão, desgaste e alinhamento de correias e correntes de transmissão', category: 'Transmissão' },
      { label: 'Alinhamento de eixos e medição de folgas mecânicas radiais e axiais', category: 'Alinhamento' },
      { label: 'Análise de vibração e ruído acústico anômalo em motores e redutores', category: 'Vibração' },
      { label: 'Inspeção e substituição de filtros de óleo e separadores ar/óleo de compressores', category: 'Filtração' },
      { label: 'Verificação de sistemas de frenagem, catracas e travas eletromecânicas', category: 'Segurança' },
      { label: 'Inspeção das proteções físicas de partes móveis e botão de parada de emergência (NR-12)', category: 'NR-12' },
    ],
  },
  geradores: {
    id: 'geradores',
    name: 'Geradores & Energia Crítica',
    icon: 'Power',
    description: 'Grupos geradores diesel, chave QTA de transferência automática e nobreaks.',
    defaultPlanType: 'pmp',
    items: [
      { label: 'Teste de partida simulada sem carga e comutação pela chave QTA', category: 'Transferência' },
      { label: 'Checagem do nível de óleo lubrificante, viscosidade e ausência de vazamentos', category: 'Lubrificação' },
      { label: 'Verificação do nível, decantação de água e filtros do combustível diesel', category: 'Combustível' },
      { label: 'Inspeção do nível e aditivação do líquido de arrefecimento e mangueiras do radiador', category: 'Arrefecimento' },
      { label: 'Medição da tensão de flutuação e estado eletroquímico da bateria de partida', category: 'Bateria' },
      { label: 'Conferência de frequência gerada (60Hz), tensão entre fases e funcionamento do AVR', category: 'Gerador' },
      { label: 'Vistoria do sistema de exaustão de gases, silencioso e entrada de ar na sala técnica', category: 'Exaustão' },
    ],
  },
  civil: {
    id: 'civil',
    name: 'Civil & Infraestrutura Predial',
    icon: 'Building2',
    description: 'Coberturas, lajes impermeabilizadas, fachadas, calhas e trincas estruturais.',
    defaultPlanType: 'pgm',
    items: [
      { label: 'Vistoria da manta asfáltica e estanqueidade de lajes de cobertura e reservatórios', category: 'Impermeabilização' },
      { label: 'Desobstrução e limpeza de calhas, rufos e condutores de águas pluviais', category: 'Drenagem Pluvial' },
      { label: 'Mapeamento e monitoramento de fissuras, trincas ou movimentações estruturais', category: 'Estrutural' },
      { label: 'Verificação de aderência de pastilhas, textura e juntas de dilatação de fachada', category: 'Fachada' },
      { label: 'Inspeção do funcionamento de portas corta-fogo, barras antipânico e molas hidráulicas', category: 'Segurança Predial' },
      { label: 'Vistoria das escadas de emergência, corrimãos e fitas antiderrapantes', category: 'Acessibilidade' },
    ],
  },
  elevadores: {
    id: 'elevadores',
    name: 'Elevadores & Transporte Vertical',
    icon: 'ArrowUpDown',
    description: 'Cabos de aço, limitadores de velocidade, portas de pavimento e máquinas de tração.',
    defaultPlanType: 'pmp',
    items: [
      { label: 'Inspeção visual e dimensional de desgaste nos cabos de tração e polias', category: 'Cabos' },
      { label: 'Teste funcional do limitador de velocidade mecânico e freio de segurança', category: 'Freios' },
      { label: 'Regulagem e alinhamento de trincos e contatos elétricos de portas de pavimento', category: 'Portas' },
      { label: 'Verificação da precisão de nivelamento da cabine nos andares de parada', category: 'Nivelamento' },
      { label: 'Vistoria e lubrificação das guias de cabine e contrapeso', category: 'Guias' },
      { label: 'Teste do botão de alarme, interfone de emergência e luz de segurança da cabine', category: 'Emergência' },
      { label: 'Inspeção da casa de máquinas, quadro de comando e ventilação técnica', category: 'Comando' },
    ],
  },
  geral: {
    id: 'geral',
    name: 'Geral / Manutenção Integrada',
    icon: 'Layers',
    description: 'Auditoria e checklist periódico geral para instalações comerciais e industriais.',
    defaultPlanType: 'pgm',
    items: [
      { label: 'Inspeção geral das instalações elétricas e quadros de iluminação', category: 'Elétrica' },
      { label: 'Checagem operacional do sistema de climatização e conforto térmico', category: 'HVAC' },
      { label: 'Verificação de pontos de água, torneiras e vasos quanto a vazamentos', category: 'Hidráulica' },
      { label: 'Inspeção do estado geral de conservação de extintores e sinalização de emergência', category: 'Incêndio' },
      { label: 'Vistoria de portas, fechaduras e acessos controlados', category: 'Acessos' },
      { label: 'Verificação visual de tetos e paredes quanto a infiltrações aparentes', category: 'Predial' },
    ],
  },
};
