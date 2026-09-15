// Calculadora de Taxas de Cartão & Parcelamento (Margem Blindada)
// Protege o lucro líquido do eletricista contra perdas nas maquininhas

export interface CardFeeTier {
  installments: number; // 1 a 12
  feePercent: number; // ex: 4.5 para 4.5%
  customerInstallmentValue: number; // valor de cada parcela cobrada do cliente
  customerTotalValue: number; // total cobrado do cliente
  technicianNetValue: number; // valor líquido que cai na conta do prestador
  feeAmount: number; // valor retido pela maquininha
}

export interface MachinePreset {
  id: string;
  name: string;
  debitFee: number;
  credit1xFee: number;
  // Taxa base parcelado + acréscimo por parcela
  creditInstallmentBaseFee: number;
  feePerInstallment: number;
}

export const POPULAR_MACHINES: MachinePreset[] = [
  {
    id: 'padrao',
    name: 'Média de Mercado (Stone / PagBank / Ton)',
    debitFee: 1.99,
    credit1xFee: 4.29,
    creditInstallmentBaseFee: 5.49,
    feePerInstallment: 1.15,
  },
  {
    id: 'infinitepay',
    name: 'InfinitePay / Taxa Reduzida',
    debitFee: 1.38,
    credit1xFee: 3.16,
    creditInstallmentBaseFee: 4.80,
    feePerInstallment: 0.95,
  },
  {
    id: 'mercadopago',
    name: 'Mercado Pago / PagSeguro Padrão',
    debitFee: 2.19,
    credit1xFee: 4.98,
    creditInstallmentBaseFee: 5.99,
    feePerInstallment: 1.35,
  },
];

/**
 * Calcula todas as opções de parcelamento de 1x a 12x
 * @param baseAmount Valor base do orçamento
 * @param passFeeToCustomer Se true, repassa a taxa para o cliente (margem blindada). Se false, prestador absorve.
 * @param machine Maquininha selecionada
 * @param pixDiscountPercent Desconto opcional no Pix à vista (ex: 5%)
 */
export function calculateInstallmentPlan(
  baseAmount: number,
  passFeeToCustomer = true,
  machine: MachinePreset = POPULAR_MACHINES[0],
  pixDiscountPercent = 5
): {
  pixAmount: number;
  pixDiscountValue: number;
  debitOption: {
    total: number;
    fee: number;
    net: number;
  };
  installments: CardFeeTier[];
} {
  const pixDiscountValue = (baseAmount * pixDiscountPercent) / 100;
  const pixAmount = baseAmount - pixDiscountValue;

  // Débito
  let debitTotal = baseAmount;
  let debitFeeAmount = (baseAmount * machine.debitFee) / 100;
  let debitNet = baseAmount - debitFeeAmount;

  if (passFeeToCustomer) {
    // Fórmula de Gross-Up: Total = Base / (1 - taxa)
    debitTotal = baseAmount / (1 - machine.debitFee / 100);
    debitFeeAmount = (debitTotal * machine.debitFee) / 100;
    debitNet = baseAmount;
  }

  const installments: CardFeeTier[] = [];

  for (let n = 1; n <= 12; n++) {
    let feePercent: number;

    if (n === 1) {
      feePercent = machine.credit1xFee;
    } else {
      feePercent = machine.creditInstallmentBaseFee + (n - 2) * machine.feePerInstallment;
    }

    let customerTotal: number;
    let netValue: number;
    let feeAmount: number;

    if (passFeeToCustomer) {
      // Repasse (Margem Blindada): prestador recebe exatamente baseAmount
      customerTotal = baseAmount / (1 - feePercent / 100);
      feeAmount = (customerTotal * feePercent) / 100;
      netValue = baseAmount;
    } else {
      // Absorção: cliente paga baseAmount, prestador arca com a taxa
      customerTotal = baseAmount;
      feeAmount = (baseAmount * feePercent) / 100;
      netValue = baseAmount - feeAmount;
    }

    const customerInstallmentValue = customerTotal / n;

    installments.push({
      installments: n,
      feePercent: Number(feePercent.toFixed(2)),
      customerInstallmentValue: Number(customerInstallmentValue.toFixed(2)),
      customerTotalValue: Number(customerTotal.toFixed(2)),
      technicianNetValue: Number(netValue.toFixed(2)),
      feeAmount: Number(feeAmount.toFixed(2)),
    });
  }

  return {
    pixAmount: Number(pixAmount.toFixed(2)),
    pixDiscountValue: Number(pixDiscountValue.toFixed(2)),
    debitOption: {
      total: Number(debitTotal.toFixed(2)),
      fee: Number(debitFeeAmount.toFixed(2)),
      net: Number(debitNet.toFixed(2)),
    },
    installments,
  };
}

/**
 * Gera mensagem formatada pronta para enviar no WhatsApp do cliente
 */
export function formatPaymentOptionsWhatsApp(
  clientName: string,
  budgetCode: string,
  budgetTitle: string,
  plan: ReturnType<typeof calculateInstallmentPlan>,
  passFeeToCustomer: boolean
): string {
  const t1 = plan.installments[0]; // 1x
  const t3 = plan.installments[2]; // 3x
  const t6 = plan.installments[5]; // 6x
  const t12 = plan.installments[11]; // 12x

  let msg = `Olá, *${clientName}*!\n\n`;
  msg += `Seguem as opções de pagamento para a *OS ${budgetCode}* (${budgetTitle}):\n\n`;
  msg += `⚡ *À VISTA NO PIX (com desconto):*\n`;
  msg += `👉 *R$ ${plan.pixAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n`;

  msg += `💳 *PARCELADO NO CARTÃO:*\n`;
  msg += `• 1x de R$ ${t1.customerTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
  if (t3) {
    msg += `• 3x de R$ ${t3.customerInstallmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Total: R$ ${t3.customerTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})\n`;
  }
  if (t6) {
    msg += `• 6x de R$ ${t6.customerInstallmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Total: R$ ${t6.customerTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})\n`;
  }
  if (t12) {
    msg += `• 12x de R$ ${t12.customerInstallmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Total: R$ ${t12.customerTotalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})\n`;
  }

  msg += `\nQual a melhor opção para você?`;
  return msg;
}
