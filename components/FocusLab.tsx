
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './GlassCard';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_WEEKLY_DATA } from '../constants';

export const FocusLab: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // 25 minutes
  const [isComplete, setIsComplete] = useState(false);
  // Fix: Using ReturnType<typeof setInterval> to avoid NodeJS namespace issues in browser environment
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = 25 * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  
  // Timer Logic
  useEffect(() => {
    if (isActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      handleComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft]);

  const handleStart = () => {
    setIsActive(true);
    setIsComplete(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setSecondsLeft(25 * 60);
  };

  const handleComplete = () => {
    setIsActive(false);
    setIsComplete(true);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular Progress Props
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`min-h-screen w-full relative overflow-x-hidden pt-14 pb-20 px-8 transition-colors duration-1000 ${isActive ? 'bg-[#0f172a]' : 'bg-[#fdfcfb]'} app-container`}>
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000 ${isActive ? 'bg-indigo-900' : 'bg-indigo-200'}`} />
        <div className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[100px] transition-colors duration-1000 ${isActive ? 'bg-purple-900' : 'bg-pink-100'}`} />
      </div>

      <div className="max-w-md mx-auto space-y-8 relative z-10">
        <header className="flex items-center justify-between mb-10">
          <button 
            onClick={onBack} 
            className={`p-3 glass-container rounded-full transition-all active:scale-90 ${isActive ? 'bg-white/10 border-white/20 text-white' : 'hover:bg-white/50 text-gray-800'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className={`text-lg font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-800'}`}>
            {isActive ? 'Flowing...' : 'Focus Lab'}
          </h1>
          <div className="w-10 h-10" />
        </header>

        <GlassCard 
          className={`p-10 text-center transition-all duration-700 ${isActive ? 'bg-white/5 border-white/10' : ''}`} 
          opacity={isActive ? 10 : 40}
        >
          {/* Circular Timer Display */}
          <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
            {/* Background Glow */}
            <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity duration-1000 ${isActive ? 'bg-indigo-500/30 opacity-100 animate-pulse' : 'opacity-0'}`} />
            
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="96" cy="96" r={radius}
                stroke={isActive ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="96" cy="96" r={radius}
                stroke={isActive ? '#818cf8' : '#4f46e5'}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            <div className="relative z-10 flex flex-col items-center">
              <span className={`text-4xl font-black tracking-tighter font-mono ${isActive ? 'text-white' : 'text-gray-800'}`}>
                {isComplete ? 'Done' : formatTime(secondsLeft)}
              </span>
              <p className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-1 ${isActive ? 'text-indigo-300' : 'text-gray-400'}`}>
                {isActive ? 'Deep Work' : 'Ready'}
              </p>
            </div>
          </div>

          <h2 className={`text-2xl font-bold transition-colors ${isActive ? 'text-white' : 'text-gray-800'}`}>
            {isComplete ? 'Cycle Mastered' : isActive ? 'Stay in the Zone' : 'Deep Work Cycle'}
          </h2>
          <p className={`text-sm mt-2 transition-colors ${isActive ? 'text-gray-400' : 'text-gray-500'}`}>
            {isComplete ? 'You added 25 mins to your focus bank.' : isActive ? 'Distractions are muted. Focus on the core.' : 'Aim for 25 minutes of pure concentration.'}
          </p>
        </GlassCard>

        {!isActive && !isComplete && (
          <section className="space-y-4 animate-in slide-in-from-bottom-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-2">Focus Stability</h3>
            <GlassCard className="p-6 h-64" opacity={30}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_WEEKLY_DATA}>
                  <defs>
                    <linearGradient id="focusGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)' }}
                  />
                  <Area type="monotone" dataKey="focus" stroke="#4f46e5" strokeWidth={3} fill="url(#focusGlow)" />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </section>
        )}

        {isActive && (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4">
            <StatBox label="O2 Level" value="99%" color="text-emerald-400" isDark />
            <StatBox label="Pulse" value="68 bpm" color="text-rose-400" isDark />
          </div>
        )}

        <div className="pt-8">
          {isComplete ? (
            <button 
              onClick={() => { setIsComplete(false); setSecondsLeft(25 * 60); }}
              className="w-full py-5 bg-indigo-600 text-white rounded-[28px] font-bold shadow-2xl active:scale-[0.98] transition-all"
            >
              Start New Cycle
            </button>
          ) : isActive ? (
            <button 
              onClick={handleStop}
              className="w-full py-5 bg-white/10 hover:bg-rose-500/20 text-rose-400 border border-white/10 rounded-[28px] font-bold active:scale-[0.98] transition-all"
            >
              End Session early
            </button>
          ) : (
            <button 
              onClick={handleStart}
              className="w-full py-5 bg-gray-900 text-white rounded-[28px] font-bold shadow-2xl active:scale-[0.98] transition-all hover:bg-black"
            >
              Start Focus Session
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color, isDark }: { label: string, value: string, color: string, isDark?: boolean }) => (
  <GlassCard opacity={isDark ? 5 : 50} className={`p-6 text-center border-white/10 ${isDark ? 'bg-white/5' : ''}`}>
    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </GlassCard>
);
