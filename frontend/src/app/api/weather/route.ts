import { NextResponse } from "next/server";
import { CITIES_WEATHER } from "@/data/smartCityData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cityParam = (searchParams.get("city") || "pune").toLowerCase();

  const weather = CITIES_WEATHER[cityParam] || CITIES_WEATHER.pune;
  return NextResponse.json(weather);
}
