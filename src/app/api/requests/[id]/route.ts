import { NextRequest, NextResponse } from "next/server";
import { requests, getRequestWithRelations, getUser } from "@/lib/mock-data";

// GET /api/requests/[id] - Get a single request
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const request = requests.find((r) => r.id === id);

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const requester = getUser(request.requesterId);
    const fulfiller = request.fulfillerId
      ? getUser(request.fulfillerId)
      : null;

    return NextResponse.json({
      ...request,
      requester: requester
        ? { id: requester.id, name: requester.name, email: requester.email }
        : null,
      fulfiller: fulfiller
        ? { id: fulfiller.id, name: fulfiller.name, email: fulfiller.email }
        : null,
    });
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

    const requestIndex = requests.findIndex((r) => r.id === id);

    if (requestIndex === -1) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const request = requests[requestIndex];

    // Handle different actions
    switch (action) {
      case "cancel":
        if (request.status !== "OPEN") {
          return NextResponse.json(
            { error: "Can only cancel open requests" },
            { status: 400 }
          );
        }
        request.status = "CANCELLED";
        break;

      case "complete":
        if (request.status !== "FULFILLED") {
          return NextResponse.json(
            { error: "Request must be fulfilled before completing" },
            { status: 400 }
          );
        }
        request.status = "COMPLETED";
        request.completedAt = new Date();
        break;

      case "release":
        if (request.status !== "CLAIMED") {
          return NextResponse.json(
            { error: "Can only release claimed requests" },
            { status: 400 }
          );
        }
        request.status = "OPEN";
        request.fulfillerId = null;
        request.claimedAt = null;
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json(getRequestWithRelations(request));
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
