import { NextResponse } from "next/server";
import { HOSPITALS_DATA } from "@/data/smartCityData";

export async function GET() {
  return NextResponse.json({
    count: HOSPITALS_DATA.length,
    data: HOSPITALS_DATA
  });
}
