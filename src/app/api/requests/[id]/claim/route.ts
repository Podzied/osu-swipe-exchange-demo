import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RATE_LIMITS, DINING_LOCATIONS } from "@/lib/constants";
import { DEMO_USER } from "@/lib/demo-user";

// Use a second demo user for fulfilling to show the flow
const DEMO_FULFILLER = {
  id: "demo-fulfiller-1",
  email: "fulfiller@example.com",
  name: "Demo Fulfiller",
  role: "USER",
};

// POST /api/requests/[id]/claim - Claim or fulfill a request
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure demo fulfiller exists
    await prisma.user.upsert({
      where: { email: DEMO_FULFILLER.email },
      update: {},
      create: {
        id: DEMO_FULFILLER.id,
        email: DEMO_FULFILLER.email,
        name: DEMO_FULFILLER.name,
        role: DEMO_FULFILLER.role,
      },
    });

    const { id } = await params;
    const body = await req.json();
    const { action, fulfilledLocation, grubhubOrderId } = body;

    const request = await prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (action === "claim") {
      if (request.status !== "OPEN") {
        return NextResponse.json(
          { error: "Request is no longer available" },
          { status: 400 }
        );
      }

      await prisma.request.update({
        where: { id },
        data: {
          status: "CLAIMED",
          fulfillerId: DEMO_FULFILLER.id,
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
