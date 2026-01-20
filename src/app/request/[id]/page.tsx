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
  fulfilledLocation?: string;
  grubhubOrderId?: string;
  createdAt: string;
  claimedAt?: string;
  fulfilledAt?: string;
  completedAt?: string;
  requester: { id: string; name: string };
  fulfiller?: { id: string; name: string };
}

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      }
    } catch (error) {
      console.error("Error fetching request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchRequest();
      }
    } catch (error) {
      console.error("Error performing action:", error);
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
              <h1 className="text-xl font-semibold">Request Details</h1>
              <p className="text-sm text-gray-500">ID: {request.id}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Pickup Code */}
          {request.status !== "OPEN" && request.status !== "CANCELLED" && (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
              <p className="text-sm text-primary-700 font-medium">
                Pickup Code
              </p>
              <p className="text-2xl font-mono font-bold text-primary-900">
                {request.pickupAlias}
              </p>
              <p className="text-xs text-primary-600 mt-1">
                Show this code to verify your identity
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
              <div className="mt-1 text-sm text-gray-600">
                <p>Building: {request.deliveryBuilding}</p>
                {request.deliveryNotes && (
                  <p>Notes: {request.deliveryNotes}</p>
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

          {/* Fulfillment Info */}
          {request.fulfiller && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Fulfiller Info
              </h3>
              <p className="text-gray-900">{request.fulfiller.name}</p>
              {request.fulfilledLocation && (
                <p className="text-sm text-gray-600">
                  Location:{" "}
                  {DINING_LOCATIONS.find(
                    (l) => l.id === request.fulfilledLocation
                  )?.name || request.fulfilledLocation}
                </p>
              )}
              {request.grubhubOrderId && (
                <p className="text-sm text-gray-600">
                  Order ID: {request.grubhubOrderId}
                </p>
              )}
            </div>
          )}

          {/* Status Updates */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Timeline</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                Created: {new Date(request.createdAt).toLocaleString()}
              </p>
              {request.claimedAt && (
                <p className="text-gray-600">
                  Claimed: {new Date(request.claimedAt).toLocaleString()}
                </p>
              )}
              {request.fulfilledAt && (
                <p className="text-gray-600">
                  Fulfilled: {new Date(request.fulfilledAt).toLocaleString()}
                </p>
              )}
              {request.completedAt && (
                <p className="text-gray-600">
                  Completed: {new Date(request.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex gap-3 w-full">
            {request.status === "OPEN" && (
              <Button
                variant="danger"
                onClick={() => handleAction("cancel")}
                disabled={actionLoading}
                className="flex-1"
              >
                Cancel Request
              </Button>
            )}
            {request.status === "FULFILLED" && (
              <Button
                onClick={() => handleAction("complete")}
                disabled={actionLoading}
                className="flex-1"
              >
                Mark as Received
              </Button>
            )}
            {(request.status === "COMPLETED" ||
              request.status === "CANCELLED" ||
              request.status === "EXPIRED") && (
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="flex-1"
              >
                Back to Dashboard
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
