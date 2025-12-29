require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// ===============================
// CORS
// ===============================
app.use(
  cors({
    origin: "https://medicycle-platform.vercel.app",
    credentials: true,
  })
);

// ===============================
// DATABASE
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// ===============================
// MODELS
// ===============================

// USER
const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "pharmacy" },
});
const User = mongoose.model("User", UserSchema);

// MEDICINE
const MedicineSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  batchNumber: String,
  condition: String,
  status: { type: String, default: "active" },
  createdAt: { type: Date, default: Date.now },
});
const Medicine = mongoose.model("Medicine", MedicineSchema);

// ===============================
// REQUEST LOGGER (DEBUG)
// ===============================
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ===============================
// AUTH ROUTES
// ===============================

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "pharmacy",
    });

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GOOGLE LOGIN
app.post("/api/auth/google", async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const hashed = await bcrypt.hash("google-auth", 10);
      user = await User.create({
        username: username || "Google User",
        email,
        password: hashed,
        role: "individual",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Google Auth Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ===============================
// INVENTORY ROUTES
// ===============================

// ADD MEDICINE
app.post("/api/inventory", async (req, res) => {
  try {
    const { name, quantity, expiryDate, batchNumber, condition } = req.body;

    if (!name || !quantity || !expiryDate) {
      return res.status(400).json({ msg: "Required fields missing" });
    }

    const medicine = await Medicine.create({
      name,
      quantity,
      expiryDate,
      batchNumber,
      condition,
      status: "active",
    });

    res.status(201).json(medicine);
  } catch (err) {
    console.error("❌ Add Medicine Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// GET ALL MEDICINES
app.get("/api/inventory", async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (err) {
    console.error("❌ Fetch Inventory Error:", err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 MediCycle Backend Running");
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  console.log("❌ ROUTE NOT FOUND:", req.method, req.url);
  res.status(404).json({ msg: "Route not found" });
});

// ===============================
// SERVER START
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
