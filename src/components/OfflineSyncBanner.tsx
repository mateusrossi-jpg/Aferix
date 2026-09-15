import React from 'react';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, CloudUpload, AlertTriangle } from 'lucide-react';
import { useOfflineSync } from '../utils/offlineSync';
import { useTheme } from '../context/ThemeContext';

export const OfflineSyncBanner: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, syncNow, lastSyncedAt } = useOfflineSync();
  const { isDark } = useTheme();

  // If online and nothing is pending to sync, show nothing (or subtle indicator)
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div className="w-full transition-all duration-300 z-40">
      {/* Offline Mode Alert */}
      {!isOnline && (
        <div className="bg-amber-600 text-white px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 animate-pulse text-amber-200" />
            <span>
              <strong>Modo Offline Ativo:</strong> Você pode criar e editar orçamentos normalmente. Todas as alterações estão salvas no aparelho e serão sincronizadas assim que a conexão voltar.
            </span>
          </div>
          {pendingCount > 0 && (
            <span className="shrink-0 text-[11px] font-mono bg-black/20 px-2 py-0.5 rounded-full font-bold">
              {pendingCount} {pendingCount === 1 ? 'pendência' : 'pendências'}
            </span>
          )}
        </div>
      )}

      {/* Online with Pending Sync Items */}
      {isOnline && (pendingCount > 0 || isSyncing) && (
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-cyan-200" />
            ) : (
              <CloudUpload className="w-4 h-4 shrink-0 text-cyan-200" />
            )}
            <span>
              {isSyncing
                ? 'Sincronizando orçamentos com a nuvem...'
                : `Conexão restabelecida! ${pendingCount} alteraç${
                    pendingCount === 1 ? 'ão pronta' : 'ões prontas'
                  } para sincronizar.`}
            </span>
          </div>

          <button
            type="button"
            onClick={syncNow}
            disabled={isSyncing}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-cyan-800 hover:bg-cyan-50 font-bold text-[11px] shadow-sm transition-all active:scale-95 disabled:opacity-75"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const SyncStatusPill: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isOnline, isSyncing, pendingCount, syncNow } = useOfflineSync();

  if (!isOnline) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400"
        title="Modo Offline - Todas as alterações estão salvas no dispositivo"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Offline</span>
        {pendingCount > 0 && <span className="font-mono text-[10px]">({pendingCount})</span>}
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span>Sincronizando...</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        type="button"
        onClick={syncNow}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 transition-all"
        title="Clique para sincronizar alterações pendentes"
      >
        <CloudUpload className="w-3 h-3" />
        <span>Sincronizar ({pendingCount})</span>
      </button>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
      title="Conectado e dados 100% sincronizados"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span>Sincronizado</span>
    </div>
  );
};
