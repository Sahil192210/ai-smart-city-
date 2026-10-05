import { NextResponse } from "next/server";
import { GOVERNMENT_SERVICES_DATA } from "@/data/smartCityData";

export async function GET() {
  return NextResponse.json({
    count: GOVERNMENT_SERVICES_DATA.length,
    data: GOVERNMENT_SERVICES_DATA
  });
}
