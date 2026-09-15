import React, { useState, useMemo } from 'react';
import { Search, X, ClipboardList, Users, Layers, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { Budget, Client, CatalogItem, Appointment, ActiveTab } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgets: Budget[];
  clients: Client[];
  catalog: CatalogItem[];
  appointments: Appointment[];
  onSelectBudget: (budget: Budget) => void;
  onNavigateTab: (tab: ActiveTab) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  budgets,
  clients,
  catalog,
  appointments,
  onSelectBudget,
  onNavigateTab,
}) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { budgets: [], clients: [], catalog: [], appointments: [] };

    return {
      budgets: budgets.filter(
        b =>
          b.title.toLowerCase().includes(q) ||
          b.clientName.toLowerCase().includes(q) ||
          b.code.toLowerCase().includes(q)
      ).slice(0, 4),
      clients: clients.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.city.toLowerCase().includes(q)
      ).slice(0, 4),
      catalog: catalog.filter(
        k =>
          k.name.toLowerCase().includes(q) ||
          k.category.toLowerCase().includes(q)
      ).slice(0, 4),
      appointments: appointments.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.clientName.toLowerCase().includes(q) ||
          a.address.toLowerCase().includes(q)
      ).slice(0, 4),
    };
  }, [query, budgets, clients, catalog, appointments]);

  if (!isOpen) return null;

  const totalResults =
    results.budgets.length +
    results.clients.length +
    results.catalog.length +
    results.appointments.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-4 pt-16 sm:pt-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-up transition-all ${
          isDark
            ? 'bg-[#0F1626] border-white/10 text-white shadow-[0_24px_48px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)]'
            : 'bg-white border-slate-200/90 text-[#0F172A] shadow-2xl'
        }`}
      >
        {/* Search Input Bar */}
        <div
          className={`p-3.5 border-b flex items-center gap-2.5 ${
            isDark ? 'border-white/[0.08] bg-[#0A0F1D]' : 'border-slate-200/80 bg-slate-50'
          }`}
        >
          <Search className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0 ml-1" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar por cliente, OS, serviço ou data..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`flex-1 bg-transparent text-sm focus:outline-none ${
              isDark ? 'text-white placeholder-slate-500' : 'text-[#0F172A] placeholder-slate-400'
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className={`p-1 rounded-md transition-all ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              isDark
                ? 'border-white/10 bg-[#090E17] text-slate-300 hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
            }`}
          >
            Esc
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query ? (
            <div className={`text-center py-8 space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Search className={`w-8 h-8 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
              <p className="text-xs font-semibold">Digite para buscar em todo o Aferix</p>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2">
                {['#1025', 'João Silva', 'Quadro elétrico', 'Hoje'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setQuery(tag)}
                    className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-all ${
                      isDark
                        ? 'bg-[#0A0F1D] border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
                        : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className={`text-center py-8 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Nenhum resultado encontrado para "<span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{query}</span>".
            </div>
          ) : (
            <div className="space-y-4">
              {/* Budgets */}
              {results.budgets.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <span className="flex items-center gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5" /> Orçamentos & OS ({results.budgets.length})
                    </span>
                  </div>
                  <div className={`divide-y rounded-xl border overflow-hidden ${
                    isDark ? 'bg-[#0A0F1D] border-white/[0.07] divide-white/[0.05]' : 'bg-slate-50 border-slate-200/80 divide-slate-200/80'
                  }`}>
                    {results.budgets.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          onSelectBudget(b);
                          onClose();
                        }}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-all ${
                          isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{b.code}</span>
                            <span className="text-xs font-bold">{b.title}</span>
                          </div>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{b.clientName} • {b.date}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            R$ {b.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clients */}
              {results.clients.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Clientes ({results.clients.length})
                    </span>
                  </div>
                  <div className={`divide-y rounded-xl border overflow-hidden ${
                    isDark ? 'bg-[#0A0F1D] border-white/[0.07] divide-white/[0.05]' : 'bg-slate-50 border-slate-200/80 divide-slate-200/80'
                  }`}>
                    {results.clients.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigateTab('clientes');
                          onClose();
                        }}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-all text-xs ${
                          isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-100/80'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{c.name}</p>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c.phone} • {c.city}</p>
                        </div>
                        <ArrowRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catalog */}
              {results.catalog.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Catálogo & Preços ({results.catalog.length})
                    </span>
                  </div>
                  <div className={`divide-y rounded-xl border overflow-hidden ${
                    isDark ? 'bg-[#0A0F1D] border-white/[0.07] divide-white/[0.05]' : 'bg-slate-50 border-slate-200/80 divide-slate-200/80'
                  }`}>
                    {results.catalog.map((k) => (
                      <div
                        key={k.id}
                        onClick={() => {
                          onNavigateTab('catalogo');
                          onClose();
                        }}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-all text-xs ${
                          isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-100/80'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{k.name}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isDark ? 'bg-[#090E17] text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {k.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">R$ {k.price.toFixed(2)}</span>
                          <span className={`block text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Custo: R$ {k.cost.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments */}
              {results.appointments.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Agenda & Visitas ({results.appointments.length})
                    </span>
                  </div>
                  <div className={`divide-y rounded-xl border overflow-hidden ${
                    isDark ? 'bg-[#0A0F1D] border-white/[0.07] divide-white/[0.05]' : 'bg-slate-50 border-slate-200/80 divide-slate-200/80'
                  }`}>
                    {results.appointments.map((a) => (
                      <div
                        key={a.id}
                        onClick={() => {
                          onNavigateTab('agenda');
                          onClose();
                        }}
                        className={`p-3 flex items-center justify-between cursor-pointer transition-all text-xs ${
                          isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-100/80'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{a.title}</p>
                          <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{a.clientName} • {a.date} às {a.time}</p>
                        </div>
                        <ArrowRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
