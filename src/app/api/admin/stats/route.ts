import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND_URL}/admin/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { message: 'Failed to fetch admin stats' },
      { status: 500 },
    );
  }
}
