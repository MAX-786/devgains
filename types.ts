export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealSlot {
  id: string;
  title: string;
  time: string; // HH:MM
  isConsumed: boolean;
  suggestedItems: FoodItem[];
  actualItems: FoodItem[]; // Empty implies consumed suggested
}

export interface ExerciseSet {
  setNumber: number;
  reps: number | string;
  weight: number | string;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  targetSets: number;
  targetRepsRange: string;
  notes: string;
  sets: ExerciseSet[];
}

export interface Workout {
  type: "Workout A" | "Workout B" | "Rest" | "Active Recovery";
  isRestDay: boolean;
  exercises: Exercise[];
  postWorkoutStretch: boolean;
}

export interface NutritionSummary {
  totalCaloriesConsumed: number;
  totalProteinConsumed: number;
  targetCalories: number;
  targetProtein: number;
  meals: MealSlot[];
}

export interface DailyLog {
  id: string; // usually date string YYYY-MM-DD
  date: string;
  dayOfWeek: string;
  nutrition: NutritionSummary;
  workout: Workout;
  notes?: string;
}

export interface UserProfile {
  name: string;
  metrics: {
    height: number;
    weight: number;
    tdee: number;
    targetCalories: number;
    targetProtein: number;
  };
}