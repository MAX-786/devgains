import React, { useState, useEffect } from 'react';
import { getHistory, HistorySummary } from '../services/protocolService';

interface HistoryProps {
    onSelectDate: (date: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onSelectDate }) => {
    const [history, setHistory] = useState<HistorySummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHistory().then(data => {
            setHistory(data);
            setLoading(false);
        });
    }, []);
    
    // Group history by month for easier viewing
    const historyByMonth = React.useMemo(() => {
        const groups: {[key: string]: HistorySummary[]} = {};
        history.forEach(h => {
            const date = new Date(h.date);
            const key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[key]) groups[key] = [];
            groups[key].push(h);
        });
        return groups;
    }, [history]);

    if (loading) return <div className="text-center p-10 text-slate-500">Loading History...</div>;

    return (
        <div className="animate-fade-in pb-20">
            <h2 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-blue-500">History Log</h2>
            
            {Object.keys(historyByMonth).length === 0 && (
                <div className="text-center text-slate-500 py-10">
                    No history recorded yet. Start logging today!
                </div>
            )}

            {Object.entries(historyByMonth).map(([month, logs]) => (
                <div key={month} className="mb-8">
                    <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3 sticky top-0 bg-slate-950 py-2 z-10">{month}</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {logs.map(log => {
                            const isTargetMet = log.calories >= (log.targetCalories - 200);
                            const dateObj = new Date(log.date);
                            const dayNum = dateObj.getDate();
                            const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

                            return (
                                <div 
                                    key={log.date} 
                                    onClick={() => onSelectDate(log.date)}
                                    className="bg-slate-800 hover:bg-slate-700 transition cursor-pointer rounded-xl p-3 border border-slate-700 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            flex flex-col items-center justify-center w-12 h-12 rounded-lg border 
                                            ${isTargetMet ? 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400' : 'bg-slate-700 border-slate-600 text-slate-400'}
                                        `}>
                                            <span className="text-xs font-bold uppercase leading-none">{weekday}</span>
                                            <span className="text-lg font-bold leading-none">{dayNum}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-300">
                                                {log.calories} <span className="text-slate-500">/ {log.targetCalories} cal</span>
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2">
                                                 <span className={`${log.workoutType !== 'Rest' ? 'text-blue-400' : 'text-slate-500'}`}>{log.workoutType}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-slate-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
