const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
// Allow all origins to prevent CORS issues during development
app.use(cors({ origin: '*' }));

// REPLACE <db_password> with your actual password
const MONGO_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- DATA CONSTANTS (Source of Truth) ---

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

// --- SCHEMAS ---

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  metrics: {
    height: { type: Number, default: 176 },
    weight: { type: Number, default: 56 },
    tdee: { type: Number, default: 2117 },
    targetCalories: { type: Number, default: 2700 },
    targetProtein: { type: Number, default: 125 }
  },
  templates: {
    diet: { type: Array, default: [] }, 
    workoutA: { type: Array, default: [] },
    workoutB: { type: Array, default: [] }
  }
});

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  data: { type: Object, required: true } // The Full DailyLog object
});

LogSchema.index({ userId: 1, date: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Log = mongoose.model('Log', LogSchema);

// --- MIDDLEWARE ---

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

// --- ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
  console.log('Register request:', req.body.username);
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'Please enter all fields' });

  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Initialize New User with Defaults
    user = new User({ 
        username, 
        password,
        templates: {
            diet: DEFAULT_DIET_TEMPLATE,
            workoutA: DEFAULT_WORKOUT_A,
            workoutB: DEFAULT_WORKOUT_B
        }
    });
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    await user.save();

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 3600 * 24 * 30 });
    res.json({ token, user: { id: user.id, username: user.username, metrics: user.metrics } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  console.log('Login request:', req.body.username);
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'Please enter all fields' });

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'User does not exist' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 3600 * 24 * 30 });
    res.json({ token, user: { id: user.id, username: user.username, metrics: user.metrics } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile & Templates
app.get('/api/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Profile (Metrics or Templates)
app.put('/api/user', auth, async (req, res) => {
  try {
    const updates = req.body; 
    const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Log by Date
app.get('/api/logs/:date', auth, async (req, res) => {
  try {
    const log = await Log.findOne({ userId: req.user.id, date: req.params.date });
    if (!log) return res.status(404).json({ msg: 'Log not found' });
    res.json(log.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save Log
app.post('/api/logs', auth, async (req, res) => {
  try {
    const { date, data } = req.body;
    
    const log = await Log.findOneAndUpdate(
      { userId: req.user.id, date },
      { data },
      { new: true, upsert: true }
    );
    res.json(log.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All History (Summary)
app.get('/api/history', auth, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.id }).sort({ date: -1 });
    const history = logs.map(l => ({
        date: l.date,
        dayOfWeek: l.data.dayOfWeek,
        calories: l.data.nutrition.totalCaloriesConsumed,
        targetCalories: l.data.nutrition.targetCalories,
        protein: l.data.nutrition.totalProteinConsumed,
        workoutType: l.data.workout.type
    }));
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
