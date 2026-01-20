import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RATE_LIMITS, DINING_LOCATIONS } from "@/lib/constants";

// POST /api/requests/[id]/claim - Claim or fulfill a request
export async function POST(
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
    const { action, fulfilledLocation, grubhubOrderId } = body;

    const request = await prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Can't claim your own request
    if (request.requesterId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot fulfill your own request" },
        { status: 400 }
      );
    }

    if (action === "claim") {
      if (request.status !== "OPEN") {
        return NextResponse.json(
          { error: "Request is no longer available" },
          { status: 400 }
        );
      }

      // Check claim rate limit
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const claimsToday = await prisma.request.count({
        where: {
          fulfillerId: session.user.id,
          claimedAt: { gte: today },
        },
      });

      if (claimsToday >= RATE_LIMITS.MAX_CLAIMS_PER_DAY) {
        return NextResponse.json(
          { error: `You can only claim ${RATE_LIMITS.MAX_CLAIMS_PER_DAY} requests per day` },
          { status: 429 }
        );
      }

      await prisma.request.update({
        where: { id },
        data: {
          status: "CLAIMED",
          fulfillerId: session.user.id,
          claimedAt: new Date(),
        },
      });
    } else if (action === "fulfill") {
      if (request.status !== "CLAIMED") {
        return NextResponse.json(
          { error: "Request must be claimed first" },
          { status: 400 }
        );
      }

      if (request.fulfillerId !== session.user.id) {
        return NextResponse.json(
          { error: "Only the claimer can fulfill this request" },
          { status: 403 }
        );
      }

      // Validate fulfilled location
      const validLocation = DINING_LOCATIONS.find(
        (l) => l.id === fulfilledLocation
      );
      if (!validLocation) {
        return NextResponse.json(
          { error: "Invalid fulfilled location" },
          { status: 400 }
        );
      }

      await prisma.request.update({
        where: { id },
        data: {
          status: "FULFILLED",
          fulfilledLocation,
          grubhubOrderId,
          fulfilledAt: new Date(),
        },
      });
    } else {
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
    console.error("Error processing claim:", error);
    return NextResponse.json(
      { error: "Failed to process claim" },
      { status: 500 }
    );
  }
}
