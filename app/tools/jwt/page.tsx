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
    } catch (err) {
      setError("Invalid JWT");
      setPayload("");
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">JWT Decoder</h1>

      <textarea
        className="w-full h-32 p-2 border mb-3"
        placeholder="Paste JWT here..."
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />

      <button
        onClick={decodeJWT}
        className="px-4 py-2 bg-black text-white mb-3"
      >
        Decode
      </button>

      {error && <p className="text-red-500">{error}</p>}

      <textarea
        className="w-full h-40 p-2 border"
        value={payload}
        readOnly
      />
    </main>
  );
}