import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Verbose CORS options with logging to help debug frontend CORS issues
const corsOptions = {
  origin: (origin, callback) => {
    // allow requests from any origin
    callback(null, true);
  },
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// (request logging removed)

// Handle OPTIONS preflight globally and log details
// Use a valid path pattern for express/path-to-regexp
// Handle OPTIONS preflight globally via middleware to avoid path-to-regexp issues
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, x-auth-token');
    return res.sendStatus(200);
  }
  next();
});

const MONGO_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// --- DB ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- DATA CONSTANTS ---
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
  { title: "Bedtime (Recovery)", time: "22:30", suggestedItems: BEDTIME }
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
    diet: { type: Array, default: DEFAULT_DIET_TEMPLATE },
    workoutA: { type: Array, default: [] },
    workoutB: { type: Array, default: [] }
  }
});

const LogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  data: { type: Object, required: true }
});

LogSchema.index({ userId: 1, date: 1 }, { unique: true });

const User = mongoose.model('User', UserSchema);
const Log = mongoose.model('Log', LogSchema);

// --- AUTH MIDDLEWARE ---
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    console.error('Token invalid:', err && err.message);
    res.status(401).json({ msg: 'Token invalid' });
  }
};

// --- ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ msg: 'Missing fields' });

  const exists = await User.findOne({ username });
  if (exists) return res.status(400).json({ msg: 'User exists' });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hash
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

app.get('/api/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/logs/:date', auth, async (req, res) => {
  try {
    const log = await Log.findOne({
      userId: req.user.id,
      date: req.params.date
    });

    if (!log) return res.status(404).json({ msg: 'Log not found' });

    res.json(log.data);
  } catch (err) {
    console.error('Get log error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


app.post('/api/logs', auth, async (req, res) => {
  try {
    const { date, data } = req.body;
    if (!date || !data) {
      return res.status(400).json({ msg: 'Date and data required' });
    }

    // Normalize
    data.id = date;
    data.date = date;

    const log = await Log.findOneAndUpdate(
      { userId: req.user.id, date },
      { userId: req.user.id, date, data },
      { new: true, upsert: true }
    );

    res.json(log.data);
  } catch (err) {
    console.error('Save log error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.get('/api/history', auth, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.id }).sort({ date: -1 });

    const history = logs.map(l => ({
      date: l.date,
      calories: l.data?.nutrition?.totalCaloriesConsumed ?? 0,
      targetCalories: l.data?.nutrition?.targetCalories ?? 0,
      protein: l.data?.nutrition?.totalProteinConsumed ?? 0,
      workoutType: l.data?.workout?.type ?? null
    }));

    res.json(history);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
