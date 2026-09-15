import { jsPDF } from 'jspdf';
import { Budget, UserProfile } from '../types';

/**
 * Gera o documento PDF executivo do Orçamento / Proposta Comercial Aferix
 */
export function generateBudgetPdf(budget: Budget, profile: UserProfile): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Paleta Aferix
  const colorPrimary = [13, 79, 156]; // #0D4F9C
  const colorOrange = [245, 130, 32]; // #F58220
  const colorDark = [15, 23, 42]; // #0F172A
  const colorGray = [100, 116, 139]; // #64748B
  const colorLight = [248, 250, 252]; // #F8FAFC
  const colorBorder = [226, 232, 240]; // #E2E8F0

  let y = 14;

  // 1. Barra superior corporativa
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(margin, y, contentWidth, 3, 'F');
  doc.setFillColor(colorOrange[0], colorOrange[1], colorOrange[2]);
  doc.rect(margin + contentWidth - 30, y, 30, 3, 'F');
  y += 7;

  // 2. Cabeçalho da Empresa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text(profile.businessName || 'AFERIX ENGENHARIA & ORÇAMENTOS', margin, y + 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  const contactLine = [
    profile.ownerName ? `Resp: ${profile.ownerName}` : '',
    profile.technicalRegistry ? `Reg: ${profile.technicalRegistry}` : '',
    profile.phone ? `Tel: ${profile.phone}` : '',
    profile.city || '',
  ]
    .filter(Boolean)
    .join('  •  ');
  doc.text(contactLine, margin, y + 9);

  // Logo / Tag canto direito
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text('AFERIX', pageWidth - margin, y + 3, { align: 'right' });
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('Proposta Comercial & OS', pageWidth - margin, y + 7, { align: 'right' });

  y += 15;

  // Linha divisória
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 6;

  // 3. Título e Bloco de Informações do Orçamento
  doc.setFillColor(colorLight[0], colorLight[1], colorLight[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.text('PROPOSTA COMERCIAL / ORÇAMENTO', margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(budget.title || 'Serviços de Instalação e Manutenção', margin + 5, y + 13);

  doc.setFontSize(7.5);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text(`Status: ${(budget.status || 'orcamento').toUpperCase()}`, margin + 5, y + 19);

  // Código / Data à direita
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(`REF: ${budget.code || '#' + budget.id.slice(-6).toUpperCase()}`, pageWidth - margin - 5, y + 8, {
    align: 'right',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  const formattedDate = budget.date ? budget.date.split('-').reverse().join('/') : '';
  doc.text(`Data: ${formattedDate}`, pageWidth - margin - 5, y + 13, { align: 'right' });

  y += 29;

  // 4. Dados do Cliente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('1. DADOS DO CLIENTE', margin, y);
  y += 3;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);

  doc.text('Cliente:', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(budget.clientName || 'Cliente', margin + 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('Telefone / WhatsApp:', margin + 110, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(budget.clientPhone || 'Não informado', margin + 145, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('Endereço:', margin + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(budget.clientAddress || 'Endereço do local', margin + 20, y + 12);

  y += 22;

  // 5. Tabela de Itens do Orçamento
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('2. DISCRIMINAÇÃO DOS SERVIÇOS E MATERIAIS', margin, y);
  y += 3;

  const thHeight = 6.5;
  doc.setFillColor(colorPrimary[0], colorPrimary[1], colorPrimary[2]);
  doc.rect(margin, y, contentWidth, thHeight, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIÇÃO DO ITEM / SERVIÇO', margin + 4, y + 4.5);
  doc.text('QTD', margin + 115, y + 4.5, { align: 'center' });
  doc.text('VALOR UNIT.', margin + 140, y + 4.5, { align: 'right' });
  doc.text('TOTAL', pageWidth - margin - 5, y + 4.5, { align: 'right' });

  y += thHeight;

  const items = budget.items || [];
  const rowHeight = 7.5;

  items.forEach((item, index) => {
    if (y > pageHeight - 50) {
      doc.addPage();
      y = 15;
    }

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    const label = item.name.length > 60 ? item.name.slice(0, 58) + '...' : item.name;
    doc.text(label, margin + 4, y + 4.8);

    doc.text(`${item.qty} ${item.unit || 'un'}`, margin + 115, y + 4.8, { align: 'center' });
    doc.text(`R$ ${item.unitPrice.toFixed(2)}`, margin + 140, y + 4.8, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(`R$ ${item.total.toFixed(2)}`, pageWidth - margin - 5, y + 4.8, { align: 'right' });

    y += rowHeight;
  });

  doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
  doc.rect(margin, y - thHeight - items.length * rowHeight, contentWidth, thHeight + items.length * rowHeight, 'S');

  y += 4;

  // Valor Total Destacado
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(pageWidth - margin - 70, y, 70, 12, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(5, 150, 105);
  doc.text('VALOR TOTAL DA PROPOSTA:', pageWidth - margin - 65, y + 5);

  doc.setFontSize(11);
  doc.text(`R$ ${budget.totalValue.toFixed(2)}`, pageWidth - margin - 5, y + 10, { align: 'right' });

  y += 18;

  // 6. Observações / Condições de Pagamento
  if (budget.notes) {
    if (y > pageHeight - 45) {
      doc.addPage();
      y = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text('3. CONDIÇÕES E OBSERVAÇÕES', margin, y);
    y += 3;

    doc.setFillColor(colorLight[0], colorLight[1], colorLight[2]);
    doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    const splitNotes = doc.splitTextToSize(budget.notes, contentWidth - 8);
    doc.text(splitNotes, margin + 4, y + 6);

    y += 20;
  }

  // 7. Registro Fotográfico de Campo (Se houver fotos anexadas)
  if (budget.photos && budget.photos.length > 0) {
    if (y > pageHeight - 65) {
      doc.addPage();
      y = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
    doc.text('4. EVIDÊNCIAS FOTOGRÁFICAS DE CAMPO', margin, y);
    y += 4;

    const availablePhotos = budget.photos.slice(0, 3);
    const photoWidth = (contentWidth - (availablePhotos.length - 1) * 4) / availablePhotos.length;
    const photoHeight = 28;

    availablePhotos.forEach((photo, idx) => {
      const pX = margin + idx * (photoWidth + 4);
      try {
        doc.setFillColor(245, 247, 250);
        doc.rect(pX, y, photoWidth, photoHeight, 'F');
        doc.addImage(photo.url, 'JPEG', pX, y, photoWidth, photoHeight);
        doc.setDrawColor(colorBorder[0], colorBorder[1], colorBorder[2]);
        doc.rect(pX, y, photoWidth, photoHeight, 'S');

        // Legenda / Tipo
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
        const caption = `${photo.type.toUpperCase()}: ${photo.caption}`.slice(0, 28);
        doc.text(caption, pX + 2, y + photoHeight + 3.5);
      } catch {
        // Fallback se imagem for inválida
      }
    });

    y += photoHeight + 8;
  }

  // 8. Campo de Assinatura e QR Code Pix
  if (y > pageHeight - 45) {
    doc.addPage();
    y = 15;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text('5. VALIDAÇÃO E FORMA DE PAGAMENTO', margin, y);
  y += 10;

  const signWidth = (contentWidth - 12) / 2;
  doc.setDrawColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + signWidth, y);

  if (budget.clientSignature) {
    try {
      doc.addImage(budget.clientSignature, 'PNG', margin + (signWidth - 40) / 2, y - 11, 40, 10);
    } catch {
      // Fallback
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(colorDark[0], colorDark[1], colorDark[2]);
  doc.text(budget.clientSignerName || budget.clientName, margin + signWidth / 2, y + 4, {
    align: 'center',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text('Aprovação do Cliente / Contratante', margin + signWidth / 2, y + 8, { align: 'center' });

  // Rodapé do Sistema
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(colorGray[0], colorGray[1], colorGray[2]);
  doc.text(
    `Proposta gerada eletronicamente via Aferix — Soluções para ERP  •  Ref: #${budget.id.slice(-6)}`,
    margin,
    pageHeight - 8
  );
  doc.text('Página 1 de 1', pageWidth - margin, pageHeight - 8, { align: 'right' });

  return doc;
}

/**
 * Baixa o PDF do orçamento
 */
export function downloadBudgetPdf(budget: Budget, profile: UserProfile): string {
  const doc = generateBudgetPdf(budget, profile);
  const cleanName = (budget.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Orcamento_${budget.id.slice(-6)}_${cleanName}.pdf`;
  doc.save(fileName);
  return fileName;
}

/**
 * Compartilha o orçamento em PDF no WhatsApp (com Web Share API ou download + link)
 */
export async function shareBudgetPdfViaWhatsApp(
  budget: Budget,
  profile: UserProfile
): Promise<{ method: 'direct_share' | 'download_and_whatsapp'; fileName: string }> {
  const doc = generateBudgetPdf(budget, profile);
  const cleanName = (budget.clientName || 'Cliente').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Orcamento_${budget.id.slice(-6)}_${cleanName}.pdf`;

  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

  const shareText =
    `Olá, ${budget.clientName}! Segue em anexo a Proposta Comercial / Orçamento oficial (${budget.title}) no valor de R$ ${budget.totalValue.toFixed(2)}.\n\n` +
    `Emitido via ${profile.businessName || 'Aferix'}.`;

  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [pdfFile] })
  ) {
    try {
      await navigator.share({
        files: [pdfFile],
        title: `Orçamento ${budget.title}`,
        text: shareText,
      });
      return { method: 'direct_share', fileName };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return { method: 'direct_share', fileName };
      }
    }
  }

  // Fallback: Download + WhatsApp Web link
  doc.save(fileName);

  const cleanPhone = budget.clientPhone ? budget.clientPhone.replace(/\D/g, '') : '';
  const phoneWithCountry = cleanPhone ? (cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`) : '';

  const waText = encodeURIComponent(
    `*PROPOSTA COMERCIAL / ORÇAMENTO - AFERIX*\n\n` +
      `*Serviço:* ${budget.title}\n` +
      `*Valor Total:* R$ ${budget.totalValue.toFixed(2)}\n` +
      `*Cliente:* ${budget.clientName}\n\n` +
      `📄 *O arquivo PDF com o orçamento detalhado foi gerado e está pronto para anexar nesta conversa:*\n` +
      `_${fileName}_\n\n` +
      `Emitido por ${profile.businessName || 'Aferix'}.`
  );

  const url = phoneWithCountry
    ? `https://wa.me/${phoneWithCountry}?text=${waText}`
    : `https://wa.me/?text=${waText}`;

  window.open(url, '_blank');

  return { method: 'download_and_whatsapp', fileName };
}
