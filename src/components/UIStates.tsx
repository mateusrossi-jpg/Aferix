import React from 'react';
import { AlertTriangle, Inbox, CheckCircle2, RefreshCw, Plus } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * Linear-style Skeleton Card for Loading states
 */
export const CardSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 3,
  className = '',
}) => {
  const { isDark } = useTheme();
  return (
    <div
      className={`rounded-2xl p-5 border animate-pulse space-y-4 ${
        isDark ? 'bg-[#0F1626] border-white/[0.07]' : 'bg-white border-slate-200/80'
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <div
          className={`h-4 w-28 rounded-md ${
            isDark ? 'bg-white/[0.06]' : 'bg-slate-200'
          }`}
        />
        <div
          className={`h-7 w-7 rounded-lg ${
            isDark ? 'bg-white/[0.06]' : 'bg-slate-200'
          }`}
        />
      </div>
      <div
        className={`h-8 w-44 rounded-md ${
          isDark ? 'bg-white/[0.08]' : 'bg-slate-300/80'
        }`}
      />
      <div className="space-y-2 pt-1">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded-md ${
              isDark ? 'bg-white/[0.04]' : 'bg-slate-100'
            }`}
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Elegant Empty State with Icon, Message & Action
 */
export const EmptyState: React.FC<{
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const { isDark } = useTheme();
  return (
    <div
      className={`rounded-2xl p-8 sm:p-10 border text-center space-y-3 aferix-card ${
        isDark
          ? 'bg-[#0F1626] border-white/[0.07] text-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
          : 'bg-white border-slate-200/80 text-slate-700 shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
      } ${className}`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto ${
          isDark ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-blue-50 text-blue-600 border border-blue-100'
        }`}
      >
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>
      <div className="max-w-sm mx-auto space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-inherit">{title}</h3>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Toast or Inline Alert Message
 */
export const InlineFeedback: React.FC<{
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  onDismiss?: () => void;
}> = ({ type, message, onDismiss }) => {
  const { isDark } = useTheme();

  const styles = {
    success: isDark
      ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
      : 'bg-emerald-50 border-emerald-200 text-emerald-800',
    warning: isDark
      ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
      : 'bg-amber-50 border-amber-200 text-amber-800',
    error: isDark
      ? 'bg-rose-950/40 border-rose-800/50 text-rose-300'
      : 'bg-rose-50 border-rose-200 text-rose-800',
    info: isDark
      ? 'bg-blue-950/40 border-blue-800/50 text-blue-300'
      : 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertTriangle,
    info: RefreshCw,
  };

  const IconComponent = Icons[type];

  return (
    <div
      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${styles[type]}`}
    >
      <div className="flex items-center gap-2">
        <IconComponent className="w-4 h-4 shrink-0" />
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs opacity-70 hover:opacity-100 font-bold"
        >
          ✕
        </button>
      )}
    </div>
  );
};
