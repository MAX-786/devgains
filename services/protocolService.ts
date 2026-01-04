import { DailyLog, MealSlot, Exercise, Workout, UserProfile, FoodItem } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = process.env.REACT_APP_TOKEN_KEY || 'devgains_token';

// --- AUTH & API HELPERS ---

export const getToken = () => localStorage.getItem(TOKEN_KEY);

const authHeader = () => {
    const token = getToken();
    return token ? { 'x-auth-token': token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

export const login = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Login failed');
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.user;
};

export const register = async (username, password) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.msg || 'Registration failed');
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.user;
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.reload();
};

// --- DATA FETCHING ---

// Cache to avoid refetching profile constantly
let cachedUser: any = null;

export const fetchUserData = async () => {
    if (cachedUser) return cachedUser;
    const res = await fetch(`${API_URL}/user`, { headers: authHeader() });
    if (res.ok) {
        cachedUser = await res.json();
        return cachedUser;
    }
    return null;
};

export const getUserProfile = async (): Promise<UserProfile> => {
    const user = await fetchUserData();
    if (user) {
        return { name: user.username, metrics: user.metrics };
    }
    // Fallback default (should not happen if auth is working)
    return {
        name: "Dev",
        metrics: { height: 176, weight: 56, tdee: 2117, targetCalories: 2700, targetProtein: 125 }
    };
};

export const saveUserProfile = async (profile: UserProfile) => {
    // We only save metrics part to backend user object
    const res = await fetch(`${API_URL}/user`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ metrics: profile.metrics })
    });
    if (res.ok) {
        const updated = await res.json();
        cachedUser = updated;
    }
};

export const getDietTemplate = async (): Promise<any[]> => {
    const user = await fetchUserData();
    if (user && user.templates && user.templates.diet) {
        return user.templates.diet;
    }
    return [];
};

export const saveDietTemplate = async (template: any[]) => {
    const res = await fetch(`${API_URL}/user`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ templates: { ...cachedUser?.templates, diet: template } })
    });
    if (res.ok) {
        const updated = await res.json();
        cachedUser = updated;
    }
};

export const getWorkoutTemplate = async (type: 'A' | 'B'): Promise<Partial<Exercise>[]> => {
    const user = await fetchUserData();
    const key = type === 'A' ? 'workoutA' : 'workoutB';
    
    if (user && user.templates && user.templates[key]) {
        return user.templates[key];
    }
    return [];
};

export const saveWorkoutTemplate = async (type: 'A' | 'B', template: Partial<Exercise>[]) => {
    const key = type === 'A' ? 'workoutA' : 'workoutB';
    const currentTemplates = cachedUser?.templates || {};
    
    const res = await fetch(`${API_URL}/user`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ templates: { ...currentTemplates, [key]: template } })
    });
    if (res.ok) {
        const updated = await res.json();
        cachedUser = updated;
    }
};

// --- LOGS ---

export const getDailyLog = async (dateStr: string): Promise<DailyLog> => {
    // 1. Try to fetch existing log
    const res = await fetch(`${API_URL}/logs/${dateStr}`, { headers: authHeader() });
    
    const user = await getUserProfile(); // Ensure we have latest metrics

    if (res.ok) {
        const log: DailyLog = await res.json();
        // SYNC: Always update targets to match current settings
        log.nutrition.targetCalories = user.metrics.targetCalories;
        log.nutrition.targetProtein = user.metrics.targetProtein;
        return log;
    }

    // 2. If 404, Generate new log locally based on fetched templates
    const dateObj = new Date(dateStr);
    const dayIndex = dateObj.getDay(); // 0 = Sun, 1 = Mon ...
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    
    const dietTpl = await getDietTemplate();

    // Generate Meals
    const meals: MealSlot[] = dietTpl.map((tpl: any, idx: number) => ({
        id: `meal-${idx}-${Date.now()}`,
        title: tpl.title,
        time: tpl.time,
        isConsumed: false,
        suggestedItems: tpl.suggestedItems,
        actualItems: []
    }));

    // Generate Workout
    let workoutType: Workout['type'] = "Rest";
    let exercises: Exercise[] = [];
    let isRestDay = true;

    if (dayIndex === 1 || dayIndex === 5) { // Mon, Fri
        workoutType = "Workout A";
        isRestDay = false;
        const tplA = await getWorkoutTemplate('A');
        exercises = mapTemplateToExercises(tplA);
    } else if (dayIndex === 3) { // Wed
        workoutType = "Workout B";
        isRestDay = false;
        const tplB = await getWorkoutTemplate('B');
        exercises = mapTemplateToExercises(tplB);
    } else {
        workoutType = "Active Recovery";
        isRestDay = true;
    }

    const newLog: DailyLog = {
        id: dateStr,
        date: dateStr,
        dayOfWeek: dayName,
        nutrition: {
            totalCaloriesConsumed: 0,
            totalProteinConsumed: 0,
            targetCalories: user.metrics.targetCalories,
            targetProtein: user.metrics.targetProtein,
            meals
        },
        workout: {
            type: workoutType,
            isRestDay,
            exercises,
            postWorkoutStretch: false
        }
    };

    // 3. Save the newly generated log to backend immediately
    await saveDailyLog(newLog);
    return newLog;
};

const mapTemplateToExercises = (tpl: Partial<Exercise>[]): Exercise[] => {
    return tpl.map((t, idx) => ({
        id: `ex-${idx}-${Date.now()}`,
        name: t.name || "Exercise",
        targetSets: t.targetSets || 3,
        targetRepsRange: t.targetRepsRange || "10",
        notes: t.notes || "",
        sets: Array.from({ length: t.targetSets || 3 }, (_, sIdx) => ({
            setNumber: sIdx + 1,
            reps: '',
            weight: '',
            completed: false
        }))
    }));
};

export const saveDailyLog = async (log: DailyLog) => {
    // Recalculate totals
    let totalCal = 0;
    let totalProt = 0;

    log.nutrition.meals.forEach(meal => {
        if (meal.isConsumed) {
            const items = meal.suggestedItems;
            items.forEach(i => {
                totalCal += i.calories;
                totalProt += i.protein;
            });
        }
    });

    log.nutrition.totalCaloriesConsumed = totalCal;
    log.nutrition.totalProteinConsumed = totalProt;

    await fetch(`${API_URL}/logs`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ date: log.date, data: log })
    });
};

export interface HistorySummary {
    date: string;
    dayOfWeek: string;
    calories: number;
    targetCalories: number;
    protein: number;
    workoutType: string;
}

export const getHistory = async (): Promise<HistorySummary[]> => {
    const res = await fetch(`${API_URL}/history`, { headers: authHeader() });
    if (res.ok) {
        return await res.json();
    }
    return [];
};
