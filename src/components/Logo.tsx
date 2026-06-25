import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      id="platform-official-logo"
    >
      <defs>
        {/* Luxury Gold Gradients */}
        <linearGradient id="goldGradOuter" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A6F27" />
        </linearGradient>
        <linearGradient id="goldGradInner" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#AA7C11" />
          <stop offset="50%" stopColor="#FDF6C7" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        {/* Green Accent Glow */}
        <linearGradient id="greenGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        {/* Radial Dark Shadow */}
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle background glow circle */}
      <circle cx="50" cy="50" r="45" fill="url(#shadowGrad)" opacity="0.5" />

      {/* Premium Outer Shield / Crest */}
      <path
        d="M50 8C65 8 82 14 82 34C82 58 64 78 50 88C36 78 18 58 18 34C18 14 35 8 50 8Z"
        stroke="url(#goldGradOuter)"
        strokeWidth="3.5"
        fill="#07090D"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Inner Emerald Accent Shield Line */}
      <path
        d="M50 14C61.5 14 75.5 19 75.5 34C75.5 53.5 61.5 70.5 50 79C38.5 70.5 24.5 53.5 24.5 34C24.5 19 38.5 14 50 14Z"
        stroke="url(#greenGlow)"
        strokeWidth="1.5"
        fill="transparent"
        opacity="0.85"
      />

      {/* The FIFA World Cup Trophy Silhouette / Representation */}
      {/* Trophy Base */}
      <path
        d="M38 72H62L58 64H42L38 72Z"
        fill="url(#goldGradInner)"
        stroke="url(#goldGradOuter)"
        strokeWidth="1"
      />
      <rect
        x="42"
        y="60"
        width="16"
        height="4"
        rx="1"
        fill="url(#goldGradInner)"
      />
      <rect
        x="44"
        y="56"
        width="12"
        height="4"
        rx="1"
        fill="url(#goldGradOuter)"
      />

      {/* Trophy Body (Sinuously rising bands) */}
      <path
        d="M45 56C45 46 41 42 41 34C41 28 45 25 50 25C55 25 59 28 59 34C59 42 55 46 55 56H45Z"
        fill="url(#goldGradInner)"
      />

      {/* Stylized Globe/Ball on top of trophy */}
      <circle
        cx="50"
        cy="31"
        r="7.5"
        fill="url(#goldGradInner)"
        stroke="url(#goldGradOuter)"
        strokeWidth="1.2"
      />

      {/* Football-like panel lines on the globe */}
      <path
        d="M45 28C47 30 50 30 52 28M44 33C48 35 52 35 55 33M49 24.5V37.5"
        stroke="#451A03"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Stars on left and right representing world cup status */}
      <path
        d="M32 30L33.5 33.5H37L34 35.5L35 39L32 37L29 39L30 35.5L27 33.5H30.5L32 30Z"
        fill="url(#goldGradOuter)"
      />
      <path
        d="M68 30L69.5 33.5H73L70 35.5L71 39L68 37L65 39L66 35.5L63 33.5H66.5L68 30Z"
        fill="url(#goldGradOuter)"
      />

      {/* Elegant Crown / Star accent on top center */}
      <polygon
        points="50,15 52,20 57,20 53,23 55,28 50,25 45,28 47,23 43,20 48,20"
        fill="url(#goldGradOuter)"
      />
    </svg>
  );
};
