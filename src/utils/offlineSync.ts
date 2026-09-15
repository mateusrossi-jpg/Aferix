import { useState, useEffect, useCallback } from 'react';
import { SyncQueueItem, Budget } from '../types';
import { aferixStore } from '../storage/store';

const SYNC_QUEUE_KEY = 'aferix_sync_queue_v1';
const LAST_SYNCED_KEY = 'aferix_last_synced_v1';

export function isOnlineNow(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function getSyncQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: SyncQueueItem[]): void {
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('aferix_sync_queue_changed', { detail: { queue } }));
  } catch (err) {
    console.error('Error saving sync queue:', err);
  }
}

export function getLastSyncedAt(): string | null {
  return localStorage.getItem(LAST_SYNCED_KEY);
}

export function setLastSyncedAt(timestamp: string): void {
  localStorage.setItem(LAST_SYNCED_KEY, timestamp);
}

/**
 * Enqueues a budget change (creation, edit, status) into the persistent sync queue
 */
export function enqueueBudgetChange(
  type: 'create_budget' | 'update_budget' | 'status_change',
  budgetId: string,
  payload: any
): void {
  const queue = getSyncQueue();
  const newItem: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    entityId: budgetId,
    payload,
    timestamp: new Date().toISOString(),
    retries: 0,
  };

  saveSyncQueue([...queue, newItem]);

  // If online, immediately attempt background sync
  if (isOnlineNow()) {
    setTimeout(() => {
      processSyncQueue();
    }, 400);
  }
}

/**
 * Processes all pending items in the sync queue once connectivity is online
 */
export async function processSyncQueue(): Promise<{ syncedCount: number }> {
  if (!isOnlineNow()) {
    return { syncedCount: 0 };
  }

  const queue = getSyncQueue();
  if (queue.length === 0) {
    return { syncedCount: 0 };
  }

  // Simulate network flight / server synchronization handshake
  await new Promise((resolve) => setTimeout(resolve, 800));

  const budgets = aferixStore.getBudgets();
  const now = new Date().toISOString();

  // Mark all pending budgets in local store as synced
  const updatedBudgets = budgets.map((b) => {
    const hasPendingInQueue = queue.some((q) => q.entityId === b.id);
    if (hasPendingInQueue || b.syncStatus === 'pending_sync') {
      return {
        ...b,
        syncStatus: 'synced' as const,
        syncedAt: now,
      };
    }
    return b;
  });

  try {
    localStorage.setItem('aferix_budgets_v1', JSON.stringify(updatedBudgets));
    window.dispatchEvent(
      new CustomEvent('aferix_storage_update', { detail: { key: 'aferix_budgets_v1' } })
    );
  } catch (e) {
    console.error('Failed to update synced budgets in storage:', e);
  }

  const syncedCount = queue.length;

  // Clear queue
  saveSyncQueue([]);
  setLastSyncedAt(now);

  window.dispatchEvent(
    new CustomEvent('aferix_sync_completed', {
      detail: { count: syncedCount, timestamp: now },
    })
  );

  aferixStore.addNotification({
    title: 'Sincronização Offline Concluída',
    message: `${syncedCount} alteraç${syncedCount === 1 ? 'ão em orçamento foi sincronizada' : 'ões em orçamentos foram sincronizadas'} com sucesso!`,
    type: 'success',
  });

  return { syncedCount };
}

/**
 * React Hook to monitor online status and synchronization queue
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(isOnlineNow());
  const [queue, setQueue] = useState<SyncQueueItem[]>(getSyncQueue());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSynced] = useState<string | null>(getLastSyncedAt());

  const syncNow = useCallback(async () => {
    if (!isOnlineNow() || isSyncing) return;
    setIsSyncing(true);
    try {
      await processSyncQueue();
    } finally {
      setIsSyncing(false);
      setQueue(getSyncQueue());
      setLastSynced(getLastSyncedAt());
    }
  }, [isSyncing]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically process queue when connection returns
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = (e: any) => {
      setQueue(e.detail?.queue || getSyncQueue());
    };

    const handleSyncCompleted = (e: any) => {
      setLastSynced(e.detail?.timestamp || new Date().toISOString());
      setQueue([]);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('aferix_sync_queue_changed', handleQueueChange);
    window.addEventListener('aferix_sync_completed', handleSyncCompleted);

    // Periodic heartbeat check for queue flush if online
    const interval = setInterval(() => {
      if (isOnlineNow() && getSyncQueue().length > 0 && !isSyncing) {
        syncNow();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('aferix_sync_queue_changed', handleQueueChange);
      window.removeEventListener('aferix_sync_completed', handleSyncCompleted);
      clearInterval(interval);
    };
  }, [syncNow, isSyncing]);

  return {
    isOnline,
    isSyncing,
    pendingCount: queue.length,
    syncNow,
    lastSyncedAt,
  };
}
