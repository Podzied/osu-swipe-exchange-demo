import { NextRequest, NextResponse } from "next/server";
import { users, requests, flags } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

// GET /api/admin/users - Get all users
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let filtered = [...users];

    if (status) {
      filtered = filtered.filter((u) => u.status === status);
    }

    // Sort by createdAt desc
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Add counts
    const result = filtered.map((user) => ({
      ...user,
      _count: {
        requests: requests.filter((r) => r.requesterId === user.id).length,
        fulfillments: requests.filter((r) => r.fulfillerId === user.id).length,
        flags: flags.filter((f) => f.userId === user.id).length,
      },
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
