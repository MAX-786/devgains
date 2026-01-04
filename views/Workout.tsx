import React from 'react';
import { DailyLog, Exercise } from '../types';
import { ExerciseCard } from '../components/ExerciseCard';

interface WorkoutProps {
  log: DailyLog;
  onUpdate: (updatedLog: DailyLog) => void;
}

export const Workout: React.FC<WorkoutProps> = ({ log, onUpdate }) => {
  
  const handleSetUpdate = (exerciseId: string, setIndex: number, field: string, value: any) => {
    const updatedExercises = log.workout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const newSets = [...ex.sets];
        newSets[setIndex] = { ...newSets[setIndex], [field]: value };
        return { ...ex, sets: newSets };
      }
      return ex;
    });

    const newLog = { ...log, workout: { ...log.workout, exercises: updatedExercises } };
    onUpdate(newLog);
  };

  if (log.workout.isRestDay) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6 animate-fade-in">
        <div className="w-24 h-24 bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
           </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{log.workout.type}</h2>
        <p className="text-slate-400 mb-8 max-w-xs">
          Your body grows when you rest. Keep protein high, stress low, and fix that posture.
        </p>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full">
          <h3 className="text-orange-400 font-bold mb-2 flex items-center justify-center gap-2">
            <span>⚠</span> Posture Check
          </h3>
          <ul className="text-left text-sm text-slate-300 space-y-2 list-disc pl-5">
            <li>Are your shoulders rounded forward? Roll them back.</li>
            <li>Chin tuck: Align ears with shoulders.</li>
            <li>Stand up and stretch your hip flexors.</li>
          </ul>
        </div>
      </div>
    );
  }

  const completedSets = log.workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalSets = log.workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const progress = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="animate-fade-in pb-24">
      <div className="mb-6 sticky top-0 bg-slate-950/90 backdrop-blur z-20 py-2 border-b border-slate-800">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white">{log.workout.type}</h2>
            <p className="text-xs text-orange-400 font-medium bg-orange-950/30 px-2 py-0.5 rounded inline-block border border-orange-900/50">
              Hypertrophy & Posture Correction
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-200">{progress}%</div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-800 rounded overflow-hidden">
          <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="bg-red-900/10 border border-red-900/30 p-3 rounded-lg mb-6 text-sm text-red-200 flex gap-3 items-start">
        <span className="text-xl">🧖</span>
        <div>
          <strong>Hygiene Protocol:</strong>
          <p className="opacity-80 text-xs mt-1">Use two towels. One for the bench, one for your face. Don't be that guy.</p>
        </div>
      </div>

      <div>
        {log.workout.exercises.map(ex => (
          <ExerciseCard 
            key={ex.id} 
            exercise={ex} 
            onUpdateSet={handleSetUpdate} 
          />
        ))}
      </div>

      <button className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-colors">
        Finish Workout
      </button>
    </div>
  );
};
