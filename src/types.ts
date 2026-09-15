export type JobStatus =
  | 'iniciado'
  | 'enviado'
  | 'aprovado'
  | 'execucao'
  | 'finalizado'
  | 'arquivado';

export const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; bg: string; border: string }> = {
  iniciado: {
    label: 'Iniciado',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    border: 'border-slate-200 dark:border-white/10',
  },
  enviado: {
    label: 'Enviado',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    border: 'border-blue-500/20 dark:border-blue-500/30',
  },
  aprovado: {
    label: 'Aprovado',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    border: 'border-emerald-500/20 dark:border-emerald-500/30',
  },
  execucao: {
    label: 'Em Execução',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    border: 'border-amber-500/20 dark:border-amber-500/30',
  },
  finalizado: {
    label: 'Finalizado',
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10 dark:bg-teal-500/15',
    border: 'border-teal-500/20 dark:border-teal-500/30',
  },
  arquivado: {
    label: 'Arquivado',
    color: 'text-slate-500 dark:text-slate-500',
    bg: 'bg-slate-100 dark:bg-slate-900/60',
    border: 'border-slate-200 dark:border-white/10',
  },
};

export interface BudgetItem {
  id: string;
  name: string;
  type: 'servico' | 'material' | 'mao_de_obra';
  qty: number;
  unit: string;
  unitPrice: number;
  unitCost: number;
  total: number;
}

export interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  type: 'antes' | 'durante' | 'depois';
  timestamp: string;
}

export interface Budget {
  id: string;
  code: string;
  title: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  status: JobStatus;
  date: string;
  scheduledTime?: string;
  items: BudgetItem[];
  totalValue: number;
  totalCost: number;
  netProfit: number;
  marginPercent: number;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  photos?: JobPhoto[];
  clientSignature?: string; // base64 canvas image data
  clientSignatureDate?: string;
  clientSignerName?: string;
  reminderDate?: string;
  reminderNote?: string;
  reminderSent?: boolean;
  syncStatus?: 'synced' | 'pending_sync';
  syncedAt?: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'create_budget' | 'update_budget' | 'status_change';
  entityId: string;
  payload: any;
  timestamp: string;
  retries: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  address: string;
  notes?: string;
  totalJobs: number;
  totalRevenue: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: 'Serviço' | 'Material' | 'Mão de obra';
  unit: string;
  price: number;
  cost: number;
  stock?: number;
}

export interface Receivable {
  id: string;
  budgetId?: string;
  clientName: string;
  description: string;
  value: number;
  dueDate: string;
  status: 'pendente' | 'recebido' | 'atrasado';
  receivedAt?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'entrada' | 'saida';
  category: string;
  description: string;
  value: number;
  date: string;
  budgetId?: string;
}

export interface Appointment {
  id: string;
  budgetId?: string;
  clientId: string;
  clientName: string;
  title: string;
  date: string;
  time: string;
  address: string;
  status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  type: 'visita_tecnica' | 'execucao' | 'orcamento';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'critical';
  read: boolean;
}

export interface UserProfile {
  businessName: string;
  ownerName: string;
  pixKey: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  phone: string;
  email: string;
  city: string;
  cnpj?: string;
  technicalRegistry?: string; // CFT / CREA
}

export interface Equipment {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  brand: string;
  model: string;
  serialNumber: string;
  installDate: string;
  warrantyUntil: string;
  location: string;
  status: 'operacional' | 'manutencao_necessaria' | 'critico';
  lastMaintenance?: string;
  notes?: string;
}

export type MaintenancePlanType = 'pmp' | 'pgm' | 'pmoc';

export type MaintenanceDiscipline =
  | 'eletrica'
  | 'climatizacao'
  | 'hidraulica'
  | 'mecanica'
  | 'geradores'
  | 'civil'
  | 'elevadores'
  | 'geral';

export interface MaintenanceCheckItem {
  id: string;
  label: string;
  category: string;
  status: 'conforme' | 'nao_conforme' | 'corrigido' | 'na';
  observation?: string;
}

export interface MaintenanceReport {
  id: string;
  code: string;
  planType: MaintenancePlanType;
  discipline: MaintenanceDiscipline;
  periodicity?: 'mensal' | 'bimestral' | 'trimestral' | 'semestral' | 'anual' | 'avulso';
  clientId: string;
  clientName: string;
  equipmentName: string;
  technicianName: string;
  date: string;
  items: MaintenanceCheckItem[];
  generalStatus: 'aprovado' | 'reprovado' | 'com_ressalvas';
  technicianNotes?: string;
  clientSignatureName?: string;
  clientSignatureDataUrl?: string;
}

// Aliases para compatibilidade integral com o código existente
export type PmocCheckItem = MaintenanceCheckItem;
export type PmocReport = MaintenanceReport;

export type ActiveTab = 'resumo' | 'operacao' | 'financeiro' | 'agenda' | 'clientes' | 'catalogo' | 'relatorios' | 'configuracoes' | 'clp_facil';

