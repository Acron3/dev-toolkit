"use client";
import { useState } from "react";

export default function JwtDecoder() {
  const [token, setToken] = useState("");
  const [payload, setPayload] = useState("");
  const [error, setError] = useState("");

  const decodeJWT = () => {
    try {
      const base64 = token.split(".")[1];
      const decoded = atob(base64);
      const parsed = JSON.parse(decoded);
      setPayload(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Invalid JWT");
      setPayload("");
    }
  };

  return (
      <div className="max-w-3xl mx-auto space-y-8">
        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80">
          <div className="mb-6">
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">JWT Decoder</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Paste a JWT token to decode the payload and inspect its claims.
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            JWT Token
          </label>
          <textarea
            className="w-full min-h-[180px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            placeholder="Paste JWT here..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={decodeJWT}
              className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
            >
              Decode JWT
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Use the token string from an authorization header or auth payload.
            </p>
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Decoded Payload
          </label>
          <textarea
            className="w-full min-h-[240px] rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            value={payload}
            readOnly
          />
        </section>
      </div>
  );
}