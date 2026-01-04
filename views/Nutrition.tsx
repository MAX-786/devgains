import React from 'react';
import { DailyLog, MealSlot } from '../types';
import { MealCard } from '../components/MealCard';

interface NutritionProps {
  log: DailyLog;
  onUpdate: (updatedLog: DailyLog) => void;
}

export const Nutrition: React.FC<NutritionProps> = ({ log, onUpdate }) => {
  const handleToggle = (mealId: string, isConsumed: boolean) => {
    const updatedMeals = log.nutrition.meals.map(m => {
      if (m.id === mealId) {
        return { ...m, isConsumed };
      }
      return m;
    });

    const newLog = { ...log, nutrition: { ...log.nutrition, meals: updatedMeals } };
    onUpdate(newLog);
  };

  const consumedCals = log.nutrition.totalCaloriesConsumed;
  const targetCals = log.nutrition.targetCalories;
  const remainingCals = targetCals - consumedCals;

  return (
    <div className="space-y-4 animate-fade-in pb-20">
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center sticky top-0 z-20 shadow-lg backdrop-blur-md bg-opacity-90">
        <div>
           <div className="text-xs text-slate-400">Remaining</div>
           <div className="text-2xl font-bold text-white">{remainingCals} <span className="text-sm font-normal text-slate-500">kcal</span></div>
        </div>
        <div className="text-right">
           <div className="text-xs text-slate-400">Target</div>
           <div className="text-lg font-bold text-blue-400">{targetCals}</div>
        </div>
      </div>

      <div className="space-y-4">
        {log.nutrition.meals.map(meal => (
          <MealCard 
            key={meal.id} 
            meal={meal} 
            onToggle={handleToggle} 
          />
        ))}
      </div>
      
      <div className="text-center text-xs text-slate-500 pt-8">
        End of Day - MP Protocol
      </div>
    </div>
  );
};
