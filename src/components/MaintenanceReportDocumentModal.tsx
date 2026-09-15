import React, { useState } from 'react';
import { Printer, Download, MessageCircle, X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MaintenanceReport, UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { MAINTENANCE_DISCIPLINES, MAINTENANCE_PLAN_TYPES } from '../data/maintenanceTemplates';
import { downloadMaintenancePdf, shareMaintenancePdfViaWhatsApp } from '../utils/maintenancePdfGenerator';

interface MaintenanceReportDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: MaintenanceReport | null;
  profile: UserProfile;
  clientPhone?: string;
}

export const MaintenanceReportDocumentModal: React.FC<MaintenanceReportDocumentModalProps> = ({
  isOpen,
  onClose,
  report,
  profile,
  clientPhone,
}) => {
  const { isDark } = useTheme();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      const fileName = downloadMaintenancePdf(report, profile);
      setFeedback(`PDF "${fileName}" baixado com sucesso!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch {
      setFeedback('Erro ao gerar o arquivo PDF.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSendWhatsAppPdf = async () => {
    setIsSending(true);
    try {
      const result = await shareMaintenancePdfViaWhatsApp(report, profile, clientPhone);
      if (result.method === 'direct_share') {
        setFeedback('PDF enviado diretamente para compartilhamento!');
      } else {
        setFeedback(`PDF "${result.fileName}" baixado! Abrindo conversa do WhatsApp...`);
      }
      setTimeout(() => setFeedback(null), 5000);
    } catch {
      setFeedback('Não foi possível concluir o envio do PDF.');
      setTimeout(() => setFeedback(null), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const planConfig = MAINTENANCE_PLAN_TYPES.find((p) => p.id === report.planType);
  const discConfig = MAINTENANCE_DISCIPLINES[report.discipline];
  const isAprovado = report.generalStatus === 'aprovado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:static">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs print:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal */}
      <div className="relative w-full max-w-4xl rounded-2xl bg-white text-zinc-900 shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col print:max-h-none print:shadow-none print:rounded-none animate-fade-in-up">
        {/* Top Control Bar (Oculto na impressão) */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b p-3.5 sm:px-6 print:hidden shrink-0 ${
            isDark ? 'bg-[#0A0F1D] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 text-blue-500 font-bold text-xs">
              PDF
            </span>
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-100">
                Laudo Técnico Oficial — {report.code}
              </span>
              <p className="text-[11px] text-slate-400">
                Envio certificado em formato PDF com registro técnico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botão Enviar PDF via WhatsApp */}
            <button
              type="button"
              disabled={isSending}
              onClick={handleSendWhatsAppPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isSending ? 'Gerando...' : 'Enviar PDF no WhatsApp'}</span>
            </button>

            {/* Botão Baixar PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                isDark
                  ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span>Baixar PDF</span>
            </button>

            {/* Botão Imprimir */}
            <button
              type="button"
              onClick={handlePrint}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border transition-all active:scale-95 ${
                isDark
                  ? 'border-white/15 bg-white/5 text-slate-200 hover:bg-white/10'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors ${
                isDark
                  ? 'border-white/10 hover:bg-white/10 text-slate-300'
                  : 'border-slate-200 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Document Body (Área formatada como folha A4 oficial) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center">
          <div className="w-full max-w-[210mm] bg-white shadow-xl rounded-lg p-6 sm:p-10 text-slate-800 text-xs border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0">
            {/* Faixa decorativa Aferix */}
            <div className="h-1.5 w-full bg-[#0D4F9C] flex justify-end mb-6 rounded-xs overflow-hidden">
              <div className="h-full w-24 bg-[#F58220]" />
            </div>

            {/* Cabeçalho da Empresa */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-5 mb-6 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0D4F9C] tracking-tight">
                  {profile.businessName || 'AFERIX ENGENHARIA & MANUTENÇÃO'}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-medium">
                  {profile.ownerName && <span>Resp: {profile.ownerName}</span>}
                  {profile.technicalRegistry && <span>Reg: {profile.technicalRegistry}</span>}
                  {profile.phone && <span>Tel: {profile.phone}</span>}
                  {profile.city && <span>{profile.city}</span>}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-black text-[#0D4F9C] tracking-wide">AFERIX</div>
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Soluções para ERP
                </div>
              </div>
            </div>

            {/* Bloco de Identificação do Documento Técnico */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0D4F9C]/10 text-[#0D4F9C] font-black text-[11px] mb-1">
                  LAUDO TÉCNICO • {planConfig?.acronym || report.planType.toUpperCase()}
                </div>
                <h2 className="text-sm font-bold text-slate-900">{planConfig?.name}</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Especialidade: <strong className="text-slate-700">{discConfig?.name}</strong> •
                  Periodicidade:{' '}
                  <strong className="text-slate-700 uppercase">{report.periodicity}</strong>
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-5">
                <div className="text-base font-mono font-bold text-slate-900">{report.code}</div>
                <div className="text-[11px] text-slate-500">
                  Data:{' '}
                  <strong>
                    {report.date ? report.date.split('-').reverse().join('/') : ''}
                  </strong>
                </div>
                <div className="mt-1.5">
                  {isAprovado ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      CONFORME / APROVADO
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      COM RESSALVAS
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Seção 1: Cliente e Ativo */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D4F9C]" />
                1. Identificação do Cliente e Ativo Vistoriado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white border border-slate-200 rounded-xl text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Cliente / Razão Social:</span>
                  <strong className="text-slate-800 text-xs">{report.clientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Responsável no Local:</span>
                  <strong className="text-slate-800 text-xs">
                    {report.clientSignatureName || 'Gerência Predial'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Equipamento / Sistema:</span>
                  <strong className="text-slate-800 text-xs">{report.equipmentName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Técnico Especialista:</span>
                  <strong className="text-slate-800 text-xs">
                    {report.technicianName || profile.ownerName}
                  </strong>
                </div>
              </div>
            </div>

            {/* Seção 2: Itens de Inspeção e Conformidade */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                2. Itens de Inspeção e Verificações Técnicas
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-[#0D4F9C] text-white font-bold text-[10px] uppercase">
                      <th className="py-2.5 px-3">Categoria</th>
                      <th className="py-2.5 px-3">Procedimento Técnico Realizado</th>
                      <th className="py-2.5 px-3 text-right">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.items.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-500 uppercase text-[10px]">
                          {item.category}
                        </td>
                        <td className="py-2 px-3 text-slate-800">{item.label}</td>
                        <td className="py-2 px-3 text-right">
                          {item.status === 'conforme' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                              CONFORME
                            </span>
                          )}
                          {item.status === 'corrigido' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 font-bold text-[9px]">
                              CORRIGIDO
                            </span>
                          )}
                          {item.status === 'nao_conforme' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm bg-rose-50 text-rose-700 font-bold text-[9px]">
                              NÃO CONFORME
                            </span>
                          )}
                          {item.status === 'na' && (
                            <span className="inline-block px-2 py-0.5 rounded-sm bg-slate-100 text-slate-500 font-medium text-[9px]">
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Seção 3: Parecer Técnico */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                3. Parecer do Responsável Técnico
              </h3>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 italic leading-relaxed">
                {report.technicianNotes ||
                  'Todas as etapas preventivas foram rigorosamente concluídas e os testes de conformidade operacional atestaram parâmetros adequados para operação contínua.'}
              </div>
            </div>

            {/* Seção 4: Assinaturas */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-8">
                4. Termo de Responsabilidade e Recebimento
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center">
                <div>
                  <div className="border-t border-slate-400 pt-2 w-48 sm:w-60 mx-auto">
                    <p className="font-bold text-xs text-slate-900">
                      {report.technicianName || profile.ownerName}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {profile.technicalRegistry
                        ? `Registro: ${profile.technicalRegistry}`
                        : profile.businessName}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Responsável Técnico</p>
                  </div>
                </div>

                <div>
                  <div className="border-t border-slate-400 pt-2 w-48 sm:w-60 mx-auto">
                    <p className="font-bold text-xs text-slate-900">
                      {report.clientSignatureName || report.clientName}
                    </p>
                    <p className="text-[10px] text-slate-500">De acordo com a inspeção realizada</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Recebedor / Cliente</p>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-4 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
                <span>Documento emitido e certificado via Aferix — Soluções para ERP</span>
                <span>Protocolo: {report.code}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
