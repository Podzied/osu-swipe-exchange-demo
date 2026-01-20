"use client";

import Link from "next/link";
import { Card, CardContent, CardFooter } from "./ui/Card";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/Button";
import { DINING_LOCATIONS } from "@/lib/constants";

interface RequestCardProps {
  request: {
    id: string;
    status: string;
    locations: string;
    timeWindowStart: string | Date;
    timeWindowEnd: string | Date;
    deliveryMethod: string;
    dietaryTags: string;
    pickupAlias?: string;
  };
  showActions?: boolean;
  isFulfiller?: boolean;
}

export function RequestCard({
  request,
  showActions = true,
  isFulfiller = false,
}: RequestCardProps) {
  const locations = JSON.parse(request.locations) as string[];
  const dietaryTags = JSON.parse(request.dietaryTags) as string[];
  const locationNames = locations
    .map((id) => DINING_LOCATIONS.find((l) => l.id === id)?.shortName || id)
    .join(", ");

  const startTime = new Date(request.timeWindowStart);
  const endTime = new Date(request.timeWindowEnd);
  const timeRange = `${startTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} - ${endTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  const dateStr = startTime.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Card>
      <CardContent>
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm text-gray-500">{dateStr}</p>
            <p className="font-medium text-gray-900">{timeRange}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Location:</span>
            {locationNames}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Delivery:</span>
            {request.deliveryMethod === "PICKUP" ? "Pickup" : "Delivery"}
          </div>
          {dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
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
        </div>

        {request.pickupAlias && request.status !== "OPEN" && (
          <div className="mt-3 p-2 bg-gray-100 rounded">
            <p className="text-xs text-gray-500">Pickup Code</p>
            <p className="font-mono font-bold text-lg">{request.pickupAlias}</p>
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter>
          <Link
            href={isFulfiller ? `/fulfill/${request.id}` : `/request/${request.id}`}
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
