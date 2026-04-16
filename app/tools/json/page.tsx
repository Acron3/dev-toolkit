"use client";
import { useState } from "react";

function parseValue(valueText: string) {
  const trimmed = valueText.trim();
  const lower = trimmed.toLowerCase();

  if (trimmed === "") return "";
  if (lower === "null") return null;
  if (lower === "true") return true;
  if (lower === "false") return false;
  if (/^[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  const quoted = trimmed.match(/^(['"])(.*)\1$/);
  if (quoted) {
    return quoted[2];
  }

  return trimmed;
}

function parseCustomObject(raw: string) {
  const lines = raw.split(/\r?\n/);
  const parsed: Record<string, unknown> = {};
  const invalidLines: number[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const cleaned = trimmed.replace(/,+\s*$/, "");
    const match = cleaned.match(/^(.+?)\s*[:=]\s*(.+)$/);

    if (!match) {
      invalidLines.push(index + 1);
      return;
    }

    const key = match[1].trim().replace(/^['"]|['"]$/g, "");
    const valueText = match[2].trim();

    if (!key) {
      invalidLines.push(index + 1);
      return;
    }

    parsed[key] = parseValue(valueText);
  });

  return { parsed, invalidLines };
}

function formatReverseValue(value: unknown) {
  if (value === null) return "null";
  if (typeof value === "string") return value;
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function formatObjectAsLines(value: unknown) {
  if (value === null) return "null";
  if (typeof value !== "object" || Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  }

  return Object.entries(value as Record<string, unknown>)
    .map(([key, item]) => `${key}: ${formatReverseValue(item)}`)
    .join("\n");
}

function parseInput(rawInput: string, reverseMode: boolean) {
  const trimmedInput = rawInput.trim();
  if (!trimmedInput) {
    return { output: "", error: "", warning: "" };
  }

  if (reverseMode) {
    try {
      const parsed = JSON.parse(trimmedInput);
      return { output: formatObjectAsLines(parsed), error: "", warning: "" };
    } catch {
      return {
        output: "",
        error: "Reverse mode requires valid JSON.",
        warning: "Use valid JSON like { \"name\": \"budi\" } to convert to lines.",
      };
    }
  }

  try {
    const parsed = JSON.parse(trimmedInput);
    return { output: JSON.stringify(parsed, null, 2), error: "", warning: "" };
  } catch {
    const { parsed, invalidLines } = parseCustomObject(trimmedInput);
    if (invalidLines.length > 0) {
      return {
        output: "",
        error: `Invalid format on line${invalidLines.length > 1 ? "s" : ""}: ${invalidLines.join(", ")}`,
        warning: "Use key: value or key = value, and trim trailing commas.",
      };
    }

    if (Object.keys(parsed).length === 0) {
      return {
        output: "",
        error: "Unable to parse input.",
        warning: "Use key: value, key = value, or valid JSON.",
      };
    }

    return { output: JSON.stringify(parsed, null, 2), error: "", warning: "" };
  }
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [copied, setCopied] = useState(false);
  const [reverseMode, setReverseMode] = useState(false);

  const handleInputChange = (value: string) => {
    setInput(value);
    const parsed = parseInput(value, reverseMode);
    setOutput(parsed.output);
    setError(parsed.error);
    setWarning(parsed.warning);
  };

  const handleReverseToggle = () => {
    const nextMode = !reverseMode;
    setReverseMode(nextMode);
    const parsed = parseInput(input, nextMode);
    setOutput(parsed.output);
    setError(parsed.error);
    setWarning(parsed.warning);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">JSON Formatter</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Ketik input langsung tanpa tombol generate. Auto-convert key/value ke JSON dan sebaliknya.
          </p>
        </div>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleReverseToggle}
            className={`cursor-pointer inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition ${reverseMode ? "bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100" : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"}`}
          >
            {reverseMode ? "Reverse mode: JSON → lines" : "Normal mode: lines → JSON"}
          </button>
        </div>

        <textarea
          className="w-full min-h-[220px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          placeholder="name: budi \n age: 10 \n id: 1024"
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
        />

        {(error || warning) && (
          <div className="mt-4 space-y-2">
            {error && <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>}
            {warning && <p className="text-sm text-slate-600 dark:text-slate-400">{warning}</p>}
          </div>
        )}

        <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {reverseMode ? "Converted lines" : "Formatted JSON"}
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
              if (!output) return;
              await navigator.clipboard.writeText(output);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
            disabled={!output}
            title={copied ? "Copied!" : "Copy output"}
            aria-label="Copy output"
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
