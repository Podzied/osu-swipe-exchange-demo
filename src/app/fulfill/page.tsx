import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RequestCard } from "@/components/RequestCard";

export default async function FulfillPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch open requests (excluding user's own)
  const openRequests = await prisma.request.findMany({
    where: {
      status: "OPEN",
      requesterId: { not: session.user.id },
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "asc" }, // FIFO
  });

  // Fetch requests this user is currently fulfilling
  const myFulfillments = await prisma.request.findMany({
    where: {
      fulfillerId: session.user.id,
      status: { in: ["CLAIMED", "FULFILLED"] },
    },
    orderBy: { claimedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fulfill Requests</h1>
        <p className="text-gray-600">
          Help fellow Buckeyes by using your extra meal swipes
        </p>
      </div>

      {/* Currently Fulfilling Section */}
      {myFulfillments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Active Fulfillments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myFulfillments.map((request) => (
              <RequestCard key={request.id} request={request} isFulfiller />
            ))}
          </div>
        </div>
      )}

      {/* Open Requests Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Available Requests ({openRequests.length})
        </h2>
        {openRequests.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No open requests at the moment. Check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openRequests.map((request) => (
              <RequestCard key={request.id} request={request} isFulfiller />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
