require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize App
const app = express();
app.use(express.json());
app.use(cors());

// ==========================================
// 1️⃣ DATABASE CONNECTION
// ==========================================
// Use your local URI or this fallback for testing
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/medicycle?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// ==========================================
// 2️⃣ MODELS
// ==========================================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'pharmacy' } 
});
const User = mongoose.model('User', userSchema);

const medicineSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  batchNumber: { type: String },
  condition: { type: String },
  status: { type: String, default: 'active' }, // active, sold, expired
  date: { type: Date, default: Date.now }
});
const Medicine = mongoose.model('Medicine', medicineSchema);

const transactionSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' }, // pending, approved, rejected
  quantity: { type: Number, default: 1 },
  requestDate: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// ==========================================
// 3️⃣ HELPER: Risk Calculator
// ==========================================
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

// ==========================================
// 4️⃣ AUTH ROUTES (Login/Register)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    user = new User({ username, email, password: hashedPassword, role });
    await user.save();

    res.json({ msg: 'User registered successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check User
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

    // Create Token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'secret123', 
      { expiresIn: '1h' }
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 5️⃣ GOD MODE INVENTORY ROUTES
// ==========================================

// GET: Return ALL medicines (Universal View)
app.get('/api/inventory', async (req, res) => {
  try {
    // Fetch all medicines, newest first
    const medicines = await Medicine.find().sort({ date: -1 });
    
    // Add the risk analysis
    const analyzed = medicines.map(med => ({ 
      ...med._doc, 
      risk: calculateRisk(med.expiryDate) 
    }));
    
    // Return ARRAY directly (matches your frontend logic)
    res.json(analyzed);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST: Add Medicine (Universal Add)
app.post('/api/inventory', async (req, res) => {
  try {
    const { name, quantity, expiryDate, batchNumber, condition } = req.body;

    // 🛠️ HACK: Use a "Demo ID" if user is not logged in
    // This creates a fake "Pharmacy Owner" so the app doesn't crash
    const demoOwnerId = "65d4c8f8e4b0a1b2c3d4e5f6"; 
    
    // Try to get ID from token if it exists, otherwise use Demo ID
    let ownerId = demoOwnerId;
    const token = req.header('x-auth-token');
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        ownerId = decoded.id;
      } catch (e) { /* Token invalid? Ignore and use demo ID */ }
    }

    const newMedicine = new Medicine({
      owner: ownerId,
      name,
      quantity,
      expiryDate,
      batchNumber,
      condition,
      status: 'active'
    });

    const medicine = await newMedicine.save();
    console.log("✅ Medicine Added:", medicine);
    res.json(medicine);

  } catch (err) {
    console.error("❌ Add Failed:", err.message);
    res.status(500).send('Server Error');
  }
});

// ==========================================
// 6️⃣ APPROVALS / TRANSACTIONS ROUTES
// ==========================================

// GET Pending Requests
app.get('/api/transactions/pending', async (req, res) => {
  try {
    // For Demo: Return ALL pending transactions
    const requests = await Transaction.find({ status: 'pending' })
      .populate('medicine')
      .populate('buyer', 'username')
      .populate('seller', 'username');
      
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// PUT (Approve/Reject) Request
app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    
    // Update Transaction
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    // If approved, update the Medicine status too
    if (status === 'approved' && transaction.medicine) {
        await Medicine.findByIdAndUpdate(transaction.medicine, { status: 'sold' });
    }

    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));