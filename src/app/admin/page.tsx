"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface Stats {
  totalUsers: number;
  totalRequests: number;
  completedRequests: number;
  pendingFlags: number;
  todayRequests: number;
  todayCompletions: number;
  weeklyRequests: number;
  statusCounts: Record<string, number>;
  recentRequests: Array<{
    id: string;
    status: string;
    createdAt: string;
    requester: { name: string; email: string };
    fulfiller?: { name: string; email: string };
  }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-500">Failed to load admin stats</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and management</p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link
          href="/admin/flags"
          className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 font-medium"
        >
          Flagged Activity ({stats.pendingFlags})
        </Link>
        <Link
          href="/admin/users"
          className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 font-medium"
        >
          Manage Users
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalUsers}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalRequests}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {stats.completedRequests}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500">Pending Flags</p>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.pendingFlags}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <h2 className="font-semibold">Today&apos;s Activity</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Requests Created</span>
                <span className="font-medium">{stats.todayRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completions</span>
                <span className="font-medium">{stats.todayCompletions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Requests</span>
                <span className="font-medium">{stats.weeklyRequests}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">Request Status Breakdown</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-gray-600">{status}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Recent Requests</h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Requester
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Fulfiller
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-4 py-2 text-sm font-mono">
                      {req.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {req.requester.name || req.requester.email}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          req.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : req.status === "OPEN"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {req.fulfiller?.name || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {new Date(req.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
