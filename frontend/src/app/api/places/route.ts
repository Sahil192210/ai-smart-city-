import { NextResponse } from "next/server";
import { TOURIST_PLACES_DATA } from "@/data/smartCityData";

export async function GET() {
  return NextResponse.json({
    count: TOURIST_PLACES_DATA.length,
    data: TOURIST_PLACES_DATA
  });
}
