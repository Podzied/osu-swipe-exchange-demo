"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Flag {
  id: string;
  type: string;
  reason: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  user: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
}

export default function FlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING");

  useEffect(() => {
    fetchFlags();
  }, [filter]);

  const fetchFlags = async () => {
    try {
      const url = filter ? `/api/admin/flags?status=${filter}` : "/api/admin/flags";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setFlags(data);
      }
    } catch (error) {
      console.error("Error fetching flags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id: string, status: string, resolution: string) => {
    try {
      const response = await fetch(`/api/admin/flags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resolution }),
      });

      if (response.ok) {
        await fetchFlags();
      }
    } catch (error) {
      console.error("Error resolving flag:", error);
    }
  };

  const flagTypeLabels: Record<string, string> = {
    RAPID_REQUESTS: "Rapid Requests",
    CLAIM_TIMEOUT: "Claim Timeout",
    CONFIRMATION_REUSE: "Confirmation Reuse",
    UNUSUAL_PATTERN: "Unusual Pattern",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          &larr; Back to Admin
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Flagged Activity</h1>
        <p className="text-gray-600">Review and resolve flagged user activity</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["PENDING", "ACTIONED", "DISMISSED", ""].map((status) => (
          <button
            key={status || "all"}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === status
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : flags.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            No flags found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <Card key={flag.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        flag.type === "RAPID_REQUESTS"
                          ? "bg-red-100 text-red-800"
                          : flag.type === "CLAIM_TIMEOUT"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {flagTypeLabels[flag.type] || flag.type}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(flag.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      flag.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : flag.status === "ACTIONED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {flag.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">User</p>
                    <Link
                      href={`/admin/users/${flag.user.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {flag.user.name || flag.user.email}
                    </Link>
                    <span
                      className={`ml-2 text-xs ${
                        flag.user.status === "ACTIVE"
                          ? "text-green-600"
                          : flag.user.status === "SUSPENDED"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      ({flag.user.status})
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Reason</p>
                    <p className="text-gray-900">{flag.reason}</p>
                  </div>
                  {flag.resolution && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Resolution
                      </p>
                      <p className="text-gray-900">{flag.resolution}</p>
                    </div>
                  )}
                  {flag.status === "PENDING" && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleResolve(flag.id, "ACTIONED", "User warned")
                        }
                      >
                        Take Action
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleResolve(flag.id, "DISMISSED", "False positive")
                        }
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
