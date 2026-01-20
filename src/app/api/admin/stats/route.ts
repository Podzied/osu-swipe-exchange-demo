import { NextResponse } from "next/server";
import { requests, users, flags, getUser } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

// GET /api/admin/stats - Get admin dashboard stats
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Aggregate stats
    const totalUsers = users.length;
    const totalRequests = requests.length;
    const completedRequests = requests.filter(
      (r) => r.status === "COMPLETED"
    ).length;
    const pendingFlags = flags.filter((f) => f.status === "PENDING").length;
    const todayRequests = requests.filter((r) => r.createdAt >= today).length;
    const todayCompletions = requests.filter(
      (r) => r.status === "COMPLETED" && r.completedAt && r.completedAt >= today
    ).length;
    const weeklyRequests = requests.filter((r) => r.createdAt >= weekAgo).length;

    // Status counts
    const statusCountsMap: Record<string, number> = {};
    requests.forEach((r) => {
      statusCountsMap[r.status] = (statusCountsMap[r.status] || 0) + 1;
    });

    // Recent activity
    const recentRequests = [...requests]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10)
      .map((r) => {
        const requester = getUser(r.requesterId);
        const fulfiller = r.fulfillerId ? getUser(r.fulfillerId) : null;
        return {
          ...r,
          requester: requester
            ? { name: requester.name, email: requester.email }
            : null,
          fulfiller: fulfiller
            ? { name: fulfiller.name, email: fulfiller.email }
            : null,
        };
      });

    return NextResponse.json({
      totalUsers,
      totalRequests,
      completedRequests,
      pendingFlags,
      todayRequests,
      todayCompletions,
      weeklyRequests,
      statusCounts: statusCountsMap,
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
