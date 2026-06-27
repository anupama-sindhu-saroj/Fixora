import { useEffect, useRef } from "react";

export default function IssueMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const initMap = async () => {
      const L = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      // Fix default marker icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      mapInstanceRef.current = L.map(mapRef.current).setView([25.4358, 81.8463], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      }).addTo(mapInstanceRef.current);

      try {
        const res = await fetch("http://localhost:5001/api/issues/pending");
        const issues = await res.json();
        issues.forEach((issue) => {
          if (issue.location?.lat && issue.location?.lng) {
            L.marker([issue.location.lat, issue.location.lng])
              .addTo(mapInstanceRef.current)
              .bindPopup(`<b>${issue.title || issue.issueType}</b><br>Status: ${issue.status}<br>${issue.description || ""}`);
          }
        });
      } catch (err) {
        console.error("Map fetch error:", err);
      }
    };

    initMap();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col" style={{ height: "420px" }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <h3 className="text-base font-semibold text-slate-800">Live Issue Map</h3>
      </div>
      <div ref={mapRef} className="flex-1 w-full rounded-xl overflow-hidden" />
    </div>
  );
}
