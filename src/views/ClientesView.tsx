import React, { useState } from 'react';
import {
  Users,
  Plus,
  Phone,
  MapPin,
  Mail,
  MessageSquare,
  X,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { Client } from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/UIStates';

interface ClientesViewProps {
  clients: Client[];
}

export const ClientesView: React.FC<ClientesViewProps> = ({ clients }) => {
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('São Paulo, SP');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    aferixStore.addClient({
      name: name.trim(),
      phone: phone || '(11) 99999-9999',
      email: email || undefined,
      city,
      address: address || 'Endereço não informado',
      notes: notes || undefined,
    });

    setShowModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
  };

  const handleWhatsApp = (phoneStr: string, clientName: string) => {
    const clean = phoneStr.replace(/\D/g, '');
    const full = clean.startsWith('55') ? clean : `55${clean}`;
    window.open(
      `https://wa.me/${full}?text=${encodeURIComponent(
        `Olá ${clientName}, tudo bem? Aqui é da Aferix.`
      )}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6 pb-28 text-left animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">Carteira de Clientes</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {clients.length} clientes cadastrados
          </p>
        </div>
        <button
          id="btn-clientes-new"
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-150 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25)] border border-blue-400/30 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* Client List */}
      <div>
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado"
            description="Cadastre clientes para vincular a ordens de serviço e faturamento."
            actionLabel="Cadastrar Cliente"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {clients.map((client) => (
              <div
                key={client.id}
                className={`rounded-2xl p-4 sm:p-5 border aferix-card space-y-3 transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs border border-white/20">
                      {client.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold truncate tracking-tight">{client.name}</h3>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} truncate font-mono`}>
                        {client.phone} • {client.city}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleWhatsApp(client.phone, client.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all duration-150 active:scale-95 shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {client.address && (
                  <div className={`text-xs flex items-center gap-1.5 pt-2 border-t ${
                    isDark ? 'border-white/[0.06] text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div
            className={`relative w-full max-w-md rounded-2xl border p-5 sm:p-6 z-10 space-y-4 animate-fade-in-up ${
              isDark
                ? 'bg-[#0F1626] border-white/10 text-white shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]'
                : 'bg-white border-slate-200/90 text-[#0F172A] shadow-2xl'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-tight">Cadastrar Novo Cliente</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-slate-400">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva ou Empresa XPTO"
                  className="w-full rounded-xl px-3 py-2.5 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-400">WhatsApp / Telefone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98888-7777"
                    className="w-full rounded-xl px-3 py-2.5 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Cidade / UF</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="São Paulo, SP"
                    className="w-full rounded-xl px-3 py-2.5 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Endereço Completo</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, bairro..."
                  className="w-full rounded-xl px-3 py-2.5 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">E-mail (Opcional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="w-full rounded-xl px-3 py-2.5 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
