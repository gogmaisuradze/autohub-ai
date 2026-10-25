import React, { useEffect, useRef, useState } from 'react';
import {
  DELINEATED_PARKING_ZONES,
  DelineatedParkingZone,
  getParkingZonesByCity
} from '../../constants/parkingZones';
import { sounds } from '../../services/soundEffects';
import {
  TBILISI_PARKING_LOGO_B64,
  BATUMI_PARKING_LOGO_B64,
  KUTAISI_PARKING_LOGO_B64
} from '../../constants/parkingLogosData';
import {
  MapPin,
  Layers,
  Search,
  Navigation,
  Info,
  Car,
  Play,
  CheckCircle2,
  Compass,
  SlidersHorizontal,
  Eye
} from 'lucide-react';

interface Props {
  city: 'tbilisi' | 'batumi' | 'kutaisi';
  selectedZoneId?: string;
  onSelectZone: (zone: DelineatedParkingZone) => void;
  onStartParkingWithZone?: (zone: DelineatedParkingZone) => void;
  className?: string;
}

const CITY_COORDINATES: Record<'tbilisi' | 'batumi' | 'kutaisi', { center: [number, number]; zoom: number }> = {
  tbilisi: { center: [41.7120, 44.7850], zoom: 13 },
  batumi: { center: [41.6500, 41.6400], zoom: 14 },
  kutaisi: { center: [42.2700, 42.7030], zoom: 14 }
};

