import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Edit3, CloudUpload } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const ISSUE_TYPES = [
  { value: "", label: "Select issue category" },
  { value: "pothole", label: "Pothole / Road damage" },
  { value: "graffiti", label: "Graffiti" },
  { value: "street_light", label: "Street light outage" },
  { value: "trash", label: "Illegal dumping / Trash" },
  { value: "other", label: "Other" },
];

const DEFAULT_COORDS = { lat: 25.4358, lng: 81.8463 };
const API_BASE = "http://localhost:5001/api";

// ─── Leaflet loader (avoids SSR issues) ──────────────────────────────────────
function useLeaflet(mapRef, onMarkerMove) {
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return; // already initialised

    // Load Leaflet CSS once
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => initMap();
    document.head.appendChild(script);

    function initMap() {
      const L = window.L;
      if (!mapRef.current) return;

      const map = L.map(mapRef.current).setView([0, 0], 13);
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      function placeMarker(lat, lng) {
        map.setView([lat, lng], 15);
        if (markerRef.current) map.removeLayer(markerRef.current);
        const m = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current = m;
        onMarkerMove(lat, lng);
        m.on("moveend", (e) => {
          const pos = e.target.getLatLng();
          onMarkerMove(pos.lat, pos.lng);
        });
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => placeMarker(pos.coords.latitude, pos.coords.longitude),
          () => placeMarker(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng)
        );
      } else {
        placeMarker(DEFAULT_COORDS.lat, DEFAULT_COORDS.lng);
      }
    }

    // If Leaflet already loaded (e.g. HMR), init immediately
    if (window.L) initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── ReportIssue page ────────────────────────────────────────────────────────
export default function ReportIssue() {
  // Form state
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  // Map
  const mapRef = useRef(null);
  useLeaflet(mapRef, (lat, lng) => setCoords({ lat, lng }));

  // File handling
  function handleFiles(selected) {
    const arr = Array.from(selected).slice(0, 5);
    setFiles(arr);
    const urls = arr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  }

  function onFileChange(e) {
    handleFiles(e.target.files);
  }

  function onDrop(e) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  // Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    const token = localStorage.getItem("citizenToken");
    if (!token) {
      setErrorMsg("You must be logged in to report an issue.");
      return;
    }
    if (!issueType || !description || !location) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setStatus("loading");

    try {
      // 1. Upload images
      let imageUrls = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((f) => formData.append("files", f));
        const uploadRes = await fetch(`${API_BASE}/uploadMultiple`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "File upload failed.");
        imageUrls = uploadData.urls || [];
      }

      // 2. Submit issue
      const res = await fetch(`${API_BASE}/issues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          issueType,
          description,
          location,
          latitude: coords.lat,
          longitude: coords.lng,
          imageUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");

      setStatus("success");
      // Reset
      setIssueType("");
      setDescription("");
      setLocation("");
      setFiles([]);
      setPreviews([]);
    } catch (err) {
      setErrorMsg(err.message || "Network error. Please try again.");
      setStatus("error");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header
        className="text-white px-7 py-5 shadow-md flex justify-between items-center"
        style={{ background: "linear-gradient(135deg, #008080, #473bd0)" }}
      >
        <a
          href="/city-dashboard"
          className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to dashboard
        </a>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Edit3 className="w-6 h-6" />
          Report a city issue
        </h1>
        <div className="w-32" />
      </header>

      {/* Main */}
      <main className="flex-grow container mx-auto px-6 py-8 max-w-5xl">
        {status === "success" ? (
          <SuccessBanner onReset={() => setStatus(null)} />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Two-column layout */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left column */}
              <div className="md:w-1/2 flex flex-col gap-5">
                {/* Issue type */}
                <Field label="Issue type" htmlFor="issueType" required>
                  <select
                    id="issueType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
                  >
                    {ISSUE_TYPES.map((t) => (
                      <option key={t.value} value={t.value} disabled={!t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* Description */}
                <Field label="Description" htmlFor="description" hint="E.g., large pothole at the intersection." required>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the issue"
                    required
                    rows={4}
                    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 resize-vertical focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </Field>

                {/* Location */}
                <Field label="Location" htmlFor="location" required>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Street address or landmark"
                    required
                    className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  {coords.lat && (
                    <p className="text-xs text-gray-400 mt-1">
                      Pin: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </p>
                  )}
                </Field>
              </div>

              {/* Right column – map */}
              <div className="md:w-1/2 flex flex-col gap-3">
                <label className="block text-sm font-medium text-gray-700">
                  Approximate location on map
                </label>
                <div
                  ref={mapRef}
                  className="w-full rounded-lg shadow-inner border border-gray-200"
                  style={{ minHeight: 300, flexGrow: 1 }}
                />
                {/* Choose files (aligned bottom-right) */}
                <div className="flex justify-end pt-1">
                  <label
                    htmlFor="fileInput"
                    className="text-white px-5 py-2 rounded-full font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity select-none"
                    style={{ background: "linear-gradient(135deg, #008080, #473bd0)" }}
                  >
                    Choose files
                  </label>
                  <input
                    type="file"
                    id="fileInput"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              </div>
            </div>

            {/* Upload section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload images / videos
                <span className="text-gray-400 font-normal ml-1">(optional, max 5)</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Drop zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => document.getElementById("fileInput").click()}
                  className="shrink-0 w-full sm:w-36 h-32 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-teal-400 transition-colors text-gray-500"
                >
                  <CloudUpload className="w-6 h-6 mb-1 text-gray-400" />
                  <span className="text-xs font-medium">Drag & drop</span>
                  <span className="text-xs text-gray-400">or click to browse</span>
                </div>

                {/* Thumbnails */}
                {previews.length > 0 && (
                  <div className="flex gap-3 flex-wrap">
                    {previews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Preview ${i + 1}`}
                        className="w-28 h-28 rounded-lg object-cover border border-gray-200 shadow-sm"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {errorMsg}
              </p>
            )}

            {/* Submit */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={status === "loading"}
                className="text-white px-10 py-3 rounded-full font-semibold text-sm shadow-md hover:opacity-90 transition-opacity disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #008080, #473bd0)" }}
              >
                {status === "loading" ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Field({ label, htmlFor, hint, required, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SuccessBanner({ onReset }) {
  return (
    <div className="max-w-lg mx-auto mt-16 text-center p-8 border-2 border-teal-500 rounded-2xl bg-teal-50">
      <div className="text-4xl mb-3">✅</div>
      <h2 className="text-xl font-semibold text-teal-700 mb-2">Report submitted</h2>
      <p className="text-sm text-teal-600 mb-6">
        Thanks for helping improve the city. We'll review your report soon.
      </p>
      <button
        onClick={onReset}
        className="text-white px-8 py-2.5 rounded-full font-semibold text-sm hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #008080, #473bd0)" }}
      >
        Report another issue
      </button>
    </div>
  );
}