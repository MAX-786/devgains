import React, { useState, useEffect } from 'react';
import { getDailyLog, saveDailyLog, getToken } from './services/protocolService';
import { DailyLog } from './types';
import { Dashboard } from './views/Dashboard';
import { Nutrition } from './views/Nutrition';
import { Workout } from './views/Workout';
import { Settings } from './views/Settings';
import { History } from './views/History';
import { Auth } from './views/Auth';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(getToken());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateStr, setDateStr] = useState<string>('');
  const [log, setLog] = useState<DailyLog | null>(null);
  const [loading, setLoading] = useState(false);

  // If no token, show auth
  if (!token) {
      return <Auth onLoginSuccess={() => setToken(getToken())} />;
  }

  useEffect(() => {
    goToday();
  }, [token]);

  const goToday = () => {
    const today = new Date();
    const ds = today.toLocaleDateString('en-CA'); // YYYY-MM-DD
    setDateStr(ds);
    loadLogForDate(ds);
    setActiveTab('dashboard');
  };

  const loadLogForDate = async (ds: string) => {
    setLoading(true);
    try {
        const dailyLog = await getDailyLog(ds);
        setLog(dailyLog);
    } catch (e) {
        console.error("Failed to load log", e);
    } finally {
        setLoading(false);
    }
  };

  const handleUpdateLog = async (updatedLog: DailyLog) => {
    setLog(updatedLog);
    // Optimistic update locally, then save
    await saveDailyLog(updatedLog);
  };

  const handleHistorySelect = (selectedDate: string) => {
    setDateStr(selectedDate);
    loadLogForDate(selectedDate);
    setActiveTab('dashboard');
  };

  if (!log || loading) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-500 gap-4">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            <div className="text-sm font-mono animate-pulse">Syncing Protocol...</div>
        </div>
    );
  }

  const isToday = dateStr === new Date().toLocaleDateString('en-CA');

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans max-w-md mx-auto relative shadow-2xl shadow-black overflow-hidden border-x border-slate-900">
      
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-slate-900 border-b border-slate-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              DevGains
            </h1>
            <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                {log.date} ({log.dayOfWeek})
                </p>
                {!isToday && (
                    <button onClick={goToday} className="bg-blue-900/50 text-blue-300 text-[10px] px-2 py-0.5 rounded border border-blue-800 hover:bg-blue-800">
                        Return to Today
                    </button>
                )}
            </div>
          </div>
          <button onClick={() => setActiveTab('settings')} className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 h-[calc(100vh-140px)] overflow-y-auto pb-20 scroll-smooth">
        {activeTab === 'dashboard' && <Dashboard log={log} onNavigate={setActiveTab} />}
        {activeTab === 'nutrition' && <Nutrition log={log} onUpdate={handleUpdateLog} />}
        {activeTab === 'workout' && <Workout log={log} onUpdate={handleUpdateLog} />}
        {activeTab === 'history' && <History onSelectDate={handleHistorySelect} />}
        {activeTab === 'settings' && <Settings />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 w-full max-w-md bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around p-2 pb-6 z-50">
        <NavButton 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
          label="Home"
        />
        <NavButton 
          active={activeTab === 'nutrition'} 
          onClick={() => setActiveTab('nutrition')} 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />}
          label="Food"
        />
        <NavButton 
          active={activeTab === 'workout'} 
          onClick={() => setActiveTab('workout')} 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
          label="Gym"
        />
        <NavButton 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
          label="History"
        />
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center w-full py-2 transition-all ${active ? 'text-blue-400 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icon}
    </svg>
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
