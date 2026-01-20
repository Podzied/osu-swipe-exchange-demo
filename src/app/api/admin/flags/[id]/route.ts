import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/flags/[id] - Resolve a flag
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, resolution } = body;

    if (status !== "DISMISSED" && status !== "ACTIONED") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const flag = await prisma.flag.update({
      where: { id },
      data: {
        status,
        resolution,
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json(flag);
  } catch (error) {
    console.error("Error updating flag:", error);
    return NextResponse.json(
      { error: "Failed to update flag" },
      { status: 500 }
    );
  }
}
