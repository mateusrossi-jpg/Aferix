import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface AferixLogoProps {
  variant?: 'horizontal' | 'vertical' | 'compact' | 'hero' | 'full';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Símbolo Oficial Aferix (Isótipo Vetorial)
 * Composto por:
 * 1. Checkmark técnico integrado à perna esquerda do "A" (Azul Corporativo #0D4F9C)
 * 2. Perna direita e barra de base (Azul Corporativo #0D4F9C)
 * 3. Haste diagonal ascendente (Azul Corporativo #0D4F9C)
 * 4. Porca sextavada mecânica com orifício central (Laranja Oficial #F58220)
 */
export const AferixMonogram: React.FC<{
  size?: number;
  className?: string;
  adaptiveDark?: boolean;
}> = ({ size = 32, className = '', adaptiveDark = false }) => {
  const { isDark } = useTheme();

  // No tema escuro, opcionalmente clareia suavemente o azul para contraste ideal sobre fundo escuro
  const strokeColor = adaptiveDark && isDark ? '#3B82F6' : '#0D4F9C';
  const orangeColor = '#F58220';

  return (
    <svg
      width={size}
      height={Math.round((size * 90) / 105)}
      viewBox="0 0 108 92"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Símbolo Aferix"
    >
      {/* Estrutura Principal: Asa Esquerda + Vértice Inferior do V + Triângulo "A" + Base Direita */}
      <path
        d="M 6 45 L 24 45 L 42 79 L 68 21 L 92 79 L 74 79"
        stroke={strokeColor}
        strokeWidth="7.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
      />

      {/* Haste Ascendente Paralela */}
      <path
        d="M 44 73 L 79 21"
        stroke={strokeColor}
        strokeWidth="7.5"
        strokeLinecap="square"
      />

      {/* Porca Sextavada Técnica Laranja Oficial (Hexágono Regular com Furo Central) */}
      <path
        d="M 81.5 5.5 L 92.5 5.5 L 98 15 L 92.5 24.5 L 81.5 24.5 L 76 15 Z M 87 11.2 A 3.8 3.8 0 1 0 87 18.8 A 3.8 3.8 0 1 0 87 11.2 Z"
        fill={orangeColor}
        fillRule="evenodd"
      />
    </svg>
  );
};

/**
 * Tipografia Oficial da Marca Aferix
 * - "Aferix" com "A" maiúsculo e caixa baixa
 * - O pingo do "i" é uma esfera laranja vibrante (#F58220) alinhada à identidade
 * - Subtítulo opcional: "Soluções para ERP"
 */
export const AferixWordmark: React.FC<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSubtitle?: boolean;
}> = ({ size = 'xs', className = '', showSubtitle = false }) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    xs: {
      text: 'text-[15px] sm:text-[16px]',
      dotSize: 'w-[4px] h-[4px] -top-[3px]',
      sub: 'text-[8px] tracking-[0.02em]',
      gap: 'gap-0.5',
    },
    sm: {
      text: 'text-[17px] sm:text-[18px]',
      dotSize: 'w-[4.5px] h-[4.5px] -top-[3.5px]',
      sub: 'text-[9px] tracking-[0.02em]',
      gap: 'gap-0.5',
    },
    md: {
      text: 'text-[20px] sm:text-[22px]',
      dotSize: 'w-[5px] h-[5px] -top-[4px]',
      sub: 'text-[10px] tracking-[0.02em]',
      gap: 'gap-1',
    },
    lg: {
      text: 'text-2xl sm:text-3xl',
      dotSize: 'w-[6.5px] h-[6.5px] -top-[5.5px]',
      sub: 'text-[12px] tracking-[0.02em]',
      gap: 'gap-1',
    },
    xl: {
      text: 'text-3xl sm:text-4xl',
      dotSize: 'w-[8px] h-[8px] -top-[7px]',
      sub: 'text-[14px] tracking-[0.02em]',
      gap: 'gap-1.5',
    },
  };

  const current = sizeClasses[size] || sizeClasses.xs;

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      {/* Nome Aferix com Ponto Laranja no "i" */}
      <div className="flex items-baseline leading-none">
        <span
          className={`font-black tracking-tight ${current.text} ${
            isDark ? 'text-white' : 'text-[#0D4F9C]'
          } transition-colors`}
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" }}
        >
          Afer
          {/* Letra 'i' com o ponto esférico laranja oficial */}
          <span className="relative inline-block">
            <span className="opacity-0">i</span>
            {/* Haste do i */}
            <span
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[55%] h-[68%] rounded-[1px] ${
                isDark ? 'bg-white' : 'bg-[#0D4F9C]'
              }`}
            />
            {/* Esfera Laranja Oficial (#F58220) */}
            <span
              className={`absolute left-1/2 -translate-x-1/2 rounded-full bg-[#F58220] shadow-[0_0_4px_rgba(245,130,32,0.35)] ${current.dotSize}`}
            />
          </span>
          x
        </span>
      </div>

      {/* Slogan Oficial: Soluções para ERP */}
      {showSubtitle && (
        <span
          className={`font-semibold ${current.sub} ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          } mt-0.5 leading-tight`}
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
        >
          Soluções para ERP
        </span>
      )}
    </div>
  );
};

/**
 * Logotipo Completo Oficial Aferix
 * Reúne o Símbolo com Checkmark/Hexágono Laranja + Tipografia "Aferix" + "Soluções para ERP"
 */
export const AferixLogo: React.FC<AferixLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showSubtitle = true,
}) => {
  const iconSizes = {
    xs: 22,
    sm: 26,
    md: 34,
    lg: 46,
    xl: 62,
  };

  const iconSize = iconSizes[size] || 34;

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-2 select-none ${className}`}>
        <AferixMonogram size={iconSize * 1.3} />
        <AferixWordmark size={size} showSubtitle={showSubtitle} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      <AferixMonogram size={iconSize} />
      <AferixWordmark size={size} showSubtitle={showSubtitle} />
    </div>
  );
};

/**
 * Emblema / Monograma Compacto
 */
export const AferixEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
  className = '',
}) => {
  return <AferixMonogram size={size} className={className} />;
};

/**
 * Ícone Oficial de Aplicação para Telas e PWA
 */
export const AferixAppIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 64,
  className = '',
}) => {
  const { isDark } = useTheme();

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative rounded-[22.5%] p-2.5 shadow-xl border flex items-center justify-center select-none transition-all ${
        isDark
          ? 'bg-gradient-to-b from-[#0F1626] to-[#0A0F1D] border-white/10 shadow-[0_12px_28px_rgba(0,0,0,0.6)]'
          : 'bg-white border-slate-200/90 shadow-[0_12px_28px_rgba(13,79,156,0.12)]'
      } ${className}`}
    >
      <AferixMonogram size={Math.round(size * 0.72)} />
    </div>
  );
};
