import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Mini API Debug Toolkit
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          A simple, fast, and no-login toolkit for backend developers to debug common API-related tasks.
        </p>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">JSON Formatter</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Format and validate your JSON data with ease. Perfect for debugging API responses.
          </p>
          <Link href="/tools/json" className="mt-4 inline-block text-blue-500 hover:underline">
            Try it now →
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">JWT Decoder</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Decode and inspect JWT tokens to understand their payload and headers.
          </p>
          <Link href="/tools/jwt" className="mt-4 inline-block text-blue-500 hover:underline">
            Try it now →
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Timestamp Converter</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Convert timestamps to readable dates or turn date strings into Unix timestamp values.
          </p>
          <Link href="/tools/timestamp" className="mt-4 inline-block text-blue-500 hover:underline">
            Try it now →
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Base64 Encoder / Decoder</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Encode text to Base64 or decode Base64 strings back to plain text.
          </p>
          <Link href="/tools/base64" className="mt-4 inline-block text-blue-500 hover:underline">
            Try it now →
          </Link>
        </div>
      </section>
    </div>
  );
}