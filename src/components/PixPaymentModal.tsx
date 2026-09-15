import React, { useState, useMemo } from 'react';
import {
  X,
  QrCode,
  Copy,
  Check,
  Share2,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Budget, UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { generatePixPayload, createQrSvgDataUri } from '../utils/pixPayload';
import { aferixStore } from '../storage/store';

interface PixPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
  profile: UserProfile;
  onPaymentConfirmed?: () => void;
}

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
  isOpen,
  onClose,
  budget,
  profile,
  onPaymentConfirmed,
}) => {
  if (!isOpen) return null;

  const { isDark } = useTheme();

  // Custom or total amount
  const [paymentMode, setPaymentMode] = useState<'total' | 'half' | 'custom'>('total');
  const [customAmount, setCustomAmount] = useState<number>(budget.totalValue);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [tempPixKey, setTempPixKey] = useState(profile.pixKey || '');

  const effectiveAmount = useMemo(() => {
    if (paymentMode === 'total') return budget.totalValue;
    if (paymentMode === 'half') return Number((budget.totalValue / 2).toFixed(2));
    return customAmount > 0 ? customAmount : budget.totalValue;
  }, [paymentMode, budget.totalValue, customAmount]);

  const pixKeyToUse = tempPixKey.trim() || profile.pixKey?.trim() || '';

  // Generate EMV payload
  const pixPayload = useMemo(() => {
    if (!pixKeyToUse) return '';
    return generatePixPayload({
      pixKey: pixKeyToUse,
      merchantName: profile.ownerName || profile.businessName || 'Aferix Eletricista',
      merchantCity: profile.city || 'BRASIL',
      amount: effectiveAmount,
      txId: budget.code.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || 'OS' + Date.now().toString().slice(-6),
      description: `OS ${budget.code}`,
    });
  }, [pixKeyToUse, profile, effectiveAmount, budget.code]);

  const qrCodeUrl = useMemo(() => {
    if (!pixPayload) return '';
    return createQrSvgDataUri(pixPayload, 260);
  }, [pixPayload]);

  const handleCopyPayload = () => {
    if (!pixPayload) return;
    navigator.clipboard.writeText(pixPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  const handleCopyKey = () => {
    if (!pixKeyToUse) return;
    navigator.clipboard.writeText(pixKeyToUse);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!pixPayload) return;
    const cleanPhone = budget.clientPhone.replace(/\D/g, '');
    let text = `Olá, *${budget.clientName}*!\n\n`;
    text += `Aqui está a cobrança via Pix referente ao serviço:\n`;
    text += `📋 *${budget.title}* (OS ${budget.code})\n`;
    text += `💰 *Valor:* R$ ${effectiveAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n`;
    text += `🔑 *Chave Pix:* ${pixKeyToUse}\n\n`;
    text += `📱 *Código Pix Copia e Cola:* (copie e cole no app do seu banco):\n\`\`\`${pixPayload}\`\`\`\n\n`;
    text += `Assim que efetuar o pagamento, seu comprovante é validado automaticamente na OS. Obrigado!`;

    const encoded = encodeURIComponent(text);
    const url = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleConfirmReceipt = () => {
    // 1. Mark existing receivables as paid
    const receivables = aferixStore.getReceivables();
    const rec = receivables.find((r) => r.budgetId === budget.id && r.status === 'pendente');
    if (rec) {
      aferixStore.markReceivablePaid(rec.id);
    } else {
      // Create transaction directly
      aferixStore.addTransaction({
        type: 'entrada',
        category: 'Serviços Elétricos',
        description: `Recebimento Pix OS ${budget.code} - ${budget.clientName}`,
        value: effectiveAmount,
        date: new Date().toISOString().slice(0, 10),
        budgetId: budget.id,
      });
    }

    // 2. Mark budget as finalizado if not already
    if (budget.status !== 'finalizado') {
      aferixStore.updateBudgetStatus(budget.id, 'finalizado');
    }

    aferixStore.addNotification({
      title: 'Pix Confirmado!',
      message: `Recebimento de R$ ${effectiveAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado para a OS ${budget.code}.`,
      type: 'success',
    });

    if (onPaymentConfirmed) onPaymentConfirmed();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-[#0F1626] border-white/10 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Cobrança Imediata via Pix</h3>
              <p className="text-xs text-slate-400">
                {budget.code} • {budget.clientName}
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
          {/* Missing Pix Key Warning / Inline Input */}
          {!pixKeyToUse && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Nenhuma chave Pix configurada no seu perfil</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                Informe sua chave Pix (CPF, celular, e-mail ou aleatória) abaixo para gerar o QR Code instantâneo:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Digite sua chave Pix..."
                  value={tempPixKey}
                  onChange={(e) => setTempPixKey(e.target.value)}
                  className={`flex-1 px-3 py-1.5 rounded-lg border text-xs outline-none ${
                    isDark ? 'bg-black/30 border-white/20 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tempPixKey.trim()) {
                      aferixStore.setProfile({ ...profile, pixKey: tempPixKey.trim() });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold active:scale-95"
                >
                  Salvar
                </button>
              </div>
            </div>
          )}

          {/* Amount Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Valor da Cobrança
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('total')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMode === 'total'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                    : isDark
                    ? 'border-white/10 bg-white/[0.02] text-slate-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Integral (100%)
                <div className="text-[11px] font-mono font-normal opacity-80">
                  R$ {budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('half')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMode === 'half'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                    : isDark
                    ? 'border-white/10 bg-white/[0.02] text-slate-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Entrada (50%)
                <div className="text-[11px] font-mono font-normal opacity-80">
                  R$ {(budget.totalValue / 2).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('custom')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  paymentMode === 'custom'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-sm'
                    : isDark
                    ? 'border-white/10 bg-white/[0.02] text-slate-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700'
                }`}
              >
                Outro Valor
                <div className="text-[11px] font-mono font-normal opacity-80">Personalizado</div>
              </button>
            </div>

            {paymentMode === 'custom' && (
              <div className="pt-1">
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(Number(e.target.value))}
                    className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm font-mono font-bold outline-none ${
                      isDark
                        ? 'bg-black/30 border-white/15 text-white'
                        : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* QR Code Card */}
          {pixKeyToUse ? (
            <div
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-3 ${
                isDark ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* QR Code Box */}
              <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-200">
                <img
                  src={qrCodeUrl}
                  alt="QR Code Pix"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                />
              </div>

              {/* Total Display */}
              <div className="space-y-0.5">
                <span className="text-xs text-slate-400 font-medium">Aponte a câmera do celular</span>
                <div className="text-2xl font-black font-mono text-emerald-500">
                  R$ {effectiveAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Pix Key Badge */}
              <div
                onClick={handleCopyKey}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:opacity-80 transition-all ${
                  isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-slate-400">Chave:</span>
                <strong className="font-mono text-emerald-400">{pixKeyToUse}</strong>
                {copiedKey ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-sm">
              Insira sua chave Pix acima para gerar o QR Code de cobrança.
            </div>
          )}

          {/* Action Buttons */}
          {pixKeyToUse && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                    copiedPayload
                      ? 'bg-emerald-500 border-emerald-400 text-black font-extrabold'
                      : isDark
                      ? 'bg-white/10 hover:bg-white/15 border-white/10 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                  }`}
                >
                  {copiedPayload ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copia e Cola Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Pix Copia e Cola</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Cobrar no WhatsApp</span>
                </button>
              </div>

              {/* Confirm Receipt & Mark Done */}
              <button
                type="button"
                onClick={handleConfirmReceipt}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-lg transition-all active:scale-95 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Confirmar Recebimento & Baixa na OS</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
