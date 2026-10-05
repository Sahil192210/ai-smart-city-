# AI Smart City - Full Stack Architecture

The project is structured into two clean, independent parts: **`frontend/`** and **`backend/`**.

```
Ai smart city/
├── frontend/               # Next.js 16 Web App (Port 3000)
│   ├── src/
│   │   ├── app/            # App Router & API Routes
│   │   ├── components/     # UI Components (SmartCityMap, AIChatbot, etc.)
│   │   ├── data/           # Smart City multi-city data & photos
│   │   ├── services/       # Client services & offline knowledge engine
│   │   └── types/          # TypeScript domain models
│   ├── package.json
│   └── next.config.ts
│
├── backend/                # Spring Boot 4 / Java 23 Backend (Port 8085)
│   ├── src/main/java/com/smartcity/backend/
│   │   ├── controller/     # REST Endpoints (/api/chat, /api/health)
│   │   ├── service/        # Gemini AI + Google Search Grounding service
│   │   └── dto/            # Request/Response data transfer objects
│   ├── src/main/resources/
│   │   └── application.properties # Server port 8085 & Gemini config
│   ├── build.gradle
│   └── gradlew.bat
│
└── README.md
```

---

## 🚀 Running the Services

### 1. Frontend (`frontend/`)
- **Port:** `http://localhost:3000`
- **Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript, Vanilla CSS design system, Leaflet GIS.
- **Run Command:**
  ```powershell
  cd "frontend"
  npm run dev
  ```

### 3. Google Maps Integration (Optional)
- You can provide your Google Maps API key in two ways:
  1. **Directly in the Web UI**: Open the map, click the 🔑 key icon on the top right map controls, enter your Google Maps API key, and click **Save & Apply**.
  2. **Environment File**: Add your key to [`frontend/.env.local`](file:///c:/Users/DELL/Documents/Ai%20smart%20city/frontend/.env.local):
     ```properties
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
     ```
  - When selected, the map will stream live **Google Maps** tiles alongside CartoDB and Esri satellite GIS.
