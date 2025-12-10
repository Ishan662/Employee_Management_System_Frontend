import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const res = await fetch(`${BACKEND_URL}/permissions`, {
      headers: authHeader ? { Authorization: authHeader } : undefined,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
