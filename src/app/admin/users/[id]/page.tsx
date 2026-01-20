"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/StatusBadge";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  suspendedUntil: string | null;
  createdAt: string;
  requests: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
  fulfillments: Array<{
    id: string;
    status: string;
    claimedAt: string;
  }>;
  flags: Array<{
    id: string;
    type: string;
    reason: string;
    status: string;
    createdAt: string;
  }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [params.id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, extra?: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });

      if (response.ok) {
        await fetchUser();
      } else {
        const data = await response.json();
        alert(data.error || "Action failed");
      }
    } catch (error) {
      console.error("Error performing action:", error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin/users"
          className="text-gray-600 hover:text-gray-900 mb-2 inline-block"
        >
          &larr; Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
      </div>

      {/* User Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">{user.name || "No Name"}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  user.role === "ADMIN"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {user.role}
              </span>
              <span
                className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                  user.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : user.status === "SUSPENDED"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {user.status}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Joined</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Requests Made</p>
              <p className="font-medium">{user.requests.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fulfilled</p>
              <p className="font-medium">{user.fulfillments.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Flags</p>
              <p className="font-medium text-red-600">{user.flags.length}</p>
            </div>
          </div>

          {user.suspendedUntil && (
            <div className="p-3 bg-yellow-50 rounded mb-4">
              <p className="text-sm text-yellow-800">
                Suspended until:{" "}
                {new Date(user.suspendedUntil).toLocaleString()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {user.status === "ACTIVE" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => handleAction("suspend", { suspendDays: 7 })}
                >
                  Suspend 7 Days
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() => {
                    if (confirm("Are you sure you want to ban this user?")) {
                      handleAction("ban");
                    }
                  }}
                >
                  Ban User
                </Button>
              </>
            )}
            {user.status === "SUSPENDED" && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleAction("unsuspend")}
              >
                Remove Suspension
              </Button>
            )}
            {user.status === "BANNED" && (
              <Button
                variant="outline"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleAction("unban")}
              >
                Unban User
              </Button>
            )}
            {user.role === "USER" && (
              <Button
                variant="secondary"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleAction("setRole", { role: "ADMIN" })}
              >
                Make Admin
              </Button>
            )}
            {user.role === "ADMIN" && (
              <Button
                variant="secondary"
                size="sm"
                disabled={actionLoading}
                onClick={() => handleAction("setRole", { role: "USER" })}
              >
                Remove Admin
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flags */}
      {user.flags.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="font-semibold">Flags ({user.flags.length})</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.flags.map((flag) => (
                <div
                  key={flag.id}
                  className="p-3 bg-gray-50 rounded flex justify-between items-start"
                >
                  <div>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        flag.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : flag.status === "ACTIONED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {flag.type}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">{flag.reason}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(flag.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Requests */}
      <Card className="mb-6">
        <CardHeader>
          <h3 className="font-semibold">Recent Requests</h3>
        </CardHeader>
        <CardContent>
          {user.requests.length === 0 ? (
            <p className="text-gray-500 text-sm">No requests</p>
          ) : (
            <div className="space-y-2">
              {user.requests.slice(0, 10).map((req) => (
                <div
                  key={req.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm font-mono">
                    {req.id.slice(0, 12)}...
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-gray-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Fulfillments */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Recent Fulfillments</h3>
        </CardHeader>
        <CardContent>
          {user.fulfillments.length === 0 ? (
            <p className="text-gray-500 text-sm">No fulfillments</p>
          ) : (
            <div className="space-y-2">
              {user.fulfillments.slice(0, 10).map((req) => (
                <div
                  key={req.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm font-mono">
                    {req.id.slice(0, 12)}...
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={req.status} />
                    <span className="text-xs text-gray-500">
                      {req.claimedAt
                        ? new Date(req.claimedAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
