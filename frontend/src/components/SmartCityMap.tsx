"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, Shield, HeartPulse, Train, Eye, Maximize2, Compass as CompassIcon, SlidersHorizontal, Navigation, ExternalLink, MapPin } from "lucide-react";

interface MapItem {
  id: number;
  name: string;
  category: "hospital" | "police" | "tourist" | "transit" | "all";
  latitude: number;
  longitude: number;
  address: string;
  detail?: string;
  phone?: string;
}

interface SmartCityMapProps {
  items: MapItem[];
  selectedLocation?: { lat: number; lng: number; title?: string } | null;
  onMarkerClick?: (item: MapItem) => void;
  activeFilter?: string;
  center?: [number, number];
  zoom?: number;
  cityName?: string;
}

export default function SmartCityMap({
  items,
  selectedLocation,
  onMarkerClick,
  activeFilter = "all",
  center = [18.5204, 73.8567],
  zoom = 13,
  cityName = "Pune",
}: SmartCityMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeLayerStyle, setActiveLayerStyle] = useState<"voyager" | "dark" | "satellite" | "google">("google");
  const [showKeyDetails, setShowKeyDetails] = useState(true);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);

  // Tile layer URLs - using official Google Maps, OpenStreetMap and Esri Satellite
  const getTileUrl = (style: "voyager" | "dark" | "satellite" | "google") => {
    switch (style) {
      case "dark":
        // Dark high-contrast OpenStreetMap
        return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      case "satellite":
        // Ultra-clear Esri World Imagery Satellite
        return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      case "voyager":
        // Free, official OpenStreetMap (Never watermarked, fast and reliable)
        return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      case "google":
      default:
        // Official Google Maps Standard Roadmap Tiles
        return "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
    });

    const initialTiles = L.tileLayer(getTileUrl("google"), {
      attribution: '&copy; Google Maps',
      maxZoom: 20,
    }).addTo(map);

    currentTileLayerRef.current = initialTiles;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer Style Changes
  const switchMapLayer = (style: "voyager" | "dark" | "satellite" | "google") => {
    if (!mapInstanceRef.current) return;
    setActiveLayerStyle(style);

    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }

    const newTiles = L.tileLayer(getTileUrl(style), {
      attribution: style === "google" ? '&copy; Google Maps' : '&copy; CartoDB & Esri GIS',
      maxZoom: 20,
    }).addTo(mapInstanceRef.current);

    currentTileLayerRef.current = newTiles;
  };

  // Update center when city selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom]);

  // Update Markers when items or filter change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    const getIconColor = (cat: string) => {
      switch (cat) {
        case "hospital":
          return { bg: "#ef4444", icon: "🏥", glow: "rgba(239,68,68,0.5)" };
        case "police":
          return { bg: "#3b82f6", icon: "👮", glow: "rgba(59,130,246,0.5)" };
        case "tourist":
          return { bg: "#10b981", icon: "🏛️", glow: "rgba(16,185,129,0.5)" };
        case "transit":
          return { bg: "#8b5cf6", icon: "🚆", glow: "rgba(139,92,246,0.5)" };
        default:
          return { bg: "#06b6d4", icon: "📍", glow: "rgba(6,182,212,0.5)" };
      }
    };

    items
      .filter((item) => activeFilter === "all" || item.category === activeFilter)
      .forEach((item) => {
        const { bg, icon, glow } = getIconColor(item.category);

        const customIcon = L.divIcon({
          className: "custom-smart-marker",
          html: `
            <div style="
              background: ${bg};
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 16px ${glow}, 0 6px 12px rgba(0,0,0,0.4);
              border: 2.5px solid white;
              cursor: pointer;
              font-size: 19px;
              transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            " onmouseover="this.style.transform='scale(1.22) translateY(-4px)'" onmouseout="this.style.transform='scale(1)'">
              <span>${icon}</span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          popupAnchor: [0, -22],
        });

        const marker = L.marker([item.latitude, item.longitude], {
          icon: customIcon,
        });

        const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}&destination_place_id=${encodeURIComponent(item.name)}`;

        const popupContent = `
          <div style="font-family: inherit; padding: 6px; min-width: 220px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
              <span style="font-size: 18px;">${icon}</span>
              <strong style="color: #0f172a; font-size: 14px; font-weight: 800;">${item.name}</strong>
            </div>
            <p style="margin: 0; color: #475569; font-size: 12px; line-height: 1.4;">${item.address}</p>
            ${item.detail ? `<div style="margin-top: 8px; padding: 5px 8px; background: #f1f5f9; border-radius: 8px; font-size: 11px; color: #334155; font-weight: 600;">${item.detail}</div>` : ""}
            ${item.phone ? `<div style="margin-top: 6px; font-size: 12px; color: #2563eb; font-weight: 700;">📞 ${item.phone}</div>` : ""}
            <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: flex; gap: 6px;">
              <a
                href="${googleMapsDirUrl}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                  flex: 1;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  gap: 5px;
                  background: #0284c7;
                  color: white;
                  padding: 7px 10px;
                  border-radius: 8px;
                  font-size: 11px;
                  font-weight: 700;
                  text-decoration: none;
                  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.3);
                "
              >
                <span>🧭 Directions in Google Maps</span>
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          if (onMarkerClick) onMarkerClick(item);
        });

        layer.addLayer(marker);
      });
  }, [items, activeFilter, onMarkerClick, mapReady]);

  // Pan to selectedLocation if triggered
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation || typeof selectedLocation.lat !== "number" || typeof selectedLocation.lng !== "number") return;

    mapInstanceRef.current.flyTo(
      [selectedLocation.lat, selectedLocation.lng],
      15,
      { duration: 1.5 }
    );

    markersLayerRef.current?.eachLayer((layer: any) => {
      if (layer.getLatLng) {
        const pos = layer.getLatLng();
        if (
          Math.abs(pos.lat - selectedLocation.lat) < 0.001 &&
          Math.abs(pos.lng - selectedLocation.lng) < 0.001
        ) {
          layer.openPopup();
        }
      }
    });
  }, [selectedLocation]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, zoom, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-cyan-500/25 shadow-2xl bg-slate-950">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Live GIS Status Node */}
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2.5 bg-slate-950/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-xl border border-cyan-500/30 text-xs font-semibold text-slate-100">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
        <span className="text-cyan-300 font-bold uppercase tracking-wider">{cityName}</span>
        <span className="text-slate-400 text-[11px]">&bull; Smart GIS Grid Active</span>
      </div>

      {/* Top Right: Layer Styler Controls */}
      <div className="absolute top-4 right-4 z-[400] flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-xl border border-slate-700/80 text-xs">
        <button
          onClick={() => switchMapLayer("google")}
          className={`px-2.5 py-1.5 rounded-xl font-bold transition text-[11px] ${
            activeLayerStyle === "google" ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25" : "text-slate-400 hover:text-white"
          }`}
        >
          Google
        </button>
        <button
          onClick={() => switchMapLayer("voyager")}
          className={`px-2.5 py-1.5 rounded-xl font-bold transition text-[11px] ${
            activeLayerStyle === "voyager" ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25" : "text-slate-400 hover:text-white"
          }`}
        >
          Street
        </button>
        <button
          onClick={() => switchMapLayer("dark")}
          className={`px-2.5 py-1.5 rounded-xl font-bold transition text-[11px] ${
            activeLayerStyle === "dark" ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25" : "text-slate-400 hover:text-white"
          }`}
        >
          Night
        </button>
        <button
          onClick={() => switchMapLayer("satellite")}
          className={`px-2.5 py-1.5 rounded-xl font-bold transition text-[11px] ${
            activeLayerStyle === "satellite" ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25" : "text-slate-400 hover:text-white"
          }`}
        >
          Satellite
        </button>
        <button
          onClick={resetView}
          title="Recenter Map"
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition"
        >
          <CompassIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Floating Map Legend */}
      <div className="absolute bottom-4 left-4 z-[400] max-w-sm">
        <div className="bg-slate-950/92 backdrop-blur-2xl rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden text-xs">
          {/* Header of Map Legend */}
          <div
            className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-slate-900 to-slate-850 cursor-pointer border-b border-slate-800/80"
            onClick={() => setShowKeyDetails(!showKeyDetails)}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-extrabold text-white uppercase tracking-wider text-[11px]">Map Legend</span>
            </div>
            <button className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold px-1.5 py-0.5 rounded bg-cyan-500/10">
              {showKeyDetails ? "Minimize" : "Expand"}
            </button>
          </div>

          {/* Legend items */}
          {showKeyDetails && (
            <div className="p-3 space-y-2 text-slate-300">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-red-500/20">
                  <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white shadow-sm shadow-red-500/50">
                    🏥
                  </span>
                  <div>
                    <div className="font-bold text-white leading-none">Hospital</div>
                    <div className="text-[9px] text-slate-400">ICU & 24/7 Trauma</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-blue-500/20">
                  <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white shadow-sm shadow-blue-500/50">
                    👮
                  </span>
                  <div>
                    <div className="font-bold text-white leading-none">Police Beat</div>
                    <div className="text-[9px] text-slate-400">112 Dispatch Post</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-emerald-500/20">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white shadow-sm shadow-emerald-500/50">
                    🏛️
                  </span>
                  <div>
                    <div className="font-bold text-white leading-none">Heritage</div>
                    <div className="text-[9px] text-slate-400">Cultural & Tourism</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900/60 border border-purple-500/20">
                  <span className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white shadow-sm shadow-purple-500/50">
                    🚆
                  </span>
                  <div>
                    <div className="font-bold text-white leading-none">Transit Hub</div>
                    <div className="text-[9px] text-slate-400">Metro & E-Shuttle</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Total POIs: <b>{items.length}</b></span>
                <span className="text-cyan-400 font-semibold">&bull; Click pins for Google directions</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
