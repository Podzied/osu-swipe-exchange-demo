import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_USER } from "@/lib/demo-user";

// GET /api/requests/[id] - Get a single request
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
