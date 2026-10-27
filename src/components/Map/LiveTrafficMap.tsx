import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPointType, MapReport, VehicleProfile } from '../../types';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import { leafletLoader } from '../../services/leafletLoader';
import AddReportModal from './AddReportModal';
import {
  Navigation,
  Compass,
  Plus,
  Shield,
  Camera,
  AlertTriangle,
  Fuel,
  Building2,
  RefreshCw,
  Search,
  ExternalLink,
  ThumbsUp,
  XCircle,
  Phone,
  Layers,
  MapPin,
  Car,
  ParkingSquare,
  RotateCcw
} from 'lucide-react';
import { DELINEATED_PARKING_ZONES } from '../../constants/parkingZones';

interface Props {
  vehicle?: VehicleProfile;
}

export const LiveTrafficMap: React.FC<Props> = ({ vehicle }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const osmLayerRef = useRef<any>(null);
  const satLayerRef = useRef<any>(null);

  const [mapTheme, setMapTheme] = useState<'dark' | 'street' | 'satellite'>('dark');
  const [reports, setReports] = useState<MapReport[]>([]);
  const [filterType, setFilterType] = useState<MapPointType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [activeReportCount, setActiveReportCount] = useState(0);
  const [showParking, setShowParking] = useState(false);
  const [activeMapView, setActiveMapView] = useState<'autohub_map' | 'waze_live'>('autohub_map');
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  // 1. Ensure Leaflet is loaded independently and reliably
  useEffect(() => {
    let isMounted = true;
    leafletLoader.load()
      .then(() => {
        if (isMounted) setIsLeafletReady(true);
      })
      .catch((err) => {
        if (isMounted) setMapLoadError(err?.message || 'რუკის ჩატვირთვა ვერ მოხერხდა.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch Reports on Mount
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsRefreshing(true);
    try {
      const data = await n8nService.getReports();
      setReports(data);
      setActiveReportCount(data.length);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 3. Initialize Map once Leaflet is ready
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Default center: Tbilisi Freedom Square / Rustaveli
    const tbilisiLat = 41.7151;
    const tbilisiLng = 44.8271;

    const map = L.map(mapContainerRef.current, {
      center: [tbilisiLat, tbilisiLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Pre-create and cache both tile layers for instant, lag-free switching
    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    });
    osmLayerRef.current = osmLayer;

    const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    });
    satLayerRef.current = satLayer;

    // Attach initial layer
    if (mapTheme === 'satellite') {
      satLayer.addTo(map);
      satLayer.bringToBack();
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.remove('dark-map-tiles');
        mapContainerRef.current.style.backgroundColor = '#000000';
      }
    } else {
      osmLayer.addTo(map);
      osmLayer.bringToBack();
      if (mapContainerRef.current) {
        if (mapTheme === 'dark') {
          mapContainerRef.current.classList.add('dark-map-tiles');
          mapContainerRef.current.style.backgroundColor = '#1a2232';
        } else {
          mapContainerRef.current.classList.remove('dark-map-tiles');
          mapContainerRef.current.style.backgroundColor = '#f8fafc';
        }
      }
    }

    // Zoom control on top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Group layer for all reports
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Map Click handler - allows placing a point directly by clicking
    map.on('click', (e: any) => {
      setClickedCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // Invalidate size after render to prevent grey/empty tile glitch
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 350);
    const t3 = setTimeout(() => map.invalidateSize(), 700);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isLeafletReady]);

  // Instant, lag-free theme switching (toggles cached layer & CSS filter without re-downloading)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const osm = osmLayerRef.current;
    const sat = satLayerRef.current;
    if (!osm || !sat) return;

    if (mapTheme === 'satellite') {
      if (map.hasLayer(osm)) map.removeLayer(osm);
      if (!map.hasLayer(sat)) sat.addTo(map);
      sat.bringToBack();
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.remove('dark-map-tiles');
        mapContainerRef.current.style.backgroundColor = '#000000';
      }
    } else {
      // Both 'dark' and 'street' use cached OpenStreetMap
      if (map.hasLayer(sat)) map.removeLayer(sat);
      if (!map.hasLayer(osm)) osm.addTo(map);
      osm.bringToBack();

      // Instant CSS filter toggle — zero network request, zero lag!
      if (mapContainerRef.current) {
        if (mapTheme === 'dark') {
          mapContainerRef.current.classList.add('dark-map-tiles');
          mapContainerRef.current.style.backgroundColor = '#1a2232';
        } else {
          mapContainerRef.current.classList.remove('dark-map-tiles');
          mapContainerRef.current.style.backgroundColor = '#f8fafc';
        }
      }
    }
  }, [mapTheme]);

  // Helper: Format relative time in Georgian
  const formatTimeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 60000);
    if (diff < 1) return 'ახლახანს';
    if (diff < 60) return `${diff} წუთის წინ`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} საათის წინ`;
    return `${Math.floor(hours / 24)} დღის წინ`;
  };

  // 4. Update Markers on reports or filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    // Filter reports
    const filtered = reports.filter(r => {
      const matchesFilter = filterType === 'all' || r.type === filterType;
      const matchesSearch = !searchQuery.trim() ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.brand && r.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });

    filtered.forEach(item => {
      // Create custom HTML icon with glowing neon pulse
      let iconHtml = '';
      let markerClass = '';

      switch (item.type) {
        case 'patrol':
          markerClass = 'patrol-marker';
          iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <span class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></span>
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-900 border-2 border-cyan-400 text-white flex items-center justify-center shadow-[0_0_15px_rgba(0,180,255,0.7)] group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
            </div>
          `;
          break;

        case 'radar':
          markerClass = 'radar-marker';
          iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <span class="absolute w-8 h-8 rounded-full bg-amber-500/30 animate-pulse"></span>
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 border-2 border-amber-300 text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,160,0,0.8)] group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
            </div>
          `;
          break;

        case 'hazard':
          markerClass = 'hazard-marker';
          iconHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <span class="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping"></span>
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 border-2 border-rose-300 text-white flex items-center justify-center shadow-[0_0_15px_rgba(255,50,80,0.8)] group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
            </div>
          `;
          break;

        case 'fuel':
          markerClass = 'fuel-marker';
          const lowestPrice = item.fuel_prices ? (item.fuel_prices.regular_92 || item.fuel_prices.premium_95) : null;
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-emerald-500 text-navy font-black text-[10px] font-mono shadow-md border border-emerald-300 -mb-2 z-10 whitespace-nowrap">
                ${lowestPrice ? `${lowestPrice.toFixed(2)}₾` : item.brand || 'საწვავი'}
              </div>
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-900 border-2 border-emerald-300 text-white flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.7)] group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9h2a2 2 0 012 2v7a2 2 0 01-2 2h-2"></path></svg>
              </div>
            </div>
          `;
          break;

        case 'showroom':
          markerClass = 'showroom-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-gold text-navy font-black text-[10px] shadow-md border border-amber-300 -mb-2 z-10 whitespace-nowrap">
                ${item.rating ? `${item.rating} ★` : 'ავტო'}
              </div>
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-navy border-2 border-gold text-gold flex items-center justify-center shadow-[0_0_15px_rgba(252,163,17,0.6)] group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              </div>
            </div>
          `;
          break;
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [42, 42],
        iconAnchor: [21, 21],
        popupAnchor: [0, -22]
      });

      // Construct Popup HTML with Dark Neon Glassmorphism
      let popupBodyHtml = '';
      if (item.type === 'fuel' && item.fuel_prices) {
        popupBodyHtml = `
          <div class="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
            <div class="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5 flex justify-between">
              <span>საწვავის ტიპი</span>
              <span>ფასი / 1 ლიტრი</span>
            </div>
            <div class="space-y-1 text-xs font-mono">
              ${item.fuel_prices.super_98 ? `<div class="flex justify-between text-slate-200"><span>Super 98:</span><span class="font-bold text-emerald-400">${item.fuel_prices.super_98.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.premium_95 ? `<div class="flex justify-between text-slate-200"><span>Premium 95:</span><span class="font-bold text-emerald-400">${item.fuel_prices.premium_95.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.regular_92 ? `<div class="flex justify-between text-slate-200"><span>Euro Regular 92:</span><span class="font-bold text-emerald-400">${item.fuel_prices.regular_92.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.diesel ? `<div class="flex justify-between text-slate-200"><span>Euro Diesel:</span><span class="font-bold text-emerald-400">${item.fuel_prices.diesel.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.lpg ? `<div class="flex justify-between text-slate-200"><span>LPG / გაზი:</span><span class="font-bold text-cyan-400">${item.fuel_prices.lpg.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.ev_kwh ? `<div class="flex justify-between text-slate-200"><span>EV Fast Charger:</span><span class="font-bold text-gold">${item.fuel_prices.ev_kwh.toFixed(2)} ₾/კვტ</span></div>` : ''}
            </div>
          </div>
        `;
      } else if (item.type === 'showroom') {
        popupBodyHtml = `
          <div class="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-1.5 text-xs">
            ${item.rating ? `<div class="flex items-center gap-1.5 text-gold font-bold"><span>შეფასება:</span><span>${item.rating} / 5.0 ★</span></div>` : ''}
            ${item.phone ? `<div class="flex items-center gap-1.5 text-slate-300"><span>ტელეფონი:</span><a href="tel:${item.phone}" class="text-cyan-400 font-mono font-bold hover:underline">${item.phone}</a></div>` : ''}
            ${item.address ? `<div class="text-[11px] text-slate-400">მისამართი: ${item.address}</div>` : ''}
          </div>
        `;
      }

      const popupContent = `
        <div class="w-64 font-sans text-slate-100 p-1">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              item.type === 'patrol' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              item.type === 'radar' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              item.type === 'hazard' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              item.type === 'fuel' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              'bg-gold/20 text-gold border border-gold/30'
            }">
              ${item.type === 'patrol' ? '🚓 საპატრულო ეკიპაჟი' :
                item.type === 'radar' ? '📷 სიჩქარის რადარი' :
                item.type === 'hazard' ? '⚠️ საგზაო საფრთხე' :
                item.type === 'fuel' ? '⛽ ავტოგასამართი' : '🏢 ავტო სალონი'}
            </span>
            <span class="text-[10px] text-slate-400 font-mono">${formatTimeAgo(item.timestamp)}</span>
          </div>

          <h4 class="font-extrabold text-sm text-white mt-2 leading-tight">${item.title}</h4>
          ${item.description ? `<p class="text-xs text-slate-300 mt-1 leading-snug">${item.description}</p>` : ''}
          ${popupBodyHtml}

          <div class="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between gap-1 text-[11px]">
            <span class="text-slate-400 flex items-center gap-1">
              👍 <strong class="text-emerald-400 font-mono">${item.confirmations}</strong> დასტური
            </span>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}" target="_blank" rel="noreferrer" class="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-bold flex items-center gap-1 transition-colors">
              მარშრუტი ↗
            </a>
          </div>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });
      marker.bindPopup(popupContent, {
        className: 'dark-neon-popup',
        maxWidth: 280
      });

      marker.on('click', () => {
        sounds.playClick();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([item.lat, item.lng], 16, { duration: 0.8 });
        }
      });

      marker.addTo(layer);
    });

    // Render Delineated & Numbered Parking Zones (independent toggle + filter)
    if (showParking && (filterType === 'all' || filterType === 'parking')) {
      DELINEATED_PARKING_ZONES.forEach(zone => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().replace('#', '');
          const matches = zone.lotCode.includes(q) ||
            zone.zoneNumber.includes(q) ||
            zone.street_ge.toLowerCase().includes(q) ||
            zone.bounds_description_ge.toLowerCase().includes(q);
          if (!matches) return;
        }

        // Draw delineated street polygon on map if present
        if (zone.geometry?.polygon && zone.geometry.polygon.length >= 3) {
          const polygon = L.polygon(zone.geometry.polygon, {
            color: zone.color,
            fillColor: zone.fillColor,
            fillOpacity: 0.35,
            weight: 2.5,
            dashArray: '4 3'
          });

          const wazeUrl = `https://waze.com/ul?ll=${zone.geometry.center[0]},${zone.geometry.center[1]}&navigate=yes`;
          const popupContent = `
            <div class="w-64 font-sans text-slate-100 p-1">
              <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-cyan-300 border border-blue-500/30 font-mono">
                  🅿️ ლოტი #${zone.lotCode}
                </span>
                <span class="text-xs font-mono font-black text-amber-400">
                  ${zone.hourlyRateGel !== null ? `${zone.hourlyRateGel.toFixed(2)} ₾/სთ` : 'სტანდარტული'}
                </span>
              </div>
              <h4 class="font-extrabold text-sm text-white mt-2 leading-tight">${zone.street_ge}</h4>
              <p class="text-xs text-slate-300 mt-1 leading-snug font-mono">${zone.bounds_description_ge}</p>
              <div class="mt-2 text-[11px] font-mono text-emerald-400">
                ✔ 15 წთ უფასოა (დღეში 1-ხელ)
              </div>
              <div class="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] gap-2">
                <a href="${wazeUrl}" target="_blank" rel="noreferrer" class="px-2.5 py-1 rounded-lg bg-cyan-600 text-white font-bold flex items-center gap-1 transition-all hover:bg-cyan-500 shadow-sm">
                  Waze მისვლა ➔
                </a>
                <a href="#parking" class="px-2.5 py-1 rounded-lg bg-gold text-navy font-black flex items-center gap-1 transition-all hover:bg-amber-400 shadow-sm">
                  პარკინგი
                </a>
              </div>
            </div>
          `;

          polygon.bindPopup(popupContent, {
            className: 'dark-neon-popup',
            maxWidth: 280
          });

          polygon.on('click', () => {
            sounds.playClick();
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo(zone.geometry.center, 16, { duration: 0.8 });
            }
          });

          polygon.addTo(layer);
        }

        // Circular Zone Number Marker Badge
        const zoneBadgeHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-8 h-8 rounded-xl bg-navy/95 border-2 border-gold text-gold font-mono font-black text-xs flex items-center justify-center shadow-[0_0_12px_rgba(255,200,0,0.6)] group-hover:scale-115 transition-transform">
              #${zone.lotCode}
            </div>
          </div>
        `;

        const zoneIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: zoneBadgeHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const zoneMarker = L.marker(zone.geometry.center, { icon: zoneIcon });
        const wazeDeepLink = `https://waze.com/ul?ll=${zone.geometry.center[0]},${zone.geometry.center[1]}&navigate=yes`;
        zoneMarker.bindPopup(`
          <div class="p-2 text-xs text-white font-mono space-y-1">
            <div class="font-black text-gold">საპარკინგე ლოტი #${zone.lotCode}</div>
            <div class="text-slate-300">${zone.street_ge}</div>
            <div class="text-amber-300 font-bold">${zone.hourlyRateGel !== null ? `${zone.hourlyRateGel.toFixed(2)} ₾/სთ` : ''} • 15 წთ უფასო</div>
            <div class="pt-1.5 flex gap-2">
              <a href="${wazeDeepLink}" target="_blank" rel="noreferrer" class="text-cyan-400 underline font-bold">Waze მისვლა</a>
            </div>
          </div>
        `, { className: 'dark-neon-popup' });

        zoneMarker.addTo(layer);
      });
    }
  }, [reports, filterType, searchQuery, showParking]);

  // 5. User Geolocation Handler
  const handleLocateMe = () => {
    sounds.playClick();
    setIsLocating(true);

    if (!navigator.geolocation) {
      alert('თქვენს ბრაუზერში GPS გეოლოკაცია არ არის მხარდაჭერილი.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);
        sounds.playSuccess();

        const L = (window as any).L;
        if (!L || !mapInstanceRef.current) return;

        // Fly to location
        mapInstanceRef.current.flyTo([coords.lat, coords.lng], 15, {
          duration: 1.5
        });

        // Add or update User Vehicle Marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([coords.lat, coords.lng]);
        } else {
          const userIcon = L.divIcon({
            className: 'user-car-marker',
            html: `
              <div class="relative flex items-center justify-center">
                <span class="absolute w-12 h-12 rounded-full bg-cyan-400/25 animate-ping"></span>
                <span class="absolute w-8 h-8 rounded-full bg-cyan-400/50"></span>
                <div class="w-9 h-9 rounded-full bg-navy border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-[0_0_20px_#00f0ff] z-10">
                  <svg class="w-5 h-5 text-cyan-300" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/><circle cx="7.5" cy="14.5" r="1.5"/><circle cx="16.5" cy="14.5" r="1.5"/></svg>
                </div>
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          userMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: userIcon })
            .bindPopup(`<div class="p-2 text-xs font-bold text-white">ჩემი მანქანა: ${vehicle ? `${vehicle.brand} ${vehicle.model}` : 'GPS ლოკაცია'}</div>`, { className: 'dark-neon-popup' })
            .addTo(mapInstanceRef.current);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
        // Fallback to Tbilisi center
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([41.7151, 44.8271], 13);
        }
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  };

  // 6. Handle New Report Add
  const handleAddNewReport = async (newReportPayload: Omit<MapReport, 'id' | 'confirmations' | 'active'>) => {
    try {
      const res = await n8nService.addReport(newReportPayload);
      if (res && res.report) {
        setReports(prev => [res.report, ...prev]);
        setActiveReportCount(prev => prev + 1);

        // Center map to new point
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([res.report.lat, res.report.lng], 14, { duration: 1 });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filters definition
  const filterOptions = [
    { key: 'all' as const, label: 'ყველა', icon: Layers },
    { key: 'parking' as const, label: '🅿️ პარკინგი (#ზონები)', icon: ParkingSquare, color: 'text-cyan-400' },
    { key: 'patrol' as const, label: 'პატრული', icon: Shield, color: 'text-blue-500' },
    { key: 'radar' as const, label: 'რადარები', icon: Camera, color: 'text-amber-500' },
    { key: 'hazard' as const, label: 'საფრთხე', icon: AlertTriangle, color: 'text-rose-500' },
    { key: 'fuel' as const, label: 'ბენზინის ფასები', icon: Fuel, color: 'text-emerald-500' },
    { key: 'showroom' as const, label: 'ავტო სალონები', icon: Building2, color: 'text-gold' }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Map Top Control Bar (Search, Filters, Geo) — რუკის ცნობის ბანერი */}
      <div className="p-4 sm:p-5 lg:p-6 rounded-3xl border bg-gradient-to-br from-slate-900 via-navy to-slate-950 text-white border-gold/40 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Title & Live indicator */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gold/15 text-gold border border-gold/30 flex items-center justify-center shrink-0">
              <Navigation className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  AutoHub ცოცხალი რუკა & პარკინგი
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live {reports.length}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                რადარები, პატრულის ჩასაფრებები, საწვავის ფასები და საპარკინგე ლოტები
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher: AutoHub Map vs Waze Live Map */}
            <div className="flex items-center gap-1 p-1 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveMapView('autohub_map'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMapView === 'autohub_map'
                    ? 'bg-gold text-slate-950 shadow-sm font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🗺️ AutoHub რუკა</span>
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveMapView('waze_live'); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMapView === 'waze_live'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🚗 Waze Live Map</span>
              </button>
            </div>

            {/* Map Theme Toggle (Dark, Street, Satellite) */}
            <div className="flex items-center gap-1 p-1 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMapTheme('dark');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  mapTheme === 'dark' ? 'bg-gold text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="მუქი რუკის რეჟიმი"
              >
                <span>🌙 მუქი</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMapTheme('street');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  mapTheme === 'street' ? 'bg-gold text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="სტანდარტული ქუჩების რუკა"
              >
                <span>🗺️ ქუჩები</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMapTheme('satellite');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  mapTheme === 'satellite' ? 'bg-gold text-slate-950 shadow-sm font-black' : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Esri სატელიტური აეროფოტო"
              >
                <span>🛰️ სატელიტი</span>
              </button>
            </div>

            {/* Parking Layer Toggle (show/hide delineated parking zones) */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowParking(v => !v);
              }}
              title={showParking ? 'პარკინგის ზონების დამალვა' : 'პარკინგის ზონების ჩვენება და დაწყება'}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all active:scale-95 border ${
                showParking
                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/50 shadow-sm ring-2 ring-cyan-400/40'
                  : 'bg-white/10 text-slate-300 border-white/15 hover:text-white hover:bg-white/15'
              }`}
            >
              <ParkingSquare size={16} className={showParking ? 'text-cyan-300' : 'text-slate-400'} />
              <span>{showParking ? '🅿️ პარკინგი: ჩართულია' : '🅿️ პარკინგი: გამორთულია'}</span>
            </button>

            {/* Refresh */}
            <button
              onClick={() => {
                sounds.playClick();
                loadReports();
              }}
              disabled={isRefreshing}
              title="მონაცემების განახლება"
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/15 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-gold' : ''} />
            </button>

            {/* Locate Me (GPS) */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Compass size={16} className={isLocating ? 'animate-spin text-gold' : 'text-gold'} />
              <span>{isLocating ? 'GPS...' : 'ჩემი ლოკაცია'}</span>
            </button>

            {/* Add Report Button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-gold hover:bg-gold/90 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <Plus size={16} />
              <span>+ შეტყობინება</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar & Quick Search */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-white/10">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {filterOptions.map(opt => {
              const isActive = filterType === opt.key;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    sounds.playClick();
                    setFilterType(opt.key);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gold text-slate-950 shadow-md border border-gold font-black scale-105'
                      : 'bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-slate-950' : opt.color || 'text-slate-400'} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ძიება: Wissol, ვაკე, Porsche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-2 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-slate-950/80 border border-white/15 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Map Canvas OR Official Waze Live Map View */}
      {activeMapView === 'waze_live' ? (
        <div className="space-y-3 animate-fade-in">
          {/* Waze Info & Deeplink Banner */}
          <div className="p-4 rounded-3xl bg-cyan-950/90 text-white border border-cyan-500/40 shadow-lg flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Navigation size={22} />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>Waze Live Map — ოფიციალური საგზაო მოძრაობა</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    Live Traffic
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  ცოცხალი საცობები, შეფერხებები და მოძრაობის სიჩქარეები თბილისში (Waze Iframe Embed).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://www.waze.com/live-map/directions?to=ll.41.7151%2C44.8271"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <span>Waze-ში გახსნა</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Official Waze Iframe Embed */}
          <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-950">
            <iframe
              src="https://embed.waze.com/iframe?zoom=13&lat=41.7151&lon=44.7850&ct=livemap"
              width="100%"
              height="100%"
              allowFullScreen
              title="Waze Live Map თბილისი"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      ) : (
      <div className="relative w-full h-[540px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-950">
        
        {/* Leaflet DOM Node */}
        <div
          ref={mapContainerRef}
          className={`w-full h-full z-0 transition-colors duration-300 ${
            mapTheme === 'dark'
              ? 'bg-[#1a2232] dark-map-tiles'
              : mapTheme === 'satellite'
              ? 'bg-black'
              : 'bg-[#f8fafc]'
          }`}
        />

        {/* Loading overlay if Leaflet is still preparing */}
        {!isLeafletReady && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy/80 backdrop-blur-sm text-white">
            <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin mb-3"></div>
            <p className="text-xs font-mono font-bold text-gold">რუკის ინიციალიზაცია...</p>
          </div>
        )}

        {/* Floating Layer Theme Switcher on Map (Dark, Street, Satellite) */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute top-4 right-14 z-20 flex items-center gap-1 p-1 rounded-2xl bg-navy/95 backdrop-blur-md border border-slate-700/80 shadow-lg text-xs"
        >
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              setMapTheme('dark');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mapTheme === 'dark' ? 'bg-gold text-navy shadow-xs font-black' : 'text-slate-300 hover:text-white'
            }`}
            title="მუქი Waze რეჟიმი"
          >
            <span>🌙 მუქი</span>
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              setMapTheme('street');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mapTheme === 'street' ? 'bg-gold text-navy shadow-xs font-black' : 'text-slate-300 hover:text-white'
            }`}
            title="სტანდარტული ქუჩების რუკა"
          >
            <span>🗺️ ქუჩები</span>
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              sounds.playClick();
              setMapTheme('satellite');
            }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              mapTheme === 'satellite' ? 'bg-gold text-navy shadow-xs font-black' : 'text-slate-300 hover:text-white'
            }`}
            title="Esri სატელიტური აეროფოტო"
          >
            <span>🛰️ სატელიტი</span>
          </button>
        </div>

        {/* Floating Quick Stats Badge on Map */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-navy/85 backdrop-blur-md text-white border border-slate-700/80 shadow-lg text-xs">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono text-slate-300">
            თბილისის სექტორი • <strong className="text-gold font-bold">{reports.length}</strong> აქტიური წერტილი
          </span>
        </div>

        {/* Click-to-Pin hint banner if clicked on map */}
        {clickedCoords && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 px-4 py-2.5 rounded-2xl bg-navy/90 backdrop-blur-md text-white border border-gold/50 shadow-xl flex items-center gap-3 animate-fade-in text-xs">
            <MapPin size={16} className="text-gold animate-bounce" />
            <span>
              მონიშნულია წერტილი: <strong className="font-mono text-gold">{clickedCoords.lat.toFixed(4)}, {clickedCoords.lng.toFixed(4)}</strong>
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                setIsAddModalOpen(true);
              }}
              className="px-3 py-1 rounded-xl bg-gold text-navy font-bold text-xs hover:bg-amber-400 transition-colors"
            >
              + აქ შეტყობინება
            </button>
            <button
              onClick={() => setClickedCoords(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Floating Action Button (FAB) Bottom Right */}
        <button
          onClick={() => {
            sounds.playClick();
            setIsAddModalOpen(true);
          }}
          className="absolute bottom-5 right-5 z-10 px-5 py-3.5 rounded-full bg-gradient-to-r from-gold to-amber-500 text-navy font-black text-xs shadow-[0_4px_20px_rgba(252,163,17,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-white"
        >
          <Plus size={18} />
          <span>შეტყობინების დამატება</span>
        </button>

      </div>
      )}

      {/* 3. Bottom Legend & Fuel / Showrooms Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Live Fuel Station Leaderboard (Best Prices) */}
        <div className="p-4 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
              <Fuel size={15} className="text-emerald-600" />
              <span>საწვავის საუკეთესო ფასები (თბილისი)</span>
            </h4>
            <span className="text-[10px] font-mono font-bold text-slate-400">განახლებულია</span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {reports.filter(r => r.type === 'fuel' && r.fuel_prices).slice(0, 5).map(station => (
              <div
                key={station.id}
                onClick={() => {
                  sounds.playClick();
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([station.lat, station.lng], 16, { duration: 1 });
                  }
                }}
                className="p-3 rounded-2xl neu-surface hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between border border-white"
              >
                <div>
                  <div className="font-extrabold text-xs text-navy flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{station.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {station.address}
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  {station.fuel_prices?.regular_92 && (
                    <span className="px-2 py-1 rounded-xl bg-slate-200/80 text-navy font-bold">
                      92: {station.fuel_prices.regular_92.toFixed(2)}₾
                    </span>
                  )}
                  {station.fuel_prices?.premium_95 && (
                    <span className="px-2 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black">
                      95: {station.fuel_prices.premium_95.toFixed(2)}₾
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Showrooms & Official Centers */}
        <div className="p-4 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-navy uppercase tracking-wider flex items-center gap-2">
              <Building2 size={15} className="text-gold" />
              <span>ავტო სალონები და ოფიციალური ცენტრები</span>
            </h4>
            <span className="text-[10px] font-mono font-bold text-gold">ოფიციალური</span>
          </div>

          <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
            {reports.filter(r => r.type === 'showroom').slice(0, 5).map(showroom => (
              <div
                key={showroom.id}
                onClick={() => {
                  sounds.playClick();
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([showroom.lat, showroom.lng], 16, { duration: 1 });
                  }
                }}
                className="p-3 rounded-2xl neu-surface hover:bg-slate-100/80 transition-all cursor-pointer flex items-center justify-between border border-white"
              >
                <div>
                  <div className="font-extrabold text-xs text-navy flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold"></span>
                    <span>{showroom.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {showroom.address}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs">
                    {showroom.rating} ★
                  </span>
                  {showroom.phone && (
                    <a
                      href={`tel:${showroom.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-xl bg-navy text-gold hover:bg-slate-800 transition-colors"
                      title="დარეკვა"
                    >
                      <Phone size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Report Modal */}
      <AddReportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddReport={handleAddNewReport}
        currentCoords={clickedCoords || userLocation}
      />

    </div>
  );
};

export default LiveTrafficMap;
