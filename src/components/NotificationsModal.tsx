import React from 'react';
import { X, CheckCheck, Bell, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { AppNotification } from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const { isDark } = useTheme();

  const handleMarkAllRead = () => {
    aferixStore.markAllNotificationsRead();
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal dialog */}
      <div
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-fade-in-up transition-all ${
          isDark
            ? 'bg-[#0F1626] border-white/10 text-white shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-white border-slate-200/90 text-[#0F172A] shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-4 ${
            isDark ? 'border-white/[0.08] bg-[#0A0F1D]' : 'border-slate-200/80 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" />
            <h2 className="font-bold text-sm tracking-tight">
              Central de Notificações
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                isDark
                  ? 'border-white/10 bg-[#090E17] text-slate-300 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:text-slate-900'
              }`}
              title="Marcar todas como lidas"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Lidas</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                isDark
                  ? 'border-white/10 bg-[#090E17] text-slate-400 hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className={`max-h-[65vh] overflow-y-auto p-3 divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-200/70'}`}>
          {notifications.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <p className="text-sm">Nenhuma notificação recente.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`flex gap-3 p-3 transition-colors rounded-xl ${
                  !n.read
                    ? isDark
                      ? 'bg-[#0A0F1D] border border-white/5'
                      : 'bg-blue-50/60 border border-blue-100'
                    : isDark
                    ? 'hover:bg-white/5'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</h4>
                    <span className={`text-[10px] shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.time}</span>
                  </div>
                  <p className={`mt-0.5 text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
