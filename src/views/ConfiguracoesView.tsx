import React, { useState } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle2,
  User,
  Building2,
  Key,
  Phone,
  Mail,
  MapPin,
  Shield,
  Wifi,
  WifiOff,
  Cloud,
  CloudUpload,
  HardDrive,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';
import { useOfflineSync } from '../utils/offlineSync';

interface ConfiguracoesViewProps {
  profile: UserProfile;
}

export const ConfiguracoesView: React.FC<ConfiguracoesViewProps> = ({ profile }) => {
  const { isDark } = useTheme();
  const { isOnline, isSyncing, pendingCount, syncNow, lastSyncedAt } = useOfflineSync();
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    aferixStore.setProfile(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Tem certeza que deseja restaurar os dados de demonstração originais do Aferix?'
      )
    ) {
      aferixStore.resetToInitial();
      setFormData(aferixStore.getProfile());
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-28 text-left animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold tracking-tight">Configurações do Negócio</h2>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Dados da sua empresa e chave PIX para emissão de propostas executivas
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl p-5 sm:p-6 border aferix-card space-y-4 transition-all duration-200 ${
          isDark
            ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
            : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}
      >
        <div>
          <label
            className={`block text-xs font-medium mb-1.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Nome Fantasia / Empresa
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input
              type="text"
              required
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDark
                  ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Responsável Técnico / Titular
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isDark
                    ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
                    : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              CNPJ / CPF
            </label>
            <input
              type="text"
              value={formData.cnpj || ''}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              className={`w-full rounded-xl px-3.5 py-2.5 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDark
                  ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
                  : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Telefone / WhatsApp Profissional
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                  isDark
                    ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
                    : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400 focus:border-blue-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label
              className={`block text-xs font-medium mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Chave PIX (Para propostas e recebimentos)
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono ${
                  isDark
                    ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
                    : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400 focus:border-blue-500'
                }`}
              />
            </div>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t ${
          isDark ? 'border-white/[0.07]' : 'border-slate-100'
        }`}>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-rose-500 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restaurar dados de demonstração
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all duration-150 active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Dados salvos com sucesso!
          </div>
        )}
      </form>

      {/* Offline Storage & Service Worker Management Card */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border aferix-card space-y-4 transition-all duration-200 ${
          isDark
            ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
            : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03)]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold">Armazenamento Offline & Sincronização</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Service Worker e banco de dados local para operação técnica em campo
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            {isOnline ? 'Conectado' : 'Modo Offline'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/70'}`}>
            <div className="flex items-center gap-2 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold">Status do Cache PWA</span>
            </div>
            <p className="text-xs text-slate-400">
              Arquivos de sistema, fontes e layouts cacheados pelo Service Worker para carga instantânea sem sinal.
            </p>
          </div>

          <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/70'}`}>
            <div className="flex items-center gap-2 mb-1">
              <CloudUpload className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-semibold">Fila de Sincronização</span>
            </div>
            <p className="text-xs text-slate-400">
              {pendingCount > 0
                ? `${pendingCount} alteraç${pendingCount === 1 ? 'ão pendente' : 'ões pendentes'} aguardando conexão.`
                : 'Todos os orçamentos e alterações estão sincronizados.'}
            </p>
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
          <div className="text-[11px] text-slate-400">
            {lastSyncedAt ? (
              <span>Última sincronização: {new Date(lastSyncedAt).toLocaleTimeString('pt-BR')}</span>
            ) : (
              <span>Sincronização automática ativa</span>
            )}
          </div>

          <button
            type="button"
            onClick={syncNow}
            disabled={!isOnline || isSyncing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
