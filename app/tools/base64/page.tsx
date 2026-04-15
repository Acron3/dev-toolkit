"use client";
import { useEffect, useRef, useState } from "react";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const LARGE_TEXT_LIMIT = 100_000;
const PREVIEW_TEXT_LIMIT = 1000;
const ACCEPTED_FILE_TYPES = [
  "image/*",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const base64EncodeText = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const base64DecodeText = (encoded: string) => {
  const normalized = encoded.replace(/\s+/g, "");
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const base64ToBytes = (encoded: string) => {
  const normalized = encoded.replace(/\s+/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const detectMimeType = (bytes: Uint8Array) => {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) {
    return "image/bmp";
  }
  const firstText = new TextDecoder().decode(bytes.subarray(0, 16));
  if (firstText.trim().startsWith("<svg")) {
    return "image/svg+xml";
  }
  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "application/pdf";
  }
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
    const content = new TextDecoder().decode(bytes.subarray(0, Math.min(bytes.length, 2048)));
    if (content.includes("word/")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (content.includes("xl/")) return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    return "application/zip";
  }
  return "";
};

const getExtensionFromMime = (mime: string) => {
  if (mime.includes("png")) return ".png";
  if (mime.includes("jpeg")) return ".jpg";
  if (mime.includes("gif")) return ".gif";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("bmp")) return ".bmp";
  if (mime.includes("svg")) return ".svg";
  if (mime === "application/pdf") return ".pdf";
  if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return ".docx";
  if (mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") return ".xlsx";
  return ".bin";
};

const isImageMime = (mime: string) => mime.startsWith("image/");

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const compressImageFile = async (file: File, quality: number) => {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(url);
    return file;
  }
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const mimeType = file.type === "image/svg+xml" ? "image/png" : file.type;
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), mimeType, quality);
  });

  URL.revokeObjectURL(url);
  return blob instanceof Blob ? new File([blob], file.name, { type: blob.type }) : file;
};

