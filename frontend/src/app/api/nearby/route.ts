import { NextResponse } from "next/server";
import { HOSPITALS_DATA, POLICE_STATIONS_DATA, TOURIST_PLACES_DATA } from "@/data/smartCityData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all";

  let results: Array<{
    id: number;
    name: string;
    category: string;
    latitude: number;
    longitude: number;
    address: string;
    detail: string;
  }> = [];

  if (type === "hospital" || type === "all") {
    results = results.concat(HOSPITALS_DATA.map(h => ({
      id: h.id,
      name: h.name,
      category: "hospital",
      latitude: h.latitude,
      longitude: h.longitude,
      address: h.address,
      detail: `Emergency: ${h.emergency_available ? "YES" : "NO"} | Beds: ${h.icuBedsAvailable} | Tel: ${h.phone}`
    })));
  }

  if (type === "police" || type === "all") {
    results = results.concat(POLICE_STATIONS_DATA.map(p => ({
      id: p.id,
      name: p.name,
      category: "police",
      latitude: p.latitude,
      longitude: p.longitude,
      address: p.address,
      detail: `Zone: ${p.zone} | Helpline: ${p.emergencyHelpline}`
    })));
  }

  if (type === "tourist" || type === "all") {
    results = results.concat(TOURIST_PLACES_DATA.map(t => ({
      id: t.id,
      name: t.name,
      category: "tourist",
      latitude: t.latitude,
      longitude: t.longitude,
      address: t.address,
      detail: `Rating: ${t.rating}★ | Hours: ${t.opening_time} - ${t.closing_time}`
    })));
  }

  return NextResponse.json({
    total: results.length,
    results
  });
}
