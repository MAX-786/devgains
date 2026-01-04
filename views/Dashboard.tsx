import React from 'react';
import { DailyLog } from '../types';
import { CircularProgress } from '../components/ProgressBar';

interface DashboardProps {
  log: DailyLog;
  onNavigate: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ log, onNavigate }) => {
  const nextMeal = log.nutrition.meals.find(m => !m.isConsumed);
  const percentCals = (log.nutrition.totalCaloriesConsumed / log.nutrition.targetCalories) * 100;
  
  // Get current hour to position logic
  const currentHour = new Date().getHours();
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-4">
        <CircularProgress 
          current={log.nutrition.totalCaloriesConsumed} 
          target={log.nutrition.targetCalories} 
          label="Calories"
          unit="kcal"
          colorClass="text-blue-500"
        />
        <CircularProgress 
          current={log.nutrition.totalProteinConsumed} 
          target={log.nutrition.targetProtein} 
          label="Protein"
          unit="g"
          colorClass="text-emerald-500"
        />
      </div>

      {/* Hero Card: Next Action */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 border border-indigo-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-indigo-200 text-sm font-bold uppercase tracking-widest mb-2">Up Next</h2>
          {nextMeal ? (
            <div>
              <div className="text-3xl font-bold text-white mb-1">{nextMeal.title}</div>
              <div className="text-indigo-300 font-mono text-sm mb-4">Scheduled for {nextMeal.time}</div>
              <button 
                onClick={() => onNavigate('nutrition')}
                className="bg-white text-indigo-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-50 transition"
              >
                Track Now &rarr;
              </button>
            </div>
          ) : (
             <div>
              <div className="text-2xl font-bold text-white mb-2">All Meals Done!</div>
              <p className="text-indigo-300 text-sm">Great job hitting your targets today.</p>
            </div>
          )}
        </div>
        
        {/* Decorative Circle */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
      </div>

      {/* Workout Status */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 flex items-center justify-between" onClick={() => onNavigate('workout')}>
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Workout Plan</div>
          <div className="text-xl font-bold text-white flex items-center gap-2">
            {log.workout.type}
            {!log.workout.isRestDay && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>}
          </div>
        </div>
        <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>

      {/* Brief Timeline */}
      <div className="pt-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Timeline</h3>
        <div className="space-y-0 relative border-l-2 border-slate-800 ml-3">
          {log.nutrition.meals.map((meal, idx) => (
            <div key={idx} className="mb-6 ml-6 relative">
              <span className={`
                absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 
                ${meal.isConsumed ? 'bg-emerald-500 border-emerald-900' : 'bg-slate-900 border-slate-600'}
              `}></span>
              <div className={`text-sm font-mono ${meal.isConsumed ? 'text-slate-500 line-through' : 'text-blue-400'}`}>
                {meal.time}
              </div>
              <div className={`${meal.isConsumed ? 'text-slate-600' : 'text-slate-200'}`}>
                {meal.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
