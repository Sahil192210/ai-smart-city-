"use client";

import React, { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Home,
  MessageSquare,
  MapPin,
  CloudSun,
  Activity,
  FileCheck,
  Compass,
  Bus,
  User,
  Search,
  ChevronDown,
  Building2,
  Shield,
  Clock,
  ExternalLink,
  ArrowRight,
  Send,
  Sparkles,
  PhoneCall,
  X,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  Compass as CompassIcon,
  Navigation,
  Lock,
  LogIn,
  LogOut,
  AlertCircle,
  Bot,
  Cpu,
  Network,
  Zap,
  Layers,
  HelpCircle,
  Sparkle,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  ShieldAlert,
  CalendarDays
} from "lucide-react";

import {
  SMART_CITIES,
  HOSPITALS_DATA,
  POLICE_STATIONS_DATA,
  TOURIST_PLACES_DATA,
  GOVERNMENT_SERVICES_DATA,
  CITY_MUNICIPAL_SERVICES,
  CITIES_WEATHER,
  TRANSPORT_DATA,
} from "@/data/smartCityData";
import AIChatbot from "@/components/AIChatbot";
import {
  createCitizenAccount,
  authenticateCitizen,
  getCurrentUserSession,
  clearCurrentUserSession,
  getAllRegisteredUsers,
  CitizenUser
} from "@/services/authStorage";

const SmartCityMap = dynamic(() => import("@/components/SmartCityMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[460px] bg-slate-100 border border-slate-200 flex items-center justify-center rounded-2xl animate-pulse">
      <div className="text-center">
        <MapPin className="w-8 h-8 text-blue-500 animate-bounce mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-500">Loading City GIS Map...</p>
      </div>
    </div>
  ),
});

