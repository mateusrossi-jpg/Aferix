import { useState, useEffect, useCallback } from 'react';
import { Budget, Client, CatalogItem, Receivable, FinancialTransaction, Appointment, AppNotification, UserProfile, JobStatus, Equipment, PmocReport } from '../types';
import { enqueueBudgetChange, isOnlineNow } from '../utils/offlineSync';
import {
  INITIAL_PROFILE,
  INITIAL_CLIENTS,
  INITIAL_CATALOG,
  INITIAL_BUDGETS,
  INITIAL_RECEIVABLES,
  INITIAL_TRANSACTIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_EQUIPMENTS,
  INITIAL_PMOC_REPORTS,
} from './initialData';

const STORAGE_KEYS = {
  PROFILE: 'aferix_profile_v1',
  CLIENTS: 'aferix_clients_v1',
  CATALOG: 'aferix_catalog_v1',
  BUDGETS: 'aferix_budgets_v1',
  RECEIVABLES: 'aferix_receivables_v1',
  TRANSACTIONS: 'aferix_transactions_v1',
  APPOINTMENTS: 'aferix_appointments_v1',
  NOTIFICATIONS: 'aferix_notifications_v1',
  EQUIPMENTS: 'aferix_equipments_v1',
  PMOC_REPORTS: 'aferix_pmoc_reports_v1',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('aferix_storage_update', { detail: { key } }));
  } catch (err) {
    console.error(`Error saving to localStorage key: ${key}`, err);
  }
}

