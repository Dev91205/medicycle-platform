# MediCycle — Smart Medicine Lifecycle & Inventory Intelligence Platform

MediCycle is a smart medicine lifecycle and inventory intelligence platform designed to reduce medicine wastage caused by expiry, poor tracking, and inefficient stock management across individuals, pharmacies, clinics, and hospitals.

Unlike traditional reminder-based systems, MediCycle combines **batch-wise tracking**, **expiry risk analysis**, **usage insights**, and a **controlled redistribution mechanism** to ensure medicines are utilized before expiry while maintaining compliance and safety.

---

## Problem Statement

Medicine expiry and poor inventory visibility lead to:

- Expired medicines in homes, pharmacies, and clinics
- Financial losses due to stock mismanagement
- Safety risks from unnoticed expiries
- Lack of systems for redistribution of near-expiry stock
- Manual tracking practices with no predictive insights

There is no centralized platform that monitors medicines from **purchase to expiry** with intelligent analysis.

---

## Solution Overview

MediCycle provides:

- Batch-wise medicine tracking with expiry awareness
- Usage pattern analysis and expiry risk prediction
- Inventory intelligence to identify slow-moving stock
- A redistribution marketplace for near-expiry medicines
- Reports and analytics for compliance and planning

The system enables **optimized inventory management and reduced wastage** through predictive and actionable insights.

---

## Who Can Use MediCycle?

- Individual users managing home medicines
- Pharmacies and medical shops
- Clinics and hospitals

---

## Core Features

- Medicine registration with batch number, expiry date, and quantity
- Batch-wise inventory tracking for the same medicine across different expiries
- Expiry risk monitoring with timely alerts
- Usage analysis and demand forecasting
- FIFO-based selling support
- Redistribution module for near-expiry medicines between pharmacies/clinics
- Inventory reports and analytics for compliance and planning

---

## Process Flow

1. User/Pharmacy logs into the system
2. Adds medicine details (name, batch, expiry, quantity)
3. System performs:
   - Expiry tracking
   - Usage analysis
   - Risk prediction
   - Near-expiry alerts
4. Actions enabled:
   - FIFO selling
   - Redistribute near-expiry stock
   - Generate reports

---

## System Architecture

**Frontend**
- React Web Application
- Material Design UI

**Backend**
- Node.js + Express

**Database**
- Firebase Firestore (real-time updates)

**Cloud & Services**
- Firebase Authentication (Google Sign-In)
- Google Cloud Functions
- TensorFlow.js (client-side demand forecasting)

**Architecture Highlights**
- Modular and scalable
- Secure role-based access
- Cloud-ready infrastructure
- Real-time data synchronization

---

## Google Technologies Used

- **TensorFlow.js** — Linear regression model for smart demand forecasting directly in the browser
- **Firebase Authentication** — Secure login with Google Sign-In
- **Firebase Firestore** — Real-time database
- **Google Cloud Functions** — Serverless backend logic
- **Material Design / Google Fonts** — Accessible UI

---

## MVP Snapshots

The MVP includes:

- Secure login screen
- Inventory health dashboard
- Redistribution marketplace
- Incoming stock requests
- Inventory insights and alerts

(Refer to slides for visual snapshots)

---

## Future Enhancements

- Advanced AI-based demand forecasting
- Supplier integration
- Government compliance reporting
- Mobile application
- Blockchain-based medicine traceability

---

## Live Links

- **GitHub Repository**: https://github.com/Dev91205/medicycle-platform
- **MVP Deployment**: https://medicycle-platform.vercel.app/
- **Demo Video**: https://drive.google.com/drive/folders/1Bb5BPIJNR9PvQp02GMxL1Ztuon_366IQ

---

## Impact

MediCycle transforms medicine management from a **reactive reminder system** into a **predictive, intelligent inventory platform** that:

- Reduces medicine wastage
- Improves stock utilization
- Enhances safety and compliance
- Enables redistribution before expiry
- Provides actionable inventory intelligence

---


