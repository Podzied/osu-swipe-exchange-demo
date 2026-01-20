import { NextRequest, NextResponse } from "next/server";
import { DINING_LOCATIONS } from "@/lib/constants";
import { DEMO_FULFILLER } from "@/lib/demo-user";
import { requests, getRequestWithRelations, users } from "@/lib/mock-data";

// POST /api/requests/[id]/claim - Claim or fulfill a request
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ensure demo fulfiller exists in users
    if (!users.find((u) => u.id === DEMO_FULFILLER.id)) {
      users.push({
        id: DEMO_FULFILLER.id,
        email: DEMO_FULFILLER.email,
        name: DEMO_FULFILLER.name,
        role: DEMO_FULFILLER.role,
        status: "ACTIVE",
        suspendedUntil: null,
        createdAt: new Date(),
      });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, fulfilledLocation, grubhubOrderId } = body;

    const request = requests.find((r) => r.id === id);

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

      request.status = "CLAIMED";
      request.fulfillerId = DEMO_FULFILLER.id;
      request.claimedAt = new Date();
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

      request.status = "FULFILLED";
      request.fulfilledLocation = fulfilledLocation;
      request.grubhubOrderId = grubhubOrderId || null;
      request.fulfilledAt = new Date();
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(getRequestWithRelations(request));
  } catch (error) {
    console.error("Error processing claim:", error);
    return NextResponse.json(
      { error: "Failed to process claim" },
      { status: 500 }
    );
  }
}
