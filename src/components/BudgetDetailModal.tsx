import React, { useState } from 'react';
import {
  X,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  Play,
  Check,
  Share2,
  DollarSign,
  Layers,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Camera,
  PenTool,
  Printer,
  Eye,
  Bell,
  QrCode,
  Download,
  CreditCard,
  Percent,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Budget, JobStatus, STATUS_CONFIG, JobPhoto, UserProfile } from '../types';
import { aferixStore } from '../storage/store';
import { PhotoManager } from './PhotoManager';
import { SignaturePad } from './SignaturePad';
import { ExecutiveProposalModal } from './ExecutiveProposalModal';
import { PixPaymentModal } from './PixPaymentModal';
import { CardFeeCalculatorModal } from './CardFeeCalculatorModal';
import { PreventiveReminderModal } from './PreventiveReminderModal';
import { useTheme } from '../context/ThemeContext';
import { downloadBudgetPdf, shareBudgetPdfViaWhatsApp } from '../utils/budgetPdfGenerator';

interface BudgetDetailModalProps {
  budget: Budget | null;
  profile: UserProfile;
  onClose: () => void;
  onStatusChange: (id: string, newStatus: JobStatus) => void;
  onUpdateBudget: (id: string, updates: Partial<Budget>) => void;
}

export const BudgetDetailModal: React.FC<BudgetDetailModalProps> = ({
  budget,
  profile,
  onClose,
  onStatusChange,
  onUpdateBudget,
}) => {
  if (!budget) return null;

  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showExecutiveModal, setShowExecutiveModal] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [showCardFeeModal, setShowCardFeeModal] = useState(false);
  const [showPreventiveModal, setShowPreventiveModal] = useState(false);
  const [reminderDateInput, setReminderDateInput] = useState(budget.reminderDate || '');
  const [reminderNoteInput, setReminderNoteInput] = useState(budget.reminderNote || '');
  const [editingReminder, setEditingReminder] = useState(false);
  const [showValidationError, setShowValidationError] = useState(false);

  const pixKey = profile.pixKey || profile.phone || 'aferix.pagamentos@pix.com.br';
  const businessName = profile.businessName || profile.ownerName || 'Aferix';
  const pixFormattedString = `00020126580136${pixKey}5204000053039865405${budget.totalValue.toFixed(2)}5802BR5913${businessName.substring(0, 25)}6009SAO PAULO62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixFormattedString);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleSendPixWhatsApp = () => {
    const cleanPhone = budget.clientPhone ? budget.clientPhone.replace(/\D/g, '') : '';
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const text = encodeURIComponent(
      `Olá ${budget.clientName}, segue o PIX Copia e Cola para pagamento referente à OS ${budget.code} (${budget.title}) no valor de R$ ${budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}:\n\n${pixFormattedString}\n\nChave PIX: ${pixKey}`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${text}`, '_blank');
  };

  const missingFields: string[] = [];
  if (!budget.clientPhone || budget.clientPhone.trim().length < 8) {
    missingFields.push('Telefone / WhatsApp do cliente');
  }
  if (!budget.title || budget.title.trim().length === 0) {
    missingFields.push('Título do orçamento');
  }
  if (!budget.items || budget.items.length === 0) {
    missingFields.push('Itens ou serviços discriminados');
  }

  const handleWhatsAppShareChecked = () => {
    if (missingFields.length > 0) {
      setShowValidationError(true);
      return;
    }
    setShowValidationError(false);
    handleWhatsAppShare();
  };

  const handleSaveReminder = () => {
    onUpdateBudget(budget.id, {
      reminderDate: reminderDateInput,
      reminderNote: reminderNoteInput,
      reminderSent: false,
    });
    setEditingReminder(false);
  };

  const handleSendReminderWhatsApp = () => {
    const cleanPhone = budget.clientPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const msg = encodeURIComponent(
      `Olá ${budget.clientName}! Passando para verificar se teve a oportunidade de analisar nossa Proposta Comercial ${budget.code} (${budget.title}) enviada no valor de R$ ${budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.\n\nFicamos à disposição para esclarecer dúvidas. Podemos prosseguir com a aprovação?`
    );
    window.open(`https://wa.me/${phoneWithCountry}?text=${msg}`, '_blank');
    onUpdateBudget(budget.id, { reminderSent: true });
  };
  const statusCfg = STATUS_CONFIG[budget.status] || STATUS_CONFIG.iniciado;

  const handleAddPhoto = (photoData: Omit<JobPhoto, 'id' | 'timestamp'>) => {
    const newPhoto: JobPhoto = {
      ...photoData,
      id: 'photo_' + Math.random().toString(36).slice(2, 9),
      timestamp: new Date().toISOString(),
    };
    const currentPhotos = budget.photos || [];
    onUpdateBudget(budget.id, {
      photos: [...currentPhotos, newPhoto],
    });
  };

  const handleRemovePhoto = (photoId: string) => {
    const currentPhotos = budget.photos || [];
    onUpdateBudget(budget.id, {
      photos: currentPhotos.filter((p) => p.id !== photoId),
    });
  };

  const handleSaveSignature = (dataUrl: string, signerName: string) => {
    onUpdateBudget(budget.id, {
      clientSignature: dataUrl,
      clientSignatureDate: new Date().toISOString(),
      clientSignerName: signerName,
    });
    setShowSignaturePad(false);
  };

  const handleCopyProposal = () => {
    const text = `*PROPOSTA COMERCIAL AFERIX*\n*Orçamento ${budget.code}:* ${budget.title}\n*Cliente:* ${budget.clientName}\n\n*ITENS & SERVIÇOS:*\n${budget.items.map(i => `• ${i.name} (${i.qty} ${i.unit}) - R$ ${i.total.toFixed(2)}`).join('\n')}\n\n*VALOR TOTAL:* R$ ${budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n*Condições:* ${budget.notes || 'Pagamento via PIX'}\n\nEmitido por Aferix Soluções.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const cleanPhone = budget.clientPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = encodeURIComponent(`Olá ${budget.clientName}, segue a proposta comercial ${budget.code} (${budget.title}) no valor de R$ ${budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.\n\nPodemos confirmar a execução?`);
    window.open(`https://wa.me/${phoneWithCountry}?text=${message}`, '_blank');
    if (budget.status === 'iniciado') {
      onStatusChange(budget.id, 'enviado');
    }
  };

  const steps: { key: JobStatus; label: string }[] = [
    { key: 'iniciado', label: '1. Rascunho' },
    { key: 'enviado', label: '2. Enviado' },
    { key: 'aprovado', label: '3. Aprovado' },
    { key: 'execucao', label: '4. Execução' },
    { key: 'finalizado', label: '5. Finalizado' },
  ];

  const currentStepIdx = steps.findIndex(s => s.key === budget.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-fade-in-up transition-all ${
          isDark
            ? 'bg-[#0F1626] border-white/10 text-white shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-white border-slate-200/90 text-[#0F172A] shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-4 sm:p-5 shrink-0 ${
            isDark ? 'border-white/[0.08] bg-[#0A0F1D]' : 'border-slate-200/80 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm font-mono font-bold bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-600/30 px-2.5 py-1 rounded-lg">
              {budget.code}
            </span>
            {budget.syncStatus === 'pending_sync' ? (
              <span className="text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Offline (Pendente)
              </span>
            ) : (
              <span className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Sincronizado
              </span>
            )}
            <div>
              <h2 className="font-bold text-base sm:text-lg tracking-tight leading-tight">
                {budget.title}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{budget.clientName}</p>
            </div>
          </div>
          <button
            id="btn-close-budget-detail"
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Status Pipeline Step Indicator */}
          <div
            className={`p-3 rounded-xl border ${
              isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
              {steps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;
                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => onStatusChange(budget.id, step.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                        : isPassed
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : isDark
                        ? 'bg-white/5 text-slate-400 hover:text-slate-200'
                        : 'bg-slate-200/70 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isPassed && idx < currentStepIdx && <Check className="w-3 h-3 text-emerald-500" />}
                    {step.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Details */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border ${
              isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="space-y-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cliente & Contato</span>
              <p className="text-sm font-bold">{budget.clientName}</p>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <a href={`tel:${budget.clientPhone}`} className={`hover:underline ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{budget.clientPhone}</a>
              </div>
            </div>
            <div className="space-y-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Endereço do Atendimento</span>
              <div className={`flex items-start gap-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <span>{budget.clientAddress || 'Endereço não informado'}</span>
              </div>
            </div>
          </div>

          {/* Items breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Composição dos Itens & Serviços
            </h3>
            <div
              className={`divide-y rounded-xl border overflow-hidden ${
                isDark ? 'bg-[#0A0F1D] border-white/[0.07] divide-white/[0.05]' : 'bg-slate-50 border-slate-200/80 divide-slate-200/80'
              }`}
            >
              {budget.items.map((item, i) => (
                <div key={item.id || i} className="p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{item.name}</p>
                    <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.qty} {item.unit} x R$ {item.unitPrice.toFixed(2)} (Custo: R$ {item.unitCost.toFixed(2)})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm">
                      R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Profit & Margin Summary */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Resumo Financeiro & Lucro Real
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#090E17] border-white/5' : 'bg-white border-slate-200/80'}`}>
                <span className={`text-[10px] uppercase font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total da OS</span>
                <span className="text-base font-extrabold">
                  R$ {budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#090E17] border-white/5' : 'bg-white border-slate-200/80'}`}>
                <span className={`text-[10px] uppercase font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Custos Diretos</span>
                <span className={`text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  R$ {budget.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">Lucro Líquido</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  R$ {budget.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30">
                <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 block">Margem %</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  {budget.marginPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {budget.notes && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                isDark ? 'bg-[#0A0F1D] border-white/[0.07] text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-700'
              }`}
            >
              <span className={`font-semibold block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Observações & Condições:</span>
              <p>{budget.notes}</p>
            </div>
          )}

          {/* Field Photos Module */}
          <PhotoManager
            photos={budget.photos || []}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />

          {/* WhatsApp Reminder & Follow-up Module */}
          {(() => {
            const isExpiredOrDue = budget.reminderDate ? new Date(budget.reminderDate + 'T23:59:59').getTime() <= Date.now() : false;
            const isPendingFollowUp = (budget.status === 'enviado' || budget.status === 'iniciado') && isExpiredOrDue && !budget.reminderSent;

            return (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Lembrete & Follow-up de Proposta
                    </span>
                  </div>
                  {budget.reminderDate && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      budget.reminderSent
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : isExpiredOrDue
                        ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {budget.reminderSent ? 'Lembrete Enviado' : isExpiredOrDue ? 'Vencido / Expirado' : `Agendado: ${new Date(budget.reminderDate + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                    </span>
                  )}
                </div>

                {isPendingFollowUp && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-600 dark:text-amber-400">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>Proposta próxima do vencimento ou com prazo esgotado. Recomenda-se follow-up imediato!</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendReminderWhatsApp}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-xs transition-all active:scale-95"
                    >
                      Disparar Agora
                    </button>
                  </div>
                )}

                {budget.reminderDate && !editingReminder ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {budget.reminderNote || 'Follow-up de validade do orçamento'}
                      </p>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Data limite: {budget.reminderDate.split('-').reverse().join('/')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSendReminderWhatsApp}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                      >
                        <Send className="w-3.5 h-3.5" /> Disparar WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingReminder(true)}
                        className={`px-3 py-2 rounded-lg border text-xs font-semibold ${
                          isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        Editar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Data do Lembrete / Vencimento
                        </label>
                        <input
                          type="date"
                          value={reminderDateInput}
                          onChange={(e) => setReminderDateInput(e.target.value)}
                          className={`w-full rounded-xl px-3 py-2 text-xs border transition-all ${
                            isDark ? 'bg-[#090E17] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Nota / Motivo do Follow-up
                        </label>
                        <input
                          type="text"
                          value={reminderNoteInput}
                          onChange={(e) => setReminderNoteInput(e.target.value)}
                          placeholder="Ex: Verificar aprovação e validade"
                          className={`w-full rounded-xl px-3 py-2 text-xs border transition-all ${
                            isDark ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {budget.reminderDate && (
                        <button
                          type="button"
                          onClick={() => setEditingReminder(false)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Cancelar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveReminder}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                      >
                        Salvar Lembrete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Client Digital Signature Box */}
          <div
            className={`p-4 rounded-xl border space-y-3 ${
              isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-500" />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Termo de Aceite & Assinatura do Cliente
                </span>
              </div>
              {budget.clientSignature && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3" /> Assinado
                </span>
              )}
            </div>

            {budget.clientSignature ? (
              <div
                className={`flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl border ${
                  isDark ? 'bg-[#090E17] border-white/[0.06]' : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="bg-white rounded-lg p-1.5 shrink-0 border border-slate-200">
                  <img
                    src={budget.clientSignature}
                    alt="Assinatura"
                    className="h-16 max-w-[180px] object-contain"
                  />
                </div>
                <div className="text-xs space-y-1 text-center sm:text-left">
                  <p className="font-bold">{budget.clientSignerName || budget.clientName}</p>
                  <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Assinado digitalmente em{' '}
                    {budget.clientSignatureDate
                      ? new Date(budget.clientSignatureDate).toLocaleString('pt-BR')
                      : 'Campo'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(true)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Coletar nova assinatura
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {!showSignaturePad ? (
                  <button
                    type="button"
                    onClick={() => setShowSignaturePad(true)}
                    className={`w-full py-3 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      isDark
                        ? 'bg-[#090E17] hover:bg-white/5 text-white border-white/10'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                    }`}
                  >
                    <PenTool className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                    Coletar Assinatura do Cliente na Tela
                  </button>
                ) : (
                  <SignaturePad
                    defaultSignerName={budget.clientName}
                    onSave={handleSaveSignature}
                    onCancel={() => setShowSignaturePad(false)}
                  />
                )}
              </div>
            )}
          </div>

          {/* Cobrança Imediata, Maquininha & Fidelização */}
          <div
            className={`p-4 rounded-xl border space-y-3.5 ${
              isDark ? 'bg-[#0A0F1D] border-emerald-500/25' : 'bg-emerald-50/40 border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Cobrança Rápida & Maquininha
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                R$ {budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Primary Fast Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShowPixModal(true)}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code Pix</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCardFeeModal(true)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border-blue-500/30'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                <span>Taxas de Cartão</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPreventiveModal(true)}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border-purple-500/30'
                    : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                }`}
              >
                <Bell className="w-3.5 h-3.5 text-purple-400" />
                <span>Revisão 6/12m</span>
              </button>
            </div>

            {/* Quick Copia e Cola box */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">Pix Copia e Cola direto:</span>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="text-emerald-500 font-bold hover:underline flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  {pixCopied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <div
                onClick={handleCopyPix}
                className={`p-2 rounded-lg border text-[10px] font-mono break-all cursor-pointer transition-colors ${
                  isDark
                    ? 'bg-[#090E17] border-white/10 text-slate-400 hover:text-slate-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {pixFormattedString}
              </div>
            </div>
          </div>

          {/* Action buttons based on current state */}
          <div className="space-y-2 pt-2">
            {showValidationError && missingFields.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-1.5 animate-fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Campos obrigatórios pendentes para envio/compartilhamento:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 font-medium">
                  {missingFields.map((field, idx) => (
                    <li key={idx}>Falta preencher: <span className="underline">{field}</span></li>
                  ))}
                </ul>
              </div>
            )}

            {/* Executive PDF Preview & Direct Download buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowExecutiveModal(true)}
                className={`flex items-center justify-center gap-2 rounded-xl font-bold py-3 px-3 text-xs transition-all border active:scale-95 ${
                  isDark
                    ? 'bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border-blue-500/30'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                }`}
              >
                <Eye className="w-4 h-4 text-blue-500" />
                Pré-visualizar & Imprimir
              </button>

              <button
                type="button"
                onClick={() => downloadBudgetPdf(budget, profile)}
                className={`flex items-center justify-center gap-2 rounded-xl font-bold py-3 px-3 text-xs transition-all border active:scale-95 ${
                  isDark
                    ? 'bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border-emerald-500/30'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-500" />
                Baixar PDF Executivo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShareChecked}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 text-xs transition-all active:scale-95 shadow-sm"
              >
                <Send className="w-4 h-4" />
                Enviar Proposta via WhatsApp
              </button>

              <button
                type="button"
                onClick={handleCopyProposal}
                className={`flex items-center justify-center gap-2 rounded-xl border font-semibold py-3 px-4 text-xs transition-all ${
                  isDark
                    ? 'bg-[#090E17] hover:bg-white/5 text-white border-white/10'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <Share2 className="w-4 h-4" />
                {copied ? 'Copiado para Área de Transferência!' : 'Copiar Texto da Proposta'}
              </button>
            </div>

            {/* State advancement shortcuts */}
            {budget.status === 'iniciado' && (
              <button
                type="button"
                onClick={() => onStatusChange(budget.id, 'enviado')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
                Marcar como Enviado ao Cliente
              </button>
            )}

            {budget.status === 'enviado' && (
              <button
                type="button"
                onClick={() => onStatusChange(budget.id, 'aprovado')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprovar Orçamento
              </button>
            )}

            {budget.status === 'aprovado' && (
              <button
                type="button"
                onClick={() => onStatusChange(budget.id, 'execucao')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
              >
                <Play className="w-4 h-4" />
                Iniciar Execução em Campo
              </button>
            )}

            {budget.status === 'execucao' && (
              <button
                type="button"
                onClick={() => onStatusChange(budget.id, 'finalizado')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 text-sm transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <Check className="w-5 h-5" />
                Finalizar OS & Gerar Recebível
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Executive Proposal PDF / Print Modal */}
      <ExecutiveProposalModal
        isOpen={showExecutiveModal}
        onClose={() => setShowExecutiveModal(false)}
        budget={budget}
        profile={profile}
      />

      {/* Pix Payment & Dynamic QR Code Modal */}
      <PixPaymentModal
        isOpen={showPixModal}
        onClose={() => setShowPixModal(false)}
        budget={budget}
        profile={profile}
        onPaymentConfirmed={() => {
          onStatusChange(budget.id, 'finalizado');
          setShowPixModal(false);
        }}
      />

      {/* Card Fee & Installment Calculator (Margem Blindada) */}
      <CardFeeCalculatorModal
        isOpen={showCardFeeModal}
        onClose={() => setShowCardFeeModal(false)}
        budget={budget}
        onSaveTerms={(terms) => {
          onUpdateBudget(budget.id, {
            notes: budget.notes ? `${budget.notes}\n\n[Condições]: ${terms}` : `[Condições]: ${terms}`,
          });
        }}
      />

      {/* Preventive Maintenance & Recurring Revenue Reminder Modal */}
      <PreventiveReminderModal
        isOpen={showPreventiveModal}
        onClose={() => setShowPreventiveModal(false)}
        budget={budget}
      />
    </div>
  );
};
