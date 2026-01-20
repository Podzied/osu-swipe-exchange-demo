import { NextRequest, NextResponse } from "next/server";
import { flags, users, generateId } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

// GET /api/admin/flags - Get all flags
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let filtered = [...flags];

    if (status) {
      filtered = filtered.filter((f) => f.status === status);
    }

    // Sort by createdAt desc
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Add user relations
    const result = filtered.map((flag) => {
      const user = users.find((u) => u.id === flag.userId);
      return {
        ...flag,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              status: user.status,
            }
          : null,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching flags:", error);
    return NextResponse.json(
      { error: "Failed to fetch flags" },
      { status: 500 }
    );
  }
}

// POST /api/admin/flags - Create a flag
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, reason } = body;

    const flag = {
      id: generateId(),
      type,
      reason,
      status: "PENDING",
      createdAt: new Date(),
      resolvedAt: null,
      resolution: null,
      userId,
    };

    flags.push(flag);

    return NextResponse.json(flag, { status: 201 });
  } catch (error) {
    console.error("Error creating flag:", error);
    return NextResponse.json(
      { error: "Failed to create flag" },
      { status: 500 }
    );
  }
}
