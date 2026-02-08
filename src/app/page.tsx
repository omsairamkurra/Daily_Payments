import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            OSRK Payments
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Track your daily payments, investments, loans, and financial goals.
            Export your data to XLSX or PDF anytime.
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              Register
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">📍</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Location Capture</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Automatically capture your location when adding payments
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Date Filtering</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Filter payments by date range for better tracking
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="text-3xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Export Reports</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Export your payment data to XLSX or PDF format
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
