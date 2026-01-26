
import React from 'react';
import { GlassCard } from './GlassCard';

export const GlassBanner: React.FC = () => {
  return (
    <div className="relative overflow-visible group">
      {/* Vibrant Gradient Layer beneath the glass */}
      <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-[#7ae6ff] via-[#d400ff] to-[#4f46e5] opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-700" />
      
      <GlassCard 
        opacity={60} 
        className="relative h-48 flex flex-col justify-center p-8 overflow-visible border-white/40 !bg-gradient-to-br !from-white/40 !to-white/10"
      >
        {/* Internal Mesh Gradient Accents */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden rounded-[32px]">
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-[#7ae6ff]/30 blur-[40px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[10%] w-40 h-40 bg-[#d400ff]/20 blur-[40px] rounded-full" />
        </div>

        {/* 3D Decorative Elements */}
        <div className="absolute -right-4 -top-8 w-40 h-40 pointer-events-none" style={{ perspective: '1000px' }}>
          <div 
            className="w-full h-full glass-container bg-white/30 rounded-[40px] animate-float rotate-12 flex items-center justify-center backdrop-blur-md"
            style={{ 
              transform: 'rotateX(25deg) rotateY(-15deg)', 
              boxShadow: '20px 40px 60px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.5)',
              border: '1px solid rgba(255, 255, 255, 0.6)'
            }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-300 to-purple-400 blur-2xl opacity-50 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center text-4xl drop-shadow-lg">💎</div>
          </div>
        </div>

        <div className="relative z-10 max-w-[65%]">
          <div className="inline-block px-3 py-1 bg-white/60 glass-container rounded-full text-[9px] font-bold text-indigo-700 uppercase tracking-[0.2em] mb-4 border-white/80">
            Peak Performance
          </div>
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">Focus Lab</h2>
          <p className="text-xs text-gray-600 mt-2 font-semibold leading-relaxed">
            Enter the zone. Track your flow state with AI precision.
          </p>
        </div>

        {/* Interactive Highlight */}
        <div className="absolute left-10 bottom-6 w-3 h-3 rounded-full bg-[#7ae6ff] blur-[2px] opacity-60 animate-pulse" />
      </GlassCard>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: rotateX(25deg) rotateY(-15deg) translateY(0px); }
          50% { transform: rotateX(25deg) rotateY(-15deg) translateY(-12px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
