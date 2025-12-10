import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const authHeader = req.headers.get("authorization");
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/roles/${params.id}/permissions`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update role permissions" },
      { status: 500 }
    );
  }
}
