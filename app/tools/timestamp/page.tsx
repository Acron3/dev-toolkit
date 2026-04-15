"use client";
import { useState } from "react";

const parseTimestamp = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error("Input cannot be empty.");
  }

  const numeric = /^\d+$/.test(trimmed);
  let date: Date;
  let sourceType = "date";

  if (numeric) {
    let timestamp = Number(trimmed);
    sourceType = "timestamp";

    if (trimmed.length === 10) {
      timestamp *= 1000;
    }

    date = new Date(timestamp);
  } else {
    date = new Date(trimmed);
  }

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid timestamp or date string.");
  }

  return {
    sourceType,
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
    iso: date.toISOString(),
    local: date.toLocaleString(),
  };
};

export default function TimestampConverter() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{
    sourceType: string;
    unixSeconds: number;
    unixMilliseconds: number;
    iso: string;
    local: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1500);
  };

  const handleConvert = () => {
    try {
      const data = parseTimestamp(input);
      setResult(data);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed.");
      setResult(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Timestamp Converter</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Convert timestamps to readable dates, or convert date strings into Unix timestamp values.
          </p>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Timestamp or Date String
        </label>
        <textarea
          className="w-full min-h-[180px] rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          placeholder="Enter a Unix timestamp (seconds or milliseconds) or a date string..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={handleConvert}
            className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
          >
            Convert
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Supports Unix seconds, milliseconds, and ISO date strings.
          </p>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        {result && (
          <div className="mt-6 rounded-3xl border border-slate-200/80 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Input Type</p>
                <p className="text-base text-slate-900 dark:text-slate-100 capitalize">{result.sourceType}</p>
              </div>
              <div className="mt-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Unix Timestamp (seconds)</p>
                <div className="mt-1 flex items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white pl-4 pr-2 py-2 text-sm text-slate-900 shadow-sm transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                  <span className="break-words">{result.unixSeconds}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(result.unixSeconds), "unixSeconds")}
                    title={copiedField === "unixSeconds" ? "Copied!" : "Copy seconds"}
                    aria-label="Copy unix seconds"
                    className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    {copiedField === "unixSeconds" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 17H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                        <rect x="8" y="8" width="12" height="12" rx="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Unix Timestamp (milliseconds)</p>
                <div className="mt-1 flex items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white pl-4 pr-2 py-2 text-sm text-slate-900 shadow-sm transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                  <span className="break-words">{result.unixMilliseconds}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(result.unixMilliseconds), "unixMilliseconds")}
                    title={copiedField === "unixMilliseconds" ? "Copied!" : "Copy milliseconds"}
                    aria-label="Copy unix milliseconds"
                    className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    {copiedField === "unixMilliseconds" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 17H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                        <rect x="8" y="8" width="12" height="12" rx="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">ISO String</p>
                <div className="mt-1 flex items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-white pl-4 pr-2 py-2 text-sm text-slate-900 shadow-sm transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                  <span className="break-words">{result.iso}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.iso, "iso")}
                    title={copiedField === "iso" ? "Copied!" : "Copy ISO string"}
                    aria-label="Copy ISO string"
                    className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    {copiedField === "iso" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 17H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                        <rect x="8" y="8" width="12" height="12" rx="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Local Date</p>
                <div className="mt-1 flex items-center justify-between rounded-2xl border border-slate-300 bg-white pl-4 pr-2 py-2 text-sm text-slate-900 shadow-sm transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                  <span className="truncate pr-3">{result.local}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.local, "local")}
                    title={copiedField === "local" ? "Copied!" : "Copy local date"}
                    aria-label="Copy local date"
                    className="cursor-pointer inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
                  >
                    {copiedField === "local" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8 17H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
                        <rect x="8" y="8" width="12" height="12" rx="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
