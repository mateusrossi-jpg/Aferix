import { jsPDF } from 'jspdf';
import { MaintenanceReport, UserProfile } from '../types';
import { MAINTENANCE_DISCIPLINES, MAINTENANCE_PLAN_TYPES } from '../data/maintenanceTemplates';

/**
 * Gera o documento PDF oficial do Laudo de Manutenção (PMP / PGM / PMOC)
 */
export function generateMaintenancePdf(
  report: MaintenanceReport,
  profile: UserProfile
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Paleta Institucional Aferix
  const colorPrimary = [13, 79, 156]; // #0D4F9C - Azul Corporativo Aferix
  const colorOrange = [245, 130, 32]; // #F58220 - Laranja Aferix
  const colorDark = [15, 23, 42]; // #0F172A
  const colorGray = [100, 116, 139]; // #64748B
  const colorLight = [248, 250, 252]; // #F8FAFC
  const colorBorder = [226, 232, 240]; // #E2E8F0

  let y = 14;

  // 1. Barra superior decorativa com as cores Aferix
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(margin, y, contentWidth, 3, 'F');
  doc.setFillColor(colorOrange[0], colorOrange[1], colorOrange[2]);
  doc.rect(margin + contentWidth - 30, y, 30, 3, 'F');
  y += 7;

  // 2. Cabeçalho da Empresa Prestadora
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text(profile.businessName || 'AFERIX ENGENHARIA & MANUTENÇÃO', margin, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  const contactLine = [
    profile.ownerName ? `Resp. Técnico: ${profile.ownerName}` : '',
    profile.technicalRegistry ? `Reg: ${profile.technicalRegistry}` : '',
    profile.phone ? `Tel: ${profile.phone}` : '',
    profile.city || '',
  ]
    .filter(Boolean)
    .join('  •  ');
  doc.text(contactLine, margin, y + 9);

  // Logo / Tag Aferix no canto superior direito
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text('AFERIX', pageWidth - margin, y + 3, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('Soluções para ERP', pageWidth - margin, y + 7, { align: 'right' });

  y += 15;

  // Linha divisória fina
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // 3. Título Oficial do Documento Técnico
  const planConfig = MAINTENANCE_PLAN_TYPES.find((p) => p.id === report.planType);
  const planAcronym = (planConfig?.acronym || report.planType).toUpperCase();
  const planTitle = planConfig?.name.toUpperCase() || 'PLANO DE MANUTENÇÃO PREVENTIVA';
  const discConfig = MAINTENANCE_DISCIPLINES[report.discipline];
  const disciplineName = discConfig?.name || 'Geral';

  // Caixa de destaque do tipo de documento
  doc.setFillColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text(`LAUDO TÉCNICO - ${planAcronym}`, margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(planTitle, margin + 5, y + 12);

  doc.setFontSize(8);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text(
    `Especialidade: ${disciplineName}   |   Periodicidade: ${(report.periodicity || 'mensal').toUpperCase()}`,
    margin + 5,
    y + 18
  );

  // Bloco de Protocolo e Data na direita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(report.code, pageWidth - margin - 5, y + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  const formattedDate = report.date ? report.date.split('-').reverse().join('/') : '';
  doc.text(`Data da Inspeção: ${formattedDate}`, pageWidth - margin - 5, y + 13, {
    align: 'right',
  });

  // Badge de Status Geral
  const isAprovado = report.generalStatus === 'aprovado';
  if (isAprovado) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
    doc.roundedRect(pageWidth - margin - 45, y + 15, 40, 6, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('CONFORME / APROVADO', pageWidth - margin - 25, y + 19.3, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199); // amber-50
    doc.setDrawColor(253, 230, 138); // amber-200
    doc.roundedRect(pageWidth - margin - 45, y + 15, 40, 6, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text('COM RESSALVAS', pageWidth - margin - 25, y + 19.3, { align: 'center' });
  }

  y += 29;

  // 4. Identificação do Cliente e do Ativo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('1. DADOS DO CLIENTE E INSTALAÇÃO', margin, y);
  y += 3;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);

  // Coluna 1
  doc.text('Cliente / Razão Social:', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(report.clientName || 'Cliente', margin + 35, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('Equipamento / Ativo:', margin + 4, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(report.equipmentName || 'Equipamento', margin + 35, y + 13);

  // Coluna 2
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('Responsável no Local:', margin + 110, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(report.clientSignatureName || 'Gerência Predial', margin + 145, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('Técnico Executor:', margin + 110, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(report.technicianName || profile.ownerName || 'Técnico Especialista', margin + 145, y + 13);

  y += 24;

  // 5. Tabela de Verificação Técnica / Checklist
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('2. ITENS DE INSPEÇÃO E CONFORMIDADE TÉCNICA', margin, y);
  y += 3;

  // Cabeçalho da Tabela
  const thHeight = 6.5;
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(margin, y, contentWidth, thHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('CATEGORIA', margin + 4, y + 4.5);
  doc.text('DESCRIÇÃO DA VERIFICAÇÃO / NORMA TÉCNICA', margin + 40, y + 4.5);
  doc.text('SITUAÇÃO', pageWidth - margin - 15, y + 4.5, { align: 'center' });

  y += thHeight;

  // Linhas da Tabela
  const items = report.items || [];
  const rowHeight = 7.5;

  items.forEach((item, index) => {
    // Quebra de página segura se passar da altura útil
    if (y > pageHeight - 45) {
      doc.addPage();
      y = 15;
    }

    const isEven = index % 2 === 0;
    if (isEven) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    // Linha divisória inferior sutil
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    // Categoria
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
    const catText = (item.category || 'GERAL').toUpperCase();
    doc.text(catText, margin + 4, y + 4.8);

    // Descrição do Item (com limite de largura)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    const truncatedLabel =
      item.label.length > 70 ? item.label.slice(0, 68) + '...' : item.label;
    doc.text(truncatedLabel, margin + 40, y + 4.8);

    // Badge de Situação
    const status = item.status || 'conforme';
    if (status === 'conforme') {
      doc.setFillColor(236, 253, 245);
      doc.roundedRect(pageWidth - margin - 26, y + 1.6, 22, 4.5, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(5, 150, 105);
      doc.text('CONFORME', pageWidth - margin - 15, y + 4.7, { align: 'center' });
    } else if (status === 'corrigido') {
      doc.setFillColor(254, 243, 199);
      doc.roundedRect(pageWidth - margin - 26, y + 1.6, 22, 4.5, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(217, 119, 6);
      doc.text('CORRIGIDO', pageWidth - margin - 15, y + 4.7, { align: 'center' });
    } else if (status === 'nao_conforme') {
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(pageWidth - margin - 26, y + 1.6, 22, 4.5, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(220, 38, 38);
      doc.text('NÃO CONFORME', pageWidth - margin - 15, y + 4.7, { align: 'center' });
    } else {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(pageWidth - margin - 26, y + 1.6, 22, 4.5, 0.8, 0.8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
      doc.text('N/A', pageWidth - margin - 15, y + 4.7, { align: 'center' });
    }

    y += rowHeight;
  });

  // Borda da tabela inteira
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.rect(margin, y - thHeight - items.length * rowHeight, contentWidth, thHeight + items.length * rowHeight, 'S');

  y += 5;

  // 6. Parecer Técnico e Recomendações
  if (y > pageHeight - 55) {
    doc.addPage();
    y = 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('3. PARECER DO RESPONSÁVEL TÉCNICO', margin, y);
  y += 3;

  doc.setFillColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  const notesText =
    report.technicianNotes ||
    'Todas as etapas preventivas foram rigorosamente concluídas e os testes de conformidade operacional atestaram parâmetros adequados para operação contínua.';
  const splitNotes = doc.splitTextToSize(notesText, contentWidth - 8);
  doc.text(splitNotes, margin + 4, y + 6);

  y += 24;

  // 7. Campo de Assinaturas
  if (y > pageHeight - 40) {
    doc.addPage();
    y = 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('4. TERMO DE RESPONSABILIDADE E RECEBIMENTO', margin, y);
  y += 12;

  const signWidth = (contentWidth - 12) / 2;

  // Assinatura do Responsável Técnico
  doc.setDrawColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + signWidth, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(profile.ownerName || 'Responsável Técnico', margin + signWidth / 2, y + 4, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  const regText = profile.technicalRegistry
    ? `Registro Técnico: ${profile.technicalRegistry}`
    : profile.businessName;
  doc.text(regText, margin + signWidth / 2, y + 8, { align: 'center' });

  // Assinatura do Cliente / Local
  const signX2 = margin + signWidth + 12;
  
  if (report.clientSignatureDataUrl) {
    try {
      doc.addImage(report.clientSignatureDataUrl, 'PNG', signX2 + (signWidth - 42) / 2, y - 12, 42, 11);
    } catch {
      // Fallback silencioso se falhar ao carregar imagem dataUrl
    }
  }

  doc.line(signX2, y, signX2 + signWidth, y);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(
    report.clientSignatureName || report.clientName || 'Cliente / Gerente Predial',
    signX2 + signWidth / 2,
    y + 4,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('De acordo com a inspeção realizada', signX2 + signWidth / 2, y + 8, {
    align: 'center',
  });

  // 8. Rodapé do Sistema Oficial
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text(
    `Laudo emitido eletronicamente via Aferix — Soluções para ERP  •  Protocolo ${report.code}`,
    margin,
    pageHeight - 8
  );

  doc.text(`Página 1 de 1`, pageWidth - margin, pageHeight - 8, { align: 'right' });

  return doc;
}

/**
 * Realiza o download direto do arquivo PDF no dispositivo do usuário
 */
export function downloadMaintenancePdf(
  report: MaintenanceReport,
  profile: UserProfile
): string {
  const doc = generateMaintenancePdf(report, profile);
  const cleanClientName = (report.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Laudo_${report.code}_${cleanClientName}.pdf`;
  doc.save(fileName);
  return fileName;
}

/**
 * Envia ou compartilha o Laudo PDF no WhatsApp
 * - Se o dispositivo suportar Web Share API com arquivos (Android/iOS):
 *   Compartilha o arquivo PDF diretamente anexado para o WhatsApp!
 * - Caso contrário (Desktop Web):
 *   Faz o download imediato do PDF e abre a conversa do WhatsApp com o link e mensagem técnica
 */
export async function shareMaintenancePdfViaWhatsApp(
  report: MaintenanceReport,
  profile: UserProfile,
  clientPhone?: string
): Promise<{ method: 'direct_share' | 'download_and_whatsapp'; fileName: string }> {
  const doc = generateMaintenancePdf(report, profile);
  const cleanClientName = (report.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Laudo_${report.code}_${cleanClientName}.pdf`;

  // Gera Blob e File para compartilhamento nativo
  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  const planName = report.planType.toUpperCase();
  const discName = MAINTENANCE_DISCIPLINES[report.discipline]?.name || 'Geral';
  const statusStr =
    report.generalStatus === 'aprovado'
      ? 'CONFORME / APROVADO'
      : 'COM RESSALVAS TÉCNICAS';

  const shareText =
    `Olá! Segue o Laudo Técnico em PDF do Plano de Manutenção (${planName}) referente a ${report.equipmentName}.\n\n` +
    `Protocolo: ${report.code}\n` +
    `Especialidade: ${discName}\n` +
    `Status: ${statusStr}\n` +
    `Responsável: ${report.technicianName || profile.ownerName}\n\n` +
    `Documento emitido via Aferix — Soluções para ERP.`;

  // Tenta compartilhamento nativo de arquivo (Android / iOS / Navegadores compatíveis)
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `Laudo Técnico ${report.code}`,
        text: shareText,
      });
      return { method: 'direct_share', fileName };
    } catch (err: any) {
      // Se o usuário cancelou o seletor nativo, encerra suavemente
      if (err?.name === 'AbortError') {
        return { method: 'direct_share', fileName };
      }
      // Se falhou por outro motivo, continua para o fallback
    }
  }

  // Fallback: Dispara o download automático do PDF e abre o WhatsApp
  doc.save(fileName);

  const cleanPhone = clientPhone ? clientPhone.replace(/\D/g, '') : '';
  const phoneWithCountry = cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`) : '';

  const waText = encodeURIComponent(
    `*LAUDO TÉCNICO EM PDF (${planName}) - AFERIX*\n\n` +
      `*Protocolo:* ${report.code}\n` +
      `*Especialidade:* ${discName}\n` +
      `*Cliente:* ${report.clientName}\n` +
      `*Equipamento:* ${report.equipmentName}\n` +
      `*Status:* ${statusStr}\n\n` +
      `📄 *O arquivo PDF com o laudo completo foi gerado e está pronto para anexar nesta conversa:*\n` +
      `_${fileName}_\n\n` +
      `Emitido por ${profile.businessName || 'Aferix Field OS'}.`
  );

  const url = phoneWithCountry
    ? `https://wa.me/${phoneWithCountry}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  window.open(url, '_blank');

  return { method: 'download_and_whatsapp', fileName };
}
