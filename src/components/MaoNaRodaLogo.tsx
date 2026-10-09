import React from 'react';

interface MaoNaRodaLogoProps {
  className?: string;
  size?: number;
}

export const MaoNaRodaLogo: React.FC<MaoNaRodaLogoProps> = ({ className = 'h-9 w-9', size }) => {
  const sizeStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-[#0a2f1c] via-[#14532d] to-[#0f3d23] shadow-md border border-[#16a34a]/30 ${className}`}
      style={sizeStyle}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-1.5"
      >
        {/* Outer Circular Arrows (Continuous Wheel / Roda) */}
        <circle cx="50" cy="50" r="42" stroke="#4ade80" strokeWidth="2.5" strokeDasharray="210" strokeDashoffset="25" opacity="0.6" />
        <circle cx="50" cy="50" r="38" stroke="#ffffff" strokeWidth="2" strokeDasharray="180" strokeDashoffset="40" opacity="0.8" />
        
        {/* Arrow heads */}
        <path d="M 48 8 L 56 12 L 48 16 Z" fill="#ffffff" />
        <path d="M 52 92 L 44 88 L 52 84 Z" fill="#4ade80" />

        {/* Gear / Cogwheel in Background */}
        <g stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.85" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 50 18 L 50 22 M 50 78 L 50 82 M 18 50 L 22 50 M 78 50 L 82 50 M 27 27 L 30 30 M 70 70 L 73 73 M 27 73 L 30 70 M 70 27 L 73 30" />
          <path d="M 32 32 C 40 24, 60 24, 68 32 C 76 40, 76 60, 68 68 C 60 76, 40 76, 32 68 C 24 60, 24 40, 32 32 Z" />
        </g>

        {/* Calculator Base */}
        <rect
          x="32"
          y="26"
          width="36"
          height="48"
          rx="6"
          fill="#0f3d23"
          stroke="#ffffff"
          strokeWidth="3"
        />

        {/* Calculator Display Screen */}
        <rect
          x="37"
          y="31"
          width="26"
          height="10"
          rx="2"
          fill="#0a2f1c"
          stroke="#ffffff"
          strokeWidth="1.5"
        />

        {/* Calculator Buttons Grid */}
        <g fill="#ffffff">
          <rect x="37" y="45" width="6" height="5" rx="1" />
          <rect x="47" y="45" width="6" height="5" rx="1" />
          <rect x="57" y="45" width="6" height="5" rx="1" />

          <rect x="37" y="53" width="6" height="5" rx="1" />
          <rect x="47" y="53" width="6" height="5" rx="1" />
          <rect x="57" y="53" width="6" height="5" rx="1" fill="#4ade80" />

          <rect x="37" y="61" width="6" height="5" rx="1" />
          <rect x="47" y="61" width="6" height="5" rx="1" fill="#4ade80" />
        </g>

        {/* Glowing Green Checkmark Emblem at Bottom Right */}
        <circle cx="68" cy="68" r="12" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
        <path
          d="M 61 68 L 66 73 L 75 62"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
