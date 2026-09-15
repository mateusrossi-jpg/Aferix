/**
 * Aferix IndexedDB Storage Engine (idb)
 * Fornece persistência nativa assíncrona para entidades pesadas (fotos, assinaturas, backups)
 * e atua como fallback resiliente caso o localStorage atinja a cota.
 */

const DB_NAME = 'aferix_indexed_db_v1';
const DB_VERSION = 1;
const PHOTO_STORE = 'job_photos';
const BLOB_STORE = 'binary_assets';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não suportado neste ambiente'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const idbStorage = {
  /**
   * Salva ou atualiza uma foto ou item pesado no IndexedDB sem comprometer a cota de 5MB do localStorage
   */
  async setPhoto(id: string, data: any): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(PHOTO_STORE, 'readwrite');
        const store = tx.objectStore(PHOTO_STORE);
        store.put({ id, ...data, updatedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[IDB] Fallback: Falha ao salvar foto no IndexedDB', err);
    }
  },

  /**
   * Recupera uma foto armazenada
   */
  async getPhoto(id: string): Promise<any | null> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(PHOTO_STORE, 'readonly');
        const store = tx.objectStore(PHOTO_STORE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IDB] Falha ao ler foto do IndexedDB', err);
      return null;
    }
  },

  /**
   * Salva chave/valor binário genérico (ex.: assinatura em alta resolução)
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(BLOB_STORE, 'readwrite');
        const store = tx.objectStore(BLOB_STORE);
        store.put({ key, value, timestamp: Date.now() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[IDB] Falha ao persistir item no IndexedDB', err);
    }
  },

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(BLOB_STORE, 'readonly');
        const store = tx.objectStore(BLOB_STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? (req.result.value as T) : null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  },
};
