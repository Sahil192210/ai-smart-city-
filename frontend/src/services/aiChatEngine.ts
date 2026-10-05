import { HOSPITALS_DATA, POLICE_STATIONS_DATA, TOURIST_PLACES_DATA, GOVERNMENT_SERVICES_DATA, CITIES_WEATHER, TRANSPORT_DATA, SMART_CITIES } from "@/data/smartCityData";

interface AIResponseResult {
  reply: string;
  suggestedAction?: {
    lat: number;
    lng: number;
    title: string;
    type: "hospital" | "police" | "tourist" | "transit";
  };
  recommendedActions: string[];
}

export function generateSmartCityResponse(prompt: string, currentCityId: string = "pune"): AIResponseResult {
  const query = prompt.toLowerCase();

  // Find if user mentioned a specific city
  let targetCityId = currentCityId;
  if (query.includes("mumbai")) targetCityId = "mumbai";
  else if (query.includes("bengaluru") || query.includes("bangalore")) targetCityId = "bengaluru";
  else if (query.includes("delhi")) targetCityId = "delhi";
  else if (query.includes("pune")) targetCityId = "pune";

  const currentCity = SMART_CITIES.find(c => c.id === targetCityId) || SMART_CITIES[0];
  const cityHospitals = HOSPITALS_DATA.filter(h => h.cityId === targetCityId);
  const cityPolice = POLICE_STATIONS_DATA.filter(p => p.cityId === targetCityId);
  const cityTourist = TOURIST_PLACES_DATA.filter(t => t.cityId === targetCityId);
  const weather = CITIES_WEATHER[targetCityId] || CITIES_WEATHER.pune;
  const transit = TRANSPORT_DATA.filter(t => t.cityId === targetCityId);

  // 1. Birth certificate / documents query
  if (query.includes("birth certificate") || query.includes("birth") || (query.includes("certificate") && query.includes("document"))) {
    const service = GOVERNMENT_SERVICES_DATA.find(s => s.name.toLowerCase().includes("birth"));
    return {
      reply: `To obtain an official **Birth Certificate** in ${currentCity.name}:\n\n**Required Documents:**\n${service?.documents_required.map((doc: string, i: number) => `${i + 1}. ${doc}`).join("\n")}\n\n**Processing Window:** ~${service?.processingTimeDays} business days.\n**Government Fee:** ${service?.fees}.\n\nYou can submit your application directly online via the citizen portal.`,
      recommendedActions: [
        "Open Citizen Services Portal",
        "Download Birth Form-1",
        "Check Application Status"
      ]
    };
  }

  // 2. Hospital / Emergency / Doctor
  if (query.includes("hospital") || query.includes("doctor") || query.includes("icu") || query.includes("medical") || query.includes("emergency") || query.includes("ambulance")) {
    const nearestHospital = cityHospitals[0] || HOSPITALS_DATA[0];
    const totalBeds = cityHospitals.reduce((acc, h) => acc + h.icuBedsAvailable, 0);

    return {
      reply: `🚑 **Emergency Medical Assistance in ${currentCity.name}**:\nThere are currently **${cityHospitals.length} emergency hospitals** with **${totalBeds} ICU beds** ready.\n\n• **Recommended:** **${nearestHospital.name}**\n  📍 Location: ${nearestHospital.address}\n  📞 Helpline: **${nearestHospital.phone}**\n  🩺 Specialties: ${nearestHospital.specialties.join(", ")}\n  🛏️ Live ICU Beds: **${nearestHospital.icuBedsAvailable}**\n\nFor immediate emergency dispatch, dial **112 / 108**.`,
      suggestedAction: {
        lat: nearestHospital.latitude,
        lng: nearestHospital.longitude,
        title: nearestHospital.name,
        type: "hospital"
      },
      recommendedActions: [
        `View ${currentCity.name} Hospitals on Map`,
        "Call Emergency Dispatch (112)",
        "Check ICU Beds"
      ]
    };
  }

  // 3. Police / Safety / Crime
  if (query.includes("police") || query.includes("theft") || query.includes("safety") || query.includes("crime") || query.includes("complaint") || query.includes("fir")) {
    const police = cityPolice[0] || POLICE_STATIONS_DATA[0];
    return {
      reply: `👮 **Police & Public Safety in ${currentCity.name}**:\nFor life-threatening emergencies, immediately dial **112**.\n\n• **Command Center:** ${police.name}\n  📍 Address: ${police.address}\n  📞 Desk: ${police.phone}\n  🛡️ Division: ${police.zone}\n\nYou can also report non-emergency incidents online via the citizen e-FIR portal.`,
      suggestedAction: {
        lat: police.latitude,
        lng: police.longitude,
        title: police.name,
        type: "police"
      },
      recommendedActions: [
        `Locate ${currentCity.name} Police on Map`,
        "Submit Online e-FIR",
        "Call 112 Safety Helpline"
      ]
    };
  }

  // 4. Tourist places / Attractions
  if (query.includes("tourist") || query.includes("visit") || query.includes("place") || query.includes("sightseeing") || query.includes("fort") || query.includes("attraction")) {
    const topPlace = cityTourist[0] || TOURIST_PLACES_DATA[0];
    return {
      reply: `🏛️ **Explore Top Attractions in ${currentCity.name}**:\n\n${cityTourist.map((p, idx) => `${idx + 1}. **${p.name}** (${p.category})\n   ${p.description}\n   🕒 Hours: ${p.opening_time} - ${p.closing_time} | Fee: ${p.entryFee}`).join("\n\n")}\n\nDigital tickets and QR entry are available at all city landmarks!`,
      suggestedAction: {
        lat: topPlace.latitude,
        lng: topPlace.longitude,
        title: topPlace.name,
        type: "tourist"
      },
      recommendedActions: [
        `Show ${currentCity.name} Attractions on Map`,
        "Book Digital Entry Pass",
        "Find Nearby Hotels"
      ]
    };
  }

  // 5. Weather / AQI
  if (query.includes("weather") || query.includes("temp") || query.includes("rain") || query.includes("aqi") || query.includes("climate")) {
    return {
      reply: `🌤️ **Live Weather in ${weather.city}**:\n\n• **Temperature:** **${weather.temperature}°C** (${weather.condition})\n• **Humidity:** ${weather.humidity}%\n• **Wind Speed:** ${weather.windSpeed} km/h\n• **Air Quality (AQI):** **${weather.airQualityIndex}** (${weather.aqiStatus})\n\nConditions are pleasant and suitable for citizen activities.`,
      recommendedActions: [
        `View 5-Day Forecast for ${currentCity.name}`,
        "Check Air Quality Index"
      ]
    };
  }

  // 6. Transit / Metro / Commute
  if (query.includes("transport") || query.includes("bus") || query.includes("metro") || query.includes("transit") || query.includes("commute")) {
    return {
      reply: `🚆 **Public Transit in ${currentCity.name}**:\n\n${transit.map(t => `• **${t.route_number}** (${t.type}): ${t.source} ➔ ${t.destination} | Status: **${t.status}** (${t.frequency})`).join("\n") || "Metro and smart feeder buses running on schedule."}\n\nSmart travel cards and QR mobile tickets are valid across all lines.`,
      recommendedActions: [
        `View ${currentCity.name} Metro Lines`,
        "Recharge Smart Card",
        "Live Bus Timings"
      ]
    };
  }

  // 7. General services
  if (query.includes("tax") || query.includes("property") || query.includes("water") || query.includes("license") || query.includes("service")) {
    return {
      reply: `🏢 **Citizen Public Services in ${currentCity.name}**:\n\nYou can access multiple municipal services online:\n• Property Tax Assessment & Green Rebate e-Payment\n• Smart Potable Water Connection\n• Commercial Trade License Clearance\n• Official Birth & Death Certificates\n\nAll services support online document uploads and digital verification.`,
      recommendedActions: [
        "Go to Services Portal",
        "Calculate Property Tax",
        "Track Service Request"
      ]
    };
  }

  // Default clean greeting without RAG
  return {
    reply: `Hello! What can I help you with today in **${currentCity.name}**?\n\nYou can ask about:\n• 🏥 **Hospitals & Emergency Beds**\n• 👮 **Police & Safety Stations**\n• 🗺️ **Interactive City Map & Landmarks**\n• 🏛️ **Top Tourist Places to Visit**\n• 📑 **Citizen Certificates & Services**\n• 🌤️ **Live Weather & Air Quality (AQI)**\n• 🚆 **Metro & Public Transit**`,
    recommendedActions: [
      "What documents are required for a birth certificate?",
      `Show emergency hospitals in ${currentCity.name}`,
      `Current weather in ${currentCity.name}`,
      `Top places to visit in ${currentCity.name}`
    ]
  };
}
