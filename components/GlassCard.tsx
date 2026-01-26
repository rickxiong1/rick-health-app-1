
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  opacity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', opacity = 65 }) => {
  return (
    <div 
      className={`
        glass-container glass-sheen rounded-[32px] overflow-hidden
        transition-all duration-500 ease-out
        ${className}
      `}
      style={{ 
        backgroundColor: `rgba(255, 255, 255, ${opacity / 100})`,
      }}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
