import React, { useState } from 'react';
import { X, Shield, Plus, ShieldCheck, AlertCircle, Wrench, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { Equipment, Client } from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipments: Equipment[];
  clients: Client[];
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  equipments,
  clients,
}) => {
  const { isDark } = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [warrantyUntil, setWarrantyUntil] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const client = clients.find(c => c.id === selectedClientId) || clients[0];

    aferixStore.addEquipment({
      clientId: client?.id || 'c1',
      clientName: client?.name || 'Cliente',
      name: name.trim(),
      brand: brand.trim() || 'Genérica',
      model: model.trim() || 'N/A',
      serialNumber: serialNumber.trim() || `SN-${Date.now().toString().slice(-6)}`,
      installDate: new Date().toISOString().slice(0, 10),
      warrantyUntil: warrantyUntil || new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      location: location.trim() || 'Área Principal',
      status: 'operacional',
      notes: notes.trim(),
    });

    setShowAddForm(false);
    setName('');
    setBrand('');
    setModel('');
    setSerialNumber('');
    setLocation('');
  };

  const isWarrantyValid = (dateStr: string) => {
    return new Date(dateStr) > new Date();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-fade-in-up transition-all ${
          isDark
            ? 'bg-[#0F1626] border-white/10 text-white shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-white border-slate-200/90 text-[#0F172A] shadow-2xl'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b p-4 shrink-0 ${
            isDark ? 'border-white/[0.08] bg-[#0A0F1D]/70' : 'border-slate-200/80 bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400 border border-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base tracking-tight leading-tight">
                Equipamentos & Garantias
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Rastreamento de maquinário, números de série e prazos
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

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className={`font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Equipamentos Cadastrados ({equipments.length})
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition-all shadow-sm shadow-blue-600/20 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> {showAddForm ? 'Cancelar' : 'Novo Equipamento'}
            </button>
          </div>

          {/* New Equipment Form */}
          {showAddForm && (
            <form
              onSubmit={handleAddEquipment}
              className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-tight">Registrar Novo Equipamento</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Cliente
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white'
                        : 'bg-white border-slate-200/90 text-[#0F172A]'
                    }`}
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Nome / Tipo do Equipamento
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gerador Diesel 50kVA"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cummins"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Modelo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: C50D5"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Nº de Série
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: SN-2026-90"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Localização no Imóvel
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sala de Máquinas Subsolo"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Garantia Válida Até
                  </label>
                  <input
                    type="date"
                    value={warrantyUntil}
                    onChange={(e) => setWarrantyUntil(e.target.value)}
                    className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white'
                        : 'bg-white border-slate-200/90 text-[#0F172A]'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                Salvar Equipamento
              </button>
            </form>
          )}

          {/* Equipments List */}
          <div className="space-y-3">
            {equipments.map((eq) => {
              const hasWarranty = isWarrantyValid(eq.warrantyUntil);
              return (
                <div
                  key={eq.id}
                  className={`rounded-2xl p-4 sm:p-5 border aferix-card space-y-2.5 transition-all duration-200 ${
                    isDark
                      ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
                      : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isDark ? 'bg-blue-500/15 text-blue-300' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {eq.brand} • {eq.model}
                      </span>
                      <h4 className="text-sm font-bold mt-1.5">{eq.name}</h4>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {eq.clientName} • {eq.location}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1 ${
                        hasWarranty
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {hasWarranty ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {hasWarranty ? 'Garantia Ativa' : 'Garantia Expirada'}
                      </span>
                      <span className={`block text-[10px] mt-0.5 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        S/N: {eq.serialNumber}
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-center justify-between pt-2 border-t text-[11px] ${
                    isDark ? 'border-white/[0.06] text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span>Instalação: {eq.installDate.split('-').reverse().join('/')}</span>
                    <span>Vencimento: {eq.warrantyUntil.split('-').reverse().join('/')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
