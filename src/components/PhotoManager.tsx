import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Trash2, Plus } from 'lucide-react';
import { JobPhoto } from '../types';
import { useTheme } from '../context/ThemeContext';

interface PhotoManagerProps {
  photos: JobPhoto[];
  onAddPhoto: (photo: Omit<JobPhoto, 'id' | 'timestamp'>) => void;
  onRemovePhoto: (id: string) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  photos,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = React.useState<'antes' | 'durante' | 'depois'>('antes');
  const [caption, setCaption] = React.useState('');

  const compressAndProcessImage = (dataUrl: string, callback: (compressedUrl: string) => void) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800; // max width/height suitable for field reports
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.72 quality for ultra compact footprint (~40-70kb)
        const compressed = canvas.toDataURL('image/jpeg', 0.72);
        callback(compressed);
      } else {
        callback(dataUrl);
      }
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const rawResult = reader.result;
        compressAndProcessImage(rawResult, (compressedUrl) => {
          onAddPhoto({
            url: compressedUrl,
            caption: caption.trim() || (selectedType === 'antes' ? 'Estado Inicial' : selectedType === 'durante' ? 'Em Execução' : 'Serviço Finalizado'),
            type: selectedType,
          });
          setCaption('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const typeConfig = {
    antes: { label: 'Antes', color: 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border-rose-500/30' },
    durante: { label: 'Durante', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    depois: { label: 'Depois', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  };

  return (
    <div
      className={`space-y-3 p-4 rounded-xl border transition-all ${
        isDark ? 'bg-[#0A0F1D] border-white/[0.07]' : 'bg-slate-50 border-slate-200/80'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Fotos de Campo (Antes & Depois)
          </span>
        </div>
        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{photos.length} fotos registradas</span>
      </div>

      {/* Upload Controls */}
      <div
        className={`space-y-2 p-3 rounded-xl border ${
          isDark ? 'bg-[#090E17] border-white/[0.06]' : 'bg-white border-slate-200/80'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {(['antes', 'durante', 'depois'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelectedType(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedType === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-white/5 text-slate-400 hover:text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Legenda da foto (opcional)..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className={`flex-1 rounded-xl px-3 py-2 text-xs border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
              isDark
                ? 'bg-[#090E17] border-white/10 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-[#0F172A] placeholder-slate-400'
            }`}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 transition-all active:scale-95 shadow-sm shadow-blue-600/20"
          >
            <Camera className="w-4 h-4" /> Anexar Foto
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Photos Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={`group relative rounded-xl overflow-hidden border aspect-video flex flex-col justify-end ${
                isDark ? 'bg-[#090E17] border-white/10' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.caption}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

              <div className="relative p-2 z-10 flex items-end justify-between gap-1">
                <div className="min-w-0">
                  <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border inline-block ${typeConfig[photo.type].color}`}>
                    {typeConfig[photo.type].label}
                  </span>
                  <p className="text-[10px] text-white font-medium truncate mt-0.5">
                    {photo.caption}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemovePhoto(photo.id)}
                  aria-label="Remover foto"
                  className="p-1 rounded-lg bg-black/60 text-rose-400 hover:text-rose-300 hover:bg-black transition-all shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`text-center py-4 text-xs border border-dashed rounded-xl ${
          isDark ? 'text-slate-500 border-white/10' : 'text-slate-400 border-slate-300'
        }`}>
          Nenhuma foto anexada ainda. Adicione fotos do quadro, cabeamento ou laudo para comprovação.
        </div>
      )}
    </div>
  );
};
