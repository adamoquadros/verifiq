import React from 'react';

interface VerifIQLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export const VerifIQLogo: React.FC<VerifIQLogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'text-white',
  className = ''
}) => {
  const sizeMap = {
    sm: { icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', sub: 'text-[10px]' },
    lg: { icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* High-Tech VerifIQ Emblem */}
      <div className={`relative ${currentSize.icon} shrink-0 flex items-center justify-center`}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            <linearGradient id="verifiqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#a7f3d0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagonal Shield Background */}
          <path
            d="M50 4 L88 24 L88 68 L50 96 L12 68 L12 24 Z"
            fill="url(#verifiqGrad)"
            stroke="#34d399"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Inner Accent Path */}
          <path
            d="M50 14 L80 30 L80 64 L50 86 L20 64 L20 30 Z"
            fill="#064e3b"
            opacity="0.6"
          />

          {/* Modern Stylized 'V' & Metrology Checkmark */}
          <path
            d="M32 46 L45 62 L70 30"
            stroke="url(#checkGrad)"
            strokeWidth="8.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Geometric Tech Dot (IQ Node) */}
          <circle cx="70" cy="30" r="4.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left leading-tight">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight ${currentSize.text} ${textColor}`}>
              Verif<span className="text-emerald-400">IQ</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold tracking-widest uppercase">
              BPF
            </span>
          </div>
          <span className={`text-emerald-200/80 font-medium ${currentSize.sub} tracking-wide`}>
            Digital Quality & Traceability
          </span>
        </div>
      )}
    </div>
  );
};
