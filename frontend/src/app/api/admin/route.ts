import { NextResponse } from "next/server";
import { SMART_CITIES, HOSPITALS_DATA, GOVERNMENT_SERVICES_DATA, TRANSPORT_DATA } from "@/data/smartCityData";

const USERS_LIST = [
  { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", role: "Citizen", joined: "2 hours ago", status: "Active" },
  { id: 2, name: "Priya Desai", email: "priya@gmail.com", role: "Citizen", joined: "5 hours ago", status: "Active" },
  { id: 3, name: "Amit Kumar", email: "amit@smartcity.gov", role: "Admin", joined: "1 day ago", status: "Active" },
  { id: 4, name: "Neha Singh", email: "neha@gmail.com", role: "Citizen", joined: "2 days ago", status: "Active" },
];

export async function GET() {
  const totalSensors = SMART_CITIES.reduce((acc, c) => acc + c.activeSensors, 0);
  const totalIcuBeds = HOSPITALS_DATA.reduce((acc, h) => acc + h.icuBedsAvailable, 0);

  return NextResponse.json({
    metrics: {
      totalUsers: 1248,
      totalCities: SMART_CITIES.length,
      totalHospitals: HOSPITALS_DATA.length,
      totalServices: GOVERNMENT_SERVICES_DATA.length,
      totalTransitRoutes: TRANSPORT_DATA.length,
      activeSensors: totalSensors,
      liveIcuBeds: totalIcuBeds,
      systemUptime: "99.98%",
    },
    users: USERS_LIST,
    cities: SMART_CITIES.map((c) => ({
      id: c.id,
      name: c.name,
      state: c.state,
      sensors: c.activeSensors,
      score: c.smartScore,
    })),
  });
}
