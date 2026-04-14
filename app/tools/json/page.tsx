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
    } catch (err) {
      setError("Invalid JSON");
      setOutput("");
    }
  };

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">JSON Formatter</h1>

      <textarea
        className="w-full h-40 p-2 border mb-3"
        placeholder="Paste JSON here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleFormat}
        className="px-4 py-2 bg-black text-white mb-3"
      >
        Format
      </button>

      {error && <p className="text-red-500">{error}</p>}

      <textarea
        className="w-full h-40 p-2 border"
        value={output}
        readOnly
      />
    </main>
  );
}