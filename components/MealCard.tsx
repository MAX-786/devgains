import React from 'react';
import { MealSlot } from '../types';

interface MealCardProps {
  meal: MealSlot;
  onToggle: (id: string, isConsumed: boolean) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onToggle }) => {
  // Always use suggested items (Plan)
  const activeItems = meal.suggestedItems;
  
  const totalCal = activeItems.reduce((acc, i) => acc + i.calories, 0);
  const totalProt = activeItems.reduce((acc, i) => acc + i.protein, 0);

  return (
    <div className={`
      relative overflow-hidden rounded-xl border transition-all duration-300
      ${meal.isConsumed 
        ? 'bg-emerald-950/30 border-emerald-800/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]' 
        : 'bg-slate-800 border-slate-700 hover:border-slate-600'}
    `}>
      {/* Background Pattern for consumed */}
      {meal.isConsumed && (
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${meal.isConsumed ? 'bg-emerald-900 text-emerald-400' : 'bg-blue-900 text-blue-300'}`}>
                {meal.time}
              </span>
            </div>
            <h3 className={`font-bold text-lg ${meal.isConsumed ? 'text-emerald-100' : 'text-slate-100'}`}>
              {meal.title}
            </h3>
          </div>
          
          <button
            onClick={() => onToggle(meal.id, !meal.isConsumed)}
            className={`
              flex items-center justify-center w-10 h-10 rounded-full transition-colors
              ${meal.isConsumed 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 hover:bg-emerald-400' 
                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}
            `}
          >
            {meal.isConsumed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {activeItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm border-b border-dashed border-slate-700/50 pb-2 last:border-0 last:pb-0">
               <span className={`${meal.isConsumed ? 'text-slate-400' : 'text-slate-300'}`}>{item.name}</span>
               <span className="text-xs font-mono text-slate-500">{item.calories} cal</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-700/50 flex justify-between items-center text-xs">
          <div className="flex gap-4">
             <span className={`${meal.isConsumed ? 'text-emerald-400' : 'text-blue-400'} font-medium`}>
               {totalCal} <span className="text-slate-500">kcal</span>
             </span>
             <span className={`${meal.isConsumed ? 'text-emerald-400' : 'text-orange-400'} font-medium`}>
               {totalProt}g <span className="text-slate-500">prot</span>
             </span>
          </div>
          <span className="text-slate-600 italic">MP Protocol</span>
        </div>
      </div>
    </div>
  );
};
