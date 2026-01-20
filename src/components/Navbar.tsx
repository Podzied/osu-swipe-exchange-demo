"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Meal Swipe Exchange</span>
            </Link>
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
              <Link
                href="/admin"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
              >
                Admin
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm px-3 py-1 bg-primary-700 rounded">
              Demo Mode
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
