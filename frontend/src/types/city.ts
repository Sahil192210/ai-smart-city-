export interface CityInfo {
  id: string;
  name: string;
  state: string;
  tagline: string;
  lat: number;
  lng: number;
  zoom: number;
  activeSensors: number;
}

export interface Hospital {
  id: number;
  cityId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergency_available: boolean;
  specialties: string[];
  icuBedsAvailable: number;
  rating: number;
}

export interface PoliceStation {
  id: number;
  cityId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  zone: string;
  emergencyHelpline: string;
}

export interface TouristPlace {
  id: number;
  cityId: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_time: string;
  closing_time: string;
  entryFee: string;
  category: "Heritage" | "Park" | "Museum" | "Scenic" | "Religious";
  imageUrl: string;
  rating: number;
}

export interface GovernmentService {
  id: number;
  cityId: string;
  name: string;
  department: string;
  description: string;
  documents_required: string[];
  application_url: string;
  processingTimeDays: number;
  fees: string;
}

export interface TransportRoute {
  id: number;
  cityId: string;
  route_number: string;
  line_name?: string;
  color?: string;
  source: string;
  destination: string;
  timings: string;
  first_train?: string;
  last_train?: string;
  frequency: string;
  type: "Metro" | "City Bus" | "E-Shuttle";
  status: "On Time" | "5 min delay" | "Congested";
  fare?: string;
  train_name?: string;
  stations: string[];
  interchanges?: string[];
}

export interface WeatherData {
  cityId: string;
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  airQualityIndex: number;
  aqiStatus: "Good" | "Moderate" | "Unhealthy";
  forecast: {
    day: string;
    temp: number;
    icon: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  locationAction?: {
    lat: number;
    lng: number;
    title: string;
    type: "hospital" | "police" | "tourist" | "transit";
  };
  source?: string;
  recommendedActions?: string[];
}
