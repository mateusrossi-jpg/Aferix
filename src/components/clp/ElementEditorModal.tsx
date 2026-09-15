import React, { useState } from 'react';
import { LadderElement, ContactType, CoilType, ElementType } from '../../clp/types';
import { X, Trash2, Check, Clock, Cpu, Tag } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ElementEditorModalProps {
  element: LadderElement | null;
  isOutput?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: LadderElement) => void;
  onDelete?: () => void;
}

export const ElementEditorModal: React.FC<ElementEditorModalProps> = ({
  element,
  isOutput = false,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { isDark } = useTheme();

  if (!isOpen || !element) return null;

  const [type, setType] = useState<ElementType>(element.type);
  const [address, setAddress] = useState(element.address);
  const [tag, setTag] = useState(element.tag || '');
  const [presetTime, setPresetTime] = useState<number>(element.presetTime ?? 5.0);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...element,
      type,
      address,
      tag: tag.trim() || undefined,
      presetTime: type === 'ton' || type === 'tof' ? Number(presetTime) : undefined,
    });
    onClose();
  };

  const contactTypes: { id: ContactType; label: string; symbol: string }[] = [
    { id: 'contact_no', label: 'Normal Aberto (NA)', symbol: '—[ ]—' },
    { id: 'contact_nc', label: 'Normal Fechado (NF)', symbol: '—[/]—' },
    { id: 'rising_edge', label: 'Borda de Subida', symbol: '—[P]—' },
    { id: 'falling_edge', label: 'Borda de Descida', symbol: '—[N]—' },
  ];

  const coilTypes: { id: CoilType; label: string; symbol: string }[] = [
    { id: 'coil', label: 'Bobina Simples', symbol: '—( )—' },
    { id: 'coil_not', label: 'Bobina Negada', symbol: '—(/)—' },
    { id: 'coil_set', label: 'Bobina Set (Latch)', symbol: '—(S)—' },
    { id: 'coil_reset', label: 'Bobina Reset (Unlatch)', symbol: '—(R)—' },
    { id: 'ton', label: 'Temporizador On-Delay', symbol: '[TON]' },
    { id: 'tof', label: 'Temporizador Off-Delay', symbol: '[TOF]' },
  ];

  const commonAddresses = isOutput
    ? ['%Q0.0', '%Q0.1', '%Q0.2', '%Q0.3', '%Q0.4', '%Q0.5', '%M0.0', '%M0.1', 'T0', 'T1']
    : ['%I0.0', '%I0.1', '%I0.2', '%I0.3', '%I0.4', '%I0.5', '%Q0.0', '%Q0.1', '%M0.0', 'T0', 'T1'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl transition-all duration-150 ${
          isDark
            ? 'bg-[#101726] border-white/15 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-base">
              {isOutput ? 'Editar Saída / Bobina' : 'Editar Contato Ladder'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Seletor de Tipo de Instrução */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Tipo de Instrução
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(isOutput ? coilTypes : contactTypes).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setType(t.id);
                    if ((t.id === 'ton' || t.id === 'tof') && !address.startsWith('T')) {
                      setAddress('T0');
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all ${
                    type === t.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold'
                      : isDark
                      ? 'bg-slate-800/40 border-white/5 text-slate-300 hover:border-white/20'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono text-sm tracking-wider">{t.symbol}</span>
                  <span className="text-[10px] mt-0.5 opacity-90">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Endereço de Memória ou I/O */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Endereço IEC (%I0.X / %Q0.X / %M0.X / T0..T3)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value.toUpperCase())}
              placeholder="%I0.0"
              required
              className={`w-full rounded-xl px-3 py-2 text-sm font-mono border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-[#182234] border-white/10 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            {/* Sugestões rápidas de endereços */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {commonAddresses.map((addr) => (
                <button
                  key={addr}
                  type="button"
                  onClick={() => setAddress(addr)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-mono border transition-all ${
                    address === addr
                      ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                      : isDark
                      ? 'bg-slate-800/60 border-white/5 text-slate-400 hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {addr}
                </button>
              ))}
            </div>
          </div>

          {/* Tag Mnemônica / Descrição */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              <span>Nome / Tag Descritiva</span>
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Ex: Botoeira Liga (S1) ou K1 Motor"
              className={`w-full rounded-xl px-3 py-2 text-sm border focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-[#182234] border-white/10 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Parâmetro de Tempo para Temporizador TON/TOF */}
          {(type === 'ton' || type === 'tof') && (
            <div>
              <label className="block text-xs font-medium text-amber-400 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Tempo Pré-Ajustado (Preset Time em Segundos)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="300"
                value={presetTime}
                onChange={(e) => setPresetTime(parseFloat(e.target.value) || 1)}
                className={`w-full rounded-xl px-3 py-2 text-sm font-mono border focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                  isDark
                    ? 'bg-[#182234] border-amber-500/30 text-white'
                    : 'bg-amber-50/50 border-amber-300 text-slate-900'
                }`}
              />
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {onDelete && !isOutput ? (
              <button
                type="button"
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Salvar</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
