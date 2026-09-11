# SIH26162 — NTIS (National Thermal Intelligence System)

> **NTIS — National Thermal Intelligence System**  
> *AI-Powered Industrial Fire & Persistent Thermal Source Intelligence*

[![Smart India Hackathon](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-green.svg)](https://leafletjs.com/)

---

## 📌 Problem Statement Overview
- **Project ID:** SIH26162
- **Title:** AI-Based Detection and Classification of Industrial Fires and Persistent Thermal Sources Using NASA FIRMS, OSM & Satellite Data
- **Objective:** Provide mission-critical situational awareness by detecting, classifying, and monitoring high-temperature industrial anomalies, flare stacks, persistent heat signatures, and potential wildfire hazards near industrial corridors.

---

## 🌟 Key Features
- **Real-Time Geospatial Map**: Interactive 1:1 square & full-screen Leaflet cartography with custom SVG pulsing markers, risk level filters, and industrial plant overlays.
- **Automated Risk Evaluation**: Classifies anomalies into `CRITICAL`, `HIGH`, `MEDIUM`, and `LOW` risk tiers using Fire Radiative Power (MW) and proximity algorithms.
- **Persistent Thermal Source Tracking**: Tracks multi-day recurring hotspots across satellite revisit passes.
- **Priority Alerts & Notification Engine**: Real-time notification popover, simulated alert dispatcher, and floating toast system.
- **Command Palette Global Search (`Ctrl+K`)**: Rapid search across anomalies, industrial facilities, and system pages.
- **Interactive Analytics**: 4 visualization charts (risk distribution, 24h trendline, average FRP horizontal bars, satellite source breakdown).
- **Comprehensive Authentication Suite (`/login`)**: Role-based access for Senior Dispatchers, System Admins, and Field Inspectors.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm / pnpm / yarn

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/vivekramina/SIH-2026.git

# Navigate to the frontend application directory
cd SIH-2026/thermal-watch-ai
# OR if at repo root
cd thermal-watch-ai

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
thermal-watch-ai/
├── src/
│   ├── components/
│   │   ├── dashboard/       # Metric cards, charts, priority alerts, system status
│   │   ├── layout/          # AppShell, Sidebar, Topbar
│   │   ├── map/             # ThermalMap (Leaflet), Popups, Legend
│   │   └── ui/              # 3D ToggleSwitch, SearchModal (Ctrl+K), Toasts
│   ├── context/             # AppContext (Auth, Alerts, Toasts, State)
│   ├── data/                # Mock Data (FIRMS detections, OSM facilities, alerts)
│   ├── lib/                 # Utility functions & formatting helpers
│   ├── pages/               # Overview, LiveMap, Detections, Analytics, Alerts, Settings, Auth
│   ├── services/            # API mock/REST service layer
│   └── types/               # TypeScript interfaces & domain models
```

---

## 🔒 Security Note
All satellite sensor credentials and NASA FIRMS API keys are managed server-side. No proprietary credentials are exposed in the client-side bundle.

---
© 2026 THERMAL WATCH AI — Smart India Hackathon (SIH26162)
