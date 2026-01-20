import { NextRequest, NextResponse } from "next/server";
import { users, requests, flags } from "@/lib/mock-data";

// GET /api/admin/users/[id] - Get user details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = users.find((u) => u.id === id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's requests
    const userRequests = requests
      .filter((r) => r.requesterId === id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20);

    // Get user's fulfillments
    const userFulfillments = requests
      .filter((r) => r.fulfillerId === id)
      .sort((a, b) => {
        const aTime = a.claimedAt?.getTime() || 0;
        const bTime = b.claimedAt?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 20);

    // Get user's flags
    const userFlags = flags
      .filter((f) => f.userId === id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      ...user,
      requests: userRequests,
      fulfillments: userFulfillments,
      flags: userFlags,
    });
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
    const { id } = await params;
    const body = await req.json();
    const { action, suspendDays, role } = body;

    const user = users.find((u) => u.id === id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    switch (action) {
      case "suspend":
        const suspendedUntil = new Date();
        suspendedUntil.setDate(suspendedUntil.getDate() + (suspendDays || 7));
        user.status = "SUSPENDED";
        user.suspendedUntil = suspendedUntil;
        break;
      case "unsuspend":
        user.status = "ACTIVE";
        user.suspendedUntil = null;
        break;
      case "ban":
        user.status = "BANNED";
        break;
      case "unban":
        user.status = "ACTIVE";
        user.suspendedUntil = null;
        break;
      case "setRole":
        if (role !== "USER" && role !== "ADMIN") {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        user.role = role;
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
