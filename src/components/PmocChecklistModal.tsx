import React, { useState } from 'react';
import {
  X,
  ClipboardCheck,
  Check,
  AlertTriangle,
  Send,
  Share2,
  Plus,
  Trash2,
  CheckCircle2,
  Zap,
  Snowflake,
  Droplets,
  Wrench,
  Power,
  Building2,
  ArrowUpDown,
  Layers,
  History,
  FileText,
  Calendar,
  Filter,
  Download,
  Eye,
  MessageCircle,
} from 'lucide-react';
import {
  Client,
  MaintenanceReport,
  MaintenanceCheckItem,
  MaintenancePlanType,
  MaintenanceDiscipline,
} from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';
import {
  MAINTENANCE_PLAN_TYPES,
  MAINTENANCE_DISCIPLINES,
} from '../data/maintenanceTemplates';
import {
  downloadMaintenancePdf,
  shareMaintenancePdfViaWhatsApp,
} from '../utils/maintenancePdfGenerator';
import { MaintenanceReportDocumentModal } from './MaintenanceReportDocumentModal';
import { SignatureCanvasPad } from './SignatureCanvasPad';

interface PmocChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  existingReports: MaintenanceReport[];
}

export const PmocChecklistModal: React.FC<PmocChecklistModalProps> = ({
  isOpen,
  onClose,
  clients,
  existingReports,
}) => {
  const { isDark } = useTheme();

  // Mode: Criar Novo Laudo ou Visualizar Histórico
  const [activeView, setActiveView] = useState<'create' | 'history'>('create');

  // Form State
  const [planType, setPlanType] = useState<MaintenancePlanType>('pmp');
  const [discipline, setDiscipline] = useState<MaintenanceDiscipline>('eletrica');
  const [periodicity, setPeriodicity] = useState<MaintenanceReport['periodicity']>('mensal');
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [equipmentName, setEquipmentName] = useState('Quadro Geral de Baixa Tensão (QGBT 630A)');
  const [technicianNotes, setTechnicianNotes] = useState(
    'Inspeção preventiva realizada conforme normas vigentes. Conexões aferidas e parâmetros dentro da faixa operacional segura.'
  );
  const [signatureName, setSignatureName] = useState('Gerente Predial / Manutenção');

  // Items State
  const [items, setItems] = useState<MaintenanceCheckItem[]>(() => {
    return MAINTENANCE_DISCIPLINES.eletrica.items.map((item, idx) => ({
      id: `it_${idx}`,
      label: item.label,
      category: item.category,
      status: 'conforme',
    }));
  });

  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [savedReport, setSavedReport] = useState<MaintenanceReport | null>(null);
  const [selectedReportDetail, setSelectedReportDetail] = useState<MaintenanceReport | null>(null);
  const [documentModalReport, setDocumentModalReport] = useState<MaintenanceReport | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string>('');

  const profile = aferixStore.getProfile();

  const handleCloneReport = (rep: MaintenanceReport) => {
    setPlanType(rep.planType);
    setDiscipline(rep.discipline);
    setPeriodicity(rep.periodicity || 'mensal');
    setSelectedClientId(rep.clientId);
    setEquipmentName(`${rep.equipmentName} (Recorrência)`);
    setTechnicianNotes(rep.technicianNotes || '');
    setSignatureName(rep.clientSignatureName || '');
    setItems(rep.items.map((it, idx) => ({ ...it, id: `it_clone_${idx}` })));
    setSignatureDataUrl('');
    setActiveView('create');
    setSavedReport(null);
  };

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Troca de Disciplina com recarga dos templates técnicos sugeridos
  const handleDisciplineChange = (newDisc: MaintenanceDiscipline) => {
    setDiscipline(newDisc);
    const discConfig = MAINTENANCE_DISCIPLINES[newDisc];

    // Ajusta o tipo de plano sugerido
    if (newDisc === 'climatizacao') {
      setPlanType('pmoc');
      setEquipmentName('Sistema VRF / Condensadoras & Evaporadoras');
    } else if (newDisc === 'civil') {
      setPlanType('pgm');
      setEquipmentName('Infraestrutura Predial, Calhas e Coberturas');
    } else if (newDisc === 'hidraulica') {
      setPlanType('pmp');
      setEquipmentName('Conjunto de Bombas de Recalque e Incêndio');
    } else if (newDisc === 'geradores') {
      setPlanType('pmp');
      setEquipmentName('Grupo Gerador Diesel 150 kVA & Chave QTA');
    } else if (newDisc === 'mecanica') {
      setPlanType('pmp');
      setEquipmentName('Motor Trifásico 25 CV & Redutor Industrial');
    } else if (newDisc === 'elevadores') {
      setPlanType('pmp');
      setEquipmentName('Elevador de Passageiros Atlas 8 Paradas');
    } else {
      setPlanType('pmp');
      setEquipmentName('Painel QGBT & Subestação de Entrada');
    }

    // Carrega os itens específicos daquela área
    setItems(
      discConfig.items.map((it, idx) => ({
        id: `it_${Date.now()}_${idx}`,
        label: it.label,
        category: it.category,
        status: 'conforme',
      }))
    );
  };

  const handleStatusToggle = (id: string, newStatus: MaintenanceCheckItem['status']) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, status: newStatus } : it))
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel.trim()) return;

    setItems((prev) => [
      ...prev,
      {
        id: 'it_' + Date.now(),
        label: newItemLabel.trim(),
        category: newItemCategory.trim() || 'Geral',
        status: 'conforme',
      },
    ]);

    setNewItemLabel('');
    setNewItemCategory('');
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    const hasNaoConforme = items.some((it) => it.status === 'nao_conforme');
    const generalStatus = hasNaoConforme ? 'com_ressalvas' : 'aprovado';

    const newReport = aferixStore.addPmocReport({
      planType,
      discipline,
      periodicity,
      clientId: selectedClient?.id || 'c1',
      clientName: selectedClient?.name || 'Cliente',
      equipmentName: equipmentName.trim(),
      technicianName: profile.ownerName || 'Mateus Rossi (Responsável Técnico)',
      date: new Date().toISOString().slice(0, 10),
      items,
      generalStatus,
      technicianNotes: technicianNotes.trim(),
      clientSignatureName: signatureName.trim(),
      clientSignatureDataUrl: signatureDataUrl,
    });

    setSavedReport(newReport);
  };

  const handleSendWhatsAppPdf = async (report: MaintenanceReport) => {
    setIsPdfGenerating(true);
    try {
      const client = clients.find((c) => c.id === report.clientId) || selectedClient;
      const result = await shareMaintenancePdfViaWhatsApp(report, profile, client?.phone);
      if (result.method === 'direct_share') {
        setFeedbackMessage(`Laudo PDF (${report.code}) compartilhado com sucesso!`);
      } else {
        setFeedbackMessage(`PDF "${result.fileName}" baixado! Abrindo o WhatsApp...`);
      }
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch {
      setFeedbackMessage('Não foi possível gerar ou enviar o PDF.');
      setTimeout(() => setFeedbackMessage(null), 4000);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const handleDownloadPdf = (report: MaintenanceReport) => {
    try {
      const fileName = downloadMaintenancePdf(report, profile);
      setFeedbackMessage(`PDF "${fileName}" baixado com sucesso!`);
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch {
      setFeedbackMessage('Erro ao baixar o arquivo PDF.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleOpenDocumentModal = (report: MaintenanceReport) => {
    setDocumentModalReport(report);
  };

  const getDisciplineIcon = (disc: MaintenanceDiscipline) => {
    switch (disc) {
      case 'eletrica':
        return <Zap className="w-3.5 h-3.5" />;
      case 'climatizacao':
        return <Snowflake className="w-3.5 h-3.5" />;
      case 'hidraulica':
        return <Droplets className="w-3.5 h-3.5" />;
      case 'mecanica':
        return <Wrench className="w-3.5 h-3.5" />;
      case 'geradores':
        return <Power className="w-3.5 h-3.5" />;
      case 'civil':
        return <Building2 className="w-3.5 h-3.5" />;
      case 'elevadores':
        return <ArrowUpDown className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-fade-in-up transition-all ${
          isDark
            ? 'bg-[#0F1626] border-white/10 text-white shadow-[0_24px_48px_rgba(0,0,0,0.7)]'
            : 'bg-white border-slate-200/90 text-[#0F172A] shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-4 shrink-0 ${
            isDark ? 'border-white/[0.08] bg-[#0A0F1D]/70' : 'border-slate-200/80 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/25 shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm sm:text-base tracking-tight leading-tight">
                  Plano de Manutenção Preventiva (PMP / PGM / PMOC)
                </h2>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Engenharia de manutenção: elétrica, climatização, hidráulica, mecânica, civil e elevadores
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
              isDark
                ? 'border-white/10 bg-[#090E17] text-slate-400 hover:text-white'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-900'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div
          className={`flex items-center px-4 pt-2.5 pb-0 border-b gap-3 shrink-0 ${
            isDark ? 'border-white/[0.08] bg-[#0A0F1D]/40' : 'border-slate-200/80 bg-slate-50/50'
          }`}
        >
          <button
            type="button"
            onClick={() => {
              setActiveView('create');
              setSelectedReportDetail(null);
            }}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-bold border-b-2 transition-all ${
              activeView === 'create'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Emitir Novo Laudo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`flex items-center gap-1.5 pb-2.5 text-xs font-bold border-b-2 transition-all ${
              activeView === 'history'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Planos Emitidos ({existingReports.length})</span>
          </button>
        </div>

        {/* Feedback Alert Bar */}
        {feedbackMessage && (
          <div className="bg-blue-600 text-white text-xs font-semibold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {activeView === 'history' ? (
            /* Histórico de Planos Emitidos */
            <div className="space-y-3">
              {existingReports.length === 0 ? (
                <div
                  className={`text-center py-12 rounded-2xl border ${
                    isDark ? 'border-white/[0.06] bg-[#0A0F1D]' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <ClipboardCheck className="w-10 h-10 mx-auto text-slate-400 mb-2 opacity-50" />
                  <p className="font-semibold text-sm">Nenhum plano emitido ainda</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Preencha o formulário de emissão para gerar laudos PMP, PGM ou PMOC.
                  </p>
                </div>
              ) : (
                existingReports.map((rep) => {
                  const discCfg = MAINTENANCE_DISCIPLINES[rep.discipline] || MAINTENANCE_DISCIPLINES.geral;
                  const isApproved = rep.generalStatus === 'aprovado';

                  return (
                    <div
                      key={rep.id}
                      className={`p-4 rounded-xl border space-y-3 transition-all ${
                        isDark
                          ? 'bg-[#0A0F1D] border-white/[0.07] hover:border-blue-500/40'
                          : 'bg-slate-50 border-slate-200/90 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase border ${
                              rep.planType === 'pmoc'
                                ? 'bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border-cyan-500/30'
                                : rep.planType === 'pgm'
                                ? 'bg-purple-500/15 text-purple-500 dark:text-purple-400 border-purple-500/30'
                                : 'bg-blue-500/15 text-blue-500 dark:text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {rep.code}
                          </span>

                          <span
                            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {getDisciplineIcon(rep.discipline)}
                            <span>{discCfg.name}</span>
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isApproved
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {isApproved ? 'Aprovado' : 'Com Ressalvas'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{rep.date.split('-').reverse().join('/')}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Cliente: </span>
                          <strong className="font-semibold">{rep.clientName}</strong>
                        </div>
                        <div>
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Ativo: </span>
                          <strong className="font-semibold">{rep.equipmentName}</strong>
                        </div>
                      </div>

                      {rep.technicianNotes && (
                        <p
                          className={`text-xs italic p-2.5 rounded-lg border ${
                            isDark
                              ? 'bg-[#090E17] border-white/[0.05] text-slate-300'
                              : 'bg-white border-slate-200 text-slate-600'
                          }`}
                        >
                          "{rep.technicianNotes}"
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.04]">
                        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {rep.items.length} itens checados ({rep.items.filter((i) => i.status === 'conforme').length} conformes)
                        </span>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleCloneReport(rep)}
                            title="Criar novo laudo com base neste (Recorrência)"
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-all active:scale-95 ${
                              isDark
                                ? 'border-white/10 hover:bg-white/5 text-slate-300'
                                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Clonar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDocumentModal(rep)}
                            title="Visualizar laudo técnico em formato A4"
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-all active:scale-95 ${
                              isDark
                                ? 'border-white/10 hover:bg-white/5 text-slate-300'
                                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            <span>Visualizar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(rep)}
                            title="Baixar arquivo PDF no dispositivo"
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-all active:scale-95 ${
                              isDark
                                ? 'border-white/10 hover:bg-white/5 text-slate-300'
                                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            <span>PDF</span>
                          </button>

                          <button
                            type="button"
                            disabled={isPdfGenerating}
                            onClick={() => handleSendWhatsAppPdf(rep)}
                            title="Enviar Laudo Técnico em PDF pelo WhatsApp"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Enviar PDF no WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : savedReport ? (
            /* Tela de Sucesso após Emissão */
            <div
              className={`rounded-2xl p-6 text-center border space-y-4 ${
                isDark ? 'bg-[#0A0F1D] border-white/[0.08]' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
                  {savedReport.code}
                </span>
                <h3 className="text-base sm:text-lg font-bold mt-1">
                  Plano de Manutenção Registrado com Sucesso!
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Documento técnico gerado e assinado digitalmente no padrão Aferix.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border text-left text-xs space-y-2 ${
                  isDark ? 'bg-[#090E17] border-white/[0.06]' : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <p>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Tipo:</span>{' '}
                    <strong className="uppercase font-bold text-blue-500">{savedReport.planType}</strong>
                  </p>
                  <p>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Especialidade:</span>{' '}
                    <strong className="font-semibold">{MAINTENANCE_DISCIPLINES[savedReport.discipline]?.name}</strong>
                  </p>
                  <p>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Cliente:</span>{' '}
                    <strong className="font-semibold">{savedReport.clientName}</strong>
                  </p>
                  <p>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Equipamento:</span>{' '}
                    <strong className="font-semibold">{savedReport.equipmentName}</strong>
                  </p>
                  <p>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Status:</span>{' '}
                    <strong
                      className={`uppercase font-bold ${
                        savedReport.generalStatus === 'aprovado'
                          ? 'text-emerald-500'
                          : 'text-amber-500'
                      }`}
                    >
                      {savedReport.generalStatus}
                    </strong>
                  </p>
                  <p>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Recebedor:</span>{' '}
                    <strong className="font-semibold">{savedReport.clientSignatureName}</strong>
                  </p>
                </div>
              </div>

              {/* Botões de Ação para Envio do PDF */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isPdfGenerating}
                  onClick={() => handleSendWhatsAppPdf(savedReport)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isPdfGenerating ? 'Gerando Laudo PDF...' : 'Enviar Laudo em PDF no WhatsApp'}</span>
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(savedReport)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border font-bold py-2.5 text-xs transition-all active:scale-95 ${
                      isDark
                        ? 'border-white/10 bg-[#090E17] text-slate-200 hover:bg-white/5'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>Baixar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenDocumentModal(savedReport)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border font-bold py-2.5 text-xs transition-all active:scale-95 ${
                      isDark
                        ? 'border-white/10 bg-[#090E17] text-slate-200 hover:bg-white/5'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Visualizar Laudo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSavedReport(null)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border font-bold py-2.5 text-xs transition-all active:scale-95 ${
                      isDark
                        ? 'border-white/10 bg-[#090E17] text-slate-400 hover:text-white'
                        : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>Emitir Outro Plano</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Formulário de Criação e Vistoria */
            <form onSubmit={handleSaveReport} className="space-y-4">
              {/* 1. SELEÇÃO DO TIPO DE PLANO (PMP / PGM / PMOC) */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  1. Modelo do Documento Técnico
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {MAINTENANCE_PLAN_TYPES.map((pt) => {
                    const isSelected = planType === pt.id;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setPlanType(pt.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                            : isDark
                            ? 'border-white/[0.08] bg-[#0A0F1D] text-slate-300 hover:border-white/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black font-mono tracking-tight">{pt.acronym}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-500" />}
                        </div>
                        <p className="font-bold text-[11px] leading-snug mt-1">{pt.name}</p>
                        <p className={`text-[9.5px] mt-1 leading-tight line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {pt.scope}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. DISCIPLINA / ESPECIALIDADE TÉCNICA */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  2. Disciplina & Engenharia Aplicada
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {(Object.keys(MAINTENANCE_DISCIPLINES) as MaintenanceDiscipline[]).map((discKey) => {
                    const disc = MAINTENANCE_DISCIPLINES[discKey];
                    const isSelected = discipline === discKey;

                    return (
                      <button
                        key={discKey}
                        type="button"
                        onClick={() => handleDisciplineChange(discKey)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                            : isDark
                            ? 'border-white/[0.07] bg-[#0A0F1D] text-slate-300 hover:border-white/20'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : isDark
                              ? 'bg-white/10 text-slate-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {getDisciplineIcon(discKey)}
                        </div>
                        <span className="text-[11px] leading-tight truncate">{disc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. DADOS DO CLIENTE, EQUIPAMENTO E PERIODICIDADE */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border ${
                  isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Cliente Solicitante
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white'
                        : 'bg-white border-slate-200/90 text-[#0F172A]'
                    }`}
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Equipamento / Ativo / Instalação
                  </label>
                  <input
                    type="text"
                    required
                    value={equipmentName}
                    onChange={(e) => setEquipmentName(e.target.value)}
                    placeholder="Ex: QGBT 630A, Chillers, Bombas..."
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Periodicidade do Plano
                  </label>
                  <select
                    value={periodicity}
                    onChange={(e) => setPeriodicity(e.target.value as any)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white'
                        : 'bg-white border-slate-200/90 text-[#0F172A]'
                    }`}
                  >
                    <option value="mensal">Mensal (Padrão PMOC/PMP)</option>
                    <option value="bimestral">Bimestral</option>
                    <option value="trimestral">Trimestral (Subestações / QGBT)</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual (Auditoria / SPDA / Civil)</option>
                    <option value="avulso">Avulso / Chamado Especial</option>
                  </select>
                </div>
              </div>

              {/* 4. ITENS DO CHECKLIST DE CONFORMIDADE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Itens de Inspeção ({items.length})
                    </h3>
                    <span className="text-[10px] text-blue-500 font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full">
                      {MAINTENANCE_DISCIPLINES[discipline]?.name}
                    </span>
                  </div>
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {items.filter((i) => i.status === 'conforme').length} conformes •{' '}
                    {items.filter((i) => i.status === 'nao_conforme').length} pendências
                  </span>
                </div>

                <div
                  className={`divide-y rounded-xl border overflow-hidden ${
                    isDark
                      ? 'bg-[#0A0F1D] border-white/[0.07] divide-white/[0.06]'
                      : 'bg-slate-50 border-slate-200/80 divide-slate-200/80'
                  }`}
                >
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {it.category}
                        </span>
                        <p className="font-semibold leading-snug">{it.label}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(it.id, 'conforme')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            it.status === 'conforme'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isDark
                              ? 'bg-[#090E17] border border-white/10 text-slate-400 hover:text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Conforme
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(it.id, 'corrigido')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            it.status === 'corrigido'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : isDark
                              ? 'bg-[#090E17] border border-white/10 text-slate-400 hover:text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Corrigido
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(it.id, 'nao_conforme')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            it.status === 'nao_conforme'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : isDark
                              ? 'bg-[#090E17] border border-white/10 text-slate-400 hover:text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Não Conforme
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          title="Remover este item"
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Adicionar Item Customizado */}
                <div
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center gap-2 ${
                    isDark ? 'bg-[#0A0F1D]/50 border-white/[0.05]' : 'bg-slate-50 border-slate-200/60'
                  }`}
                >
                  <input
                    type="text"
                    placeholder="Adicionar item customizado de inspeção..."
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs border ${
                      isDark ? 'bg-[#090E17] border-white/10 text-white' : 'bg-white border-slate-200'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Categoria (opcional)"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className={`w-full sm:w-36 rounded-lg px-3 py-1.5 text-xs border ${
                      isDark ? 'bg-[#090E17] border-white/10 text-white' : 'bg-white border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full sm:w-auto flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                </div>
              </div>

              {/* 5. PARECER TÉCNICO & ASSINATURA */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border ${
                  isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Parecer Técnico / Observações da Vistoria
                  </label>
                  <textarea
                    rows={2}
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <SignatureCanvasPad
                    signatoryName={signatureName}
                    onSignatoryChange={setSignatureName}
                    onSave={(dataUrl) => setSignatureDataUrl(dataUrl)}
                    initialSignature={signatureDataUrl}
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 text-xs font-bold text-white transition-all active:scale-[0.98] shadow-md shadow-blue-600/25"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>
                  Gerar Laudo {planType.toUpperCase()} ({MAINTENANCE_DISCIPLINES[discipline]?.name})
                </span>
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Modal de Visualização, Impressão e Compartilhamento do Laudo Oficial PDF */}
      {documentModalReport && (
        <MaintenanceReportDocumentModal
          isOpen={Boolean(documentModalReport)}
          onClose={() => setDocumentModalReport(null)}
          report={documentModalReport}
          profile={profile}
          clientPhone={
            clients.find((c) => c.id === documentModalReport.clientId)?.phone || selectedClient?.phone
          }
        />
      )}
    </div>
  );
};
