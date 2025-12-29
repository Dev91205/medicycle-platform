require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// 🔒 CORS – allow Vercel frontend
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
const UserSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "pharmacy" },
});
const User = mongoose.model("User", UserSchema);

// ===============================
// AUTH ROUTES
// ===============================

// ✅ route hit log
app.use((req, res, next) => {
  console.log(`➡️ Incoming: ${req.method} ${req.url}`);
  next();
});

/* =====================================================
   ✅ ADDED: STANDARD LOGIN ROUTE (THIS FIXES THE 404)
===================================================== */
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

// 🔐 Google Login (already correct)
app.post("/api/auth/google", async (req, res) => {
  try {
    console.log("✅ /api/auth/google HIT");

    const { username, email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      const hashed = await bcrypt.hash("google-auth", 10);
      user = await User.create({
        username,
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
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 MediCycle Backend Running");
});

// 404 catcher
app.use((req, res) => {
  console.log("❌ ROUTE NOT FOUND:", req.method, req.url);
  res.status(404).json({ msg: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
