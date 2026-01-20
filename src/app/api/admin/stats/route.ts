import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/stats - Get admin dashboard stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Aggregate stats
    const [
      totalUsers,
      totalRequests,
      completedRequests,
      pendingFlags,
      todayRequests,
      todayCompletions,
      weeklyRequests,
      statusCounts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.request.count(),
      prisma.request.count({ where: { status: "COMPLETED" } }),
      prisma.flag.count({ where: { status: "PENDING" } }),
      prisma.request.count({ where: { createdAt: { gte: today } } }),
      prisma.request.count({
        where: { status: "COMPLETED", completedAt: { gte: today } },
      }),
      prisma.request.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.request.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    // Recent activity
    const recentRequests = await prisma.request.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { name: true, email: true } },
        fulfiller: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      totalUsers,
      totalRequests,
      completedRequests,
      pendingFlags,
      todayRequests,
      todayCompletions,
      weeklyRequests,
      statusCounts: Object.fromEntries(
        statusCounts.map((s) => [s.status, s._count.status])
      ),
      recentRequests,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
