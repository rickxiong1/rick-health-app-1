
import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';

export const Reminders: React.FC = () => {
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState("");

  const messages = [
    "Eyes off the screen! Look at something far away for 20s. 👀",
    "Your chair misses you. Stand up and stretch! 🧘‍♀️",
    "Drink some water, human plant. 🪴",
    "Deep breath in... and out. You're doing great! ✨"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsg(messages[Math.floor(Math.random() * messages.length)]);
      setShow(true);
      setTimeout(() => setShow(false), 8000);
    }, 45000); // Remind every 45s for demo

    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-bounce cursor-pointer" onClick={() => setShow(false)}>
      <GlassCard className="px-6 py-4 flex items-center space-x-3 shadow-2xl border-indigo-200/50">
        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
          🔔
        </div>
        <p className="text-indigo-900 font-medium whitespace-nowrap">{msg}</p>
      </GlassCard>
    </div>
  );
};
