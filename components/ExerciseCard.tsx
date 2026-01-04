import React from 'react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateSet: (exerciseId: string, setIndex: number, field: string, value: any) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onUpdateSet }) => {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden mb-4">
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-white">{exercise.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                {exercise.targetSets} sets
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                {exercise.targetRepsRange} reps
              </span>
            </div>
          </div>
        </div>
        {exercise.notes && (
          <div className="mt-3 text-sm text-blue-200 bg-blue-900/20 border border-blue-900/50 p-2 rounded flex items-start gap-2">
            <span className="text-blue-400 text-lg leading-none">ℹ</span>
            <p className="italic opacity-90">{exercise.notes}</p>
          </div>
        )}
      </div>

      <div className="p-2">
        <div className="grid grid-cols-[30px_1fr_1fr_40px] gap-2 mb-2 px-2 text-xs font-mono text-slate-500 uppercase tracking-wider text-center">
          <div className="pt-2">#</div>
          <div>KG</div>
          <div>Reps</div>
          <div className="pt-2">✓</div>
        </div>

        <div className="space-y-1">
          {exercise.sets.map((set, idx) => (
            <div 
              key={idx} 
              className={`
                grid grid-cols-[30px_1fr_1fr_40px] gap-2 items-center p-2 rounded 
                ${set.completed ? 'bg-emerald-950/20' : 'bg-slate-900/50'}
              `}
            >
              <div className="text-center text-slate-500 font-mono text-sm">{idx + 1}</div>
              
              <input
                type="number"
                placeholder="0"
                value={set.weight}
                onChange={(e) => onUpdateSet(exercise.id, idx, 'weight', e.target.value)}
                className="w-full bg-slate-700 border-none rounded text-center text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 h-8 text-sm"
              />
              
              <input
                type="number"
                placeholder="0"
                value={set.reps}
                onChange={(e) => onUpdateSet(exercise.id, idx, 'reps', e.target.value)}
                className="w-full bg-slate-700 border-none rounded text-center text-white placeholder-slate-600 focus:ring-1 focus:ring-blue-500 h-8 text-sm"
              />

              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={set.completed}
                  onChange={(e) => onUpdateSet(exercise.id, idx, 'completed', e.target.checked)}
                  className="w-6 h-6 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-offset-slate-900 focus:ring-emerald-600 cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
