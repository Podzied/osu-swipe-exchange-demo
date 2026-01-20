"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { DINING_LOCATIONS } from "@/lib/constants";

interface Request {
  id: string;
  status: string;
  locations: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  deliveryMethod: string;
  deliveryBuilding?: string;
  deliveryNotes?: string;
  dietaryTags: string;
  dietaryNotes?: string;
  pickupAlias: string;
  requesterId: string;
  fulfillerId?: string;
  requester: { id: string; name: string };
  fulfiller?: { id: string; name: string };
}

export default function FulfillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [grubhubOrderId, setGrubhubOrderId] = useState("");
  const [showFulfillForm, setShowFulfillForm] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
        // Pre-select first location if available
        const locations = JSON.parse(data.locations);
        if (locations.length > 0) {
          setSelectedLocation(locations[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "claim" }),
      });

      if (response.ok) {
        await fetchRequest();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to claim request");
      }
    } catch (error) {
      console.error("Error claiming request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFulfill = async () => {
    if (!selectedLocation) {
      alert("Please select a location");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/requests/${params.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "fulfill",
          fulfilledLocation: selectedLocation,
          grubhubOrderId: grubhubOrderId || null,
        }),
      });

      if (response.ok) {
        await fetchRequest();
        setShowFulfillForm(false);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to fulfill request");
      }
    } catch (error) {
      console.error("Error fulfilling request:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!confirm("Are you sure you want to release this claim?")) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "release" }),
      });

      if (response.ok) {
        router.push("/fulfill");
      }
    } catch (error) {
      console.error("Error releasing claim:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Request not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const locations = JSON.parse(request.locations) as string[];
  const dietaryTags = JSON.parse(request.dietaryTags) as string[];
  const locationNames = locations
    .map((id) => DINING_LOCATIONS.find((l) => l.id === id)?.name || id)
    .join(", ");

  const startTime = new Date(request.timeWindowStart);
  const endTime = new Date(request.timeWindowEnd);

  const canClaim = request.status === "OPEN";
  const canFulfill = request.status === "CLAIMED";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
      >
        &larr; Back
      </button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-semibold">Fulfill Request</h1>
              <p className="text-sm text-gray-500">
                Requested by {request.requester.name}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pickup Alias (shown after claim) */}
          {request.status !== "OPEN" && (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-700 font-medium">
                Pickup Code (Verify with requester)
              </p>
              <p className="text-2xl font-mono font-bold text-primary-900">
                {request.pickupAlias}
              </p>
            </div>
          )}

          {/* Time Window */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Time Window
            </h3>
            <p className="text-gray-900">
              {startTime.toLocaleDateString([], {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-700">
              {startTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {endTime.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Locations */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Preferred Locations
            </h3>
            <p className="text-gray-900">{locationNames}</p>
          </div>

          {/* Delivery Method */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Delivery Method
            </h3>
            <p className="text-gray-900">
              {request.deliveryMethod === "PICKUP" ? "Pickup" : "Delivery"}
            </p>
            {request.deliveryMethod === "DELIVERY" && (
              <div className="mt-1 p-3 bg-yellow-50 rounded text-sm">
                <p className="font-medium text-yellow-800">
                  Deliver to: {request.deliveryBuilding}
                </p>
                {request.deliveryNotes && (
                  <p className="text-yellow-700 mt-1">
                    Notes: {request.deliveryNotes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Dietary */}
          {(dietaryTags.length > 0 || request.dietaryNotes) && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Dietary Preferences
              </h3>
              {dietaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {dietaryTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {request.dietaryNotes && (
                <p className="text-sm text-gray-600">{request.dietaryNotes}</p>
              )}
            </div>
          )}

          {/* Fulfill Form */}
          {showFulfillForm && canFulfill && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <h3 className="font-medium">Confirm Fulfillment</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location where meal was purchased
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  {locations.map((locId) => {
                    const loc = DINING_LOCATIONS.find((l) => l.id === locId);
                    return (
                      <option key={locId} value={locId}>
                        {loc?.name || locId}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GrubHub Order ID (optional)
                </label>
                <input
                  type="text"
                  value={grubhubOrderId}
                  onChange={(e) => setGrubhubOrderId(e.target.value)}
                  placeholder="Enter order ID if applicable"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFulfillForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleFulfill} disabled={actionLoading}>
                  {actionLoading ? "Processing..." : "Confirm Fulfillment"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter>
          <div className="flex gap-3 w-full">
            {canClaim && (
              <Button
                onClick={handleClaim}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? "Claiming..." : "Claim This Request"}
              </Button>
            )}
            {canFulfill && !showFulfillForm && (
              <>
                <Button
                  variant="outline"
                  onClick={handleRelease}
                  disabled={actionLoading}
                >
                  Release Claim
                </Button>
                <Button
                  onClick={() => setShowFulfillForm(true)}
                  className="flex-1"
                >
                  Mark as Fulfilled
                </Button>
              </>
            )}
            {request.status === "FULFILLED" && (
              <div className="w-full text-center text-gray-600">
                Waiting for requester to confirm receipt
              </div>
            )}
            {request.status === "COMPLETED" && (
              <Button
                variant="outline"
                onClick={() => router.push("/fulfill")}
                className="flex-1"
              >
                Back to Browse
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
