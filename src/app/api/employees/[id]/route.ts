import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const authHeader = _req.headers.get('authorization');
    const res = await fetch(`${BACKEND_URL}/employees/${params.id}`, {
      headers: authHeader ? { Authorization: authHeader } : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Failed to fetch employee' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    const res = await fetch(`${BACKEND_URL}/employees/${params.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const authHeader = _req.headers.get('authorization');
    const res = await fetch(`${BACKEND_URL}/employees/${params.id}`, {
      method: 'DELETE',
      headers: authHeader ? { Authorization: authHeader } : undefined,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Failed to delete employee' }, { status: 500 });
  }
}
