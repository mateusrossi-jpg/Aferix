import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SignatureCanvasPadProps {
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  initialSignature?: string;
  signatoryName: string;
  onSignatoryChange: (name: string) => void;
}

export const SignatureCanvasPad: React.FC<SignatureCanvasPadProps> = ({
  onSave,
  onClear,
  initialSignature,
  signatoryName,
  onSignatoryChange,
}) => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho real do canvas para alta nitidez em retina displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.strokeStyle = isDark ? '#ffffff' : '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasSigned(true);
      };
      img.src = initialSignature;
    }
  }, [isDark, initialSignature]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSigned) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasSigned(false);
    if (onClear) onClear();
    onSave('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={`block text-[11px] font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Assinatura Digital (Toque na tela ou arraste o mouse)
        </label>
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold transition-colors"
        >
          <Eraser className="w-3.5 h-3.5" /> Limpar Assinatura
        </button>
      </div>

      <div
        className={`relative w-full h-32 rounded-xl border overflow-hidden touch-none ${
          isDark
            ? 'bg-[#090E17] border-white/10'
            : 'bg-slate-50 border-slate-200 shadow-inner'
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
          className="w-full h-full cursor-crosshair"
        />
        {!hasSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic opacity-60">
            Assine aqui com o dedo ou mouse...
          </div>
        )}
      </div>

      <div>
        <input
          type="text"
          value={signatoryName}
          onChange={(e) => onSignatoryChange(e.target.value)}
          placeholder="Nome e Cargo do Recebedor (Ex: Carlos Pereira - Gerente Predial)"
          className={`w-full rounded-xl px-3 py-2 text-xs border transition-all ${
            isDark
              ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
              : 'bg-white border-slate-200/90 text-[#0F172A] placeholder-slate-400'
          }`}
        />
      </div>
    </div>
  );
};
