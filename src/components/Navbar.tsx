"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function Navbar() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Meal Swipe Exchange</span>
            </Link>
            {status === "authenticated" && (
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Dashboard
                </Link>
                <Link
                  href="/request/new"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Request Meal
                </Link>
                <Link
                  href="/fulfill"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Fulfill
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
                  >
                    Admin
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            {status === "loading" ? (
              <span className="text-sm">Loading...</span>
            ) : status === "authenticated" ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm hidden sm:block">
                  {session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-3 py-2 rounded-md text-sm font-medium bg-primary-700 hover:bg-primary-500"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 rounded-md text-sm font-medium bg-primary-700 hover:bg-primary-500"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
