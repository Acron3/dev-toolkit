import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Minimal API Debug Toolkit</h1>

      <ul className="space-y-2">
        <li>
          <Link href="/tools/json" className="text-blue-500 underline">
            JSON Formatter
          </Link>
        </li>
        <li>
          <Link href="/tools/jwt" className="text-blue-500 underline">
            JWT Decoder
          </Link>
        </li>
      </ul>
    </main>
  );
}