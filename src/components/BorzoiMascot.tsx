import React from 'react';

interface BorzoiMascotProps {
  className?: string;
  size?: number;
  snootLength?: number; // Optional dynamic snout extender (1 to 5)
}

export const BorzoiMascot: React.FC<BorzoiMascotProps> = ({
  className = '',
  size = 48,
  snootLength = 3,
}) => {
  // Calculates extra snout length dynamically for the Snoot Meter
  const extraSnout = (snootLength - 1) * 12;

  return (
    <svg
      width={size + extraSnout}
      height={size}
      viewBox={`0 0 ${120 + extraSnout} 120`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-all duration-300 ${className}`}
    >
      {/* Background Glow Badge */}
      <circle cx="60" cy="60" r="54" fill="#1E1B4B" stroke="#6366F1" strokeWidth="3" />

      {/* Fluffy Ear (Left/Back) */}
      <path
        d="M 38 42 C 30 35, 22 55, 28 72 C 32 82, 40 75, 42 62 Z"
        fill="#C4A484"
        stroke="#4A3525"
        strokeWidth="2.5"
      />

      {/* Dog Head Base */}
      <path
        d="M 35 65 C 35 40, 52 32, 68 35 C 80 38, 88 48, 92 58 Z"
        fill="#FDFBF7"
        stroke="#4A3525"
        strokeWidth="2.5"
      />

      {/* Iconic Long Borzoi Snout (Extensible) */}
      <path
        d={`M 68 46 L ${105 + extraSnout} 58 C ${112 + extraSnout} 60, ${112 + extraSnout} 68, ${104 + extraSnout} 70 L 62 72 Z`}
        fill="#F5EBE6"
        stroke="#4A3525"
        strokeWidth="2.5"
      />

      {/* Cute Black Boop Snoot Nose */}
      <ellipse
        cx={108 + extraSnout}
        cy="64"
        rx="5"
        ry="4"
        fill="#1E293B"
      />
      {/* Nose Shine */}
      <ellipse
        cx={107 + extraSnout}
        cy="62"
        rx="1.5"
        ry="1"
        fill="#FFFFFF"
      />

      {/* Cute Expressive Eye */}
      <ellipse cx="58" cy="48" rx="4.5" ry="5.5" fill="#292524" />
      <circle cx="56.5" cy="46.5" r="1.8" fill="#FFFFFF" />

      {/* Floppy Main Ear */}
      <path
        d="M 42 38 C 32 28, 20 48, 25 68 C 28 80, 38 78, 44 60 Z"
        fill="#E6CCB2"
        stroke="#4A3525"
        strokeWidth="2.5"
      />

      {/* Mouth Line */}
      <path
        d={`M 75 66 Q ${90 + extraSnout / 2} 67 ${102 + extraSnout} 67`}
        stroke="#78350F"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Collar & Tech Badge */}
      <path
        d="M 36 70 C 44 76, 54 76, 62 72"
        stroke="#6366F1"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="49" cy="77" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1" />
    </svg>
  );
};