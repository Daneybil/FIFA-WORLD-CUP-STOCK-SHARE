import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <img
      src="/official-logo.jpg"
      alt="Official Logo"
      className={`inline-block object-contain select-none ${className}`}
      id="platform-official-logo"
      style={{ width: size, height: size }}
      referrerPolicy="no-referrer"
    />
  );
};

