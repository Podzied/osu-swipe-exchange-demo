import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePickupAlias } from "@/lib/alias";
import { RATE_LIMITS } from "@/lib/constants";
import { DEMO_USER } from "@/lib/demo-user";

// GET /api/requests - Get requests (optionally filtered)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type"); // "my" or "open"

    let whereClause: Record<string, unknown> = {};

    if (type === "my") {
      whereClause.requesterId = DEMO_USER.id;
    } else if (type === "open") {
      whereClause.status = "OPEN";
      whereClause.requesterId = { not: DEMO_USER.id };
    } else if (type === "fulfilling") {
      whereClause.fulfillerId = DEMO_USER.id;
    }

    if (status) {
      whereClause.status = status;
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        requester: {
          select: { id: true, name: true },
        },
        fulfiller: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(requests);
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
    // Ensure demo user exists
    await prisma.user.upsert({
      where: { email: DEMO_USER.email },
      update: {},
      create: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        role: DEMO_USER.role,
      },
    });

    // Check rate limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const requestsToday = await prisma.request.count({
      where: {
        requesterId: DEMO_USER.id,
        createdAt: { gte: today },
        status: { not: "CANCELLED" },
      },
    });

    if (requestsToday >= RATE_LIMITS.MAX_REQUESTS_PER_DAY) {
      return NextResponse.json(
        { error: `You can only create ${RATE_LIMITS.MAX_REQUESTS_PER_DAY} requests per day` },
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

    const request = await prisma.request.create({
      data: {
        requesterId: DEMO_USER.id,
        locations: JSON.stringify(locations),
        timeWindowStart: new Date(timeWindowStart),
        timeWindowEnd: new Date(timeWindowEnd),
        deliveryMethod,
        deliveryBuilding,
        deliveryNotes,
        dietaryTags: JSON.stringify(dietaryTags || []),
        dietaryNotes,
        pickupAlias: generatePickupAlias(),
        expiresAt,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