export const aferixStore = {
  // Profile
  getProfile: (): UserProfile => getStored(STORAGE_KEYS.PROFILE, INITIAL_PROFILE),
  setProfile: (profile: UserProfile) => setStored(STORAGE_KEYS.PROFILE, profile),

  // Clients
  getClients: (): Client[] => getStored(STORAGE_KEYS.CLIENTS, INITIAL_CLIENTS),
  addClient: (client: Omit<Client, 'id' | 'totalJobs' | 'totalRevenue'>) => {
    const current = aferixStore.getClients();
    const newClient: Client = {
      ...client,
      id: 'c_' + Date.now(),
      totalJobs: 0,
      totalRevenue: 0,
    };
    setStored(STORAGE_KEYS.CLIENTS, [newClient, ...current]);
    return newClient;
  },
  updateClient: (id: string, updates: Partial<Client>) => {
    const current = aferixStore.getClients();
    const updated = current.map(c => c.id === id ? { ...c, ...updates } : c);
    setStored(STORAGE_KEYS.CLIENTS, updated);
  },
  deleteClient: (id: string) => {
    const current = aferixStore.getClients();
    setStored(STORAGE_KEYS.CLIENTS, current.filter(c => c.id !== id));
  },

  // Catalog
  getCatalog: (): CatalogItem[] => getStored(STORAGE_KEYS.CATALOG, INITIAL_CATALOG),
  addCatalogItem: (item: Omit<CatalogItem, 'id'>) => {
    const current = aferixStore.getCatalog();
    const newItem: CatalogItem = { ...item, id: 'k_' + Date.now() };
    setStored(STORAGE_KEYS.CATALOG, [...current, newItem]);
    return newItem;
  },
  updateCatalogItem: (id: string, updates: Partial<CatalogItem>) => {
    const current = aferixStore.getCatalog();
    setStored(STORAGE_KEYS.CATALOG, current.map(k => k.id === id ? { ...k, ...updates } : k));
  },
  deleteCatalogItem: (id: string) => {
    const current = aferixStore.getCatalog();
    setStored(STORAGE_KEYS.CATALOG, current.filter(k => k.id !== id));
  },

  // Budgets / Work Orders
  getBudgets: (): Budget[] => getStored(STORAGE_KEYS.BUDGETS, INITIAL_BUDGETS),
  getBudgetById: (id: string): Budget | undefined => {
    return aferixStore.getBudgets().find(b => b.id === id);
  },
  addBudget: (budgetData: Omit<Budget, 'id' | 'code' | 'createdAt'>) => {
    const current = aferixStore.getBudgets();
    const nextCodeNum = 1020 + current.length + 1;
    const isOnline = isOnlineNow();
    const newBudget: Budget = {
      ...budgetData,
      id: 'b_' + Date.now(),
      code: `#${nextCodeNum}`,
      createdAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending_sync',
      syncedAt: isOnline ? new Date().toISOString() : undefined,
    };
    setStored(STORAGE_KEYS.BUDGETS, [newBudget, ...current]);

    // Enqueue for offline sync tracking
    enqueueBudgetChange('create_budget', newBudget.id, newBudget);

    // Update client stats
    const clients = aferixStore.getClients();
    const client = clients.find(c => c.id === budgetData.clientId);
    if (client) {
      aferixStore.updateClient(client.id, {
        totalJobs: client.totalJobs + 1,
        totalRevenue: client.totalRevenue + budgetData.totalValue,
      });
    }

    // Add notification
    aferixStore.addNotification({
      title: isOnline ? 'Novo Orçamento Criado' : 'Orçamento Salvo Offline',
      message: `Orçamento ${newBudget.code} criado para ${newBudget.clientName} (R$ ${newBudget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). ${!isOnline ? 'Será sincronizado automaticamente ao reconectar.' : ''}`,
      type: isOnline ? 'info' : 'warning',
    });

    return newBudget;
  },
  updateBudget: (id: string, updates: Partial<Budget>) => {
    const current = aferixStore.getBudgets();
    const isOnline = isOnlineNow();
    const updated = current.map(b =>
      b.id === id
        ? {
            ...b,
            ...updates,
            syncStatus: isOnline ? ('synced' as const) : ('pending_sync' as const),
            syncedAt: isOnline ? new Date().toISOString() : b.syncedAt,
          }
        : b
    );
    setStored(STORAGE_KEYS.BUDGETS, updated);
    enqueueBudgetChange('update_budget', id, updates);
  },
  updateBudgetStatus: (id: string, status: JobStatus) => {
    const current = aferixStore.getBudgets();
    const budget = current.find(b => b.id === id);
    if (!budget) return;

    const isOnline = isOnlineNow();
    const updates: Partial<Budget> = {
      status,
      syncStatus: isOnline ? 'synced' : 'pending_sync',
      syncedAt: isOnline ? new Date().toISOString() : budget.syncedAt,
    };
    enqueueBudgetChange('status_change', id, { status });
    if (status === 'finalizado') {
      updates.completedAt = new Date().toISOString();

      // Automatic Stock Deduction for items of type 'material' or 'mao_de_obra' matching catalog
      const catalog = aferixStore.getCatalog();
      const catalogUpdates: { id: string; newStock: number }[] = [];
      const stockWarnings: string[] = [];

      if (budget.items && budget.items.length > 0) {
        budget.items.forEach(item => {
          if (item.type === 'material') {
            // Find matching catalog item by name (case-insensitive or exact)
            const catItem = catalog.find(
              c => c.name.toLowerCase().trim() === item.name.toLowerCase().trim()
            );
            if (catItem) {
              const currentStock = catItem.stock ?? 10; // default stock if undefined
              const newStock = currentStock - item.qty;
              catalogUpdates.push({ id: catItem.id, newStock });
              if (newStock < 0) {
                stockWarnings.push(`${catItem.name} (Estoque negativo: ${newStock})`);
              }
            }
          }
        });

        // Apply stock updates
        catalogUpdates.forEach(su => {
          aferixStore.updateCatalogItem(su.id, { stock: su.newStock });
        });

        if (stockWarnings.length > 0) {
          aferixStore.addNotification({
            title: 'Aviso de Estoque Insuficiente',
            message: `OS ${budget.code} finalizada com estoque abaixo do zero em: ${stockWarnings.join(', ')}.`,
            type: 'warning',
          });
        }
      }

      // Also register receivable if none exists
      const receivables = aferixStore.getReceivables();
      if (!receivables.some(r => r.budgetId === id)) {
        aferixStore.addReceivable({
          budgetId: id,
          clientName: budget.clientName,
          description: `Orçamento ${budget.code} - ${budget.title}`,
          value: budget.totalValue,
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
          status: 'pendente',
        });
      }
    }

    aferixStore.updateBudget(id, updates);

    // Notify
    aferixStore.addNotification({
      title: `Status Atualizado: ${budget.code}`,
      message: `Orçamento de ${budget.clientName} mudou para "${status.toUpperCase()}".`,
      type: status === 'aprovado' || status === 'finalizado' ? 'success' : 'info',
    });
  },

  // Receivables
  getReceivables: (): Receivable[] => getStored(STORAGE_KEYS.RECEIVABLES, INITIAL_RECEIVABLES),
  addReceivable: (receivable: Omit<Receivable, 'id'>) => {
    const current = aferixStore.getReceivables();
    const newReceivable: Receivable = { ...receivable, id: 'r_' + Date.now() };
    setStored(STORAGE_KEYS.RECEIVABLES, [newReceivable, ...current]);
    return newReceivable;
  },
  markReceivablePaid: (id: string) => {
    const current = aferixStore.getReceivables();
    const item = current.find(r => r.id === id);
    if (!item) return;

    const updated = current.map(r => r.id === id ? { ...r, status: 'recebido' as const, receivedAt: new Date().toISOString().slice(0, 10) } : r);
    setStored(STORAGE_KEYS.RECEIVABLES, updated);

    // Add entry transaction
    aferixStore.addTransaction({
      type: 'entrada',
      category: 'Recebimento de Serviço',
      description: item.description,
      value: item.value,
      date: new Date().toISOString().slice(0, 10),
      budgetId: item.budgetId,
    });

    aferixStore.addNotification({
      title: 'Pagamento Recebido!',
      message: `Recebido R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de ${item.clientName}.`,
      type: 'success',
    });
  },

  // Financial Transactions
  getTransactions: (): FinancialTransaction[] => getStored(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS),
  addTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => {
    const current = aferixStore.getTransactions();
    const newTx: FinancialTransaction = { ...transaction, id: 't_' + Date.now() };
    setStored(STORAGE_KEYS.TRANSACTIONS, [newTx, ...current]);
    return newTx;
  },
  deleteTransaction: (id: string) => {
    const current = aferixStore.getTransactions();
    setStored(STORAGE_KEYS.TRANSACTIONS, current.filter(t => t.id !== id));
  },

  // Appointments
  getAppointments: (): Appointment[] => getStored(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS),
  addAppointment: (app: Omit<Appointment, 'id'>) => {
    const current = aferixStore.getAppointments();
    const newApp: Appointment = { ...app, id: 'a_' + Date.now() };
    setStored(STORAGE_KEYS.APPOINTMENTS, [...current, newApp]);
    return newApp;
  },
  updateAppointmentStatus: (id: string, status: Appointment['status']) => {
    const current = aferixStore.getAppointments();
    setStored(STORAGE_KEYS.APPOINTMENTS, current.map(a => a.id === id ? { ...a, status } : a));
  },

  // Equipments
  getEquipments: (): Equipment[] => getStored(STORAGE_KEYS.EQUIPMENTS, INITIAL_EQUIPMENTS),
  addEquipment: (eq: Omit<Equipment, 'id'>) => {
    const current = aferixStore.getEquipments();
    const newEq: Equipment = { ...eq, id: 'eq_' + Date.now() };
    setStored(STORAGE_KEYS.EQUIPMENTS, [newEq, ...current]);
    return newEq;
  },
  updateEquipment: (id: string, updates: Partial<Equipment>) => {
    const current = aferixStore.getEquipments();
    setStored(STORAGE_KEYS.EQUIPMENTS, current.map(e => e.id === id ? { ...e, ...updates } : e));
  },
  deleteEquipment: (id: string) => {
    const current = aferixStore.getEquipments();
    setStored(STORAGE_KEYS.EQUIPMENTS, current.filter(e => e.id !== id));
  },

  // Maintenance & PMOC/PMP Reports
  getPmocReports: (): PmocReport[] => getStored(STORAGE_KEYS.PMOC_REPORTS, INITIAL_PMOC_REPORTS),
  addPmocReport: (report: Omit<PmocReport, 'id' | 'code'>) => {
    const current = aferixStore.getPmocReports();
    const planPrefix = (report.planType || 'pmp').toUpperCase();
    const nextCode = `${planPrefix}-${new Date().getFullYear()}-${String(current.length + 1).padStart(3, '0')}`;
    const newReport: PmocReport = {
      ...report,
      id: 'pm_' + Date.now(),
      code: nextCode,
    };
    setStored(STORAGE_KEYS.PMOC_REPORTS, [newReport, ...current]);

    aferixStore.addNotification({
      title: `Plano de Manutenção (${planPrefix}) Emitido`,
      message: `Documento ${nextCode} registrado com sucesso para ${newReport.clientName}.`,
      type: 'success',
    });

    return newReport;
  },

  // Notifications
  getNotifications: (): AppNotification[] => getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  addNotification: (notif: Omit<AppNotification, 'id' | 'time' | 'read'>) => {
    const current = aferixStore.getNotifications();
    const newN: AppNotification = {
      ...notif,
      id: 'n_' + Date.now(),
      time: 'Agora',
      read: false,
    };
    setStored(STORAGE_KEYS.NOTIFICATIONS, [newN, ...current]);
  },
  markAllNotificationsRead: () => {
    const current = aferixStore.getNotifications();
    setStored(STORAGE_KEYS.NOTIFICATIONS, current.map(n => ({ ...n, read: true })));
  },

  // Reset demo dataset
  resetToInitial: () => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(INITIAL_PROFILE));
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(INITIAL_CATALOG));
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(INITIAL_BUDGETS));
    localStorage.setItem(STORAGE_KEYS.RECEIVABLES, JSON.stringify(INITIAL_RECEIVABLES));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(INITIAL_EQUIPMENTS));
    localStorage.setItem(STORAGE_KEYS.PMOC_REPORTS, JSON.stringify(INITIAL_PMOC_REPORTS));
    window.dispatchEvent(new CustomEvent('aferix_storage_update', { detail: { key: 'all' } }));
  },
};

