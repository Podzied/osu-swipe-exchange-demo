import { STATUS_COLORS } from "@/lib/constants";
import { RequestStatus } from "@/types";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass =
    STATUS_COLORS[status as RequestStatus] || "bg-gray-100 text-gray-800";

  const labels: Record<string, string> = {
    OPEN: "Open",
    CLAIMED: "Claimed",
    FULFILLED: "Ready for Pickup",
    COMPLETED: "Completed",
    EXPIRED: "Expired",
    CANCELLED: "Cancelled",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {labels[status] || status}
    </span>
  );
}
