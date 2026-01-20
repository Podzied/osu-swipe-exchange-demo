import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users/[id] - Get user details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        requests: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        fulfillments: {
          orderBy: { claimedAt: "desc" },
          take: 20,
        },
        flags: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id] - Update user status
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
    const { action, suspendDays, role } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData: Record<string, unknown> = {};

    switch (action) {
      case "suspend":
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + (suspendDays || 7));
        updateData = {
          status: "SUSPENDED",
          suspendedUntil,
        };
        break;
      case "unsuspend":
        updateData = {
          status: "ACTIVE",
          suspendedUntil: null,
        };
        break;
      case "ban":
        updateData = {
          status: "BANNED",
        };
        break;
      case "unban":
        updateData = {
          status: "ACTIVE",
          suspendedUntil: null,
        };
        break;
      case "setRole":
        if (role !== "USER" && role !== "ADMIN") {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        updateData = { role };
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
