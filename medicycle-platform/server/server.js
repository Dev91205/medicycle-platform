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

// ✅ ADDED: route hit log (CRITICAL)
app.use((req, res, next) => {
  console.log(`➡️ Incoming: ${req.method} ${req.url}`);
  next();
});

// 🔐 Google Login (Hackathon-safe)
app.post("/api/auth/google", async (req, res) => {
  try {
    console.log("✅ /api/auth/google HIT"); // ✅ ADDED

    const { username, email } = req.body;

    if (!email) {
      console.log("❌ Email missing");
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

// ✅ ADDED: final 404 catcher (DO NOT REMOVE)
app.use((req, res) => {
  console.log("❌ ROUTE NOT FOUND:", req.method, req.url);
  res.status(404).json({ msg: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on port ${PORT}`)
);
