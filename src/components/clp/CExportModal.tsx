import React, { useState } from 'react';
import { X, Copy, Check, Download, Cpu, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface CExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cCode: string;
  programName: string;
}

export const CExportModal: React.FC<CExportModalProps> = ({
  isOpen,
  onClose,
  cCode,
  programName,
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(cCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([cCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'endap_ladder_program.h';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-2xl border p-5 shadow-2xl flex flex-col max-h-[85vh] transition-all duration-150 ${
          isDark
            ? 'bg-[#0E1524] border-white/15 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Exportar Código C / Ladder</h3>
              <p className="text-xs text-slate-400">
                Código C pronto para compilação determinística em microcontroladores e CLPs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações de Conformidade Industrial */}
        <div className="my-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong>Lógica Determinística Compilada:</strong> As instruções estruturadas acima
            permitem rodar a lógica Ladder em qualquer microcontrolador ou RTOS com ciclo rígido de varredura.
          </div>
        </div>

        {/* Visualizador de Código C com Syntax Styling */}
        <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-[#070B13] p-4 font-mono text-xs text-emerald-400">
          <pre className="whitespace-pre">{cCode}</pre>
        </div>

        {/* Barra de Ações */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10 shrink-0">
          <span className="text-xs text-slate-400 font-mono">endap_ladder_program.h</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Código'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 shadow-lg shadow-emerald-600/30"
            >
              <Download className="w-4 h-4" />
              <span>Baixar .h</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
