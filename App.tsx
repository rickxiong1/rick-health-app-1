
import React, { useState, useEffect, useRef } from 'react';
import { HealthData, ThemeType, Recommendation, ThemeColors } from './types';
import { THEMES } from './constants';
import { GlassCard } from './components/GlassCard';
import { WeeklyReport } from './components/WeeklyReport';
import { Reminders } from './components/Reminders';
import { GlassBanner } from './components/GlassBanner';
import { FocusLab } from './components/FocusLab';
import { getAIHealthAnalysis, streamHealthChat } from './services/geminiService';

const DEFAULT_COLORS: Record<ThemeType, ThemeColors> = {
  MINT: { primary: 'rgba(122, 235, 255, 0.5)' },
  LAVENDER: { primary: 'rgba(212, 0, 255, 0.3)' },
  APRICOT: { primary: 'rgba(254, 215, 170, 0.5)' }
};

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface UserProfile {
  name: string;
  title: string;
  avatarSeed: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'lab'>('home');
  const [theme, setTheme] = useState<ThemeType>('LAVENDER');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<HealthData>({
    heartRate: 74,
    bloodPressure: '118/78',
    bloodOxygen: 99,
    stress: 28,
    focusScore: 92
  });
  
  // Profile State
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('zen_user_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Andrew Watson',
      title: 'Creative Lead & Strategist',
      avatarSeed: 'AndrewWatson'
    };
  });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editTitle, setEditTitle] = useState(profile.title);
  const [editSeed, setEditSeed] = useState(profile.avatarSeed);

  const [customColors, setCustomColors] = useState<Record<ThemeType, ThemeColors>>(() => {
    const saved = localStorage.getItem('zen_theme_colors');
    return saved ? JSON.parse(saved) : DEFAULT_COLORS;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Chat State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    localStorage.setItem('zen_theme_colors', JSON.stringify(customColors));
  }, [customColors]);

  useEffect(() => {
    localStorage.setItem('zen_user_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    const timeTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const sensorTimer = setInterval(() => {
      refreshData();
    }, 8000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(sensorTimer);
    };
  }, []);

  const refreshData = () => {
    setIsRefreshing(true);
    setData(prev => ({
      ...prev,
      heartRate: 70 + Math.floor(Math.random() * 8),
      stress: Math.max(15, Math.min(85, prev.stress + (Math.random() > 0.5 ? 2 : -2))),
      focusScore: Math.max(60, Math.min(100, prev.focusScore + (Math.random() > 0.5 ? 1 : -1)))
    }));
    setTimeout(() => setIsRefreshing(false), 800);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isAiTyping]);

  const openAiDoctor = async () => {
    setIsDrawerOpen(true);
    setDragY(0);
    if (chatHistory.length === 0) {
      setChatHistory([{ role: 'model', text: `Hello ${profile.name.split(' ')[0]}! I'm your Zen AI Dr. How are you feeling today?` }]);
    }
  };

  const handleSaveProfile = () => {
    setProfile({
      name: editName,
      title: editTitle,
      avatarSeed: editSeed
    });
    setIsEditProfileOpen(false);
  };

  const shuffleAvatar = () => {
    setEditSeed(Math.random().toString(36).substring(7));
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userInput.trim() || isAiTyping) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);
    setUserInput('');
    setIsAiTyping(true);

    try {
      const historyForApi = updatedHistory.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      let aiResponseText = '';
      
      const stream = streamHealthChat(historyForApi, data);
      setChatHistory(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        aiResponseText += chunk;
        setChatHistory(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, text: aiResponseText }];
        });
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, I lost sync for a moment. Let's try again! 😅" }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDragY(0);
  };

  const updateColor = (themeType: ThemeType, color: string) => {
    setCustomColors(prev => ({
      ...prev,
      [themeType]: { primary: color }
    }));
    setTheme(themeType);
  };

  const activeColor = customColors[theme].primary;
  const dynamicBg = `
    radial-gradient(circle at 50% 100%, ${activeColor} 0%, rgba(255, 255, 255, 0) 80%),
    radial-gradient(circle at 100% 0%, rgba(0, 242, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%)
  `;

  if (view === 'lab') {
    return <FocusLab onBack={() => setView('home')} />;
  }

  return (
    <div className="app-container min-h-screen w-full relative overflow-x-hidden pt-10 pb-40 px-8">
      <div 
        className="fixed inset-0 pointer-events-none transition-all duration-1000 z-0 opacity-60" 
        style={{ background: dynamicBg }}
      />

      <Reminders />

      <div className="max-w-md mx-auto space-y-10 relative z-10">
        <header className="flex flex-col space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-800/80">Profile</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 hover:bg-white/40 rounded-full transition-all active:scale-90"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
              <button 
                onClick={refreshData}
                className={`p-2.5 transition-all duration-500 hover:bg-white/40 rounded-full ${isRefreshing ? 'rotate-180 scale-90' : 'active:scale-90'}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* INTERACTIVE CAPSULE AVATAR */}
            <button 
              onClick={() => {
                setEditName(profile.name);
                setEditTitle(profile.title);
                setEditSeed(profile.avatarSeed);
                setIsEditProfileOpen(true);
              }}
              className="relative group outline-none focus:ring-4 focus:ring-indigo-200 rounded-[44px] transition-all"
            >
              {/* Dynamic Aura Glow */}
              <div 
                className="absolute -inset-6 rounded-[48px] opacity-40 blur-3xl transition-all duration-1000 animate-pulse"
                style={{ 
                  background: `radial-gradient(circle, #6366f1 0%, transparent 70%)`,
                  transform: `scale(${0.8 + (data.focusScore / 100) * 0.4})`
                }}
              />
              
              {/* Main Avatar Container (Squircle) */}
              <div className="relative w-32 h-32 glass-container bg-white/40 border-white/80 rounded-[40px] p-2 overflow-hidden shadow-2xl transition-transform group-hover:scale-105 duration-500">
                <div className="w-full h-full rounded-[32px] overflow-hidden bg-gradient-to-tr from-slate-100 to-white relative">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed}&backgroundColor=f8fafc`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                  {/* Hover Edit Overlay */}
                  <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Pill Badge */}
              <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-bold border-2 border-white shadow-lg flex items-center space-x-1 animate-in slide-in-from-bottom-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="tracking-tight uppercase">Active</span>
              </div>
            </button>

            {/* Typography Section */}
            <div className="text-center mt-8">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.name}</h1>
              <div className="flex items-center justify-center space-x-2 mt-1">
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.15em]">{profile.title}</p>
                <span className="w-1 h-1 rounded-full bg-indigo-400" />
              </div>
            </div>

            {/* Floating Metric Chips */}
            <div className="flex space-x-4 mt-10">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-sm border border-white/50 group hover:translate-y-[-2px] transition-transform">
                <span className="text-lg">🔥</span>
                <span className="font-bold text-gray-800 text-sm">11</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-sm border border-white/50 group hover:translate-y-[-2px] transition-transform">
                <span className="text-lg">✅</span>
                <span className="font-bold text-gray-800 text-sm">56</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-sm border border-white/50 group hover:translate-y-[-2px] transition-transform">
                <span className="text-lg">🏆</span>
                <span className="font-bold text-gray-800 text-sm">12</span>
              </div>
            </div>
          </div>
        </header>

        <section onClick={() => setView('lab')} className="cursor-pointer active:scale-[0.98] transition-all">
          <GlassBanner />
        </section>

        <section className="grid gap-4">
          <MetricItem icon="❤️" label="Heart Rate" value={data.heartRate} unit="bpm" notification={2} />
          <MetricItem icon="🧠" label="Stress Level" value={data.stress} unit="pts" notification={1} />
          <MetricItem icon="🔋" label="Focus Score" value={data.focusScore} unit="%" />
          <MetricItem icon="🩸" label="Blood Oxygen" value={data.bloodOxygen} unit="%" />
        </section>

        <section><WeeklyReport /></section>
      </div>

      <div className="fixed bottom-10 left-0 right-0 px-8 max-w-md mx-auto z-40">
        <button 
          onClick={openAiDoctor}
          className="tap-pill w-full py-5 rounded-[32px] flex items-center justify-between px-6 transition-all active:scale-95 group overflow-hidden glass-sheen"
        >
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-gray-600 text-sm font-semibold tracking-wide">Consult AI Wellness Dr.</span>
          </div>
          <div className="text-gray-400 group-hover:text-indigo-500 transition-colors relative z-10">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Edit Profile Drawer */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-md z-[70] transition-opacity duration-500 ${isEditProfileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsEditProfileOpen(false)}>
        <div 
          className={`absolute bottom-0 inset-x-0 h-[85vh] glass-container rounded-t-[48px] p-8 flex flex-col bg-white/95 transform transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${isEditProfileOpen ? 'translate-y-0' : 'translate-y-full'}`} 
          onClick={e => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
          
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Identity Studio</h2>
            <button onClick={() => setIsEditProfileOpen(false)} className="p-2 bg-gray-100 rounded-full active:scale-90 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-10 px-2 custom-scrollbar pb-20">
            {/* Live Preview */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-40 h-40 glass-container bg-white rounded-[48px] p-3 shadow-xl relative overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${editSeed}&backgroundColor=f8fafc`} 
                  alt="Edit Preview" 
                  className="w-full h-full object-cover rounded-[38px] bg-slate-50"
                />
                <button 
                  onClick={shuffleAvatar}
                  className="absolute bottom-4 right-4 p-3 bg-gray-900 text-white rounded-2xl shadow-lg active:rotate-180 transition-transform duration-500"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"/>
                  </svg>
                </button>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avatar Live Preview</p>
            </div>

            {/* Input Fields */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Display Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-100/50 border border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-3xl px-6 py-5 outline-none transition-all font-bold text-gray-800 text-lg"
                  placeholder="Your Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Professional Role</label>
                <input 
                  type="text" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-100/50 border border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-3xl px-6 py-5 outline-none transition-all font-bold text-gray-800 text-lg"
                  placeholder="Job Title"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 bg-white/50 backdrop-blur-xl absolute bottom-0 inset-x-0 p-8">
            <button 
              onClick={handleSaveProfile}
              className="w-full py-5 bg-gray-900 text-white rounded-[32px] font-black tracking-wide text-lg shadow-2xl active:scale-[0.98] transition-transform hover:bg-gray-800"
            >
              Sync Identity
            </button>
          </div>
        </div>
      </div>

      {/* Atmosphere Settings Drawer */}
      <div className={`fixed inset-0 bg-black/10 backdrop-blur-sm z-[60] transition-opacity duration-500 ${isSettingsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSettingsOpen(false)}>
        <div className={`absolute bottom-0 inset-x-0 h-[60vh] glass-container rounded-t-[48px] p-10 transform transition-transform duration-500 ease-out bg-white/95 ${isSettingsOpen ? 'translate-y-0' : 'translate-y-full'}`} onClick={e => e.stopPropagation()}>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-10" />
          <h2 className="text-2xl font-bold text-center mb-8">Atmosphere</h2>
          <div className="space-y-6">
            {(Object.keys(DEFAULT_COLORS) as ThemeType[]).map(t => (
              <div key={t} className="flex items-center justify-between p-5 glass-container rounded-2xl bg-white/40">
                <span className="font-semibold text-gray-700 capitalize text-lg">{t.toLowerCase()} Theme</span>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: customColors[t].primary }} />
                  <input type="color" value={customColors[t].primary} onChange={(e) => updateColor(t, e.target.value)} className="w-10 h-10 p-0.5 bg-transparent border-0 cursor-pointer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Chat Drawer */}
      <div className={`fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[45] transition-opacity duration-500 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeDrawer} />
      
      <div 
        className={`fixed inset-x-0 bottom-0 h-[85vh] glass-container bg-white/95 rounded-t-[48px] z-50 flex flex-col 
          ${isDragging ? '' : 'transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1)'}`}
        style={{ transform: isDrawerOpen ? `translateY(${dragY}px)` : 'translateY(100%)' }}
      >
        <div className="relative pt-6 pb-2 flex flex-col items-center">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4" />
          <button onClick={closeDrawer} className="absolute top-6 right-8 p-2.5 glass-container rounded-full hover:bg-gray-100 active:scale-90">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="text-center px-10">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">AI Wellness Dr.</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Real-time Consulting</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
              <div className={`max-w-[85%] px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white/60 glass-container border-white/50 text-gray-800 rounded-tl-none'
              }`}>
                {msg.text || (isAiTyping && idx === chatHistory.length - 1 ? '...' : '')}
              </div>
            </div>
          ))}
          {isAiTyping && chatHistory[chatHistory.length - 1].role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-white/60 glass-container border-white/50 px-5 py-3 rounded-3xl rounded-tl-none animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-6 border-t border-gray-100/50 bg-white/40">
          <div className="relative flex items-center">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about your health..."
              className="w-full bg-white/80 glass-container border-white/80 rounded-full py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <button 
              type="submit"
              disabled={!userInput.trim() || isAiTyping}
              className="absolute right-2 p-3 bg-indigo-600 text-white rounded-full active:scale-90 transition-transform disabled:opacity-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MetricItem: React.FC<{ icon: string, label: string, value: number | string, unit: string, notification?: number }> = ({ icon, label, value, unit, notification }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  useEffect(() => {
    setIsUpdating(true);
    const timer = setTimeout(() => setIsUpdating(false), 600);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <GlassCard opacity={45} className={`p-6 flex items-center justify-between group cursor-pointer active:scale-[0.98] transition-all ${isUpdating ? 'animate-update' : ''}`}>
      <div className="flex items-center space-x-5">
        <div className="w-12 h-12 glass-container bg-white/40 rounded-2xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">{icon}</div>
        <div>
          <p className="text-gray-900 text-sm font-bold">{label}</p>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{value} {unit}</p>
        </div>
      </div>
      {notification && (
        <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
          <span className="text-[10px] text-white font-bold">{notification}</span>
        </div>
      )}
    </GlassCard>
  );
};

export default App;
