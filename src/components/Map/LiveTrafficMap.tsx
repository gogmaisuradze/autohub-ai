import React, { useEffect, useRef, useState } from 'react';
import { MapPointType, MapReport, VehicleProfile } from '../../types';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import AddReportModal from './AddReportModal';
import {
  Navigation,
  Compass,
  Plus,
  ShieldAlert,
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
  Car
} from 'lucide-react';

interface Props {
  vehicle?: VehicleProfile;
}

export const LiveTrafficMap: React.FC<Props> = ({ vehicle }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);

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

  // 1. Ensure Leaflet is loaded
  useEffect(() => {
    const checkLeaflet = () => {
      if ((window as any).L) {
        setIsLeafletReady(true);
      } else {
        // Dynamically inject if not loaded by index.html yet
        const existingScript = document.querySelector('script[src*="leaflet.js"]');
        if (!existingScript) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);

          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = () => setIsLeafletReady(true);
          document.body.appendChild(script);
        } else {
          setTimeout(checkLeaflet, 200);
        }
      }
    };

    checkLeaflet();
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

    // Dark Matter CartoDB Tiles (Perfect for dark neon aesthetic)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

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

    // Invalidate size after short render delay
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isLeafletReady]);

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

      marker.addTo(layer);
    });
  }, [reports, filterType, searchQuery]);

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
    { key: 'patrol' as const, label: 'პატრული', icon: ShieldAlert, color: 'text-blue-500' },
    { key: 'radar' as const, label: 'რადარები', icon: Camera, color: 'text-amber-500' },
    { key: 'hazard' as const, label: 'საფრთხე', icon: AlertTriangle, color: 'text-rose-500' },
    { key: 'fuel' as const, label: 'ბენზინის ფასები', icon: Fuel, color: 'text-emerald-500' },
    { key: 'showroom' as const, label: 'ავტო სალონები', icon: Building2, color: 'text-gold' }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Map Top Control Bar (Search, Filters, Geo) */}
      <div className="p-4 rounded-3xl neu-card shadow-neu-card border border-white space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Title & Live indicator */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl neu-circle flex items-center justify-center text-gold">
              <Navigation className="w-5 h-5 text-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-navy tracking-tight">
                  Waze ცოცხალი რუკა & ავტო-ჰაბი
                </h3>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live {reports.length}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                რადარები, პატრულის ჩასაფრებები, საწვავის ფასები და ავტო სალონები თბილისში
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              onClick={() => {
                sounds.playClick();
                loadReports();
              }}
              disabled={isRefreshing}
              title="მონაცემების განახლება"
              className="p-2.5 rounded-2xl neu-surface hover:bg-slate-100 text-slate-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-gold' : ''} />
            </button>

            {/* Locate Me (GPS) */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="px-3.5 py-2.5 rounded-2xl neu-btn text-xs font-bold text-navy flex items-center gap-1.5 hover:text-gold transition-all active:scale-95"
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
              className="px-4 py-2.5 rounded-2xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-gold-soft flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus size={16} />
              <span>+ შეტყობინება</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
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
                      ? 'bg-navy text-gold shadow-sm scale-105'
                      : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-gold' : opt.color || 'text-slate-400'} />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ძიება: Wissol, ვაკე, Porsche..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-navy focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-navy"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Interactive Map Canvas */}
      <div className="relative w-full h-[540px] rounded-3xl overflow-hidden neu-card border-2 border-white shadow-neu-card">
        
        {/* Leaflet DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-dark-900" />

        {/* Loading overlay if Leaflet is still preparing */}
        {!isLeafletReady && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-navy/80 backdrop-blur-sm text-white">
            <div className="w-12 h-12 rounded-full border-4 border-gold border-t-transparent animate-spin mb-3"></div>
            <p className="text-xs font-mono font-bold text-gold">რუკის ინიციალიზაცია...</p>
          </div>
        )}

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

          <div className="space-y-2">
            {reports.filter(r => r.type === 'fuel' && r.fuel_prices).slice(0, 3).map(station => (
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

          <div className="space-y-2">
            {reports.filter(r => r.type === 'showroom').slice(0, 3).map(showroom => (
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
