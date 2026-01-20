import { RequestCard } from "@/components/RequestCard";
import { requests } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default async function FulfillPage() {
  // Fetch all open requests from mock data
  const openRequests = requests
    .filter((r) => r.status === "OPEN")
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // FIFO

  // Fetch requests being fulfilled
  const myFulfillments = requests
    .filter((r) => ["CLAIMED", "FULFILLED"].includes(r.status))
    .sort((a, b) => {
      const aTime = a.claimedAt?.getTime() || 0;
      const bTime = b.claimedAt?.getTime() || 0;
      return bTime - aTime;
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
            Active Fulfillments
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
