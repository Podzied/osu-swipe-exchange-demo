import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/requests/[id] - Get a single request
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        requester: {
          select: { id: true, name: true, email: true },
        },
        fulfiller: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error("Error fetching request:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

// PATCH /api/requests/[id] - Update a request
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body;

    const request = await prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case "cancel":
        // Only requester can cancel their own request
        if (request.requesterId !== session.user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (request.status !== "OPEN") {
          return NextResponse.json(
            { error: "Can only cancel open requests" },
            { status: 400 }
          );
        }
        await prisma.request.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
        break;

      case "complete":
        // Only requester can mark as completed
        if (request.requesterId !== session.user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (request.status !== "FULFILLED") {
          return NextResponse.json(
            { error: "Request must be fulfilled before completing" },
            { status: 400 }
          );
        }
        await prisma.request.update({
          where: { id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        break;

      case "release":
        // Only fulfiller can release a claimed request
        if (request.fulfillerId !== session.user.id) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (request.status !== "CLAIMED") {
          return NextResponse.json(
            { error: "Can only release claimed requests" },
            { status: 400 }
          );
        }
        await prisma.request.update({
          where: { id },
          data: {
            status: "OPEN",
            fulfillerId: null,
            claimedAt: null,
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedRequest = await prisma.request.findUnique({
      where: { id },
      include: {
        requester: {
          select: { id: true, name: true },
        },
        fulfiller: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
