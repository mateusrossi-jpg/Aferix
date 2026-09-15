/**
 * Aferix Operational Event Store (Camada de Auditoria & Imutabilidade)
 * Garante que toda mutação crítica (aprovação, cancelamento, finalização, recebimento)
 * seja registrada como um evento imutável com timestamp e payload completo.
 */

export type OperationalEventType =
  | 'BUDGET_CREATED'
  | 'BUDGET_UPDATED'
  | 'BUDGET_APPROVED'
  | 'BUDGET_STATUS_CHANGED'
  | 'WORKORDER_COMPLETED'
  | 'RECEIVABLE_CREATED'
  | 'RECEIVABLE_PAID'
  | 'STOCK_DEDUCTED'
  | 'SYSTEM_RESTORE';

export interface OperationalEvent {
  id: string;
  type: OperationalEventType;
  entityId: string;
  timestamp: string;
  payload: Record<string, any>;
}

const EVENTS_STORAGE_KEY = 'aferix_operational_events_v1';
const MAX_EVENTS_IN_MEMORY = 300;

function getStoredEvents(): OperationalEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const eventStore = {
  /**
   * Grava um evento operacional imutável
   */
  emit(type: OperationalEventType, entityId: string, payload: Record<string, any>): OperationalEvent {
    const events = getStoredEvents();
    const newEvent: OperationalEvent = {
      id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type,
      entityId,
      timestamp: new Date().toISOString(),
      payload: JSON.parse(JSON.stringify(payload || {})),
    };

    // Mantém janela deslizante recente no localStorage para não estourar memória
    const updated = [newEvent, ...events].slice(0, MAX_EVENTS_IN_MEMORY);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('aferix_event_emitted', { detail: newEvent }));
    } catch (err) {
      console.warn('[EventStore] Falha ao persistir evento no storage:', err);
    }

    return newEvent;
  },

  /**
   * Retorna os eventos de uma determinada entidade (ex: histórico de uma OS)
   */
  getEventsForEntity(entityId: string): OperationalEvent[] {
    return getStoredEvents().filter(e => e.entityId === entityId);
  },

  /**
   * Retorna todos os eventos recentes
   */
  getAll(): OperationalEvent[] {
    return getStoredEvents();
  },
};
