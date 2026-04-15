"use client";
import { useState } from "react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError("");
    } catch {
      setError("Invalid JSON");
      setOutput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">JSON Formatter</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Paste raw JSON and format it cleanly for easier reading and debugging.
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Input JSON
          </label>
          <textarea
            className="w-full min-h-[220px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Paste JSON here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={handleFormat}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
            >
              Format JSON
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Valid JSON will be pretty-printed below.
            </p>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Formatted Output
          </label>
          <textarea
            className="w-full min-h-[240px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={output}
            readOnly
          />
        </section>
      </div>
  );
}