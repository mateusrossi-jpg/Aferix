import React, { useState } from 'react';
import { X, Printer, Download, MessageCircle, QrCode, CheckCircle2, ShieldCheck, Phone, MapPin, Layers, DollarSign } from 'lucide-react';
import { Budget, UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { AferixMonogram } from './AferixLogo';
import { downloadBudgetPdf, shareBudgetPdfViaWhatsApp } from '../utils/budgetPdfGenerator';

interface ExecutiveProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  profile: UserProfile;
}

export const ExecutiveProposalModal: React.FC<ExecutiveProposalModalProps> = ({
  isOpen,
  onClose,
  budget,
  profile,
}) => {
  if (!isOpen || !budget) return null;

  const { isDark } = useTheme();
  const [isSharing, setIsSharing] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadBudgetPdf(budget, profile);
    setShareMsg('PDF do orçamento baixado com sucesso!');
    setTimeout(() => setShareMsg(null), 3000);
  };

  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    try {
      await shareBudgetPdfViaWhatsApp(budget, profile);
      setShareMsg('Orçamento enviado com sucesso via WhatsApp!');
    } catch {
      setShareMsg('Erro ao gerar ou compartilhar arquivo.');
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareMsg(null), 4000);
    }
  };

  // QR Code PIX link generator (Open-source QR server)
  const pixQrUrl = profile.pixKey
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        `00020126360014BR.GOV.BCB.PIX0114${profile.pixKey}5204000053039865405${budget.totalValue.toFixed(2)}5802BR5913${profile.ownerName.slice(0, 13)}6009${profile.city.slice(0, 9)}62070503***6304`
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:static">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm print:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Main Container */}
      <div className="relative w-full max-w-3xl rounded-2xl bg-white text-zinc-900 shadow-2xl overflow-hidden my-auto max-h-[95vh] flex flex-col print:max-h-none print:shadow-none print:rounded-none animate-fade-in-up">
        {/* Top Control Bar (Hidden in Print) */}
        <div
          className={`flex flex-wrap items-center justify-between border-b p-4 print:hidden shrink-0 gap-3 ${
            isDark ? 'bg-[#0A0F1D] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-wider text-blue-500">
              Proposta Executiva • PDF & WhatsApp
            </span>
            {shareMsg && (
              <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded animate-fade-in">
                {shareMsg}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={isSharing}
              onClick={handleWhatsAppShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isSharing ? 'Gerando...' : 'Enviar no WhatsApp'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border font-bold text-xs transition-all active:scale-95 ${
                isDark
                  ? 'border-white/10 bg-[#090E17] text-slate-200 hover:bg-white/5'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Download className="w-4 h-4 text-blue-500" />
              <span>Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-600/25 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" /> Imprimir
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

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 print:p-6 print:overflow-visible text-left">
          {/* Header & Company Brand */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <AferixMonogram size={36} />
                <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {profile.businessName}
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Responsável Técnico: <strong className="text-slate-900">{profile.ownerName}</strong>
                {profile.technicalRegistry && ` • Reg: ${profile.technicalRegistry}`}
              </p>
              <p className="text-xs text-slate-500">
                {profile.phone} • {profile.email} • {profile.city}
              </p>
            </div>

            <div className="sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl w-full sm:w-auto border sm:border-0 border-slate-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                Proposta Comercial / OS
              </span>
              <span className="text-xl font-black font-mono text-slate-900">{budget.code}</span>
              <p className="text-xs text-slate-500 mt-1">Data: {budget.date.split('-').reverse().join('/')}</p>
            </div>
          </div>

          {/* Client Details Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Dados do Solicitante</span>
              <p className="font-bold text-sm text-zinc-900">{budget.clientName}</p>
              <p className="text-zinc-600 mt-0.5">{budget.clientPhone}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Local da Execução</span>
              <p className="font-medium text-zinc-800">{budget.clientAddress || 'Endereço em campo'}</p>
              <p className="text-zinc-500 mt-0.5">Título do Serviço: <strong>{budget.title}</strong></p>
            </div>
          </div>

          {/* Table of Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
              Discriminação dos Serviços & Materiais
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-300 text-[11px] font-bold text-zinc-600">
                  <th className="py-2">Item / Descrição Técnica</th>
                  <th className="py-2 text-center">Tipo</th>
                  <th className="py-2 text-center">Qtd</th>
                  <th className="py-2 text-right">Valor Unit.</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {budget.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50">
                    <td className="py-2.5 font-medium text-zinc-900">{item.name}</td>
                    <td className="py-2.5 text-center text-[10px] uppercase font-bold text-zinc-500">
                      {item.type}
                    </td>
                    <td className="py-2.5 text-center font-mono">
                      {item.qty} {item.unit}
                    </td>
                    <td className="py-2.5 text-right font-mono text-zinc-700">
                      R$ {item.unitPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-bold font-mono text-zinc-900">
                      R$ {item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total & PIX Payment Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t-2 border-zinc-900 items-center">
            {/* PIX Box */}
            <div className="col-span-2 p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center gap-4">
              {pixQrUrl ? (
                <img
                  src={pixQrUrl}
                  alt="QR Code PIX"
                  className="w-20 h-20 rounded-lg border border-zinc-300 bg-white p-1 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-zinc-200 flex items-center justify-center text-zinc-400">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
              <div className="text-xs space-y-1">
                <span className="font-bold text-zinc-900 uppercase text-[11px] block">
                  Pagamento Facilitado via PIX
                </span>
                <p className="text-zinc-600">
                  Chave: <strong className="font-mono text-zinc-900">{profile.pixKey || 'Consulte o técnico'}</strong>
                </p>
                <p className="text-[11px] text-zinc-500">
                  Titular: {profile.ownerName} • Banco de recebimento imediato
                </p>
              </div>
            </div>

            {/* Total Value */}
            <div className="p-4 rounded-xl bg-slate-900 text-white text-right space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Investimento Total
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono block">
                R$ {budget.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Field Photos Evidence (if any) */}
          {budget.photos && budget.photos.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-200 page-break-inside-avoid">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                Registro Fotográfico de Conformidade
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {budget.photos.slice(0, 3).map((p) => (
                  <div key={p.id} className="border border-zinc-300 rounded-lg overflow-hidden text-center bg-zinc-50">
                    <img src={p.url} alt={p.caption} className="w-full h-24 object-cover" />
                    <span className="text-[9px] font-bold text-zinc-600 block p-1 truncate">
                      {p.type.toUpperCase()}: {p.caption}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signatures Footer */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-300 page-break-inside-avoid text-center text-xs">
            <div className="space-y-2">
              <div className="h-14 flex items-end justify-center border-b border-zinc-400 pb-1">
                <span className="font-bold text-zinc-800">{profile.ownerName}</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                {profile.businessName}<br />Responsável Técnico
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-14 flex items-end justify-center border-b border-zinc-400 pb-1">
                {budget.clientSignature ? (
                  <img src={budget.clientSignature} alt="Assinatura" className="max-h-12 object-contain" />
                ) : (
                  <span className="text-zinc-400 italic text-[11px]">Aguardando assinatura no local</span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                {budget.clientSignerName || budget.clientName}<br />De acordo com os serviços executados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
