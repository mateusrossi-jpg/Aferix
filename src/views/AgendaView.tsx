import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  User,
  CheckCircle2,
  X,
  Phone,
  Navigation,
} from 'lucide-react';
import { Appointment, Client } from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/UIStates';

interface AgendaViewProps {
  appointments: Appointment[];
  clients: Client[];
}

export const AgendaView: React.FC<AgendaViewProps> = ({ appointments, clients }) => {
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<Appointment['type']>('visita_tecnica');

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId);
    const clientName = client ? client.name : 'Cliente Avulso';

    aferixStore.addAppointment({
      title: title.trim() || 'Atendimento em Campo',
      clientId: clientId || 'c_temp',
      clientName,
      date,
      time,
      address: address || client?.address || 'Endereço a confirmar',
      status: 'agendado',
      type,
    });

    setShowModal(false);
    setTitle('');
    setAddress('');
  };

  const handleToggleStatus = (id: string, current: Appointment['status']) => {
    const next =
      current === 'agendado'
        ? 'em_andamento'
        : current === 'em_andamento'
        ? 'concluido'
        : 'agendado';
    aferixStore.updateAppointmentStatus(id, next);
  };

  const handleStartRoute = (addressStr: string) => {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`,
      '_blank'
    );
  };

  return (
    <div className="space-y-6 pb-28 text-left animate-fade-in-up">
      {/* Header action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">Cronograma & Visitas</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {appointments.length} atendimentos agendados
          </p>
        </div>
        <button
          id="btn-agenda-new"
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-all duration-150 active:scale-[0.98] shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.25)] border border-blue-400/30 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Agendar Visita</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Nenhum atendimento agendado"
            description="Sua agenda está livre. Adicione uma visita técnica ou instalação."
            actionLabel="Agendar Visita"
            onAction={() => setShowModal(true)}
          />
        ) : (
          appointments.map((app) => (
            <div
              key={app.id}
              className={`rounded-2xl p-4 sm:p-5 border aferix-card space-y-3.5 transition-all duration-200 ${
                isDark
                  ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
                  : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                        app.status === 'concluido'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : app.status === 'em_andamento'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {app.status === 'concluido'
                        ? 'Concluído'
                        : app.status === 'em_andamento'
                        ? 'Em Andamento'
                        : 'Agendado'}
                    </span>
                    <span className="text-xs font-bold font-mono text-blue-600 dark:text-blue-400">
                      {app.date.split('-').reverse().slice(0, 2).join('/')} às {app.time}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold truncate tracking-tight">{app.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5" />
                      {app.clientName}
                    </span>
                    {app.address && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {app.address}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleStatus(app.id, app.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 active:scale-95 shrink-0 shadow-xs ${
                    app.status === 'concluido'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : isDark
                      ? 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {app.status === 'concluido' ? 'Concluído ✓' : 'Avançar Status'}
                </button>
              </div>

              {app.address && (
                <div
                  className={`pt-2.5 border-t flex gap-2 ${
                    isDark ? 'border-white/[0.06]' : 'border-slate-100'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleStartRoute(app.address)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-semibold transition-all duration-150 active:scale-98 ${
                      isDark
                        ? 'bg-white/[0.04] border-white/10 text-slate-200 hover:text-white hover:bg-white/[0.08]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-500" />
                    <span>Navegar GPS</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Novo Agendamento */}
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
              <h3 className="text-sm font-bold tracking-tight">Novo Agendamento / Visita</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-slate-400">Título / Serviço</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Visita Técnica de Avaliação"
                  className="w-full rounded-xl px-3 py-2.5 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Cliente</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Horário</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1 text-slate-400">Endereço da Visita</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex: Av. Paulista, 1000 - Apto 42"
                  className="w-full rounded-xl px-3 py-2 border bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
