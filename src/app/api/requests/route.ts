import { NextRequest, NextResponse } from "next/server";
import { generatePickupAlias } from "@/lib/alias";
import { RATE_LIMITS } from "@/lib/constants";
import { DEMO_USER } from "@/lib/demo-user";
import { requests, generateId, getRequestWithRelations } from "@/lib/mock-data";

// GET /api/requests - Get requests (optionally filtered)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type"); // "my" or "open"

    let filtered = [...requests];

    if (type === "my") {
      filtered = filtered.filter((r) => r.requesterId === DEMO_USER.id);
    } else if (type === "open") {
      filtered = filtered.filter(
        (r) => r.status === "OPEN" && r.requesterId !== DEMO_USER.id
      );
    } else if (type === "fulfilling") {
      filtered = filtered.filter((r) => r.fulfillerId === DEMO_USER.id);
    }

    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }

    // Sort by createdAt desc
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Add relations
    const result = filtered.map(getRequestWithRelations);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST /api/requests - Create a new request
export async function POST(req: NextRequest) {
  try {
    // Check rate limit (count today's requests)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requestsToday = requests.filter(
      (r) =>
        r.requesterId === DEMO_USER.id &&
        r.createdAt >= today &&
        r.status !== "CANCELLED"
    ).length;

    if (requestsToday >= RATE_LIMITS.MAX_REQUESTS_PER_DAY) {
      return NextResponse.json(
        {
          error: `You can only create ${RATE_LIMITS.MAX_REQUESTS_PER_DAY} requests per day`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      locations,
      timeWindowStart,
      timeWindowEnd,
      deliveryMethod,
      deliveryBuilding,
      deliveryNotes,
      dietaryTags,
      dietaryNotes,
    } = body;

    // Validate required fields
    if (!locations || !timeWindowStart || !timeWindowEnd || !deliveryMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate expiry time (end of time window)
    const expiresAt = new Date(timeWindowEnd);

    const newRequest = {
      id: generateId(),
      status: "OPEN",
      locations: JSON.stringify(locations),
      timeWindowStart: new Date(timeWindowStart),
      timeWindowEnd: new Date(timeWindowEnd),
      deliveryMethod,
      deliveryBuilding: deliveryBuilding || null,
      deliveryNotes: deliveryNotes || null,
      dietaryTags: JSON.stringify(dietaryTags || []),
      dietaryNotes: dietaryNotes || null,
      pickupAlias: generatePickupAlias(),
      fulfilledLocation: null,
      grubhubOrderId: null,
      createdAt: new Date(),
      claimedAt: null,
      fulfilledAt: null,
      completedAt: null,
      expiresAt,
      requesterId: DEMO_USER.id,
      fulfillerId: null,
    };

    requests.push(newRequest);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
