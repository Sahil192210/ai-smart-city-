import { NextResponse } from "next/server";
import { TRANSPORT_DATA } from "@/data/smartCityData";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || searchParams.get("cityId") || "all";

  let results = TRANSPORT_DATA;
  if (city !== "all") {
    results = TRANSPORT_DATA.filter((t) => t.cityId.toLowerCase() === city.toLowerCase());
  }

  return NextResponse.json({
    total: results.length,
    city,
    data: results,
  });
}
