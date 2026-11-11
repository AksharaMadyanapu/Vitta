import React from 'react';

export type WorkshopIllustrationVariant = 'healthy' | 'watch' | 'urgent';

interface WorkshopIllustrationProps {
  variant?: WorkshopIllustrationVariant;
  className?: string;
}

export const WorkshopIllustration: React.FC<WorkshopIllustrationProps> = ({
  variant = 'watch',
  className = 'w-48 h-40',
}) => {
  // 3 variants: healthy (mint sky, gold sun, gentle rising path)
  // watch (butter sky, warm amber sun, winding rising path)
  // urgent (coral sunset sky, subtle flag atop factory roof, rising path)

  const config = {
    healthy: {
      sky: '#CDEBDD',
      sun: '#FFE8A3',
      sunStroke: '#8A5B00',
      path: '#0F3D33',
      roof: '#1C6B56',
      walls: '#FFFFFF',
      window: '#CDEBDD',
      flag: '#CDEBDD',
      hasFlag: false,
    },
    watch: {
      sky: '#FFE8A3',
      sun: '#FF6B4A',
      sunStroke: '#B83216',
      path: '#0F3D33',
      roof: '#0F3D33',
      walls: '#FFFFFF',
      window: '#FFE8A3',
      flag: '#FFE8A3',
      hasFlag: false,
    },
    urgent: {
      sky: '#FDEEE9',
      sun: '#FF6B4A',
      sunStroke: '#B83216',
      path: '#0F3D33',
      roof: '#FF6B4A',
      walls: '#FFFFFF',
      window: '#FFE8A3',
      flag: '#FF6B4A',
      hasFlag: true,
    },
  }[variant];

  return (
    <svg
      className={className}
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft rounded background backdrop blob */}
      <rect x="10" y="15" width="180" height="130" rx="32" fill={config.sky} opacity="0.65" />

      {/* Sun / Coin in sky */}
      <circle cx="155" cy="45" r="16" fill={config.sun} />
      <circle cx="155" cy="45" r="10" stroke={config.sunStroke} strokeWidth="1.5" strokeDasharray="2 2" fill="none" opacity="0.6" />

      {/* Rolling ground hill */}
      <path
        d="M10 120 C 60 105, 110 125, 190 110 L 190 145 C 190 152, 185 155, 175 155 L 25 155 C 15 155, 10 152, 10 145 Z"
        fill="#F1E9DC"
      />

      {/* Workshop / Small MSME Factory Building */}
      {/* Main workshop block */}
      <rect x="35" y="65" width="65" height="55" rx="8" fill={config.walls} />
      
      {/* Sawtooth roof profiles (characteristic of precision component workshops) */}
      <path
        d="M32 65 L 50 48 L 50 65 L 68 48 L 68 65 L 86 48 L 86 65 L 103 65"
        stroke={config.roof}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Workshop small chimney / chimney stack */}
      <rect x="88" y="40" width="8" height="18" rx="2" fill={config.roof} />
      {/* Smoke puffs */}
      <circle cx="92" cy="30" r="3.5" fill="#FFFFFF" opacity="0.8" />
      <circle cx="96" cy="22" r="4.5" fill="#FFFFFF" opacity="0.6" />

      {/* Small warning flag for urgent crunch */}
      {config.hasFlag && (
        <g>
          <line x1="45" y1="48" x2="45" y2="34" stroke="#0F3D33" strokeWidth="2" strokeLinecap="round" />
          <path d="M45 34 L 56 38 L 45 43 Z" fill={config.flag} />
        </g>
      )}

      {/* Large workshop sliding door & grid window */}
      <rect x="43" y="85" width="22" height="35" rx="4" fill="#0F3D33" />
      <line x1="54" y1="85" x2="54" y2="120" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      
      {/* Factory window */}
      <rect x="74" y="75" width="18" height="16" rx="3" fill={config.window} />
      <line x1="83" y1="75" x2="83" y2="91" stroke="#0F3D33" strokeWidth="1" opacity="0.3" />
      <line x1="74" y1="83" x2="92" y2="83" stroke="#0F3D33" strokeWidth="1" opacity="0.3" />

      {/* Rising Path from Workshop out to the right */}
      <path
        d="M60 120 C 80 125, 105 130, 130 115 C 150 102, 165 92, 185 85"
        stroke={config.path}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="1 0"
        fill="none"
      />

      {/* Stylised Floating Coins on the upward curve */}
      <circle cx="132" cy="112" r="5" fill="#FFE8A3" stroke="#0F3D33" strokeWidth="1.5" />
      <circle cx="158" cy="95" r="6" fill="#FFE8A3" stroke="#0F3D33" strokeWidth="1.5" />
      <circle cx="185" cy="80" r="7.5" fill="#FFE8A3" stroke="#0F3D33" strokeWidth="1.8" />
      <text x="183" y="83" fontSize="9" fontWeight="bold" fill="#0F3D33" fontFamily="Fraunces, serif">₹</text>
    </svg>
  );
};

