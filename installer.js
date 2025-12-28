const fs = require('fs');
const path = require('path');

// --- PROJECT CONFIGURATION ---
const rootDir = 'medicycle-platform';

// Helper to create directories recursively
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

const files = {
  // ================= SERVER FILES =================
  'server/package.json': `{
  "name": "medicycle-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^7.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`,

  'server/.env': `PORT=5000
MONGO_URI=mongodb+srv://admin:password123@cluster0.mongodb.net/medicycle
JWT_SECRET=hackathon_secret_key_2025`,

  'server/server.js': `require('dotenv').config();
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
`,

  // ================= CLIENT FILES =================
  'client/package.json': `{
  "name": "medicycle-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.0"
  }
}`,

  'client/vite.config.js': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`,

  'client/index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MediCycle Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,

  'client/postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,

  'client/tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,

  'client/src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

body { background-color: #f9fafb; }`,

  'client/src/main.jsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,

  'client/src/App.jsx': `import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import ApprovalDashboard from './components/ApprovalDashboard';

const Login = () => {
  const handleLogin = () => {
    localStorage.setItem('token', 'DEMO_TOKEN');
    window.location.href = '/dashboard';
  };
  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">MediCycle</h1>
      <button onClick={handleLogin} className="bg-blue-600 text-white px-6 py-3 rounded shadow hover:bg-blue-700">
        Login as Demo Pharmacy
      </button>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <nav className="bg-white shadow p-4 mb-4 flex gap-6 items-center">
          <Link to="/dashboard" className="font-bold text-xl text-blue-600">MediCycle</Link>
          <div className="flex gap-4 text-gray-600">
            <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>
            <Link to="/marketplace" className="hover:text-blue-500">Marketplace</Link>
            <Link to="/approvals" className="hover:text-blue-500">Approvals</Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/approvals" element={<ApprovalDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}`,

  'client/src/components/Dashboard.jsx': `import React, { useState } from 'react';
export default function Dashboard() {
  // MOCK DATA for Demo
  const stats = { critical: 2, warning: 5, valueAtRisk: 450 };
  const inventory = [
    { _id: 1, name: 'Amoxicillin', batchNumber: 'B101', expiryDate: '2025-01-20', risk: { level: 'CRITICAL', color: 'text-red-600 bg-red-100' } },
    { _id: 2, name: 'Paracetamol', batchNumber: 'P200', expiryDate: '2025-04-10', risk: { level: 'SAFE', color: 'text-green-600 bg-green-100' } }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Inventory Intelligence</h1>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
            <h3>Critical Risk</h3><p className="text-3xl font-bold">{stats.critical}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-yellow-500">
            <h3>Warning Zone</h3><p className="text-3xl font-bold">{stats.warning}</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
            <h3>Value at Risk</h3><p className="text-3xl font-bold">$ {stats.valueAtRisk}</p>
        </div>
      </div>
      <div className="bg-white rounded shadow p-4">
        <table className="w-full text-left">
            <thead><tr className="border-b bg-gray-50"><th className="p-3">Medicine</th><th className="p-3">Batch</th><th className="p-3">Risk</th></tr></thead>
            <tbody>
                {inventory.map(item => (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.name}</td>
                        <td className="p-3 text-gray-500">{item.batchNumber}</td>
                        <td className="p-3">
                            <span className={"px-2 py-1 rounded text-xs font-bold " + item.risk.color}>
                                {item.risk.level}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}`,

  'client/src/components/Marketplace.jsx': `import React, { useState } from 'react';
import { Package } from 'lucide-react';

export default function Marketplace() {
  const [items, setItems] = useState([
    { _id: '1', name: 'Amoxicillin', quantity: 50, expiryDate: '2025-01-20', owner: { username: 'City Pharmacy' } }
  ]);
  
  const handleRequest = (id) => {
    alert("Request Sent Successfully!");
    setItems(items.filter(i => i._id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Redistribution Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
                <Package className="text-blue-500" size={20} />
                <h2 className="text-xl font-bold">{item.name}</h2>
            </div>
            <p className="text-red-500 font-bold text-sm mb-2">Expires: {item.expiryDate}</p>
            <p className="text-gray-500 text-sm mb-4">Source: {item.owner.username}</p>
            <button onClick={() => handleRequest(item._id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition">
              Request Stock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,

  'client/src/components/ApprovalDashboard.jsx': `import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function ApprovalDashboard() {
  const [requests, setRequests] = useState([
    { _id: '101', medicineId: { name: 'Amoxicillin' }, toUser: { username: 'Clinic B' } }
  ]);

  const respond = (id, action) => {
    alert("Request " + action + "ed!");
    setRequests(requests.filter(r => r._id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Incoming Requests</h1>
      {requests.length === 0 ? <p className="text-gray-500">No pending requests.</p> : requests.map(req => (
        <div key={req._id} className="bg-white p-6 rounded shadow border flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg">{req.medicineId.name}</h3>
            <p className="text-sm text-gray-500">Requested by: <span className="text-blue-600">{req.toUser.username}</span></p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => respond(req._id, 'reject')} className="flex items-center gap-1 px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50">
                <X size={16} /> Reject
            </button>
            <button onClick={() => respond(req._id, 'accept')} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <Check size={16} /> Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}`
};

// --- INSTALLER LOGIC ---
console.log('🚀 Starting MediCycle Installer in folder: ' + rootDir + '...');

if (!fs.existsSync(rootDir)) fs.mkdirSync(rootDir);

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(rootDir, filePath);
  
  // Ensure the directory exists before writing the file
  ensureDirectoryExistence(fullPath);

  fs.writeFileSync(fullPath, content);
  console.log('✅ Created: ' + filePath);
});

console.log('-------------------------------------------');
console.log('🎉 INSTALLATION COMPLETE!');
console.log('-------------------------------------------');