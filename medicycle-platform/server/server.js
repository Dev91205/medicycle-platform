require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper for Expiry Logic
const calculateRisk = (expiryDate) => {
  const today = new Date();
  const exp = new Date(expiryDate);
  const diffTime = exp - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { level: 'EXPIRED', color: 'red', daysRemaining: diffDays };
  if (diffDays <= 30) return { level: 'CRITICAL', color: 'darkred', daysRemaining: diffDays };
  if (diffDays <= 60) return { level: 'WARNING', color: 'orange', daysRemaining: diffDays };
  return { level: 'SAFE', color: 'green', daysRemaining: diffDays };
};

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['individual', 'pharmacy', 'admin'], default: 'individual' },
  location: { type: String, default: 'Local Area' }
});
const User = mongoose.model('User', userSchema);

const medicineSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
  redistributionStatus: { type: String, enum: ['none', 'available', 'requested', 'transferred'], default: 'none' }
});
const Medicine = mongoose.model('Medicine', medicineSchema);

const redistributionSchema = new mongoose.Schema({
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  requestDate: { type: Date, default: Date.now }
});
const Redistribution = mongoose.model('Redistribution', redistributionSchema);

const app = express();
app.use(express.json());
app.use(cors());

// Middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) { res.status(400).json({ msg: 'Invalid Token' }); }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.json({ msg: "User registered" });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, username: user.username } });
});

app.get('/api/inventory/dashboard', auth, async (req, res) => {
    const medicines = await Medicine.find({ owner: req.user.id, status: 'active' });
    const analyzed = medicines.map(med => ({ ...med._doc, risk: calculateRisk(med.expiryDate) }));
    res.json({ inventory: analyzed });
});
app.post('/api/inventory', async (req, res) => {
  try {
    console.log("📥 Recieved Medicine Data:", req.body); // Debug log

    // 1. Get data from frontend
    const { name, quantity, expiryDate, batchNumber, condition } = req.body;

    // 2. 🛡️ GOD MODE: Use a fake Seller ID if user is not logged in
    // This allows the demo to work without authentication errors
    const sellerId = req.user ? req.user.id : "65d4c8f8e4b0a1b2c3d4e5f6"; 

    // 3. Create database entry
    // NOTE: Make sure 'Medicine' matches your model name at the top of the file
    const newMedicine = new Medicine({
      seller: sellerId,
      name,
      quantity,
      expiryDate,
      batchNumber,
      condition,
      status: 'Safe' // Default status
    });

    // 4. Save to MongoDB
    const savedMedicine = await newMedicine.save();
    
    console.log("✅ Medicine Saved!", savedMedicine);
    res.json(savedMedicine);

  } catch (err) {
    console.error("❌ Save Failed:", err.message);
    res.status(500).send('Server Error: ' + err.message);
  }
});

app.get('/api/redistribute/market', auth, async (req, res) => {
    const market = await Medicine.find({ owner: { $ne: req.user.id }, redistributionStatus: 'available' })
        .populate('owner', 'username location');
    const analyzed = market.map(m => ({ ...m._doc, risk: calculateRisk(m.expiryDate) }));
    res.json(analyzed);
});

app.post('/api/redistribute/request', auth, async (req, res) => {
    const { medicineId } = req.body;
    const medicine = await Medicine.findById(medicineId);
    if (!medicine || medicine.redistributionStatus !== 'available') return res.status(400).json({ msg: 'Unavailable' });
    
    const request = new Redistribution({
        medicineId, fromUser: medicine.owner, toUser: req.user.id, status: 'pending'
    });
    await request.save();
    
    medicine.redistributionStatus = 'requested';
    await medicine.save();
    res.json({ msg: 'Request Sent' });
});

app.get('/api/redistribute/pending', auth, async (req, res) => {
    const requests = await Redistribution.find({ fromUser: req.user.id, status: 'pending' })
        .populate('medicineId').populate('toUser', 'username');
    res.json(requests);
});

app.put('/api/redistribute/respond', auth, async (req, res) => {
    const { requestId, action } = req.body;
    const request = await Redistribution.findById(requestId);
    const medicine = await Medicine.findById(request.medicineId);

    if (action === 'accept') {
        request.status = 'accepted';
        medicine.owner = request.toUser;
        medicine.redistributionStatus = 'none';
    } else {
        request.status = 'rejected';
        medicine.redistributionStatus = 'available';
    }
    await medicine.save();
    await request.save();
    res.json({ msg: 'Processed' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
    .then(() => app.listen(PORT, () => console.log('Server running')))
    .catch(err => console.log(err));