export const ParkingZonesMap: React.FC<Props> = ({
  city,
  selectedZoneId,
  onSelectZone,
  onStartParkingWithZone,
  className = ""
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerGroupRef = useRef<any>(null);
  const markerLayerGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [mapTheme, setMapTheme] = useState<'dark' | 'street' | 'satellite'>('dark');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [hoveredZone, setHoveredZone] = useState<DelineatedParkingZone | null>(null);

  const cityZones = getParkingZonesByCity(city);

  const filteredZones = cityZones.filter(z => {
    const matchesCategory = activeCategoryFilter === 'all' || z.category === activeCategoryFilter;
    const matchesSearch = !searchQuery.trim() ||
      z.zoneNumber.includes(searchQuery.trim().replace('#', '')) ||
      z.title_ge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.street_name_ge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      z.bounds_description_ge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      const cityConfig = CITY_COORDINATES[city] || CITY_COORDINATES.tbilisi;
      const map = L.map(mapContainerRef.current, {
        center: cityConfig.center,
        zoom: cityConfig.zoom,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Default Dark Tiles via OpenStreetMap with CSS Dark Filter
      const tileUrl = getTileUrl(mapTheme);
      tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);

      if (mapContainerRef.current) {
        if (mapTheme === 'dark') {
          mapContainerRef.current.classList.add('dark-map-tiles');
          mapContainerRef.current.style.backgroundColor = '#1a2232';
        } else if (mapTheme === 'satellite') {
          mapContainerRef.current.classList.remove('dark-map-tiles');
          mapContainerRef.current.style.backgroundColor = '#000000';
        } else {
          mapContainerRef.current.classList.remove('dark-map-tiles');
          mapContainerRef.current.style.backgroundColor = '#f8fafc';
        }
      }

      polygonLayerGroupRef.current = L.layerGroup().addTo(map);
      markerLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city]);

  // Helper for Tile URLs
  const getTileUrl = (theme: 'dark' | 'street' | 'satellite') => {
    switch (theme) {
      case 'dark':
      case 'street':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // 2. Change Tile Layer when mapTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newUrl = getTileUrl(mapTheme);
    tileLayerRef.current = L.tileLayer(newUrl, { maxZoom: 19 }).addTo(mapInstanceRef.current);
    // Move tiles behind vector layers
    tileLayerRef.current.bringToBack();

    // Toggle CSS Dark Filter for instant zero-lag dark mode
    if (mapContainerRef.current) {
      if (mapTheme === 'dark') {
        mapContainerRef.current.classList.add('dark-map-tiles');
        mapContainerRef.current.style.backgroundColor = '#1a2232';
      } else if (mapTheme === 'satellite') {
        mapContainerRef.current.classList.remove('dark-map-tiles');
        mapContainerRef.current.style.backgroundColor = '#000000';
      } else {
        mapContainerRef.current.classList.remove('dark-map-tiles');
        mapContainerRef.current.style.backgroundColor = '#f8fafc';
      }
    }
  }, [mapTheme]);

  // 3. Render Delineated Polygons & Numbered Badges on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerGroupRef.current || !markerLayerGroupRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    polygonLayerGroupRef.current.clearLayers();
    markerLayerGroupRef.current.clearLayers();

    filteredZones.forEach(zone => {
      const isSelected = selectedZoneId === zone.id || selectedZoneId === zone.zoneNumber;

      // Draw Delineated Polygon (დახაზული ზონა)
      const polygon = L.polygon(zone.polygon, {
        color: isSelected ? '#fbbf24' : zone.color,
        fillColor: zone.fillColor,
        fillOpacity: isSelected ? 0.65 : 0.35,
        weight: isSelected ? 3.5 : 2.5,
        dashArray: isSelected ? undefined : '4 3'
      });

      polygon.on('click', () => {
        sounds.playClick();
        onSelectZone(zone);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(zone.center, 16, { duration: 0.8 });
        }
      });

      polygon.on('mouseover', () => {
        setHoveredZone(zone);
      });

      polygon.on('mouseout', () => {
        setHoveredZone(null);
      });

      polygonLayerGroupRef.current.addLayer(polygon);

      // Draw Circular Zone Number Badge Marker in the Center (დანომრილი მარკერი)
      const badgeHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="px-2 py-1 rounded-xl font-mono font-black text-xs flex items-center gap-1 shadow-lg transition-transform hover:scale-110 ${
            isSelected 
              ? 'bg-gold text-navy ring-2 ring-white scale-110' 
              : 'bg-navy text-gold border border-gold/60'
          }">
            <span class="w-1.5 h-1.5 rounded-full ${zone.category === 'A' ? 'bg-blue-400' : zone.category === 'B' ? 'bg-amber-400' : 'bg-emerald-400'}"></span>
            <span>#${zone.zoneNumber}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-parking-zone-badge',
        html: badgeHtml,
        iconSize: [44, 24],
        iconAnchor: [22, 12]
      });

      const marker = L.marker(zone.center, { icon: customIcon });

      // Popup on Marker
      const freeSpots = Math.max(0, zone.total_spots - zone.occupied_spots);
      const popupHtml = `
        <div class="p-3 font-sans text-navy min-w-[220px]">
          <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
            <span class="px-2 py-0.5 rounded-full bg-navy text-gold text-[10px] font-mono font-black">
              ზონა #${zone.zoneNumber}
            </span>
            <span class="text-xs font-mono font-black text-slate-800">
              ${zone.hourly_rate_gel.toFixed(2)} ₾ / სთ
            </span>
          </div>
          <div class="mt-2 text-xs font-extrabold text-navy leading-snug">
            ${zone.title_ge}
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5 font-mono">
            ${zone.bounds_description_ge}
          </div>
          <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span class="text-slate-500">თავისუფალი:</span>
            <span class="font-bold text-emerald-600 font-mono">● ${freeSpots} / ${zone.total_spots} ადგილი</span>
          </div>
          <div class="mt-2 text-[10px] text-amber-700 font-bold bg-amber-50 p-1 rounded-md text-center">
            ✔ პირველი 15 წუთი უფასოა
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      marker.on('click', () => {
        sounds.playClick();
        onSelectZone(zone);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(zone.center, 16, { duration: 0.8 });
        }
      });

      markerLayerGroupRef.current.addLayer(marker);
    });
  }, [filteredZones, selectedZoneId]);

  // Pan to zone when selected from outside
  const handleSelectAndPan = (zone: DelineatedParkingZone) => {
    sounds.playClick();
    setViewMode('map');
    onSelectZone(zone);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(zone.center, 16, { duration: 1.0 });
      }
    }, 80);
  };

  return (
    <div className={`rounded-3xl neu-card shadow-neu-card border border-white overflow-hidden flex flex-col ${className}`}>
      
      {/* Top Header & Search Bar */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 space-y-3 z-10 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl neu-circle flex items-center justify-center text-gold shadow-sm shrink-0">
              <MapPin className="w-5 h-5 text-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-6 px-1.5 py-0.5 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                  <img
                    src={city === 'tbilisi' ? TBILISI_PARKING_LOGO_B64 : city === 'batumi' ? BATUMI_PARKING_LOGO_B64 : KUTAISI_PARKING_LOGO_B64}
                    alt={city}
                    className="h-4 max-w-[45px] object-contain"
                  />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-navy">
                  დახაზული & დანომრილი ზონების რუკა
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy text-gold">
                  {cityZones.length} დანომრილი ზონა
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                ოფიციალურად დახაზული ქუჩები, ზონის ნომრები და ცოცხალი თავისუფალი ადგილები
              </p>
            </div>
          </div>

          {/* View Mode & Map Theme Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode: Map vs List */}
            <div className="p-1 rounded-xl bg-slate-100 flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => { sounds.playClick(); setViewMode('map'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-navy text-gold shadow-sm'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                🗺️ რუკა
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setViewMode('list'); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-navy text-gold shadow-sm'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                📋 სია (#{cityZones.length})
              </button>
            </div>
          </div>
        </div>

        {/* Search input & Category Filter Chips */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="მოძებნეთ ზონის ნომრით (მაგ: 01, 05, 08) ან ქუჩით (ჭავჭავაძე, პეკინი...)"
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-navy"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">ტარიფი:</span>
            {[
              { id: 'all', label: 'ყველა' },
              { id: 'A', label: 'ზონა A (1₾)' },
              { id: 'B', label: 'ზონა B (2₾)' },
              { id: 'C', label: 'ზონა C (3₾)' }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveCategoryFilter(f.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  activeCategoryFilter === f.id
                    ? 'bg-navy text-gold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Numbered Zone Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap mr-1">სწრაფი ზონა:</span>
          {cityZones.slice(0, 8).map(z => {
            const isSel = selectedZoneId === z.id || selectedZoneId === z.zoneNumber;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => handleSelectAndPan(z)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all ${
                  isSel
                    ? 'bg-navy text-gold shadow-sm border border-navy ring-2 ring-gold/40 scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs'
                }`}
              >
                <span className="font-mono font-black text-amber-500">#{z.zoneNumber}</span>
                <span className="truncate max-w-[90px]">{z.street_name_ge.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body: Interactive Map vs List View */}
      {viewMode === 'map' ? (
        <div className="relative w-full h-[380px] sm:h-[460px] bg-slate-900">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Prominent Floating Map Theme Switcher on Top Right */}
          <div className="absolute top-3 right-3 z-[400] p-1 rounded-2xl bg-navy/95 backdrop-blur-md border-2 border-white/30 shadow-2xl flex items-center gap-1 pointer-events-auto">
            {(['dark', 'street', 'satellite'] as const).map(t => {
              const isActive = mapTheme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setMapTheme(t);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gold text-navy shadow-md font-black ring-2 ring-white/60 scale-105'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${t === 'dark' ? 'მუქი' : t === 'street' ? 'ღია' : 'სატელიტი'} რუკის რეჟიმი`}
                >
                  <span>{t === 'dark' ? '🌙 მუქი' : t === 'street' ? '🗺️ ღია' : '🛰️ სატელიტი'}</span>
                </button>
              );
            })}
          </div>

          {/* Map Floating Legend at Top Left */}
          <div className="absolute top-3 left-3 z-[400] p-2.5 rounded-2xl bg-navy/85 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono space-y-1 shadow-lg pointer-events-auto">
            <div className="font-bold text-gold uppercase tracking-wider mb-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>დახაზული ზონები & ტარიფი:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-blue-500 border border-blue-300"></span>
              <span>ზონა A — 1.00 ₾ / სთ (ცენტრი)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-amber-500 border border-amber-300"></span>
              <span>ზონა B — 2.00 ₾ / სთ (საშუალო)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500 border border-emerald-300"></span>
              <span>ზონა C — 3.00 ₾ / სთ (გარეუბანი)</span>
            </div>
          </div>

          {/* Hovered / Selected Zone Floating Info Card at Bottom */}
          {(hoveredZone || selectedZoneId) && (
            <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-sm z-[400] p-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 text-navy animate-fade-in pointer-events-auto">
              {(() => {
                const targetZone = hoveredZone || cityZones.find(z => z.id === selectedZoneId || z.zoneNumber === selectedZoneId);
                if (!targetZone) return null;
                const free = Math.max(0, targetZone.total_spots - targetZone.occupied_spots);

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-navy text-gold font-mono font-black text-xs">
                          ზონა #{targetZone.zoneNumber}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {targetZone.categoryName_ge}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-navy bg-gold/15 px-2 py-0.5 rounded-md border border-gold/30">
                        {targetZone.hourly_rate_gel.toFixed(2)} ₾ / სთ
                      </span>
                    </div>

                    <div className="text-xs font-black text-navy leading-tight">
                      {targetZone.title_ge}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {targetZone.bounds_description_ge}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-emerald-700 font-bold font-mono">
                        ● {free} ადგილი თავისუფალია
                      </span>
                      {onStartParkingWithZone && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playSuccess();
                            onStartParkingWithZone(targetZone);
                          }}
                          className="px-3 py-1 rounded-xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-xs flex items-center gap-1 transition-all active:scale-95"
                        >
                          <Play size={12} className="fill-navy" />
                          <span>პარკირება</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      ) : (
        /* List View of All Numbered Zones */
        <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto space-y-2.5 bg-slate-50/60">
          {filteredZones.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              შესაბამისი პარკირების ზონა ვერ მოიძებნა
            </div>
          ) : (
            filteredZones.map(zone => {
              const isSelected = selectedZoneId === zone.id || selectedZoneId === zone.zoneNumber;
              const freeSpots = Math.max(0, zone.total_spots - zone.occupied_spots);

              return (
                <div
                  key={zone.id}
                  onClick={() => handleSelectAndPan(zone)}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-navy text-white border-navy shadow-md ring-2 ring-gold/40'
                      : 'bg-white hover:bg-slate-50 text-navy border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-mono font-black shrink-0 ${
                      isSelected
                        ? 'bg-gold text-navy shadow-sm'
                        : 'bg-slate-100 text-navy border border-slate-200'
                    }`}>
                      <span className="text-[9px] uppercase font-bold opacity-70">ზონა</span>
                      <span className="text-sm -mt-1 font-black">#{zone.zoneNumber}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-sm">
                          {zone.title_ge}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          zone.category === 'A'
                            ? 'bg-blue-100 text-blue-800'
                            : zone.category === 'B'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {zone.categoryName_ge}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {zone.bounds_description_ge}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100/20">
                    <div className="text-right font-mono">
                      <span className={`text-xs font-black block ${isSelected ? 'text-gold' : 'text-navy'}`}>
                        {zone.hourly_rate_gel.toFixed(2)} ₾ / სთ
                      </span>
                      <span className={`text-[10px] block ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        ● {freeSpots} ადგილი თავისუფალია
                      </span>
                    </div>

                    {onStartParkingWithZone && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sounds.playSuccess();
                          onStartParkingWithZone(zone);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Play size={12} className="fill-navy" />
                        <span>არჩევა</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Bottom Footer Tip */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 px-4">
        <span className="flex items-center gap-1 font-mono">
          <Info size={13} className="text-amber-500" />
          <span>დააწკაპუნეთ რუკაზე დახაზულ მონაკვეთზე ან ნომერზე სასურველი ზონის ასარჩევად</span>
        </span>
        <span className="font-mono font-bold text-navy hidden sm:inline">
          🇬🇪 პირველი 15 წთ უფასოა
        </span>
      </div>

    </div>
  );
};

export default ParkingZonesMap;
