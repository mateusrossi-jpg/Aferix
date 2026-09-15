import React, { useState } from 'react';
import {
  X,
  Bell,
  Calendar,
  Clock,
  Check,
  Share2,
  ShieldCheck,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { Budget } from '../types';
import { useTheme } from '../context/ThemeContext';
import { aferixStore } from '../storage/store';

interface PreventiveReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
}

export const PreventiveReminderModal: React.FC<PreventiveReminderModalProps> = ({
  isOpen,
  onClose,
  budget,
}) => {
  if (!isOpen) return null;

  const { isDark } = useTheme();

  // Presets: 6 months or 12 months
  const now = new Date();
  const date6Months = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate())
    .toISOString()
    .slice(0, 10);
  const date12Months = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    .toISOString()
    .slice(0, 10);

  const [selectedMonths, setSelectedMonths] = useState<6 | 12 | 'custom'>(6);
  const [scheduledDate, setScheduledDate] = useState<string>(date6Months);
  const [scheduledTime, setScheduledTime] = useState<string>('14:00');
  const [reminderNote, setReminderNote] = useState<string>(
    'Reaperto geral com torquímetro em conexões do QDC, inspeção visual de aquecimento e teste de disparo do IDR (NBR 5410).'
  );
  const [scheduledSuccess, setScheduledSuccess] = useState(false);

  const handleSelectMonths = (m: 6 | 12 | 'custom') => {
    setSelectedMonths(m);
    if (m === 6) {
      setScheduledDate(date6Months);
    } else if (m === 12) {
      setScheduledDate(date12Months);
    }
  };

  const handleSaveReminder = () => {
    // 1. Add Appointment to store
    aferixStore.addAppointment({
      budgetId: budget.id,
      clientId: budget.clientId,
      clientName: budget.clientName,
      title: `Revisão Preventiva Pós-Venda (OS ${budget.code})`,
      date: scheduledDate,
      time: scheduledTime,
      address: budget.clientAddress || 'Endereço do cliente',
      status: 'agendado',
      type: 'visita_tecnica',
    });

    // 2. Update Budget with reminder date & note
    aferixStore.updateBudget(budget.id, {
      reminderDate: scheduledDate,
      reminderNote: reminderNote,
      reminderSent: false,
    });

    // 3. Add system notification
    aferixStore.addNotification({
      title: 'Revisão Preventiva Agendada',
      message: `Revisão para ${budget.clientName} agendada para ${new Date(scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR')}.`,
      type: 'info',
    });

    setScheduledSuccess(true);
  };

  const handleNotifyClientWhatsApp = () => {
    const cleanPhone = budget.clientPhone.replace(/\D/g, '');
    const dateFormatted = new Date(scheduledDate + 'T00:00:00').toLocaleDateString('pt-BR');

    let text = `Olá, *${budget.clientName}*! Tudo bem?\n\n`;
    text += `Para manter a segurança das instalações elétricas atendidas na *OS ${budget.code}* (${budget.title}), `;
    text += `deixamos programada uma *Revisão Preventiva* para o dia *${dateFormatted}*.\n\n`;
    text += `🔍 *Itens da revisão:*\n${reminderNote}\n\n`;
    text += `Próximo à data, entraremos em contato para confirmar o melhor horário. Muito obrigado pela confiança!`;

    const encoded = encodeURIComponent(text);
    const url = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDark ? 'bg-[#0F1626] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Lembrete de Revisão Preventiva
              </h3>
              <p className="text-xs text-slate-400">
                Fidelização e recorrência de serviços para {budget.clientName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Card Explicativo de Retenção */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Máquina de Recorrência:</strong> A NBR 5410 recomenda
              revisão periódica anual em quadros elétricos. Agendando a revisão agora, você garante o
              retorno ao cliente antes que ele chame outro profissional.
            </div>
          </div>

          {/* Seletor de Período */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Intervalo Recomendado
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectMonths(6)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedMonths === 6
                    ? 'border-purple-500 bg-purple-500/15 text-purple-300 shadow-sm'
                    : isDark
                    ? 'border-white/10 bg-white/[0.02] text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                6 Meses
                <div className="text-[10px] font-normal opacity-80">Reaperto de Quadro</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMonths(12)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedMonths === 12
                    ? 'border-purple-500 bg-purple-500/15 text-purple-300 shadow-sm'
                    : isDark
                    ? 'border-white/10 bg-white/[0.02] text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                12 Meses
                <div className="text-[10px] font-normal opacity-80">Revisão Geral Anual</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMonths('custom')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedMonths === 'custom'
                    ? 'border-purple-500 bg-purple-500/15 text-purple-300 shadow-sm'
                    : isDark
                    ? 'border-white/10 bg-white/[0.02] text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Outra Data
                <div className="text-[10px] font-normal opacity-80">Personalizada</div>
              </button>
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Data Agendada</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold outline-none ${
                  isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">Horário Sugerido</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-bold outline-none ${
                  isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Escopo da Revisão */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Escopo da Manutenção Preventiva</label>
            <textarea
              rows={3}
              value={reminderNote}
              onChange={(e) => setReminderNote(e.target.value)}
              className={`w-full p-3 rounded-xl border text-xs outline-none ${
                isDark ? 'bg-black/30 border-white/15 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Ações */}
          <div className="space-y-2 pt-2">
            {!scheduledSuccess ? (
              <button
                type="button"
                onClick={handleSaveReminder}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Salvar na Agenda & Notificações</span>
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Revisão preventiva gravada na agenda com sucesso!</span>
                </div>

                <button
                  type="button"
                  onClick={handleNotifyClientWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Avisar Cliente no WhatsApp sobre a Garantia</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-center text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
