import React, { useState, useEffect } from 'react';
import { getUserProfile, saveUserProfile, getDietTemplate, saveDietTemplate, getWorkoutTemplate, saveWorkoutTemplate, logout } from '../services/protocolService';
import { UserProfile, Exercise, FoodItem } from '../types';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'diet' | 'gym'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dietTpl, setDietTpl] = useState<any[]>([]);
  const [workoutA, setWorkoutA] = useState<Partial<Exercise>[]>([]);
  const [workoutB, setWorkoutB] = useState<Partial<Exercise>[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        try {
            const p = await getUserProfile();
            const d = await getDietTemplate();
            const wa = await getWorkoutTemplate('A');
            const wb = await getWorkoutTemplate('B');
            setProfile(p);
            setDietTpl(d);
            setWorkoutA(wa);
            setWorkoutB(wb);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    setMsg('Saving...');
    try {
        if (profile) await saveUserProfile(profile);
        await saveDietTemplate(dietTpl);
        await saveWorkoutTemplate('A', workoutA);
        await saveWorkoutTemplate('B', workoutB);
        setMsg('Settings Saved! Syncing...');
    } catch (e) {
        setMsg('Error Saving');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading || !profile) return <div className="text-center p-10 text-slate-500">Loading Settings...</div>;

  return (
    <div className="animate-fade-in pb-20">
      <div className="sticky top-0 bg-slate-950/95 backdrop-blur z-20 py-4 border-b border-slate-800 mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <div className="flex gap-2">
            <button 
            onClick={logout}
            className="bg-red-900/50 border border-red-800 text-red-300 px-3 py-1 rounded text-xs font-bold hover:bg-red-800"
            >
            Logout
            </button>
            <button 
            onClick={handleSave}
            className="bg-emerald-600 px-4 py-1 rounded text-sm font-bold text-white hover:bg-emerald-500"
            >
            Save All
            </button>
        </div>
      </div>

      {msg && <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 p-2 rounded mb-4 text-sm text-center">{msg}</div>}

      <div className="flex bg-slate-900 rounded-lg p-1 mb-6">
        {['profile', 'diet', 'gym'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider rounded transition-colors ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">Targets</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Calories</label>
                <input 
                  type="number" 
                  value={profile.metrics.targetCalories}
                  onChange={e => setProfile({...profile, metrics: {...profile.metrics, targetCalories: Number(e.target.value)}})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Protein (g)</label>
                <input 
                  type="number" 
                  value={profile.metrics.targetProtein}
                  onChange={e => setProfile({...profile, metrics: {...profile.metrics, targetProtein: Number(e.target.value)}})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Current Weight (kg)</label>
                <input 
                  type="number" 
                  value={profile.metrics.weight}
                  onChange={e => setProfile({...profile, metrics: {...profile.metrics, weight: Number(e.target.value)}})}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'diet' && (
        <div className="space-y-4">
          {dietTpl.map((slot, idx) => (
            <div key={idx} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <div className="flex gap-2 mb-2">
                <input 
                  value={slot.time} 
                  onChange={e => {
                    const newTpl = [...dietTpl];
                    newTpl[idx].time = e.target.value;
                    setDietTpl(newTpl);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded p-1 text-xs text-blue-300 w-16 text-center"
                />
                <input 
                  value={slot.title}
                  onChange={e => {
                    const newTpl = [...dietTpl];
                    newTpl[idx].title = e.target.value;
                    setDietTpl(newTpl);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded p-1 text-sm font-bold text-white flex-1"
                />
                <button 
                  onClick={() => {
                     const newTpl = dietTpl.filter((_, i) => i !== idx);
                     setDietTpl(newTpl);
                  }}
                  className="text-red-400 p-1 hover:bg-slate-700 rounded"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2 pl-4 border-l-2 border-slate-700">
                {slot.suggestedItems.map((item: FoodItem, iIdx: number) => (
                  <div key={iIdx} className="flex gap-2 items-center">
                    <input 
                      value={item.name}
                      onChange={e => {
                         const newTpl = [...dietTpl];
                         newTpl[idx].suggestedItems[iIdx].name = e.target.value;
                         setDietTpl(newTpl);
                      }}
                      className="bg-slate-900/50 border-none rounded p-1 text-sm text-slate-300 flex-1"
                      placeholder="Item name"
                    />
                    <div className="flex items-center gap-1">
                        <input 
                        type="number"
                        value={item.calories}
                        onChange={e => {
                            const newTpl = [...dietTpl];
                            newTpl[idx].suggestedItems[iIdx].calories = Number(e.target.value);
                            setDietTpl(newTpl);
                        }}
                        className="bg-slate-900/50 border-none rounded p-1 text-xs text-slate-500 w-12 text-right"
                        />
                        <span className="text-xs text-slate-600">cal</span>
                    </div>
                  </div>
                ))}
                <button 
                   onClick={() => {
                     const newTpl = [...dietTpl];
                     newTpl[idx].suggestedItems.push({ name: 'New Item', calories: 0, protein: 0, carbs: 0, fats: 0 });
                     setDietTpl(newTpl);
                   }}
                   className="text-xs text-blue-400 hover:underline mt-2"
                >
                   + Add Item
                </button>
              </div>
            </div>
          ))}
          <button 
            onClick={() => setDietTpl([...dietTpl, { title: 'New Meal', time: '00:00', suggestedItems: [] }])}
            className="w-full py-3 border border-dashed border-slate-600 rounded-xl text-slate-500 hover:text-white hover:border-slate-400 transition"
          >
            + Add Meal Slot
          </button>
        </div>
      )}

      {activeTab === 'gym' && (
        <div className="space-y-8">
            <WorkoutEditor title="Workout A (Mon/Fri)" exercises={workoutA} setExercises={setWorkoutA} />
            <WorkoutEditor title="Workout B (Wed)" exercises={workoutB} setExercises={setWorkoutB} />
        </div>
      )}
    </div>
  );
};

const WorkoutEditor = ({ title, exercises, setExercises }: { title: string, exercises: Partial<Exercise>[], setExercises: any }) => (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
    <h3 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">{title}</h3>
    <div className="space-y-4">
        {exercises.map((ex, idx) => (
        <div key={idx} className="bg-slate-900 p-3 rounded border border-slate-800">
            <div className="flex justify-between mb-2">
                <input 
                    value={ex.name}
                    onChange={e => {
                        const newEx = [...exercises];
                        newEx[idx].name = e.target.value;
                        setExercises(newEx);
                    }}
                    className="bg-transparent border-b border-slate-700 text-white font-bold w-full mr-2 focus:outline-none focus:border-blue-500"
                />
                <button onClick={() => setExercises(exercises.filter((_, i) => i !== idx))} className="text-red-500">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                    <label className="text-xs text-slate-500">Sets</label>
                    <input 
                        type="number"
                        value={ex.targetSets}
                        onChange={e => {
                            const newEx = [...exercises];
                            newEx[idx].targetSets = Number(e.target.value);
                            setExercises(newEx);
                        }}
                        className="w-full bg-slate-800 rounded p-1 text-slate-300"
                    />
                </div>
                <div>
                    <label className="text-xs text-slate-500">Reps</label>
                    <input 
                        value={ex.targetRepsRange}
                        onChange={e => {
                            const newEx = [...exercises];
                            newEx[idx].targetRepsRange = e.target.value;
                            setExercises(newEx);
                        }}
                        className="w-full bg-slate-800 rounded p-1 text-slate-300"
                    />
                </div>
            </div>
        </div>
        ))}
        <button 
            onClick={() => setExercises([...exercises, { name: 'New Exercise', targetSets: 3, targetRepsRange: '8-12', notes: '' }])}
            className="text-sm text-blue-400 hover:text-blue-300 w-full text-center py-2 border border-dashed border-slate-700 rounded"
        >
            + Add Exercise
        </button>
    </div>
    </div>
);
