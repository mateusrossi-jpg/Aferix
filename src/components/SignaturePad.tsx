import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, X, PenTool } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SignaturePadProps {
  onSave: (dataUrl: string, signerName: string) => void;
  onCancel: () => void;
  defaultSignerName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  onCancel,
  defaultSignerName = '',
}) => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0F172A'; // Dark ink for authentic physical signature feel
    ctx.lineWidth = 2.5;

    // Fill background with pure white so the signature is clean on white PDF documents and transparent in UI
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, [isDark]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, signerName.trim() || 'Cliente / Responsável');
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border space-y-4 transition-all ${
        isDark
          ? 'bg-[#0A0F1D] border-white/[0.08] text-white'
          : 'bg-slate-50 border-slate-200/80 text-[#0F172A]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span className="font-bold text-xs uppercase tracking-tight">
            Assinatura Digital do Cliente no Local
          </span>
        </div>
        <button
          type="button"
          onClick={clearCanvas}
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg border transition-all ${
            isDark
              ? 'bg-[#090E17] border-white/10 text-slate-400 hover:text-white'
              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eraser className="w-3.5 h-3.5" /> Limpar
        </button>
      </div>

      <div>
        <label className={`block text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Nome Completo do Responsável pelo Recebimento:
        </label>
        <input
          type="text"
          placeholder="Ex: João Silva (Proprietário)"
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
          className={`w-full rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            isDark
              ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
              : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
          }`}
        />
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl overflow-hidden touch-none transition-all ${
          isDark
            ? 'border-white/20 bg-[#090E17]'
            : 'border-slate-300 bg-slate-50'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 cursor-crosshair block"
        />
        {!hasDrawn && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none text-xs font-medium ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Assine com o dedo ou caneta nesta área
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
            isDark
              ? 'border-white/10 bg-[#090E17] text-slate-300 hover:text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!hasDrawn}
          onClick={handleConfirm}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            hasDrawn
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 active:scale-[0.98]'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Check className="w-4 h-4" /> Confirmar e Gravar Assinatura
        </button>
      </div>
    </div>
  );
};
