import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Tag,
  X,
  DollarSign,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { CatalogItem } from '../types';
import { aferixStore } from '../storage/store';
import { useTheme } from '../context/ThemeContext';
import { EmptyState } from '../components/UIStates';

interface CatalogoViewProps {
  catalog: CatalogItem[];
}

export const CatalogoView: React.FC<CatalogoViewProps> = ({ catalog }) => {
  const { isDark } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [search, setSearch] = useState('');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Serviço' | 'Material' | 'Mão de obra'>('Serviço');
  const [unit, setUnit] = useState('un');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(price);
    const c = parseFloat(cost) || 0;
    if (!name.trim() || isNaN(p)) return;

    aferixStore.addCatalogItem({
      name: name.trim(),
      category,
      unit,
      price: p,
      cost: c,
    });

    setShowModal(false);
    setName('');
    setPrice('');
    setCost('');
  };

  const filteredItems = catalog.filter((item) => {
    const matchesCat = selectedCategory === 'todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-28 text-left animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">Tabela de Preços & Serviços</h2>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {catalog.length} itens cadastrados no catálogo
          </p>
        </div>
        <button
          id="btn-catalogo-new"
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white transition-all duration-150 active:scale-[0.98] shadow-md shadow-blue-600/20 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Adicionar Item</span>
        </button>
      </div>

      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar no catálogo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-xl pl-10 pr-3.5 py-2.5 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isDark
                ? 'bg-[#0F1626] border-white/10 text-white placeholder-slate-500 focus:border-blue-500'
                : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['todos', 'Serviço', 'Material', 'Mão de obra'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-[#0F1626] text-slate-400 border border-white/[0.07] hover:text-slate-200 hover:bg-white/[0.04]'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {cat === 'todos' ? 'Todos os Itens' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={Layers}
              title="Nenhum item encontrado"
              description="Adicione itens à sua tabela de preços para orçamentos rápidos."
              actionLabel="Adicionar Item"
              onAction={() => setShowModal(true)}
            />
          </div>
        ) : (
          filteredItems.map((item) => {
            const margin =
              item.price > 0
                ? Math.round(((item.price - (item.cost || 0)) / item.price) * 100)
                : 0;
            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 sm:p-5 border aferix-card space-y-2.5 transition-all duration-200 ${
                  isDark
                    ? 'bg-[#0F1626] border-white/[0.07] text-white shadow-[0_1px_3px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'bg-white border-slate-200/80 text-[#0F172A] shadow-[0_1px_3px_rgba(15,23,42,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      isDark
                        ? 'bg-white/[0.06] text-slate-300'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.category} • {item.unit}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {margin}% margem
                  </span>
                </div>

                <h3 className="text-sm font-bold truncate">{item.name}</h3>

                <div className={`flex items-center justify-between pt-2 border-t text-xs ${
                  isDark ? 'border-white/[0.06]' : 'border-slate-100'
                }`}>
                  <div>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Custo Base: </span>
                    <span className="font-semibold">
                      R$ {(item.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Preço Final: </span>
                    <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                      R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Novo Item */}
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
              <h3 className="text-sm font-bold tracking-tight">Novo Item da Tabela</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1 text-slate-400">Nome do Item / Serviço</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Instalação de Ponto Elétrico"
                  className={`w-full rounded-xl px-3 py-2.5 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isDark
                      ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                      : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full rounded-xl px-3 py-2.5 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white'
                        : 'bg-white border-slate-200/90 text-[#0F172A]'
                    }`}
                  >
                    <option value="Serviço">Serviço</option>
                    <option value="Material">Material</option>
                    <option value="Mão de obra">Mão de obra</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Unidade</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="un, m, hora..."
                    className={`w-full rounded-xl px-3 py-2.5 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Custo Base (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0,00"
                    className={`w-full rounded-xl px-3 py-2.5 border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1 text-slate-400">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0,00"
                    className={`w-full rounded-xl px-3 py-2.5 border font-bold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDark
                        ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                        : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    isDark
                      ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all duration-150 active:scale-[0.98] shadow-sm shadow-blue-600/20"
                >
                  Salvar Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
