# 🏙️ AI Smart City Portal - Unified Urban Intelligence & GIS Platform

An advanced, full-stack municipal digital portal integrating **real-time GIS mapping**, **generative natural language urban intelligence**, **citizen municipal document workflows**, and **local persistent citizen identity management** for Indian metropolises (Pune, Mumbai, Delhi, Bengaluru, Hyderabad, Chennai).

---

## 🌟 Key Features & Capabilities

### 1. 🗺️ Interactive GIS & Google Maps Navigation
- **Multi-layer GIS Switcher**: Stream default **Google Maps** road tiles, high-contrast Dark CartoDB GIS, Esri World Imagery Satellite, and OpenStreetMap.
- **POIs & Municipal Grids**: Dynamic pins for hospitals with live ICU availability, 112 police stations, heritage tourist landmarks, and metro transit corridors.
- **1-Click Live Navigation**: Every location pin includes a direct **"🧭 Directions in Google Maps"** trigger that automatically routes users from their current GPS location.

### 2. 💬 AI Smart City Assistant
- **Generative Conversational Engine**: Powered by Google's generative models (`gemini-flash-lite-latest` and `gemini-flash-latest`) with conversational context memory up to 8 conversation turns.
- **Categorized Starter Questions**: Clean initial zero-state interface that proposes categorized prompts across Emergency Care, Historic Sightseeing, Public Transit, and Civic Documents.
- **Dynamic Follow-Up Suggestions**: Generates actionable contextual chips for navigation, bus routes, hospital bed tracking, and digital passes.
- **Text-to-Speech & Clipboard**: Instant browser speech synthesis audio playback and 1-click clipboard copying.

### 3. 👤 LocalStorage Citizen Account System
- **Browser-Persistent Authentication**: Complete client-side account management stored in `localStorage` under `SMART_CITY_ACCOUNTS_DB`.
- **Session Auto-Restoration**: Automatically restores logged-in citizen sessions upon page refresh or browser restart.
- **Registered Accounts Directory**: Dedicated Profile tab showcasing stored credentials, assigned roles (Citizen / Admin), and demo profile switching.

### 4. 🏛️ Citizen Services & Municipal Documentation Checklists
- Pre-configured checklists for Civil Registry Certificates (Birth, Death, Marriage certificates), Property Tax assessments, Trade Permits, and Building Approvals.
- Processing timelines, fee schedules, required document breakdowns, and direct links to official municipal corporation portals.

### 5. 🌦️ Ambient Weather & Environmental Telemetry
- Real-time ambient temperature, humidity, wind speed, condition outlook, and Air Quality Index (AQI) tracking across cities.

---

## 🏗️ Technical Architecture & Stack

```
Ai smart city/
├── frontend/               # Next.js 16 Web Application (Port 3000)
│   ├── src/
│   │   ├── app/            # App Router, Layouts & API Endpoints (/api/chat, /api/auth, /api/hospitals)
│   │   ├── components/     # UI Components (SmartCityMap, AIChatbot)
│   │   ├── data/           # Smart City multi-city telemetry & POI data
│   │   ├── services/       # LocalStorage Auth & AI Chat Engines
│   │   └── types/          # TypeScript domain interfaces
│   ├── public/             # Static city imagery & SVG assets
│   ├── package.json
│   └── next.config.ts
│
├── backend/                # Spring Boot 4 / Java 23 Service (Port 8085)
│   ├── src/main/java/com/smartcity/backend/
│   │   ├── controller/     # REST Endpoints (/api/chat)
│   │   ├── service/        # Gemini AI integration service
│   │   └── dto/            # Request & Response DTOs
│   ├── src/main/resources/
│   │   └── application.properties # Server port & AI configurations
│   ├── build.gradle
│   └── gradlew.bat
│
├── .gitignore
├── start-all.ps1
└── README.md
```

### 💻 Technologies Used
| Component | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Frontend Framework** | Next.js (Turbopack) | 16.3.8 | React server & client components, API routes |
| **UI Library** | React | 19.0.0 | Component state & reactive DOM rendering |
| **Language** | TypeScript | 5.x | Strict type safety for civic telemetry & POIs |
| **Icons & Styling** | Lucide React + TailwindCSS | 4.x | Design system, glassmorphism & responsive layout |
| **GIS Mapping** | Leaflet.js | 1.9.4 | Interactive map tiles, markers, popups & layers |
| **Map Tiles** | Google Maps Tiles API | Live | Road map streaming & external GPS routing |
| **AI Integration** | Google Gemini Generative API | Flash-Lite Latest | Natural language responses with multi-turn memory |
| **Backend Service** | Spring Boot | 4.1.1 | Enterprise Java REST API service |
| **JDK Runtime** | OpenJDK / Java | 23 | High performance virtual threads & backend runtime |
| **Build Automation** | Gradle Wrapper | 8.x | Automated Java dependency resolution & execution |

---

## 🚀 Step-by-Step Setup & Running Guide

### Prerequisites
- **Node.js** (v18.18+ or v20+)
- **Java JDK 23** (or JDK 21+)
- **PowerShell** / Bash terminal

---

### Step 1: Run the Spring Boot Backend
Open a terminal in the `backend/` directory:
```powershell
cd "backend"
.\gradlew.bat bootRun
```
- The backend starts on port **`8085`**.
- Verifiable at: `http://localhost:8085`

---

### Step 2: Run the Next.js Frontend
Open a second terminal in the `frontend/` directory:
```powershell
cd "frontend"
npm install
npm run dev
```
- The frontend will launch at: **`http://localhost:3000`**

---

### Option 3: Launch Everything Simultaneously (1-Click)
In the project root folder:
```powershell
.\start-all.ps1
```

---

## 🌐 Complete Web Application Architecture Flow

```
[User Browser] (http://localhost:3000)
       │
       ├─► 1. Next.js Client Layer (React 19, TypeScript)
       │       │
       │       ├─► Interactive GIS Map (Leaflet.js + Google Maps Tiles API)
       │       │        └─► Click Pin ─► External Redirect to Google Maps Directions (GPS)
       │       │
       │       ├─► Citizen Account Store (Browser LocalStorage)
       │       │        └─► Session Auto-Restoration & Stored Accounts Directory
       │       │
       │       └─► SmartCity Assistant UI (Categorized Starter Questions & Animations)
       │                │
       │                ▼
       ├─► 2. Next.js App Router API (/api/chat)
       │       │
       │       ├─► Direct Google Gemini Engine (gemini-flash-lite-latest)
       │       │        └─► Multi-turn Context Memory (8 turns)
       │       │
       │       └─► Secondary Proxy: Spring Boot 4 Service (http://localhost:8085/api/chat)
       │                │
       │                ▼
       └─► 3. Spring Boot Backend (Java 23, RestTemplate, Actuator)
```

---

## 📄 Architecture PDF Documentation

A detailed architecture workflow PDF with structural diagrams and component details has been generated in the project root:
- **File**: [`AI_Smart_City_Technology_and_Architecture_Flow.pdf`](./AI_Smart_City_Technology_and_Architecture_Flow.pdf)

---

## 🔐 Environment Variables (`frontend/.env.local`)

```env
# Google Gemini Generative AI Key
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# Spring Boot Backend API URL
SPRING_BOOT_API_URL=http://localhost:8085
```

---

## 👥 Contributors & Author
- **Developer**: Sahil Mahajan ([@Sahil192210](https://github.com/Sahil192210))
- **Repository**: [https://github.com/Sahil192210/ai-smart-city-](https://github.com/Sahil192210/ai-smart-city-)
