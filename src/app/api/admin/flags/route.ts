import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/flags - Get all flags
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const flags = await prisma.flag.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, status: true },
        },
      },
    });

    return NextResponse.json(flags);
  } catch (error) {
    console.error("Error fetching flags:", error);
    return NextResponse.json(
      { error: "Failed to fetch flags" },
      { status: 500 }
    );
  }
}

// POST /api/admin/flags - Create a flag (for abuse detection)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    // This could be called by the system or by an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, type, reason } = body;

    const flag = await prisma.flag.create({
      data: {
        userId,
        type,
        reason,
      },
    });

    return NextResponse.json(flag, { status: 201 });
  } catch (error) {
    console.error("Error creating flag:", error);
    return NextResponse.json(
      { error: "Failed to create flag" },
      { status: 500 }
    );
  }
}