export default function FigmaSmartCityPortal() {
  const [selectedCityId, setSelectedCityId] = useState<string>("pune");
  const [activeTab, setActiveTab] = useState<string>("home"); // home, assistant, map, weather, hospitals, services, places, transport, profile, cities
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  
  // Interactive Search States
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [heroSearchInput, setHeroSearchInput] = useState("");
  const [passedChatPrompt, setPassedChatPrompt] = useState("");

  const [mapCategory, setMapCategory] = useState<string>("all");
  const [selectedMapTarget, setSelectedMapTarget] = useState<{
    lat: number;
    lng: number;
    title: string;
  } | null>(null);

  // Authentication States
  const [activeServiceDoc, setActiveServiceDoc] = useState<{
    name: string;
    department: string;
    description: string;
    portalUrl: string;
    processingTime: string;
    fees: string;
    documents: string[];
  } | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [currentUser, setCurrentUser] = useState<CitizenUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [registeredUsersList, setRegisteredUsersList] = useState<CitizenUser[]>([]);

  // Restore authenticated session & load registered users from localStorage on initial render
  useEffect(() => {
    const session = getCurrentUserSession();
    if (session) {
      setCurrentUser(session);
      setIsLoggedIn(true);
    }
    setRegisteredUsersList(getAllRegisteredUsers());
  }, []);

  const activeCity = SMART_CITIES.find((c) => c.id === selectedCityId) || SMART_CITIES[0];
  const activeWeather = CITIES_WEATHER[selectedCityId] || CITIES_WEATHER.pune;

  // Filtered datasets for active city
  const cityHospitals = HOSPITALS_DATA.filter((h) => h.cityId === selectedCityId);
  const cityPolice = POLICE_STATIONS_DATA.filter((p) => p.cityId === selectedCityId);
  const cityTourist = TOURIST_PLACES_DATA.filter((t) => t.cityId === selectedCityId);
  const cityTransit = TRANSPORT_DATA.filter((t) => t.cityId === selectedCityId);

  // Search Results across all datasets
  const searchResults = useMemo(() => {
    const q = (globalSearch || heroSearchInput).toLowerCase().trim();
    if (!q) return null;

    const matchedCities = SMART_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
    );

    const matchedHospitals = HOSPITALS_DATA.filter(
      (h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
    );

    const matchedServices = GOVERNMENT_SERVICES_DATA.filter(
      (s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );

    const matchedPlaces = TOURIST_PLACES_DATA.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );

    return {
      cities: matchedCities,
      hospitals: matchedHospitals,
      services: matchedServices,
      places: matchedPlaces,
      hasAny:
        matchedCities.length > 0 ||
        matchedHospitals.length > 0 ||
        matchedServices.length > 0 ||
        matchedPlaces.length > 0,
    };
  }, [globalSearch, heroSearchInput]);

  // Execute Hero Search or Send to AI Chat
  const handleHeroSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!heroSearchInput.trim()) return;

    // Send the query directly to AI Chat Assistant!
    setPassedChatPrompt(heroSearchInput.trim());
    setHeroSearchInput("");
    setActiveTab("assistant");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please fill all required fields.");
      return;
    }

    if (authMode === "register") {
      // 1. Create account directly in Local Storage
      const regRes = createCitizenAccount({
        name: authName,
        email: authEmail,
        password: authPassword,
        phone: authPhone,
        cityId: selectedCityId,
      });

      if (!regRes.success || !regRes.user) {
        setAuthError(regRes.error || "Could not register account.");
        return;
      }

      setCurrentUser(regRes.user);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthError("");
      setRegisteredUsersList(getAllRegisteredUsers());

      // Sync with backend API silently if available
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          email: authEmail,
          password: authPassword,
          name: authName,
        }),
      }).catch(() => {});

      if (passedChatPrompt) {
        setActiveTab("assistant");
      }
      return;
    }

    // 2. Login Mode - Check Local Storage Accounts first
    const localAuth = authenticateCitizen(authEmail, authPassword);
    if (localAuth.success && localAuth.user) {
      setCurrentUser(localAuth.user);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthError("");
      setRegisteredUsersList(getAllRegisteredUsers());

      if (passedChatPrompt) {
        setActiveTab("assistant");
      }
      return;
    }

    // Optional server fallback if account was not found locally
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          email: authEmail,
          password: authPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(localAuth.error || data.error || "Invalid email or password");
        return;
      }

      const verifiedUser: CitizenUser = {
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        registeredAt: new Date().toISOString(),
      };

      createCitizenAccount({
        name: verifiedUser.name,
        email: verifiedUser.email,
        password: authPassword,
      });

      setCurrentUser(verifiedUser);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthError("");
      setRegisteredUsersList(getAllRegisteredUsers());

      if (passedChatPrompt) {
        setActiveTab("assistant");
      }
    } catch {
      setAuthError(localAuth.error || "Invalid credentials. Please verify your email and password.");
    }
  };

  const handleLogout = () => {
    clearCurrentUserSession();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPassedChatPrompt("");
    setActiveTab("home");
  };

  // Map markers
  const mapItems = [
    ...cityHospitals.map((h) => ({
      id: h.id,
      name: h.name,
      category: "hospital" as const,
      latitude: h.latitude,
      longitude: h.longitude,
      address: h.address,
      detail: `ICU Beds: ${h.icuBedsAvailable} | 24/7 Trauma: ${h.emergency_available ? "Yes" : "No"}`,
      phone: h.phone,
    })),
    ...cityPolice.map((p) => ({
      id: 100 + p.id,
      name: p.name,
      category: "police" as const,
      latitude: p.latitude,
      longitude: p.longitude,
      address: p.address,
      detail: `Zone: ${p.zone} | Emergency: ${p.emergencyHelpline}`,
      phone: p.phone,
    })),
    ...cityTourist.map((t) => ({
      id: 200 + t.id,
      name: t.name,
      category: "tourist" as const,
      latitude: t.latitude,
      longitude: t.longitude,
      address: t.address,
      detail: `Rating: ${t.rating}★ | Fee: ${t.entryFee}`,
    })),
  ];

  const handleAISelectLocation = (loc: { lat: number; lng: number; title: string }) => {
    setSelectedMapTarget(loc);
  };

  const navMenuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "assistant", label: "Chat Assistant", icon: MessageSquare },
    { id: "map", label: "Map", icon: MapPin },
    { id: "weather", label: "Weather", icon: CloudSun },
    { id: "hospitals", label: "Hospitals", icon: Activity },
    { id: "services", label: "Services", icon: FileCheck },
    { id: "places", label: "Places", icon: Compass },
    { id: "transport", label: "Transport", icon: Bus },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen mesh-bg text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 h-16 flex items-center justify-between shadow-xs">
        {/* Logo and Nav links */}
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveTab("home")}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 group-hover:scale-105 flex items-center justify-center text-white shadow-md shadow-blue-500/25 transition">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="font-black text-lg tracking-tight text-slate-900 group-hover:text-blue-600 transition">
              AI Smart City
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab("home")}
              className={`hover:text-blue-600 transition px-2.5 py-1 rounded-lg ${
                activeTab === "home" ? "text-blue-600 font-bold bg-blue-50/80" : ""
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab("assistant")}
              className={`hover:text-blue-600 transition flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                activeTab === "assistant" ? "text-blue-600 font-bold bg-blue-50/80" : ""
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`hover:text-blue-600 transition px-2.5 py-1 rounded-lg ${
                activeTab === "map" ? "text-blue-600 font-bold bg-blue-50/80" : ""
              }`}
            >
              Map
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`hover:text-blue-600 transition px-2.5 py-1 rounded-lg ${
                activeTab === "services" ? "text-blue-600 font-bold bg-blue-50/80" : ""
              }`}
            >
              Services
            </button>
          </nav>
        </div>

        {/* Right Search, City Selector & User Profile */}
        <div className="flex items-center gap-3">

          {/* Interactive Global Search Input */}
          <div className="relative hidden sm:block w-48 lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cities, hospitals, services..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
              className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 text-xs rounded-full pl-9 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner"
            />
            {globalSearch && (
              <button
                onClick={() => setGlobalSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Instant Live Search Results Popover */}
            {searchFocused && searchResults && (
              <div className="search-results-popup absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 max-h-96 overflow-y-auto">
                {!searchResults.hasAny ? (
                  <div className="p-3 text-xs text-slate-400 text-center">
                    No results for &ldquo;{globalSearch}&rdquo;
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Cities */}
                    {searchResults.cities.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
                          Cities
                        </div>
                        {searchResults.cities.map((c) => (
                          <div
                            key={c.id}
                            onMouseDown={() => {
                              setSelectedCityId(c.id);
                              setActiveTab("home");
                              setGlobalSearch("");
                            }}
                            className="flex items-center justify-between p-2 hover:bg-blue-50 rounded-xl cursor-pointer text-xs"
                          >
                            <span className="font-bold text-slate-800">{c.name}</span>
                            <span className="text-slate-400 text-[10px]">{c.state}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Hospitals */}
                    {searchResults.hospitals.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
                          Hospitals
                        </div>
                        {searchResults.hospitals.slice(0, 3).map((h) => (
                          <div
                            key={h.id}
                            onMouseDown={() => {
                              setSelectedCityId(h.cityId);
                              setSelectedMapTarget({ lat: h.latitude, lng: h.longitude, title: h.name });
                              setActiveTab("map");
                              setGlobalSearch("");
                            }}
                            className="p-2 hover:bg-blue-50 rounded-xl cursor-pointer text-xs"
                          >
                            <div className="font-bold text-slate-800">{h.name}</div>
                            <div className="text-[10px] text-slate-400">{h.address}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Services */}
                    {searchResults.services.length > 0 && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
                          Citizen Services
                        </div>
                        {searchResults.services.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            onMouseDown={() => {
                              setActiveTab("services");
                              setGlobalSearch("");
                            }}
                            className="p-2 hover:bg-blue-50 rounded-xl cursor-pointer text-xs"
                          >
                            <div className="font-bold text-slate-800">{s.name}</div>
                            <div className="text-[10px] text-slate-400">{s.department}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* City Selector Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-full text-xs font-bold text-slate-700 transition border border-slate-200 active:scale-95 shadow-xs"
            >
              <MapPin className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
              <span>{activeCity.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {/* City Dropdown Flyout */}
            {cityDropdownOpen && (
              <div className="search-results-popup absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50">
                <div className="text-[11px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
                  Select City
                </div>
                <div className="space-y-1">
                  {SMART_CITIES.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setSelectedCityId(city.id);
                        setCityDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition ${
                        selectedCityId === city.id
                          ? "bg-blue-50 text-blue-600 font-bold"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={city.coverImage}
                          alt={city.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{city.name}</span>
                      </div>
                      {selectedCityId === city.id && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveTab("cities");
                      setCityDropdownOpen(false);
                    }}
                    className="w-full text-center text-xs text-blue-600 hover:underline font-bold py-1"
                  >
                    View All Cities &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Login Trigger */}
          {isLoggedIn && currentUser ? (
            <div
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center text-xs shadow-md group-hover:scale-105 transition">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400">{currentUser.role}</div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthError("");
                setShowAuthModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition shadow-sm active:scale-95 ml-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Layout: HOME or SIDEBAR */}
      {activeTab === "home" ? (
        /* ================= 1. HOME SCREEN ================= */
        <div className="flex-1 flex flex-col">
          {/* Hero Banner with Modern AI Smart City Aesthetic and Animated Particles */}
          <section className="relative overflow-hidden bg-slate-950 min-h-[540px] flex items-center justify-center text-center px-4 py-20">
            {/* High-Tech AI Smart City Digital Grid Background */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105 opacity-40 mix-blend-screen"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=85')`,
              }}
            />
            {/* Cyber City Hologram Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.25) 0%, transparent 70%), linear-gradient(rgba(14, 165, 233, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(14, 165, 233, 0.15) 1px, transparent 1px)`,
                backgroundSize: "100% 100%, 48px 48px, 48px 48px",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-blue-950/65 to-[#f8fafc]" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 backdrop-blur-md text-cyan-300 text-xs font-semibold border border-cyan-500/30 shadow-lg shadow-blue-500/10 animate-float">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Your Official City Guide & Helper</span>
                <span>&bull;</span>
                <span className="font-bold text-white">{activeCity.name}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                Your AI-Powered <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">
                  Smart City
                </span> Assistant
              </h1>

              <p className="text-slate-200 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
                Find nearby hospitals, police stations, bus & metro lines, tourist places, and government citizen services in seconds.
              </p>

              {/* Working AI Search Bar with Form Submission */}
              <form
                onSubmit={handleHeroSearchSubmit}
                className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl flex items-center gap-2 border border-blue-200/50 ring-4 ring-blue-500/20 transition-all focus-within:ring-blue-500/50"
              >
                <Search className="w-5 h-5 text-blue-600 ml-2" />
                <input
                  type="text"
                  value={heroSearchInput}
                  onChange={(e) => setHeroSearchInput(e.target.value)}
                  placeholder={`Ask about ${activeCity.name} hospitals, transport, weather, services...`}
                  className="flex-1 px-2 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 flex-shrink-0"
                >
                  <span>Ask AI</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Quick Service Action Pills with Hover Animations */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {[
                  { label: "Hospitals", icon: Activity, tab: "hospitals" },
                  { label: "Police Stations", icon: Shield, tab: "map" },
                  { label: "Tourist Places", icon: Compass, tab: "places" },
                  { label: "Transport", icon: Bus, tab: "transport" },
                  { label: "Weather", icon: CloudSun, tab: "weather" },
                  { label: "Government Services", icon: FileCheck, tab: "services" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => setActiveTab(item.tab)}
                      className="service-pill"
                    >
                      <Icon className="w-3.5 h-3.5 text-blue-600" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ================= 2. HOW OUR AI SMART CITY PLATFORM WORKS (WORKFLOW) ================= */}
          <section className="container mx-auto px-4 lg:px-8 py-16 max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Simple 4-Step Guide</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                How It Works For You
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Get answers, find emergency help, locate places, and access citizen services in 4 easy steps.
              </p>
            </div>

            {/* Workflow Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div 
                onClick={() => setActiveTab("cities")}
                className="figma-card p-6 flex flex-col justify-between group hover:border-blue-500 cursor-pointer relative overflow-hidden bg-white"
              >
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-blue-50 rounded-full flex items-end justify-start p-3 text-3xl font-black text-blue-100 group-hover:text-blue-200 transition">
                  01
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition shadow-sm">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition">
                      1. Pick Your City
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Choose your city — Pune, Mumbai, Delhi, Bengaluru, Hyderabad, or Chennai — to get local info instantly.
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Browse Cities</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Step 2 */}
              <div 
                onClick={() => setActiveTab("assistant")}
                className="figma-card p-6 flex flex-col justify-between group hover:border-indigo-500 cursor-pointer relative overflow-hidden bg-white"
              >
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-indigo-50 rounded-full flex items-end justify-start p-3 text-3xl font-black text-indigo-100 group-hover:text-indigo-200 transition">
                  02
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition shadow-sm">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition">
                      2. Ask Any Question
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Type like you chat with a friend. Ask about hospitals, bus & metro timings, tourist spots, or shopping markets.
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Start Chatting</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Step 3 */}
              <div 
                onClick={() => setActiveTab("map")}
                className="figma-card p-6 flex flex-col justify-between group hover:border-emerald-500 cursor-pointer relative overflow-hidden bg-white"
              >
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-50 rounded-full flex items-end justify-start p-3 text-3xl font-black text-emerald-100 group-hover:text-emerald-200 transition">
                  03
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition shadow-sm">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-600 transition">
                      3. See It On The Map
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      View live pins for hospitals, police stations, and tourist attractions with addresses and phone numbers.
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                  <span>Open City Map</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>

              {/* Step 4 */}
              <div 
                onClick={() => setActiveTab("services")}
                className="figma-card p-6 flex flex-col justify-between group hover:border-sky-500 cursor-pointer relative overflow-hidden bg-white"
              >
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-sky-50 rounded-full flex items-end justify-start p-3 text-3xl font-black text-sky-100 group-hover:text-sky-200 transition">
                  04
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition shadow-sm">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-sky-600 transition">
                      4. Get Services Done
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      Download forms for birth certificates, pay property taxes, or find emergency contacts with zero hassle.
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                  <span>View Services</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </div>

            {/* Beginner-friendly Quick Help Banner */}
            <div className="mt-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-500/30 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-cyan-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Everything In One Place
                  </div>
                  <div className="text-xs text-slate-200 mt-0.5">
                    Hospitals &bull; Police Help &bull; Metro & Buses &bull; Places to Visit &bull; Official Government Portals
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("assistant")}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 flex-shrink-0"
              >
                <span>Ask AI Now</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* Explore City Services Grid (Figma) */}
          <section className="container mx-auto px-4 lg:px-8 py-14 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Explore City Services
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Find the information and municipal clearance you need quickly and easily.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  id: "hospitals",
                  title: "Hospitals",
                  desc: "Find nearby hospitals and emergency trauma services",
                  icon: Activity,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  action: () => setActiveTab("hospitals"),
                },
                {
                  id: "police",
                  title: "Police Stations",
                  desc: "Locate police beat stations and 112 helpline desks",
                  icon: Shield,
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                  action: () => setActiveTab("map"),
                },
                {
                  id: "tourist",
                  title: "Tourist Places",
                  desc: "Discover heritage attractions and scenic spots",
                  icon: Compass,
                  color: "text-teal-600",
                  bg: "bg-teal-50",
                  action: () => setActiveTab("places"),
                },
                {
                  id: "transport",
                  title: "Transport",
                  desc: "Metro lines, bus schedules and live transit timings",
                  icon: Bus,
                  color: "text-sky-600",
                  bg: "bg-sky-50",
                  action: () => setActiveTab("transport"),
                },
                {
                  id: "services",
                  title: "Government Services",
                  desc: "Access official certificates, tax payments & documents",
                  icon: FileCheck,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  action: () => setActiveTab("services"),
                },
                {
                  id: "weather",
                  title: "Weather",
                  desc: "Live microclimate sensor data and 5-day forecast",
                  icon: CloudSun,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                  action: () => setActiveTab("weather"),
                },
                {
                  id: "map",
                  title: "Maps",
                  desc: "Interactive GIS map with satellite & night layers",
                  icon: MapPin,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  action: () => setActiveTab("map"),
                },
                {
                  id: "assistant",
                  title: "AI Chat Assistant",
                  desc: "Natural-language query assistant for all city topics",
                  icon: MessageSquare,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  action: () => setActiveTab("assistant"),
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    className="figma-card p-6 cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:shadow-md transition`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold group-hover:translate-x-1 transition">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Live Interactive City Map & Citizen Telemetry Section */}
          <section className="bg-slate-50 border-t border-slate-200/80 py-14">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-200 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Interactive City Map</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Explore {activeCity.name} on the Map
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Find emergency hospitals, police stations, and tourist places with phone numbers and addresses.
                  </p>
                </div>

                {/* Filter and Fullscreen action */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
                    {[
                      { key: "all", label: `All (${mapItems.length})` },
                      { key: "hospital", label: `🏥 Hospitals (${cityHospitals.length})` },
                      { key: "police", label: `👮 Police (${cityPolice.length})` },
                      { key: "tourist", label: `🏛️ Heritage (${cityTourist.length})` },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setMapCategory(f.key)}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          mapCategory === f.key
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveTab("map")}
                    className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Full GIS Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Map Canvas with Legend */}
              <div className="h-[480px] w-full rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
                <SmartCityMap
                  items={mapItems}
                  selectedLocation={selectedMapTarget}
                  activeFilter={mapCategory}
                  center={[activeCity.lat, activeCity.lng]}
                  zoom={activeCity.zoom}
                  cityName={activeCity.name}
                />
              </div>

              {/* Quick Telemetry Indicators under Map */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div
                  onClick={() => setActiveTab("hospitals")}
                  className="figma-card p-4 cursor-pointer hover:border-blue-400 group"
                >
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Emergency Care
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1 group-hover:text-blue-600 transition">
                    {cityHospitals.length} Centers
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                    <Activity className="w-3 h-3" /> Live Trauma Beds
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("weather")}
                  className="figma-card p-4 cursor-pointer hover:border-amber-400 group"
                >
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Microclimate
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1 group-hover:text-amber-600 transition">
                    {activeWeather.temperature}°C
                  </div>
                  <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-semibold">
                    <CloudSun className="w-3 h-3" /> AQI {activeWeather.airQualityIndex} ({activeWeather.aqiStatus})
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("places")}
                  className="figma-card p-4 cursor-pointer hover:border-teal-400 group"
                >
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Heritage & Culture
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1 group-hover:text-teal-600 transition">
                    {cityTourist.length} Attractions
                  </div>
                  <div className="text-[11px] text-teal-600 mt-1 font-semibold">
                    Open for visitors
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab("transport")}
                  className="figma-card p-4 cursor-pointer hover:border-purple-400 group"
                >
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Transit Grid
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-1 group-hover:text-purple-600 transition">
                    {cityTransit.length} Rapid Lines
                  </div>
                  <div className="text-[11px] text-purple-600 mt-1 font-semibold">
                    Metro & E-Shuttle Active
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Figma Dark Footer */}
          <footer className="bg-[#0b1329] text-white py-14 border-t border-slate-800">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="font-extrabold text-lg">AI Smart City</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Smarter Information, Better Tomorrow. Connecting citizens with AI telemetry & services.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Quick Links
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>
                      <button onClick={() => setActiveTab("home")} className="hover:text-blue-400">
                        Home
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setActiveTab("services")} className="hover:text-blue-400">
                        Services
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setActiveTab("assistant")} className="hover:text-blue-400">
                        AI Assistant
                      </button>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Popular Cities
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {SMART_CITIES.map((c) => (
                      <li key={c.id}>
                        <button
                          onClick={() => {
                            setSelectedCityId(c.id);
                            setActiveTab("home");
                          }}
                          className="hover:text-blue-400"
                        >
                          {c.name} ({c.state})
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Emergency Dispatch
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Multi-agency emergency police, fire & hospital dispatch.
                  </p>
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    <PhoneCall className="w-3.5 h-3.5" /> Call 112 SOS
                  </a>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                &copy; 2026 AI Smart City Municipal Information Platform. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      ) : (
        /* ================= 2. SIDEBAR APP LAYOUT ================= */
        <div className="flex-1 flex min-h-[calc(100vh-4rem)] relative">
          {/* Left Vertical Navigation Sidebar (Sticky) */}
          <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 hidden md:flex flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-40 overflow-y-auto">
            <div className="space-y-1.5">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center text-left gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-50 text-blue-600 font-bold border border-blue-200/80 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-500"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sidebar User Profile Footer */}
            <div
              onClick={() => setActiveTab("profile")}
              className="pt-4 border-t border-slate-100 flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition flex-shrink-0"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                S
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Sahil Mahajan</div>
                <div className="text-[10px] text-slate-400">Citizen Profile</div>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-[#f8fafc]">
            {/* ---------------- CHAT ASSISTANT TAB ---------------- */}
            {activeTab === "assistant" && (
              <div className="max-w-4xl mx-auto space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-black text-slate-900">AI Chat Assistant</h2>
                  <p className="text-xs text-slate-500">
                    Ask me anything about {activeCity.name} city. I can help you with hospitals,
                    transport, weather, places, government services and more.
                  </p>
                </div>
                <div className="h-[680px]">
                  <AIChatbot
                    currentCityName={activeCity.name}
                    currentCityId={activeCity.id}
                    initialQuery={passedChatPrompt}
                    onClearInitialQuery={() => setPassedChatPrompt("")}
                    onLocationSelect={handleAISelectLocation}
                  />
                </div>
              </div>
            )}

            {/* ---------------- EXPLORE MAP TAB ---------------- */}
            {activeTab === "map" && (
              <div className="space-y-4 max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Explore Map ({activeCity.name})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Locate hospitals, police stations, tourist places and transit stations.
                    </p>
                  </div>

                  {/* Filter Chips */}
                  <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
                    {[
                      { key: "all", label: `All (${mapItems.length})` },
                      { key: "hospital", label: `Hospitals (${cityHospitals.length})` },
                      { key: "police", label: `Police (${cityPolice.length})` },
                      { key: "tourist", label: `Attractions (${cityTourist.length})` },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setMapCategory(f.key)}
                        className={`px-3.5 py-1.5 rounded-xl transition ${
                          mapCategory === f.key
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-[640px] w-full">
                  <SmartCityMap
                    items={mapItems}
                    selectedLocation={selectedMapTarget}
                    activeFilter={mapCategory}
                    center={[activeCity.lat, activeCity.lng]}
                    zoom={activeCity.zoom}
                    cityName={activeCity.name}
                  />
                </div>
              </div>
            )}

            {/* ---------------- CHOOSE YOUR CITY (FIGMA) ---------------- */}
            {activeTab === "cities" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl">
                  <div className="relative z-10 max-w-xl space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-black">Choose Your City</h2>
                    <p className="text-xs sm:text-sm text-blue-200">
                      Get real-time municipal telemetry, emergency beds, and services for your city
                    </p>
                  </div>
                </div>

                {/* 6 City Cards matching Figma Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SMART_CITIES.map((c) => {
                    const isSelected = c.id === selectedCityId;
                    const cWeather = CITIES_WEATHER[c.id];
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCityId(c.id);
                          setActiveTab("home");
                        }}
                        className={`figma-card overflow-hidden cursor-pointer group ${
                          isSelected ? "figma-card-active" : ""
                        }`}
                      >
                        <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={c.coverImage}
                            alt={c.name}
                            onError={(e) => {
                              // Fallback if image fails to load
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80";
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                          />
                          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white border border-white/10">
                            {c.badge}
                          </span>
                        </div>

                        <div className="p-5 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition">
                                {c.name}
                              </h3>
                              <span className="text-xs text-amber-500 font-bold">{cWeather.temperature}°C</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{c.state}</p>
                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Online
                            </div>
                          </div>
                          <span className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white transition flex items-center justify-center text-slate-400 font-bold">
                            &rarr;
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------------- WEATHER TAB ---------------- */}
            {activeTab === "weather" && (() => {
              const aqi = activeWeather.airQualityIndex;
              let aqiStatus = "Good";
              let aqiColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
              let aqiBarColor = "bg-emerald-500";
              let aqiDesc = "Air quality is satisfactory and poses little or no risk to public health.";

              if (aqi > 250) {
                aqiStatus = "Severe / Hazardous";
                aqiColor = "text-purple-700 bg-purple-50 border-purple-200";
                aqiBarColor = "bg-purple-600";
                aqiDesc = "Emergency warnings. Everyone may experience serious health effects; avoid outdoor exertion.";
              } else if (aqi > 180) {
                aqiStatus = "Poor / Unhealthy";
                aqiColor = "text-rose-700 bg-rose-50 border-rose-200";
                aqiBarColor = "bg-rose-500";
                aqiDesc = "Unhealthy conditions. Children, the elderly, and sensitive groups should limit prolonged outdoor activity.";
              } else if (aqi > 100) {
                aqiStatus = "Moderate";
                aqiColor = "text-amber-700 bg-amber-50 border-amber-200";
                aqiBarColor = "bg-amber-500";
                aqiDesc = "Acceptable air quality; sensitive individuals may experience minor respiratory irritation.";
              }

              const getWeatherIcon = (cond: string, className = "w-6 h-6") => {
                const lower = (cond || "").toLowerCase();
                if (lower.includes("rain") || lower.includes("shower") || lower.includes("drizzle")) {
                  return <CloudRain className={`${className} text-blue-500`} />;
                }
                if (lower.includes("cloud") || lower.includes("overcast") || lower.includes("haze") || lower.includes("smoke")) {
                  return <Cloud className={`${className} text-slate-400`} />;
                }
                if (lower.includes("sun") || lower.includes("clear")) {
                  return <Sun className={`${className} text-amber-500`} />;
                }
                return <CloudSun className={`${className} text-amber-500`} />;
              };

              return (
                <div className="space-y-6 max-w-6xl mx-auto">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-1 border border-blue-200/60">
                        <CloudSun className="w-3.5 h-3.5" />
                        Live Meteorological Sensor Network
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        {activeCity.name} Weather & Air Quality
                      </h2>
                      <p className="text-xs text-slate-500">
                        Real-time ambient microclimate telemetry, hourly predictions & atmospheric pollutants
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200/80 rounded-xl px-3 py-2 shadow-sm self-start sm:self-auto">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>Updated 5 mins ago</span>
                    </div>
                  </div>

                  {/* Primary Hero Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Ambient Status Card */}
                    <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-blue-900/40">
                      <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute right-12 bottom-6 opacity-10 pointer-events-none hidden md:block">
                        <CloudSun className="w-48 h-48 text-white" />
                      </div>

                      <div className="relative z-10 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                              {getWeatherIcon(activeWeather.condition, "w-14 h-14")}
                            </div>
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-5xl sm:text-6xl font-black tracking-tight">
                                  {activeWeather.temperature}°
                                </span>
                                <span className="text-xl sm:text-2xl text-blue-200 font-semibold">C</span>
                              </div>
                              <div className="text-sm font-semibold text-blue-200 flex items-center gap-2 mt-0.5">
                                <span>{activeWeather.condition}</span>
                                {activeWeather.feelsLike && (
                                  <>
                                    <span className="text-blue-400">•</span>
                                    <span className="text-xs text-blue-300">Feels like {activeWeather.feelsLike}°C</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Sunrise / Sunset Pill */}
                          {(activeWeather.sunrise || activeWeather.sunset) && (
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 flex items-center gap-4 text-xs">
                              {activeWeather.sunrise && (
                                <div className="flex items-center gap-2">
                                  <Sunrise className="w-4 h-4 text-amber-300" />
                                  <div>
                                    <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Sunrise</div>
                                    <div className="font-bold">{activeWeather.sunrise}</div>
                                  </div>
                                </div>
                              )}
                              {activeWeather.sunset && (
                                <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                                  <Sunset className="w-4 h-4 text-orange-300" />
                                  <div>
                                    <div className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">Sunset</div>
                                    <div className="font-bold">{activeWeather.sunset}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Ambient Micro-Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-1.5 text-xs text-blue-200 mb-1">
                              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Humidity</span>
                            </div>
                            <div className="text-xl font-bold">{activeWeather.humidity}%</div>
                            <div className="text-[10px] text-blue-300/80">Relative dew level</div>
                          </div>

                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-1.5 text-xs text-blue-200 mb-1">
                              <Wind className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Wind</span>
                            </div>
                            <div className="text-xl font-bold">{activeWeather.windSpeed} <span className="text-xs font-normal">km/h</span></div>
                            <div className="text-[10px] text-blue-300/80">{activeWeather.windDirection || "Breeze"}</div>
                          </div>

                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-1.5 text-xs text-blue-200 mb-1">
                              <Sun className="w-3.5 h-3.5 text-amber-400" />
                              <span>UV Index</span>
                            </div>
                            <div className="text-xl font-bold">{activeWeather.uvIndex ?? 6} <span className="text-xs font-normal">/ 11</span></div>
                            <div className="text-[10px] text-blue-300/80">
                              {(activeWeather.uvIndex || 6) >= 8 ? "Very High" : (activeWeather.uvIndex || 6) >= 5 ? "Moderate" : "Low"}
                            </div>
                          </div>

                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                            <div className="flex items-center gap-1.5 text-xs text-blue-200 mb-1">
                              <Eye className="w-3.5 h-3.5 text-violet-400" />
                              <span>Visibility</span>
                            </div>
                            <div className="text-xl font-bold">{activeWeather.visibility ?? "6.0"} <span className="text-xs font-normal">km</span></div>
                            <div className="text-[10px] text-blue-300/80">{activeWeather.pressure ? `${activeWeather.pressure} hPa` : "Clear line of sight"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Air Quality Index (AQI) Card */}
                    <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Gauge className="w-4 h-4 text-blue-600" />
                            Air Quality Index (AQI)
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${aqiColor}`}>
                            {aqiStatus}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="text-4xl sm:text-5xl font-black text-slate-900">{aqi}</span>
                          <span className="text-xs text-slate-500 font-semibold">US AQI Standard</span>
                        </div>

                        <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden relative">
                          <div
                            className={`${aqiBarColor} h-full rounded-full transition-all duration-1000`}
                            style={{ width: `${Math.min((aqi / 350) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                          <span>0 Good</span>
                          <span>100 Mod</span>
                          <span>200 Poor</span>
                          <span>300+ Severe</span>
                        </div>

                        <p className="text-xs text-slate-600 mt-4 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {aqiDesc}
                        </p>
                      </div>

                      {/* Pollutant Breakdown Grid */}
                      {activeWeather.aqiBreakdown && (
                        <div className="pt-4 mt-4 border-t border-slate-100">
                          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Key Pollutant Concentrations
                          </div>
                          <div className="grid grid-cols-5 gap-1.5 text-center">
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="text-[10px] text-slate-400 font-bold">PM2.5</div>
                              <div className="text-xs font-extrabold text-slate-800 mt-0.5">{activeWeather.aqiBreakdown.pm25}</div>
                              <div className="text-[8px] text-slate-400">µg/m³</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="text-[10px] text-slate-400 font-bold">PM10</div>
                              <div className="text-xs font-extrabold text-slate-800 mt-0.5">{activeWeather.aqiBreakdown.pm10}</div>
                              <div className="text-[8px] text-slate-400">µg/m³</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="text-[10px] text-slate-400 font-bold">NO₂</div>
                              <div className="text-xs font-extrabold text-slate-800 mt-0.5">{activeWeather.aqiBreakdown.no2}</div>
                              <div className="text-[8px] text-slate-400">ppb</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="text-[10px] text-slate-400 font-bold">O₃</div>
                              <div className="text-xs font-extrabold text-slate-800 mt-0.5">{activeWeather.aqiBreakdown.o3}</div>
                              <div className="text-[8px] text-slate-400">ppb</div>
                            </div>
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                              <div className="text-[10px] text-slate-400 font-bold">CO</div>
                              <div className="text-xs font-extrabold text-slate-800 mt-0.5">{activeWeather.aqiBreakdown.co}</div>
                              <div className="text-[8px] text-slate-400">ppm</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hourly Forecast Carousel/Strip */}
                  {activeWeather.hourly && activeWeather.hourly.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <h3 className="text-base font-bold text-slate-900">Today&apos;s Hourly Forecast</h3>
                        </div>
                        <span className="text-xs text-slate-400">24-Hour Microclimate Simulation</span>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {activeWeather.hourly.map((h, idx) => (
                          <div
                            key={idx}
                            className={`p-3.5 rounded-2xl flex flex-col items-center justify-between gap-2 border transition-all ${
                              idx === 2
                                ? "bg-blue-50/70 border-blue-200 shadow-sm"
                                : "bg-slate-50/70 border-slate-100 hover:border-slate-200"
                            }`}
                          >
                            <span className="text-xs font-semibold text-slate-500">{h.time}</span>
                            <div className="my-1">
                              {getWeatherIcon(h.condition, "w-7 h-7")}
                            </div>
                            <span className="text-base font-black text-slate-900">{h.temp}°C</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
                              <Droplets className="w-3 h-3" />
                              <span>{h.pop}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5-Day Extended Weather Outlook */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        <h3 className="text-base font-bold text-slate-900">5-Day Meteorological Outlook</h3>
                      </div>
                      <span className="text-xs text-slate-400">High / Low Temperature Trends</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {activeWeather.forecast.map((fc, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-700">{fc.day}</span>
                              {fc.precipitation !== undefined && (
                                <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-0.5">
                                  <Droplets className="w-2.5 h-2.5" />
                                  {fc.precipitation}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 my-3">
                              {getWeatherIcon(fc.condition || "Partly Cloudy", "w-8 h-8")}
                              <div>
                                <div className="text-lg font-black text-slate-900">{fc.temp}°C</div>
                                {fc.minTemp && (
                                  <div className="text-[11px] text-slate-400">Min {fc.minTemp}°C</div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-500 pt-2 border-t border-slate-200/50 truncate">
                            {fc.condition || "Partly Cloudy"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ---------------- GOVERNMENT SERVICES ---------------- */}
            {activeTab === "services" && (() => {
              const municipalData = CITY_MUNICIPAL_SERVICES[selectedCityId] || CITY_MUNICIPAL_SERVICES.pune;
              return (
                <div className="space-y-6 max-w-6xl mx-auto">
                  {/* City Header & Municipal Corporation Banner */}
                  <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-blue-400/20">
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Official Municipal Corporation Node</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                        {municipalData.corporation}
                      </h2>
                      <p className="text-xs sm:text-sm text-blue-100 max-w-2xl font-light">
                        Citizen clearances, vital records, property tax billing, and trade licenses calibrated for <b>{activeCity.name}</b>.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <a
                        href={municipalData.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`tel:${municipalData.helpline.replace(/[^0-9]/g, '')}`}
                        className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Helpline: {municipalData.helpline}</span>
                      </a>
                    </div>
                  </div>

                  {/* Switch City Quick Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                      City Switch:
                    </span>
                    {SMART_CITIES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCityId(c.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
                          selectedCityId === c.id
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* City Municipal Services Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {municipalData.services.map((srv, idx) => (
                      <div
                        key={idx}
                        className="figma-card p-6 flex flex-col justify-between group hover:border-blue-400 cursor-pointer"
                        onClick={() => setActiveServiceDoc(srv)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition shadow-sm">
                              <FileText className="w-5 h-5" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              ⏱️ {srv.processingTime}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition">
                              {srv.name}
                            </h3>
                            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                              {srv.department}
                            </div>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          </div>

                          {/* Documents Preview Badge */}
                          <div className="pt-2 flex flex-wrap gap-1">
                            {srv.documents.slice(0, 2).map((doc, dIdx) => (
                              <span
                                key={dIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium"
                              >
                                {doc}
                              </span>
                            ))}
                            {srv.documents.length > 2 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-bold">
                                +{srv.documents.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 font-bold">
                            Fee: <b className="text-blue-600">{srv.fees}</b>
                          </span>
                          <span className="text-xs text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
                            Checklist & Portal &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Standard Central/National Certificates */}
                  <div className="pt-6">
                    <div className="mb-4">
                      <h3 className="font-extrabold text-base text-slate-900">
                        National Civil Registry Certificates ({activeCity.name} Hub)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Civil registrations processed through the unified national e-Pramaan registry.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {GOVERNMENT_SERVICES_DATA.slice(2, 6).map((srv) => (
                        <div key={srv.id} className="figma-card p-5 flex flex-col justify-between group">
                          <div className="space-y-2">
                            <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition">
                              {srv.name}
                            </h4>
                            <div className="text-[11px] text-slate-400">{srv.department}</div>
                            <p className="text-xs text-slate-500 line-clamp-2">{srv.description}</p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <a
                              href={srv.application_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                            >
                              <span>Apply Online</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-[11px] text-slate-400 font-semibold">{srv.fees}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ---------------- HOSPITALS TAB ---------------- */}
            {activeTab === "hospitals" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Hospitals Near You ({activeCity.name})
                    </h2>
                    <p className="text-xs text-slate-500">
                      Emergency trauma centers, ICU bed telemetry and instant contact desks
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("map")}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    View on Map &rarr;
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {cityHospitals.map((h) => (
                    <div key={h.id} className="figma-card p-6 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-extrabold text-base text-slate-900">{h.name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
                            24/7 Trauma
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{h.address}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold">
                            🛏️ {h.icuBedsAvailable} ICU Beds Available
                          </span>
                          <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-bold">
                            ★ {h.rating}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMapTarget({
                              lat: h.latitude,
                              lng: h.longitude,
                              title: h.name,
                            });
                            setActiveTab("map");
                          }}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition text-center shadow-xs"
                        >
                          Directions on Map
                        </button>
                        <a
                          href={`tel:${h.phone}`}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> Call
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- PLACES / ATTRACTIONS ---------------- */}
            {activeTab === "places" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Tourist Places in {activeCity.name}
                  </h2>
                  <p className="text-xs text-slate-500">Discover heritage spots, gardens and museums</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cityTourist.map((p) => (
                    <div key={p.id} className="figma-card overflow-hidden flex flex-col justify-between">
                      <div className="h-48 w-full relative bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1000&q=85";
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md">
                          ★ {p.rating}
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-extrabold text-base text-slate-900">{p.name}</h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                          <span>Fee: <b className="text-emerald-600">{p.entryFee}</b></span>
                          <button
                            onClick={() => {
                              setSelectedMapTarget({
                                lat: p.latitude,
                                lng: p.longitude,
                                title: p.name,
                              });
                              setActiveTab("map");
                            }}
                            className="text-blue-600 hover:underline font-bold"
                          >
                            View on Map
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- TRANSPORT TAB ---------------- */}
            {activeTab === "transport" && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
                      <Bus className="w-3.5 h-3.5 text-purple-600" />
                      <span>{activeCity.name} Metro & Rapid Rail Network</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900">
                      {activeCity.name} Metro Lines & Train Stations
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Explore all active metro corridors, station stops, train models, and live operational timetables.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{cityTransit.length} Active Metro Lines</span>
                  </div>
                </div>

                <div className="space-y-5">
                  {cityTransit.map((t) => (
                    <div
                      key={t.id}
                      className="figma-card p-6 bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      {/* Line Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-12 rounded-full flex-shrink-0"
                            style={{ backgroundColor: t.color || "#2563eb" }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-lg text-slate-900">{t.route_number}</h3>
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                                {t.type}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-0.5">
                              {t.line_name || `${t.source} — ${t.destination}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:self-center">
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {t.status}
                          </span>
                        </div>
                      </div>

                      {/* Line Details: Timings, Train Name, Fare */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Operating Hours
                          </div>
                          <div className="font-extrabold text-slate-800 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span>{t.timings}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Train Frequency
                          </div>
                          <div className="font-extrabold text-slate-800 mt-0.5">
                            {t.frequency}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            First & Last Train
                          </div>
                          <div className="font-extrabold text-slate-800 mt-0.5">
                            {t.first_train || "06:00 AM"} &bull; {t.last_train || "10:30 PM"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Ticket Fare
                          </div>
                          <div className="font-extrabold text-emerald-600 mt-0.5">
                            {t.fare || "₹10 - ₹40"}
                          </div>
                        </div>
                      </div>

                      {/* Train Model / Rake Info */}
                      {t.train_name && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 bg-blue-50/60 px-3.5 py-2 rounded-xl border border-blue-100">
                          <span className="font-bold text-blue-900">Train Rake:</span>
                          <span className="font-medium text-slate-700">{t.train_name}</span>
                        </div>
                      )}

                      {/* All Stations in Corridor */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-blue-600" />
                            <span>All Stations ({t.stations?.length || 0} Stops):</span>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {t.source} &rarr; {t.destination}
                          </span>
                        </div>

                        {/* Stations Grid / Timeline */}
                        <div className="p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            {t.stations?.map((stationName, sIdx) => {
                              const isTerminus = sIdx === 0 || sIdx === (t.stations?.length ?? 0) - 1;
                              const isInterchange = t.interchanges?.some((ich) =>
                                stationName.toLowerCase().includes(ich.toLowerCase())
                              );

                              return (
                                <div
                                  key={sIdx}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                                    isTerminus
                                      ? "bg-blue-600 text-white font-bold shadow-xs"
                                      : isInterchange
                                      ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                                      : "bg-white text-slate-700 border border-slate-200"
                                  }`}
                                  title={isInterchange ? "Interchange Station" : undefined}
                                >
                                  <span className="text-[10px] opacity-70">#{sIdx + 1}</span>
                                  <span>{stationName}</span>
                                  {isInterchange && (
                                    <span className="text-[9px] bg-amber-500 text-white px-1 rounded font-bold uppercase ml-0.5">
                                      Hub
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* ---------------- PROFILE TAB ---------------- */}
            {activeTab === "profile" && (
              <div className="max-w-xl mx-auto figma-card p-8 space-y-6">
                <div className="flex items-center gap-5">
                  <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-black text-3xl flex items-center justify-center shadow-lg">
                    {currentUser ? currentUser.name.charAt(0) : "S"}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {currentUser ? currentUser.name : "Guest Citizen"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {currentUser ? currentUser.email : "Not signed in"}
                    </p>
                    <span className="mt-1.5 inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                      {isLoggedIn ? (currentUser?.role || "Verified Citizen") : "Guest Mode"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs pt-4 border-t border-slate-100">
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Default City:</span>
                    <b className="text-slate-800">{activeCity.name}</b>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Account Database:</span>
                    <b className="text-blue-600 font-mono">Browser LocalStorage</b>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Total Registered Accounts:</span>
                    <b className="text-slate-800">{registeredUsersList.length} Accounts</b>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Notifications:</span>
                    <b className="text-emerald-600">Active (SMS & App Alerts)</b>
                  </div>
                </div>

                {/* Local Storage Registered Accounts Directory */}
                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Stored Accounts ({registeredUsersList.length})</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      💾 Local Storage
                    </span>
                  </h4>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {registeredUsersList.map((usr) => (
                      <div
                        key={usr.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                          currentUser?.email === usr.email
                            ? "bg-blue-50/80 border-blue-300 text-blue-900"
                            : "bg-slate-50 border-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="truncate">
                          <div className="font-bold truncate">{usr.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">{usr.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200">
                            {usr.role}
                          </span>
                          {currentUser?.email === usr.email && (
                            <span className="text-[10px] text-blue-600 font-bold">Active</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  {isLoggedIn ? (
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In to Account
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ---------------- CITIES SHOWCASE TAB ---------------- */}
            {activeTab === "cities" && (
              <div className="space-y-6 max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Explore Smart Cities Grid</h2>
                    <p className="text-xs text-slate-500">
                      Switch and calibrate telemetry, municipal services, and emergency grids across all 6 metropolises.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold w-fit">
                    Active Node: {activeCity.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {SMART_CITIES.map((city) => {
                    const isCurrent = city.id === selectedCityId;
                    return (
                      <div
                        key={city.id}
                        className={`figma-card overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                          isCurrent ? "border-2 border-blue-600 shadow-xl ring-4 ring-blue-500/10" : "hover:border-blue-400"
                        }`}
                      >
                        <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={city.coverImage}
                            alt={city.name}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80";
                            }}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                          <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                            {city.badge}
                          </span>
                          <div className="absolute bottom-3 left-4 text-white">
                            <h3 className="font-black text-xl leading-tight">{city.name}</h3>
                            <p className="text-xs text-slate-300">{city.state}</p>
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {city.tagline}
                          </p>

                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Population</span>
                              <div className="font-extrabold text-slate-800 mt-0.5">{city.population}</div>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Smart Score</span>
                              <div className="font-extrabold text-emerald-600 mt-0.5">{city.smartScore} / 100</div>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCityId(city.id);
                                setActiveTab("home");
                              }}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                isCurrent
                                  ? "bg-emerald-600 text-white"
                                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              }`}
                            >
                              <span>{isCurrent ? "Active City Selected" : `Switch to ${city.name}`}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedCityId(city.id);
                                setActiveTab("map");
                              }}
                              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                              title={`View ${city.name} GIS map`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      )}
      {/* Authentication Modal (Sign In / Register) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 sm:p-8 relative search-results-popup">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowAuthModal(false);
                setAuthError("");
              }}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center mb-3 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                {authMode === "login" ? "Citizen Sign In" : "Register Citizen Account"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authMode === "login"
                  ? "Access smart city telemetry, submit AI queries & track services"
                  : "Create your official digital smart city citizen profile"}
              </p>
            </div>

            {/* Auth Alert / Prompt info if triggered by ask AI */}
            {passedChatPrompt && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Pending AI Query:</span> &ldquo;{passedChatPrompt}&rdquo;
                  <div className="text-[11px] text-blue-600 mt-0.5">Please sign in to proceed with this query.</div>
                </div>
              </div>
            )}

            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
              {authMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="e.g. Sahil Mahajan"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@smartcity.gov or gmail.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{authMode === "login" ? "Sign In & Continue" : "Create Account"}</span>
              </button>
            </form>

            {/* Switch Auth Mode & Quick Demo Hint */}
            <div className="mt-5 text-center text-xs text-slate-500 space-y-2">
              <div>
                {authMode === "login" ? "Don't have an account?" : "Already registered?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "register" : "login");
                    setAuthError("");
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {authMode === "login" ? "Create one now" : "Sign In here"}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthEmail("sahil@smartcity.gov");
                    setAuthPassword("password123");
                    setAuthName("Sahil Mahajan");
                  }}
                  className="text-[11px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg font-semibold transition"
                >
                  ⚡ Auto-fill Demo Citizen Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Citizen Service Document Checklist & Portal Modal */}
      {activeServiceDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 relative search-results-popup">
            <button
              onClick={() => setActiveServiceDoc(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{activeServiceDoc.name}</h3>
                  <p className="text-xs text-slate-500">{activeServiceDoc.department}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {activeServiceDoc.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="text-[10px] uppercase font-bold text-emerald-600">Processing Time</div>
                  <div className="text-sm font-black text-emerald-800 mt-0.5">{activeServiceDoc.processingTime}</div>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="text-[10px] uppercase font-bold text-blue-600">Government Fee</div>
                  <div className="text-sm font-black text-blue-800 mt-0.5">{activeServiceDoc.fees}</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mandatory Documents Required Checklist:</span>
                </h4>
                <div className="space-y-2">
                  {activeServiceDoc.documents.map((doc, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <a
                  href={activeServiceDoc.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Open Official {activeCity.name} Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setActiveServiceDoc(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