// React hook for synchronized state
export function useAferixData() {
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setDataVersion(v => v + 1);
    };
    window.addEventListener('aferix_storage_update', handleUpdate);
    return () => window.removeEventListener('aferix_storage_update', handleUpdate);
  }, []);

  const budgets = aferixStore.getBudgets();
  const clients = aferixStore.getClients();
  const catalog = aferixStore.getCatalog();
  const receivables = aferixStore.getReceivables();
  const transactions = aferixStore.getTransactions();
  const appointments = aferixStore.getAppointments();
  const notifications = aferixStore.getNotifications();
  const profile = aferixStore.getProfile();
  const equipments = aferixStore.getEquipments();
  const pmocReports = aferixStore.getPmocReports();

  // Financial calculations
  const totalRevenue = budgets.reduce((acc, b) => acc + (b.status !== 'arquivado' ? b.totalValue : 0), 0);
  const totalCost = budgets.reduce((acc, b) => acc + (b.status !== 'arquivado' ? b.totalCost : 0), 0);
  const netProfit = totalRevenue - totalCost;
  const overallMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
  const pendingReceivables = receivables
    .filter(r => r.status === 'pendente')
    .reduce((acc, r) => acc + r.value, 0);

  const activeWorkOrders = budgets.filter(b => b.status === 'execucao' || b.status === 'aprovado').length;
  const proposalsSent = budgets.filter(b => b.status === 'enviado').length;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return {
    budgets,
    clients,
    catalog,
    receivables,
    transactions,
    appointments,
    notifications,
    profile,
    equipments,
    pmocReports,
    stats: {
      totalRevenue,
      totalCost,
      netProfit,
      overallMargin,
      pendingReceivables,
      activeWorkOrders,
      proposalsSent,
      unreadNotificationsCount,
    },
    refresh: useCallback(() => setDataVersion(v => v + 1), []),
  };
}
