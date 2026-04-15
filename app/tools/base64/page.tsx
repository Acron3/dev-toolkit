"use client";
import { useState } from "react";

const base64Encode = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64Decode = (encoded: string) => {
  const normalized = encoded.replace(/\s+/g, "");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleEncode = () => {
    try {
      setOutput(base64Encode(input));
      setError("");
    } catch {
      setError("Failed to encode input.");
      setOutput("");
    }
  };

  const handleDecode = () => {
    try {
      setOutput(base64Decode(input));
      setError("");
    } catch {
      setError("Invalid Base64 string.");
      setOutput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Base64 Encoder / Decoder</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Encode text to Base64 or decode Base64 strings back into readable text.
          </p>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Input Text or Base64
        </label>
        <textarea
          className="w-full min-h-[180px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          placeholder="Enter text to encode or Base64 string to decode..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleEncode}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
            >
              Encode
            </button>
            <button
              onClick={handleDecode}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 dark:bg-slate-300 dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Decode
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Decode Base64 strings or encode plain text with one click.
          </p>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Result
        </label>
        <div className="relative">
          <textarea
            className="w-full min-h-[240px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={output}
            readOnly
          />
          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(output);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
            disabled={!output}
            title={copied ? "Copied!" : "Copy result"}
            aria-label="Copy result"
            className="cursor-pointer absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
          >
            {copied ? (
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
      </section>
    </div>
  );
}
