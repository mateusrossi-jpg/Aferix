import React, { useState } from 'react';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useTheme } from '../context/ThemeContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { isDark } = useTheme();

  // If already running as standalone PWA, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
          compact
            ? 'p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
            : 'px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-500 hover:to-indigo-500'
        }`}
        title="Instalar Aferix no celular ou desktop"
      >
        <Download className="w-3.5 h-3.5" />
        {!compact && <span>Instalar App</span>}
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
            compact
              ? 'p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : 'px-3 py-1.5 border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/15'
          }`}
          title="Instalar no iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5" />
          {!compact && <span>Instalar no iOS</span>}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div
              className={`w-full max-w-sm rounded-2xl p-5 border shadow-2xl space-y-4 ${
                isDark ? 'bg-[#0F1626] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold">Instalar Aferix no iPhone</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <p>Para usar o Aferix em tela cheia e 100% offline no iOS:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="font-bold text-blue-400 shrink-0">1.</span>
                    <span>
                      Toque no botão de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra do Safari.
                    </span>
                  </div>
                  <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="font-bold text-blue-400 shrink-0">2.</span>
                    <span>
                      Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
