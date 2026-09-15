import React, { useState } from 'react';
import { X, Plus, Trash2, Calculator, Check, User, Phone, MapPin, Tag, ArrowRight, Zap } from 'lucide-react';
import { Budget, BudgetItem, Client, CatalogItem } from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';
import { ELECTRICAL_PACKAGES, ElectricalPackage } from '../data/electricalPackages';

interface NewBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  catalog: CatalogItem[];
  onCreated: (newBudget: Budget) => void;
}

export const NewBudgetModal: React.FC<NewBudgetModalProps> = ({
  isOpen,
  onClose,
  clients,
  catalog,
  onCreated,
}) => {
  if (!isOpen) return null;

  const { isDark } = useTheme();

  // Step state
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'new');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Items state
  const [items, setItems] = useState<BudgetItem[]>([
    {
      id: 'it_1',
      name: 'Mão de obra técnica especializada',
      type: 'mao_de_obra',
      qty: 4,
      unit: 'h',
      unitPrice: 110,
      unitCost: 35,
      total: 440,
    },
  ]);

  // Catalog item picker helper
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('');
  const [appliedPackageId, setAppliedPackageId] = useState<string | null>(null);

  const handleApplyPackage = (pkg: ElectricalPackage) => {
    setTitle(pkg.title);
    setNotes(pkg.description);
    const newItems: BudgetItem[] = pkg.items.map((item, idx) => ({
      ...item,
      id: `it_pkg_${Date.now()}_${idx}`,
    }));
    setItems(newItems);
    setAppliedPackageId(pkg.id);
  };

  const handleAddCatalogItem = (catId: string) => {
    const cat = catalog.find(c => c.id === catId);
    if (!cat) return;

    const newItem: BudgetItem = {
      id: 'it_' + Date.now(),
      name: cat.name,
      type: cat.category === 'Material' ? 'material' : cat.category === 'Mão de obra' ? 'mao_de_obra' : 'servico',
      qty: 1,
      unit: cat.unit,
      unitPrice: cat.price,
      unitCost: cat.cost,
      total: cat.price,
    };
    setItems([...items, newItem]);
    setSelectedCatalogId('');
  };

  const handleAddCustomItem = () => {
    const newItem: BudgetItem = {
      id: 'it_' + Date.now(),
      name: 'Novo Item / Serviço',
      type: 'servico',
      qty: 1,
      unit: 'un',
      unitPrice: 150,
      unitCost: 50,
      total: 150,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof BudgetItem, val: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: val };
      if (field === 'qty' || field === 'unitPrice') {
        updated.total = Number(updated.qty || 0) * Number(updated.unitPrice || 0);
      }
      return updated;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // Calculations
  const totalValue = items.reduce((acc, i) => acc + (Number(i.qty || 0) * Number(i.unitPrice || 0)), 0);
  const totalCost = items.reduce((acc, i) => acc + (Number(i.qty || 0) * Number(i.unitCost || 0)), 0);
  const netProfit = totalValue - totalCost;
  const marginPercent = totalValue > 0 ? (netProfit / totalValue) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    let clientId = selectedClientId;
    let clientName = '';
    let clientPhone = '';
    let clientAddress = '';

    if (selectedClientId === 'new') {
      if (!newClientName.trim()) {
        setFormError('Por favor, informe o nome do cliente para cadastrá-lo.');
        return;
      }
      const createdClient = aferixStore.addClient({
        name: newClientName.trim(),
        phone: newClientPhone.trim() || '(11) 99999-9999',
        city: 'São Paulo, SP',
        address: newClientAddress.trim() || 'Endereço não informado',
      });
      clientId = createdClient.id;
      clientName = createdClient.name;
      clientPhone = createdClient.phone;
      clientAddress = createdClient.address;
    } else {
      const existing = clients.find(c => c.id === selectedClientId);
      if (existing) {
        clientName = existing.name;
        clientPhone = existing.phone;
        clientAddress = existing.address;
      }
    }

    if (items.length === 0) {
      setFormError('Adicione pelo menos um item ao orçamento.');
      return;
    }

    const newBudget = aferixStore.addBudget({
      title: title.trim() || 'Serviço Elétrico & Manutenção',
      clientId,
      clientName,
      clientPhone,
      clientAddress,
      status: 'iniciado',
      date: scheduledDate,
      scheduledTime: scheduledTime || undefined,
      items,
      totalValue,
      totalCost,
      netProfit,
      marginPercent: Number(marginPercent.toFixed(1)),
      notes: notes || 'Orçamento gerado via Aferix ERP.',
    });

    onCreated(newBudget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog container */}
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-sm shadow-blue-600/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg tracking-tight leading-tight">
                Novo Orçamento / Ordem de Serviço
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Levantamento de campo e precificação em tempo real
              </p>
            </div>
          </div>
          <button
            id="btn-close-new-budget-modal"
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {formError}
            </div>
          )}

          {/* Pacotes Rápidos NBR 5410 (Orçamento em < 2 min) */}
          <div
            className={`p-3 sm:p-4 rounded-2xl border space-y-2.5 ${
              isDark
                ? 'bg-gradient-to-r from-blue-950/40 via-[#0F1626] to-emerald-950/30 border-blue-500/30'
                : 'bg-gradient-to-r from-blue-50 via-white to-emerald-50 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
                <Zap className="w-4 h-4 fill-blue-500" />
                <span>Pacotes Rápidos de Serviços (Orçamento em 1 Toque)</span>
              </div>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                NBR 5410
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Selecione um pacote para preencher automaticamente título, materiais e horas de mão de obra:
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {ELECTRICAL_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handleApplyPackage(pkg)}
                  className={`shrink-0 flex flex-col items-start p-2.5 rounded-xl border text-left transition-all active:scale-95 ${
                    appliedPackageId === pkg.id
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400 shadow-md ring-1 ring-emerald-500/50'
                      : isDark
                      ? 'border-white/10 bg-white/[0.03] hover:border-blue-500/40 text-slate-300'
                      : 'border-slate-200 bg-white hover:border-blue-400 text-slate-800 shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <span className="text-xs font-bold truncate max-w-[170px]">{pkg.title}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase bg-blue-500/20 text-blue-400 shrink-0">
                      {pkg.badge}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">
                    ~{pkg.estimatedHours}h • {pkg.items.length} itens inclusos
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Cliente & Serviço */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 1. Dados do Cliente & Serviço
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Cliente</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark
                      ? 'bg-[#0A0F1D] border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200/90 text-[#0F172A]'
                  }`}
                >
                  <option value="new">+ Cadastrar Novo Cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Título do Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: Instalação de Quadro e Reforma"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2.5 text-sm border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark
                      ? 'bg-[#0A0F1D] border-white/10 text-white placeholder-slate-500'
                      : 'bg-slate-50 border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {selectedClientId === 'new' && (
              <div
                className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border ${
                  isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <div>
                  <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Nome do Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs border transition-all ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white focus:border-blue-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>WhatsApp / Telefone</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs border transition-all ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white focus:border-blue-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Endereço do Local</label>
                  <input
                    type="text"
                    placeholder="Rua, número e bairro"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    className={`w-full rounded-lg px-3 py-2 text-xs border transition-all ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white focus:border-blue-500'
                        : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Data Prevista</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border transition-all ${
                    isDark
                      ? 'bg-[#0A0F1D] border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200/90 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs mb-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Horário (Opcional)</label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-sm border transition-all ${
                    isDark
                      ? 'bg-[#0A0F1D] border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200/90 text-slate-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Itens, Serviços & Materiais */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> 2. Composição de Itens & Custos
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-[#090E17] border-white/10 text-white hover:bg-white/5'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> Item Avulso
                </button>
              </div>
            </div>

            {/* Quick Presets for Field Electricians */}
            <div className="space-y-1.5">
              <span className={`block text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                ⚡ Pacotes Rápidos para Campo (1 Toque):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTitle('Montagem e Adequação QGBT & Disjuntores');
                    setItems([
                      { id: 'p1_1', name: 'Mão de obra montagem painel', type: 'mao_de_obra', qty: 6, unit: 'h', unitPrice: 110, unitCost: 35, total: 660 },
                      { id: 'p1_2', name: 'Disjuntor Bipolar 40A DIN', type: 'material', qty: 2, unit: 'un', unitPrice: 125, unitCost: 75, total: 250 },
                      { id: 'p1_3', name: 'Kit terminais e cabos flexíveis', type: 'material', qty: 1, unit: 'cj', unitPrice: 140, unitCost: 80, total: 140 }
                    ]);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                    isDark
                      ? 'bg-[#10172A] border-white/10 hover:border-blue-500/50 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-800'
                  }`}
                >
                  <span>⚡ QGBT & Disjuntores</span>
                  <span className="text-[10px] text-blue-400 font-mono">R$ 1.050</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('Manutenção Preventiva & PMOC Ar-Condicionado');
                    setItems([
                      { id: 'p2_1', name: 'Laudo Técnico PMOC & Checklist', type: 'servico', qty: 1, unit: 'un', unitPrice: 250, unitCost: 50, total: 250 },
                      { id: 'p2_2', name: 'Higienização química evaporadora', type: 'servico', qty: 2, unit: 'un', unitPrice: 180, unitCost: 60, total: 360 }
                    ]);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                    isDark
                      ? 'bg-[#10172A] border-white/10 hover:border-blue-500/50 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-800'
                  }`}
                >
                  <span>❄️ PMOC Climatização</span>
                  <span className="text-[10px] text-blue-400 font-mono">R$ 610</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTitle('Atendimento Emergencial / Diagnóstico Elétrico');
                    setItems([
                      { id: 'p3_1', name: 'Visita técnica e diagnóstico de avarias', type: 'mao_de_obra', qty: 2, unit: 'h', unitPrice: 150, unitCost: 40, total: 300 },
                      { id: 'p3_2', name: 'Substituição componentes de proteção', type: 'material', qty: 1, unit: 'un', unitPrice: 150, unitCost: 80, total: 150 }
                    ]);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all text-xs font-semibold flex items-center justify-between ${
                    isDark
                      ? 'bg-[#10172A] border-white/10 hover:border-blue-500/50 text-slate-200'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-800'
                  }`}
                >
                  <span>🚨 Chamado Urgência</span>
                  <span className="text-[10px] text-blue-400 font-mono">R$ 450</span>
                </button>
              </div>
            </div>

            {/* Quick Catalog Adder */}
            <div className="flex gap-2">
              <select
                value={selectedCatalogId}
                onChange={(e) => {
                  if (e.target.value) handleAddCatalogItem(e.target.value);
                }}
                className={`flex-1 rounded-xl px-3 py-2 text-xs border transition-all ${
                  isDark
                    ? 'bg-[#0A0F1D] border-white/10 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="">+ Puxar item do Catálogo de Preços...</option>
                {catalog.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    [{cat.category}] {cat.name} — R$ {cat.price} (Custo: R$ {cat.cost})
                  </option>
                ))}
              </select>
            </div>

            {/* Items table / list */}
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border space-y-2 transition-all ${
                    isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      placeholder="Descrição do item"
                      className={`flex-1 bg-transparent text-sm font-semibold border-b border-transparent focus:outline-none ${
                        isDark
                          ? 'text-white hover:border-white/20 focus:border-blue-500'
                          : 'text-[#0F172A] hover:border-slate-300 focus:border-blue-500'
                      }`}
                    />
                    <select
                      value={item.type}
                      onChange={(e) => handleUpdateItem(item.id, 'type', e.target.value)}
                      className={`text-[11px] rounded px-2 py-1 border ${
                        isDark
                          ? 'bg-[#090E17] text-slate-300 border-white/[0.08]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="servico">Serviço</option>
                      <option value="material">Material</option>
                      <option value="mao_de_obra">Mão de Obra</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      aria-label="Remover item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <label className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Qtd</label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        className={`w-full rounded px-2 py-1 text-center border focus:outline-none ${
                          isDark
                            ? 'bg-[#090E17] border-white/10 text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Preço Venda (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className={`w-full rounded px-2 py-1 text-right border focus:outline-none ${
                          isDark
                            ? 'bg-[#090E17] border-white/10 text-white'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Custo Direto (R$)</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.unitCost}
                        onChange={(e) => handleUpdateItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)}
                        className={`w-full rounded px-2 py-1 text-right border focus:outline-none ${
                          isDark
                            ? 'bg-[#090E17] border-white/10 text-slate-300'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`text-[10px] block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subtotal</label>
                      <div className="rounded px-2 py-1 text-right font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        R$ {(item.qty * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Margem & Lucro em Tempo Real */}
          <div
            className={`rounded-xl border p-4 space-y-3 ${
              isDark ? 'bg-[#0A0F1D] border-white/[0.08]' : 'bg-slate-50 border-slate-200/80'
            }`}
          >
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <Calculator className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Precificação & Margem Real
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#090E17] border-white/5' : 'bg-white border-slate-200/80'}`}>
                <span className={`text-[10px] uppercase font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Preço Total</span>
                <span className="text-base font-extrabold">
                  R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className={`p-2.5 rounded-lg border ${isDark ? 'bg-[#090E17] border-white/5' : 'bg-white border-slate-200/80'}`}>
                <span className={`text-[10px] uppercase font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Custo Total</span>
                <span className={`text-base font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400 block">Lucro Real</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-500/15 border border-blue-500/30">
                <span className="text-[10px] uppercase font-semibold text-blue-600 dark:text-blue-400 block">Margem Líquida</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  {marginPercent.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className={`block text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Condições & Observações da Proposta</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pagamento 50% no início e 50% na conclusão via PIX. Garantia de 90 dias."
              className={`w-full rounded-xl p-3 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDark
                  ? 'bg-[#0A0F1D] border-white/10 text-white placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200/90 text-[#0F172A] placeholder-slate-400'
              }`}
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              id="btn-submit-new-budget"
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-3.5 px-4 font-bold text-white text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-600/25"
            >
              <Check className="w-5 h-5" />
              Salvar Orçamento & Gerar Proposta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
