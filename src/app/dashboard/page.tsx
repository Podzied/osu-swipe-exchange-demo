import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { RequestCard } from "@/components/RequestCard";
import { Button } from "@/components/ui/Button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user's requests
  const myRequests = await prisma.request.findMany({
    where: { requesterId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Fetch requests user is fulfilling
  const fulfilling = await prisma.request.findMany({
    where: {
      fulfillerId: session.user.id,
      status: { in: ["CLAIMED", "FULFILLED"] },
    },
    orderBy: { claimedAt: "desc" },
    take: 10,
  });

  // Stats
  const totalRequests = await prisma.request.count({
    where: { requesterId: session.user.id },
  });

  const totalFulfilled = await prisma.request.count({
    where: { fulfillerId: session.user.id, status: "COMPLETED" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session.user.name || session.user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">My Requests</p>
          <p className="text-3xl font-bold text-gray-900">{totalRequests}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Meals Fulfilled</p>
          <p className="text-3xl font-bold text-gray-900">{totalFulfilled}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-500">Active Now</p>
          <p className="text-3xl font-bold text-gray-900">
            {myRequests.filter((r) => ["OPEN", "CLAIMED", "FULFILLED"].includes(r.status)).length}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link href="/request/new">
          <Button>Request a Meal</Button>
        </Link>
        <Link href="/fulfill">
          <Button variant="outline">Fulfill Requests</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Requests */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            My Requests
          </h2>
          {myRequests.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              No requests yet.{" "}
              <Link href="/request/new" className="text-primary-600 hover:underline">
                Create one
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>

        {/* Currently Fulfilling */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Currently Fulfilling
          </h2>
          {fulfilling.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-500">
              Not fulfilling any requests.{" "}
              <Link href="/fulfill" className="text-primary-600 hover:underline">
                Browse available
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {fulfilling.map((request) => (
                <RequestCard key={request.id} request={request} isFulfiller />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