export default function Base64Tool() {
  const [mode, setMode] = useState<"text" | "file">("text");
  const [fileAction, setFileAction] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef("");
  const outputRef = useRef("");

  const makePreview = (text: string) =>
    text.length > PREVIEW_TEXT_LIMIT ? `${text.slice(0, PREVIEW_TEXT_LIMIT)}...` : text;

  const setInputPreview = (text: string) => {
    inputRef.current = text;
    setInput(makePreview(text));
  };

  const setOutputPreview = (text: string) => {
    outputRef.current = text;
    setOutput(makePreview(text));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    inputRef.current = value;
    setInput(value);
  };

  const handleInputPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData("text");

    if (text.length > LARGE_TEXT_LIMIT) {
      e.preventDefault();
      setInputPreview(text);
    }
  };
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [decodedFileUrl, setDecodedFileUrl] = useState("");
  const [decodedFileName, setDecodedFileName] = useState("");
  const [decodedFileType, setDecodedFileType] = useState("");
  const [decodedFileSize, setDecodedFileSize] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [compressEnabled, setCompressEnabled] = useState(false);
  const [quality, setQuality] = useState(0.85);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }
    if (isImageMime(selectedFile.type)) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl("");
  }, [selectedFile]);

  useEffect(() => {
    return () => {
      if (decodedFileUrl) {
        URL.revokeObjectURL(decodedFileUrl);
      }
    };
  }, [decodedFileUrl]);

  const resetPreviewState = () => {
    setDecodedFileUrl("");
    setDecodedFileName("");
    setDecodedFileType("");
    setDecodedFileSize(0);
  };

  const validateFile = (file: File | null) => {
    if (!file) return "No file selected.";
    if (file.size > MAX_FILE_BYTES) return "File must be 10MB or smaller.";
    if (!ACCEPTED_FILE_TYPES.some((type) => type === "image/*" ? file.type.startsWith("image/") : file.type === type)) {
      return "Only images, PDF, DOCX, and XLSX files are allowed.";
    }
    return "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      setSelectedFile(null);
      return;
    }
    setError("");
    setSelectedFile(file);
  };


  const encodeFile = async () => {
    if (!selectedFile) {
      setError("Choose a file to encode.");
      setOutput("");
      return;
    }

    try {
      let fileToEncode = selectedFile;
      if (compressEnabled && isImageMime(selectedFile.type)) {
        fileToEncode = await compressImageFile(selectedFile, quality);
      }
      const buffer = await fileToEncode.arrayBuffer();
      const encoded = bytesToBase64(new Uint8Array(buffer));
      setOutputPreview(encoded);
      setError("");
    } catch {
      setError("Failed to encode the selected file.");
      setOutput("");
    }
  };

  const decodeFile = () => {
    const trimmed = inputRef.current.trim();
    if (!trimmed) {
      setError("Paste a Base64 string to decode.");
      setOutput("");
      resetPreviewState();
      return;
    }

    const base64 = trimmed.startsWith("data:") ? trimmed.slice(trimmed.indexOf(",") + 1) : trimmed;
    const approxBytes = Math.ceil((base64.length * 3) / 4);
    if (approxBytes > MAX_FILE_BYTES) {
      setError("Decoded file exceeds the 10MB limit.");
      setOutput("");
      resetPreviewState();
      return;
    }

    try {
      const bytes = base64ToBytes(base64);
      if (bytes.length > MAX_FILE_BYTES) {
        setError("Decoded file exceeds the 10MB limit.");
        setOutput("");
        resetPreviewState();
        return;
      }

      const detectedMime = detectMimeType(bytes) || "application/octet-stream";
      const ext = getExtensionFromMime(detectedMime);
      const blob = new Blob([bytes], { type: detectedMime });
      const url = URL.createObjectURL(blob);
      setDecodedFileUrl(url);
      setDecodedFileType(detectedMime);
      setDecodedFileName(`decoded-file${ext}`);
      setDecodedFileSize(bytes.length);
      setOutputPreview(base64);
      setError("");
    } catch {
      setError("Invalid Base64 string or unsupported file type.");
      setOutput("");
      resetPreviewState();
    }
  };

  const handleEncode = async () => {
    resetPreviewState();
    if (mode === "text") {
      try {
        const fullInput = inputRef.current;
        if (!fullInput.trim()) {
          setError("Enter text to encode.");
          setOutput("");
          return;
        }
        const encoded = base64EncodeText(fullInput);
        setOutputPreview(encoded);
        setError("");
      } catch {
        setError("Failed to encode input.");
        setOutput("");
      }
      return;
    }
    await encodeFile();
  };

  const handleDecode = () => {
    resetPreviewState();
    if (mode === "text") {
      try {
        const fullInput = inputRef.current;
        if (!fullInput.trim()) {
          setError("Paste a Base64 string to decode.");
          setOutput("");
          return;
        }
        const decoded = base64DecodeText(fullInput);
        setOutputPreview(decoded);
        setError("");
      } catch {
        setError("Invalid Base64 string.");
        setOutput("");
      }
      return;
    }
    decodeFile();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-950/80">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Base64 Encoder / Decoder</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Encode text or files to Base64, or decode Base64 back into text or a downloadable file.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("text");
              setError("");
              setSelectedFile(null);
              inputRef.current = "";
              outputRef.current = "";
              setInput("");
              setOutput("");
              resetPreviewState();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === "text"
                ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-950"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("file");
              setError("");
              inputRef.current = "";
              outputRef.current = "";
              setInput("");
              setOutput("");
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === "file"
                ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-950"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            File
          </button>
        </div>

        {mode === "file" && (
          <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-900 dark:text-white">Choose file action</p>
            <div className="mt-3 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => {
                  setFileAction("encode");
                  setError("");
                  inputRef.current = "";
                  outputRef.current = "";
                  setInput("");
                  setOutput("");
                  resetPreviewState();
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  fileAction === "encode"
                    ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-950"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                Encode
              </button>
              <button
                type="button"
                onClick={() => {
                  setFileAction("decode");
                  setError("");
                  inputRef.current = "";
                  outputRef.current = "";
                  setSelectedFile(null);
                  setPreviewUrl("");
                  setInput("");
                  setOutput("");
                  resetPreviewState();
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  fileAction === "decode"
                    ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-950"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                Decode
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {mode === "file" && fileAction === "encode" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Upload file to encode
              </label>
              <div className="rounded-3xl border-2 border-slate-300 bg-white px-4 py-8 text-center transition dark:border-slate-700 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose an image, PDF, DOCX, or XLSX file to encode.</p>
                <input
                  type="file"
                  accept={ACCEPTED_FILE_TYPES.join(",")}
                  onChange={handleFileChange}
                  className="mx-auto mt-4 hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="mt-3 inline-flex cursor-pointer rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  Choose file
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Selected file</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{selectedFile.name} • {formatBytes(selectedFile.size)} • {selectedFile.type || "Unknown type"}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {selectedFile.type.startsWith("image/") ? "Image" : "Document"}
                    </span>
                  </div>
                  {previewUrl && (
                    <img src={previewUrl} alt="Selected preview" className="mt-4 w-full rounded-3xl border border-slate-200 object-contain dark:border-slate-700" />
                  )}
                </div>
              )}

              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((current) => !current)}
                  className="inline-flex items-center justify-between w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span>Advanced options</span>
                  <span>{advancedOpen ? "Hide" : "Show"}</span>
                </button>

                {advancedOpen && (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        id="compress-enabled"
                        type="checkbox"
                        checked={compressEnabled}
                        onChange={(e) => setCompressEnabled(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800"
                      />
                      <label htmlFor="compress-enabled" className="text-sm text-slate-700 dark:text-slate-300">
                        Compress image before encoding
                      </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-1">
                      <label className="block text-sm text-slate-700 dark:text-slate-300">
                        Quality
                        <input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.05"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          disabled={!compressEnabled}
                          className="mt-4 w-full"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400">{Math.round(quality * 100)}%</span>
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Compression only applies to image files. Documents will be encoded as-is.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {(mode === "text" || fileAction === "decode") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {mode === "text"
                  ? "Input Text or Base64"
                  : "Paste Base64 to decode a file"}
              </label>
              <textarea
                className="w-full min-h-[180px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                placeholder={
                  mode === "text"
                    ? "Enter text to encode or Base64 string to decode..."
                    : "Paste Base64 string here to decode..."
                }
                value={input}
                onPaste={handleInputPaste}
                onChange={handleInputChange}
              />
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            {mode === "text" ? (
              <>
                <button
                  onClick={handleEncode}
                  className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
                >
                  Encode
                </button>
                <button
                  onClick={handleDecode}
                  className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 dark:bg-slate-300 dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Decode
                </button>
              </>
            ) : (
              <button
                onClick={fileAction === "encode" ? handleEncode : handleDecode}
                className="cursor-pointer inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
              >
                {fileAction === "encode" ? "Encode file" : "Decode file"}
              </button>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === "text"
              ? "Encode text to Base64 or decode Base64 back to readable text."
              : fileAction === "encode"
              ? "Upload a file and encode it to Base64."
              : "Paste a Base64 string to decode into a downloadable file."}
          </p>
        </div>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

        {!(mode === "file" && fileAction === "decode") && (
          <>
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
                  const textToCopy = outputRef.current || output;
                  if (!textToCopy) return;
                  await navigator.clipboard.writeText(textToCopy);
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
          </>
        )}

        {decodedFileUrl && (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Decoded file ready</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{decodedFileName}</p>
              </div>
              <a
                download={decodedFileName}
                href={decodedFileUrl}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Download file
              </a>
            </div>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-700 dark:text-slate-200">Type: <span className="font-medium">{decodedFileType}</span></p>
                <p className="text-sm text-slate-700 dark:text-slate-200">Size: <span className="font-medium">{formatBytes(decodedFileSize)}</span></p>
              </div>
              {decodedFileType.startsWith("image/") ? (
                <img src={decodedFileUrl} alt="Decoded preview" className="mt-4 w-full rounded-2xl object-contain" />
              ) : decodedFileType === "application/pdf" ? (
                <iframe src={decodedFileUrl} title="PDF preview" className="mt-4 h-96 w-full rounded-2xl border" />
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Preview not available for this file type.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
