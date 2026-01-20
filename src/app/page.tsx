import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Meal Swipe</span>
          <span className="block text-primary-600">Exchange</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Have extra meal swipes? Need a meal? Connect with fellow Buckeyes and
          make the most of your meal plan.
        </p>
        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <Link
            href="/request/new"
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
          >
            Request a Meal
          </Link>
          <Link
            href="/fulfill"
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10"
          >
            Fulfill Requests
          </Link>
          <Link
            href="/admin"
            className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
          >
            Admin Panel
          </Link>
        </div>
        <p className="mt-4 text-sm text-primary-600 font-medium">
          Demo Mode - No login required
        </p>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-3xl mb-4">1</div>
          <h3 className="text-lg font-semibold text-gray-900">
            Create a Request
          </h3>
          <p className="mt-2 text-gray-600">
            Tell us where and when you need a meal. Add any dietary preferences.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-3xl mb-4">2</div>
          <h3 className="text-lg font-semibold text-gray-900">Get Matched</h3>
          <p className="mt-2 text-gray-600">
            A fellow student with extra swipes claims your request.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow">
          <div className="text-3xl mb-4">3</div>
          <h3 className="text-lg font-semibold text-gray-900">Pick Up</h3>
          <p className="mt-2 text-gray-600">
            Meet at the dining hall or get it delivered. Use your unique pickup
            code.
          </p>
        </div>
      </div>
    </div>
  );
}
