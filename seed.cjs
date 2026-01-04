const mongoose = require('mongoose');

// --- CONSTANTS TO SEED ---
const MP_BREAKFAST_ITEMS = [
  { name: "Indori Poha + Peanuts", calories: 350, protein: 8, carbs: 60, fats: 12 },
  { name: "Jeeravan Sev (1 tbsp)", calories: 60, protein: 2, carbs: 5, fats: 4 },
  { name: "Buffalo Milk (250ml)", calories: 240, protein: 9, carbs: 12, fats: 16 }
];

const SATTU_SHAKE = [
  { name: "Sattu Powder (4 tbsp)", calories: 200, protein: 12, carbs: 30, fats: 4 },
  { name: "Buttermilk/Curd (200ml)", calories: 120, protein: 8, carbs: 10, fats: 6 },
  { name: "Chia Seeds (1 tsp)", calories: 30, protein: 1, carbs: 2, fats: 2 }
];

const LUNCH_ITEMS = [
  { name: "Dal Tadka (1 bowl)", calories: 220, protein: 12, carbs: 30, fats: 6 },
  { name: "Wheat Roti (3 pcs)", calories: 300, protein: 9, carbs: 54, fats: 3 },
  { name: "Green Salad", calories: 20, protein: 1, carbs: 4, fats: 0 },
  { name: "Ghee (1 tsp)", calories: 45, protein: 0, carbs: 0, fats: 5 }
];

const EVENING_SNACK = [
  { name: "Roasted Chana (1 handful)", calories: 160, protein: 8, carbs: 22, fats: 3 },
  { name: "Banana", calories: 105, protein: 1, carbs: 27, fats: 0 }
];

const DINNER_ITEMS = [
  { name: "Paneer Bhurji / Soya Chunk Curry", calories: 280, protein: 22, carbs: 8, fats: 18 },
  { name: "Multigrain Roti (2 pcs)", calories: 220, protein: 7, carbs: 38, fats: 3 }
];

const BEDTIME = [
  { name: "Turmeric Milk (Buffalo)", calories: 180, protein: 7, carbs: 10, fats: 10 },
  { name: "Almonds (5 pcs)", calories: 35, protein: 1, carbs: 1, fats: 3 }
];

const DEFAULT_DIET_TEMPLATE = [
  { title: "Morning Hydration", time: "07:00", suggestedItems: [{ name: "Lime Water + Salt", calories: 10, protein: 0, carbs: 2, fats: 0 }] },
  { title: "Breakfast (Anabolic Primer)", time: "08:30", suggestedItems: MP_BREAKFAST_ITEMS },
  { title: "Mid-Morning (Liquid Surplus)", time: "11:00", suggestedItems: SATTU_SHAKE },
  { title: "Lunch (Sustained Energy)", time: "13:30", suggestedItems: LUNCH_ITEMS },
  { title: "Pre-Workout / Snack", time: "17:00", suggestedItems: EVENING_SNACK },
  { title: "Dinner (Protein Focus)", time: "20:30", suggestedItems: DINNER_ITEMS },
  { title: "Bedtime (Recovery)", time: "22:30", suggestedItems: BEDTIME },
];

const DEFAULT_WORKOUT_A = [
  { name: "Goblet Squat", targetSets: 3, targetRepsRange: "8-10", notes: "Keep torso upright. Heels planted." },
  { name: "DB Bench Press", targetSets: 3, targetRepsRange: "8-12", notes: "Full ROM. Don't flair elbows." },
  { name: "Seated Cable Row", targetSets: 3, targetRepsRange: "10-12", notes: "Squeeze scapula. Fix that posture!" },
  { name: "Face Pulls", targetSets: 3, targetRepsRange: "15-20", notes: "Critical for Text Neck. Pull to forehead." }
];

const DEFAULT_WORKOUT_B = [
  { name: "Romanian Deadlift", targetSets: 3, targetRepsRange: "8-10", notes: "Feel the hamstring stretch. Back straight." },
  { name: "Lat Pulldown", targetSets: 3, targetRepsRange: "10-12", notes: "Drive elbows down. Chest up." },
  { name: "Overhead Press", targetSets: 3, targetRepsRange: "8-10", notes: "Tight core. Don't arch lower back." },
  { name: "Doorway Stretch", targetSets: 2, targetRepsRange: "30 sec", notes: "Open up that tight chest from coding." }
];

// --- DB CONNECTION ---
const MONGO_URI = 'mongodb+srv://admin:x9eQEG7zyGwFXUoZ@cluster0.sy7iv1v.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    seedData();
  })
  .catch(err => {
      console.error('MongoDB Connection Error:', err);
      process.exit(1);
  });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  templates: {
    diet: { type: Array, default: [] }, 
    workoutA: { type: Array, default: [] },
    workoutB: { type: Array, default: [] }
  }
}, { strict: false }); // Strict false to avoid validation errors on fields we don't care about here

const User = mongoose.model('User', UserSchema);

const seedData = async () => {
    const TARGET_USERNAME = 'mohammad'; 

    try {
        console.log(`Checking for user: ${TARGET_USERNAME}...`);
        const user = await User.findOne({ username: TARGET_USERNAME });

        if (!user) {
            console.log(`User '${TARGET_USERNAME}' not found. Please register via the app first, then run this script if templates are missing.`);
        } else {
            console.log(`Updating templates for '${TARGET_USERNAME}'...`);
            user.templates = {
                diet: DEFAULT_DIET_TEMPLATE,
                workoutA: DEFAULT_WORKOUT_A,
                workoutB: DEFAULT_WORKOUT_B
            };
            await user.save();
            console.log('✅ Templates successfully seeded!');
        }
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        mongoose.disconnect();
        process.exit(0);
    }
};
