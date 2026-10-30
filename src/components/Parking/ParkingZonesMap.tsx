import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  DELINEATED_PARKING_ZONES,
  DelineatedParkingZone,
  getParkingZonesByCity,
  createManualParkingLot
} from '../../constants/parkingZones';
import { leafletLoader } from '../../services/leafletLoader';
import { sounds } from '../../services/soundEffects';
import {
  TBILISI_PARKING_LOGO_B64,
  BATUMI_PARKING_LOGO_B64,
  KUTAISI_PARKING_LOGO_B64
} from '../../constants/parkingLogosData';
import {
  MapPin,
  Search,
  Navigation,
  Info,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Compass,
  Zap,
  Lock,
  Unlock,
  MousePointerClick,
  ChevronDown,
  X
} from 'lucide-react';

interface Props {
  city: 'tbilisi' | 'batumi' | 'kutaisi';
  selectedZoneId?: string;
  onSelectZone: (zone: DelineatedParkingZone) => void;
  onStartParkingWithZone?: (zone: DelineatedParkingZone) => void;
  className?: string;
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

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
  const tileLayersRef = useRef<{
    street?: any;
    dark?: any;
    satellite?: any;
  }>({});
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // States: Map Loader & Theme
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapTheme, setMapTheme] = useState<'dark' | 'street' | 'satellite'>(() => {
    try {
      const saved = localStorage.getItem('autohub_map_theme');
      if (saved === 'dark' || saved === 'street' || saved === 'satellite') return saved;
    } catch {}
    return 'street';
  });

  const handleThemeChange = (newTheme: 'dark' | 'street' | 'satellite') => {
    sounds.playClick();
    setMapTheme(newTheme);
    try {
      localStorage.setItem('autohub_map_theme', newTheme);
    } catch {}
  };
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [hoveredZone, setHoveredZone] = useState<DelineatedParkingZone | null>(null);

  // Map Scroll & Zoom Isolation states (Prevents trapping page scroll on wheel or touch)
  const [isMapUnlocked, setIsMapUnlocked] = useState<boolean>(false);
  const isMapUnlockedRef = useRef<boolean>(false);
  const [showMapGestureHint, setShowMapGestureHint] = useState<boolean>(false);
  const mapGestureTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTwoFingerOverlay, setShowTwoFingerOverlay] = useState<boolean>(false);
  const twoFingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleMapLock = useCallback(() => {
    sounds.playClick();
    setIsMapUnlocked(prev => {
      const next = !prev;
      isMapUnlockedRef.current = next;
      if (mapInstanceRef.current) {
        if (next) {
          mapInstanceRef.current.scrollWheelZoom.enable();
        } else {
          mapInstanceRef.current.scrollWheelZoom.disable();
        }
      }
      return next;
    });
  }, []);

  const handleScrollPastMap = useCallback(() => {
    sounds.playClick();
    setIsMapUnlocked(false);
    isMapUnlockedRef.current = false;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.scrollWheelZoom.disable();
    }
    const nextSection =
      document.getElementById('parking-city-selector-section') ||
      document.getElementById('parking-zones-list-section') ||
      document.querySelector('.neu-card');
    if (nextSection) {
      const stickyHeaderEl = document.getElementById('sticky-header');
      const headerHeight = stickyHeaderEl ? stickyHeaderEl.getBoundingClientRect().height : 100;
      const rect = nextSection.getBoundingClientRect();
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const targetY = Math.max(0, rect.top + currentScrollY - headerHeight - 12);
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    } else {
      window.scrollBy({ top: 480, behavior: 'smooth' });
    }
  }, []);

  // Exit interactive map mode on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mapContainerRef.current && !mapContainerRef.current.contains(e.target as Node)) {
        if (isMapUnlockedRef.current) {
          setIsMapUnlocked(false);
          isMapUnlockedRef.current = false;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.scrollWheelZoom.disable();
          }
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMapUnlockedRef.current) {
        setIsMapUnlocked(false);
        isMapUnlockedRef.current = false;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.scrollWheelZoom.disable();
        }
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const cityZones = useMemo(() => getParkingZonesByCity(city), [city]);
  const [mapRevision, setMapRevision] = useState(0);

  const filteredZones = useMemo(() => cityZones.filter(z => {
    const matchesCategory = activeCategoryFilter === 'all' || z.tariffCategory === activeCategoryFilter;
    const cleanSearch = searchQuery.trim().toLowerCase().replace('#', '');
    if (!cleanSearch) return matchesCategory;

    const matchesLotCode = z.lotCode.toLowerCase().includes(cleanSearch) || z.zoneNumber.toLowerCase().includes(cleanSearch);
    const matchesStreet = z.street_ge.toLowerCase().includes(cleanSearch) || (z.district_ge || '').toLowerCase().includes(cleanSearch);
    const matchesBounds = (z.bounds_description_ge || '').toLowerCase().includes(cleanSearch);

    return matchesCategory && (matchesLotCode || matchesStreet || matchesBounds);
  }), [cityZones, activeCategoryFilter, searchQuery]);

  // 1. Initialize Map via LeafletLoader
  const initMap = useCallback(async () => {
    if (!mapContainerRef.current) return;

    setMapStatus('loading');
    setLoadError(null);

    try {
      const L = await leafletLoader.load();

      // Ensure container is still mounted
      if (!mapContainerRef.current) return;

      // Clean up previous instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const cityConfig = CITY_COORDINATES[city] || CITY_COORDINATES.tbilisi;
      const map = L.map(mapContainerRef.current, {
        center: cityConfig.center,
        zoom: cityConfig.zoom,
        zoomControl: false,
        attributionControl: true,
        preferCanvas: true,
        scrollWheelZoom: false // Disable accidental wheel scroll hijacking
      });

      // Cooperative wheel gesture handler: Ctrl/Cmd + wheel allows zoom; normal wheel scrolls the webpage
      const domEl = mapContainerRef.current;
      const onMapWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey || isMapUnlockedRef.current) {
          map.scrollWheelZoom.enable();
        } else {
          map.scrollWheelZoom.disable();
          setShowMapGestureHint(true);
          if (mapGestureTimerRef.current) clearTimeout(mapGestureTimerRef.current);
          mapGestureTimerRef.current = setTimeout(() => {
            setShowMapGestureHint(false);
          }, 1600);
        }
      };

      // 2-finger touch handler: 1 finger scrolls page, 2 fingers drag/zoom map
      const onMapTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1 && !isMapUnlockedRef.current) {
          map.dragging.disable();
          setShowTwoFingerOverlay(true);
          if (twoFingerTimerRef.current) clearTimeout(twoFingerTimerRef.current);
          twoFingerTimerRef.current = setTimeout(() => setShowTwoFingerOverlay(false), 1600);
        } else if (e.touches.length >= 2 || isMapUnlockedRef.current) {
          map.dragging.enable();
          map.touchZoom.enable();
          setShowTwoFingerOverlay(false);
        }
      };

      const onMapTouchMove = (e: TouchEvent) => {
        if (e.touches.length >= 2 || isMapUnlockedRef.current) {
          map.dragging.enable();
          map.touchZoom.enable();
          setShowTwoFingerOverlay(false);
        }
      };

      const onMapTouchEnd = (e: TouchEvent) => {
        if (e.touches.length === 0) {
          setShowTwoFingerOverlay(false);
          map.dragging.enable();
        }
      };

      if (domEl) {
        domEl.addEventListener('wheel', onMapWheel, { passive: true });
        domEl.addEventListener('touchstart', onMapTouchStart, { passive: true });
        domEl.addEventListener('touchmove', onMapTouchMove, { passive: true });
        domEl.addEventListener('touchend', onMapTouchEnd, { passive: true });
      }

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution position
      map.attributionControl.setPosition('bottomleft');

      // Pre-create and cache all 3 tile layers
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
      });

      const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
      });

      const satLayer = L.tileLayer('https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 20,
        attribution: 'Map data &copy; Google'
      });

      tileLayersRef.current = {
        street: streetLayer,
        dark: darkLayer,
        satellite: satLayer
      };

      const initialLayer = mapTheme === 'dark' ? darkLayer : mapTheme === 'satellite' ? satLayer : streetLayer;
      initialLayer.addTo(map);
      initialLayer.bringToBack();

      // Apply initial theme styles
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.remove('dark-map-tiles');
        if (mapTheme === 'dark') {
          mapContainerRef.current.style.backgroundColor = '#12161f';
        } else if (mapTheme === 'satellite') {
          mapContainerRef.current.style.backgroundColor = '#000000';
        } else {
          mapContainerRef.current.style.backgroundColor = '#f8fafc';
        }
      }

      polygonLayerGroupRef.current = L.layerGroup().addTo(map);
      markerLayerGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
      map.on('moveend', () => setMapRevision(value => value + 1));
      setMapStatus('ready');

      // Set up ResizeObserver to handle tab switching & container size changes
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserverRef.current?.disconnect();
        resizeObserverRef.current = new ResizeObserver(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        });
        resizeObserverRef.current.observe(mapContainerRef.current);
      }

      // Initial size invalidation after mount
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

    } catch (err: any) {
      setMapStatus('error');
      setLoadError(err?.message || 'რუკის ჩატვირთვა ვერ მოხერხდა.');
    }
  }, [city]);

  useEffect(() => {
    if (viewMode !== 'map') return;
    initMap();

    return () => {
      resizeObserverRef.current?.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      tileLayersRef.current = {};
    };
  }, [initMap, viewMode]);

  // Invalidate map size on viewMode switch
  useEffect(() => {
    if (viewMode === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 100);
    }
  }, [viewMode]);

  // 2. Instant, lag-free theme switching (toggles cached native layers)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !tileLayersRef.current) return;

    const layers = tileLayersRef.current;
    const targetLayer = layers[mapTheme] || layers.street;
    if (!targetLayer) return;

    // 1. Add target layer FIRST so map never flashes grey or blanks out
    if (!map.hasLayer(targetLayer)) {
      targetLayer.addTo(map);
    }
    targetLayer.bringToBack();

    // 2. Remove other layers gracefully
    Object.entries(layers).forEach(([themeKey, layer]) => {
      if (themeKey !== mapTheme && layer && map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    if (mapContainerRef.current) {
      mapContainerRef.current.classList.remove('dark-map-tiles');
      if (mapTheme === 'dark') {
        mapContainerRef.current.style.backgroundColor = '#12161f';
      } else if (mapTheme === 'satellite') {
        mapContainerRef.current.style.backgroundColor = '#000000';
      } else {
        mapContainerRef.current.style.backgroundColor = '#f8fafc';
      }
    }

    setTimeout(() => {
      try {
        map.invalidateSize({ pan: false });
      } catch {}
    }, 40);
  }, [mapTheme]);

  // 3. Render Polygons & Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonLayerGroupRef.current || !markerLayerGroupRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    polygonLayerGroupRef.current.clearLayers();
    markerLayerGroupRef.current.clearLayers();

    const bounds = mapInstanceRef.current.getBounds().pad(0.15);
    const zoom = mapInstanceRef.current.getZoom();
    filteredZones.forEach(zone => {
      if (!bounds.intersects(L.latLngBounds(zone.polygon))) return;
      const isSelected = selectedZoneId === zone.id || selectedZoneId === zone.lotCode || selectedZoneId === zone.zoneNumber;

      // Draw Delineated Polygon
      if (zone.geometry?.polygon && zone.geometry.polygon.length >= 3) {
        const polygon = L.polygon(zone.geometry.polygon, {
          color: isSelected ? '#fbbf24' : zone.color,
          fillColor: zone.fillColor,
          fillOpacity: isSelected ? 0.65 : 0.35,
          weight: isSelected ? 3.5 : 2.5,
          dashArray: isSelected ? undefined : '4 3'
        });

        polygon.on('click', () => {
          sounds.playClick();
          onSelectZone(zone);
          marker.openPopup();
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo(zone.geometry.center, 16, { duration: 0.8 });
          }
        });

        polygon.on('mouseover', () => setHoveredZone(zone));
        polygon.on('mouseout', () => setHoveredZone(null));

        polygonLayerGroupRef.current.addLayer(polygon);
      }

      if (zoom < 16 && !isSelected) return;

      // Marker Icon
      const badgeHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="px-2 py-1 rounded-xl font-mono font-black text-xs flex items-center gap-1 shadow-lg transition-transform hover:scale-110 ${
            isSelected
              ? 'bg-gold text-navy ring-2 ring-white scale-110'
              : 'bg-navy text-gold border border-gold/60'
          }">
            <span class="w-1.5 h-1.5 rounded-full ${
              zone.tariffCategory === 'A' ? 'bg-blue-400' : zone.tariffCategory === 'B' ? 'bg-amber-400' : 'bg-emerald-400'
            }"></span>
            <span>#${zone.lotCode}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-parking-zone-badge',
        html: badgeHtml,
        iconSize: [44, 24],
        iconAnchor: [22, 12]
      });

      const marker = L.marker(zone.geometry.center, { icon: customIcon });

      const wazeDeepLink = `https://waze.com/ul?ll=${zone.geometry.center[0]},${zone.geometry.center[1]}&navigate=yes`;
      const googleMapsLink = `https://www.google.com/maps/dir/?api=1&destination=${zone.geometry.center[0]},${zone.geometry.center[1]}`;

      const popupHtml = `
        <div class="p-3 font-sans text-navy min-w-[230px] max-w-[270px]">
          <div class="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200">
            <span class="px-2 py-0.5 rounded-full bg-navy text-gold text-[10px] font-mono font-black">
              ლოტი #${zone.lotCode}
            </span>
            <span class="text-xs font-mono font-black text-slate-800">
              ${zone.hourlyRateGel !== null ? `${zone.hourlyRateGel.toFixed(2)} ₾ / სთ` : 'ტარიფი გადაამოწმეთ'}
            </span>
          </div>
          <div class="mt-2 text-xs font-black text-navy leading-snug">
            ${escapeHtml(zone.street_ge)}
          </div>
          <div class="text-[11px] text-slate-500 mt-0.5 font-mono">
            ${escapeHtml(zone.bounds_description_ge)}
          </div>
          <div class="mt-2 text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 p-1 rounded-md text-center">
            ტარიფი და შეღავათი გადაამოწმეთ ოფიციალურ აპში
          </div>
          <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
            <a href="${wazeDeepLink}" target="_blank" rel="noreferrer" class="flex-1 py-1 px-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors">
              <span>Waze მისვლა</span>
            </a>
            <a href="${googleMapsLink}" target="_blank" rel="noreferrer" class="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold text-center transition-colors">
              Maps
            </a>
          </div>
          <button type="button" id="start-park-${zone.id}" class="w-full mt-2 py-2 px-3 rounded-xl bg-gold hover:bg-amber-400 text-navy font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95">
            <span>⚡ ამ ლოტზე პარკირების დაწყება</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`start-park-${zone.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            sounds.playSuccess();
            onSelectZone(zone);
            if (onStartParkingWithZone) {
              onStartParkingWithZone(zone);
            }
          };
        }
      });

      marker.on('click', () => {
        sounds.playClick();
        onSelectZone(zone);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(zone.geometry.center, 16, { duration: 0.8 });
        }
      });

      markerLayerGroupRef.current.addLayer(marker);
    });
  }, [filteredZones, selectedZoneId, mapStatus, mapRevision, viewMode]);

  const handleSelectAndPan = (zone: DelineatedParkingZone) => {
    sounds.playClick();
    setViewMode('map');
    onSelectZone(zone);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(zone.geometry.center, 16, { duration: 1.0 });
      }
    }, 80);
  };

  const handleAddManualCode = () => {
    sounds.playClick();
    const manualLot = createManualParkingLot(searchQuery, undefined, city);
    onSelectZone(manualLot);
    if (onStartParkingWithZone) {
      onStartParkingWithZone(manualLot);
    }
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
                  საპარკინგე ლოტების ოფიციალური რეესტრი
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-navy text-gold">
                  {cityZones.length} ლოტი
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {city === 'tbilisi' ? 'ზუსტი მუნიციპალური კონტურები და კოდები • განახლებულია 28.10.2026' : 'ადგილების სია • გადაამოწმეთ ადგილზე'}
              </p>
            </div>
          </div>

          {/* View Mode & Map Theme Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                const clean = searchQuery.trim().toLowerCase().replace('#', '');
                const match = cityZones.find(z =>
                  z.lotCode.toLowerCase() === clean ||
                  z.zoneNumber.toLowerCase() === clean ||
                  z.street_ge.toLowerCase().includes(clean)
                );
                if (match) {
                  handleSelectAndPan(match);
                  if (onStartParkingWithZone) onStartParkingWithZone(match);
                } else {
                  handleAddManualCode();
                }
              }
            }}
            className="relative flex-1 flex items-center gap-1.5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ჩაწერეთ ლოტი (მაგ: A1043, 005) ან ქუჩა — 1-კლიკით პარკირება..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-navy focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-navy"
                >
                  ✕
                </button>
              )}
            </div>

            {searchQuery && (
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-gold hover:bg-amber-400 text-navy font-black text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 active:scale-95"
                title="მყისიერი პარკირება ამ ლოტზე"
              >
                <Zap size={13} className="fill-navy" />
                <span>⚡ პარკირება</span>
              </button>
            )}
          </form>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">ტარიფი:</span>
            {[
              { id: 'all', label: 'ყველა' },
              { id: 'A', label: 'ზონა A' },
              { id: 'B', label: 'ზონა B' },
              { id: 'C', label: 'ზონა C' }
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
          <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap mr-1">სწრაფი ლოტი:</span>
          {cityZones.slice(0, 8).map(z => {
            const isSel = selectedZoneId === z.id || selectedZoneId === z.lotCode || selectedZoneId === z.zoneNumber;
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
                <span className="font-mono font-black text-amber-500">#{z.lotCode}</span>
                <span className="truncate max-w-[90px]">{z.street_ge.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Body: Interactive Map vs List View */}
      {viewMode === 'map' ? (
        <div className="relative w-full h-[440px] sm:h-[540px] bg-[#FAFBFD]">
          
          {/* Map Mount Point */}
          <div
            ref={mapContainerRef}
            onDoubleClick={handleToggleMapLock}
            className={`w-full h-full z-0 transition-colors duration-300 ${
              mapTheme === 'dark'
                ? 'bg-[#12161f]'
                : mapTheme === 'satellite'
                ? 'bg-black'
                : 'bg-[#f8fafc]'
            }`}
            title="ორჯერ დაკლიკეთ რუკის ზუმის გასააქტიურებლად/გასათიშად"
          />

          {/* Active Map Zoom Pill Badge */}
          {isMapUnlocked && (
            <div className="absolute top-14 sm:top-3 left-1/2 -translate-x-1/2 z-[410] px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md text-emerald-300 border border-emerald-400/50 shadow-xl flex items-center gap-2 animate-fade-in text-xs font-bold pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>რუკის ზუმი ჩართულია • ორჯერ დაკლიკეთ ან დააჭირეთ Esc-ს</span>
              <button
                onClick={handleToggleMapLock}
                className="p-0.5 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
                title="რუკის ზუმის გამორთვა"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* 2-Finger Touch Overlay (Google Maps gesture hint) */}
          {showTwoFingerOverlay && !isMapUnlocked && (
            <div className="absolute inset-0 z-[410] flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] pointer-events-none animate-fade-in transition-opacity">
              <div className="px-5 py-3 rounded-2xl bg-slate-950/90 text-white text-xs sm:text-sm font-bold border border-white/20 shadow-2xl flex items-center gap-2.5">
                <span className="text-xl">✌️</span>
                <span>გამოიყენეთ <strong>2 თითი</strong> რუკის სამართავად</span>
              </div>
            </div>
          )}

          {/* Momentary Wheel Scroll Hint */}
          {showMapGestureHint && !isMapUnlocked && !showTwoFingerOverlay && (
            <div className="absolute top-14 sm:top-3 left-1/2 -translate-x-1/2 z-[410] px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-2xl flex items-center gap-2 pointer-events-none animate-fade-in">
              <MousePointerClick size={16} className="text-gold animate-bounce" />
              <span>გამოიყენეთ <strong>2 თითი (Pinch)</strong> ან <strong>⌘ / Ctrl + Scroll</strong> რუკის ზუმისთვის</span>
            </div>
          )}

          {/* Floating Quick Exit / Scroll Past Button */}
          <button
            type="button"
            onClick={handleScrollPastMap}
            className="absolute bottom-3 right-16 z-[400] px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-white text-navy font-bold text-xs shadow-md border border-slate-200/90 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 group pointer-events-auto"
            title="ქალაქებზე და ზონებზე ჩასვლა"
          >
            <span>ქალაქებზე ჩასვლა</span>
            <ChevronDown size={14} className="text-gold group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Loading Overlay */}
          {mapStatus === 'loading' && (
            <div className="absolute inset-0 z-[500] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-navy">
              <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold font-mono">რუკის ბიბლიოთეკის ჩატვირთვა...</p>
            </div>
          )}

          {/* Error Overlay with Retry */}
          {mapStatus === 'error' && (
            <div className="absolute inset-0 z-[500] bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-500 animate-bounce" />
              <h4 className="text-sm font-black text-white">რუკის ჩატვირთვა ვერ მოხერხდა</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {loadError || 'შეამოწმეთ ინტერნეტ-კავშირი ან სცადეთ თავიდან.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  leafletLoader.retry();
                  initMap();
                }}
                className="px-4 py-2 rounded-xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-md flex items-center gap-1.5 transition-all"
              >
                <RotateCcw size={14} />
                <span>ხელახლა ცდა</span>
              </button>
            </div>
          )}

          {/* Prominent Floating Map Theme Switcher on Top Right */}
          <div className="absolute top-3 right-3 z-[400] p-1 rounded-2xl bg-navy/95 backdrop-blur-md border-2 border-white/30 shadow-2xl flex items-center gap-1 pointer-events-auto">
            {/* Lock / Unlock Toggle Button */}
            <button
              type="button"
              onClick={handleToggleMapLock}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                isMapUnlocked ? 'bg-emerald-500 text-white shadow-xs font-black' : 'text-slate-300 hover:text-white'
              }`}
              title={isMapUnlocked ? 'რუკის ზუმი აქტიურია (ჩასაკეტად დაკლიკეთ)' : 'რუკის ზუმის განბლოკვა (ორჯერ დაკლიკეთ)'}
            >
              {isMapUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
              <span className="hidden sm:inline">{isMapUnlocked ? 'ზუმი აქტიური' : 'ზუმი ჩაკეტილი'}</span>
            </button>
            {(['dark', 'street', 'satellite'] as const).map(t => {
              const isActive = mapTheme === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleThemeChange(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-gold text-navy shadow-md font-black ring-2 ring-white/60 scale-105'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                  title={`${t === 'dark' ? 'მუქი (CartoDB)' : t === 'street' ? 'ქუჩები (OSM)' : 'სატელიტი (Google Hybrid)'} რუკის რეჟიმი`}
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
              <span>სატარიფო კატეგორიები:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-blue-500 border border-blue-300"></span>
              <span>ზონა A • ზუსტი კონტურები</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-amber-500 border border-amber-300"></span>
              <span>ზონა B</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-md bg-emerald-500 border border-emerald-300"></span>
              <span>ზონა C</span>
            </div>
          </div>

          {/* Hovered / Selected Zone Floating Info Card at Bottom */}
          {(hoveredZone || selectedZoneId) && (
            <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-sm z-[400] p-3.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 text-navy animate-fade-in pointer-events-auto">
              {(() => {
                const targetZone = hoveredZone || cityZones.find(z => z.id === selectedZoneId || z.lotCode === selectedZoneId || z.zoneNumber === selectedZoneId);
                if (!targetZone) return null;

                const wazeUrl = `https://waze.com/ul?ll=${targetZone.geometry.center[0]},${targetZone.geometry.center[1]}&navigate=yes`;

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-navy text-gold font-mono font-black text-xs">
                          ლოტი #{targetZone.lotCode}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500">
                          {targetZone.categoryLabel_ge}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-black text-navy bg-gold/15 px-2 py-0.5 rounded-md border border-gold/30">
                        {targetZone.hourlyRateGel !== null ? `${targetZone.hourlyRateGel.toFixed(2)} ₾ / სთ` : 'ტარიფი გადაამოწმეთ'}
                      </span>
                    </div>

                    <div className="text-xs font-black text-navy leading-tight">
                      {targetZone.street_ge}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      {targetZone.bounds_description_ge}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 gap-2">
                      <a
                        href={wazeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-[10px] flex items-center gap-1 transition-all"
                      >
                        <Navigation size={11} />
                        <span>Waze-ით მისვლა</span>
                      </a>

                      {onStartParkingWithZone && (
                        <button
                          type="button"
                          onClick={() => {
                            sounds.playSuccess();
                            onStartParkingWithZone(targetZone);
                          }}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold to-amber-500 hover:from-amber-400 hover:to-gold text-navy font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95 hover:scale-105"
                        >
                          <Zap size={14} className="fill-navy text-navy" />
                          <span>⚡ პარკირების დაწყება</span>
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
        /* Limit list DOM size; search still includes all places. */
        <div className="p-4 sm:p-5 max-h-[460px] overflow-y-auto space-y-2.5 bg-slate-50/60">
          {filteredZones.length > 100 && <p className="text-xs text-slate-500">ნაჩვენებია პირველი 100 ადგილი {filteredZones.length}-დან. მოძებნეთ კოდით ან მისამართით.</p>}
          {filteredZones.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="text-slate-400 text-xs">
                ლოტი „{searchQuery}“ ვერ მოიძებნა ადგილების სიაში.
              </div>
              {searchQuery.trim() && (
                <button
                  type="button"
                  onClick={handleAddManualCode}
                  className="px-4 py-2 rounded-xl bg-gold hover:bg-amber-400 text-navy font-black text-xs shadow-sm transition-all"
                >
                  ➕ ხელით შეყვანილი ლოტის #{searchQuery.trim()} დამატება & დაწყება
                </button>
              )}
            </div>
          ) : (
            filteredZones.slice(0, 100).map(zone => {
              const isSelected = selectedZoneId === zone.id || selectedZoneId === zone.lotCode || selectedZoneId === zone.zoneNumber;
              const wazeUrl = `https://waze.com/ul?ll=${zone.geometry.center[0]},${zone.geometry.center[1]}&navigate=yes`;

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
                      <span className="text-[9px] uppercase font-bold opacity-70">ლოტი</span>
                      <span className="text-sm -mt-1 font-black">#{zone.lotCode}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs sm:text-sm">
                          {zone.street_ge}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          zone.tariffCategory === 'A'
                            ? 'bg-blue-100 text-blue-800'
                            : zone.tariffCategory === 'B'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {zone.categoryLabel_ge}
                        </span>
                      </div>
                      <p className={`text-xs mt-0.5 font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {zone.bounds_description_ge}
                      </p>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <ShieldCheck size={11} className="text-emerald-500" />
                        <span>წყარო: {zone.dataSource}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100/20">
                    <div className="text-right font-mono">
                      <span className={`text-xs font-black block ${isSelected ? 'text-gold' : 'text-navy'}`}>
                        {zone.hourlyRateGel !== null ? `${zone.hourlyRateGel.toFixed(2)} ₾ / სთ` : 'ტარიფი გადაამოწმეთ'}
                      </span>
                      <span className={`text-[10px] block ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                        შეღავათი გადაამოწმეთ
                      </span>
                    </div>

                    <a
                      href={wazeUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-xl bg-cyan-600/15 hover:bg-cyan-600 text-cyan-600 hover:text-white border border-cyan-500/30 text-xs font-bold transition-all"
                      title="Waze-ით მისვლა"
                    >
                      <Navigation size={14} />
                    </a>

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

      {/* Bottom Footer Tip with Provenance Warning */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-4 gap-2">
        <span className="flex items-center gap-1 font-mono">
          <Info size={13} className="text-amber-500 shrink-0" />
          <span>წყარო: api.municipal.gov.ge • კონტურები, მისამართები და სრული კოდები.</span>
        </span>
        <span className="font-mono font-bold text-navy">
          ტარიფი და შეღავათები გადაამოწმეთ ოფიციალურ აპში
        </span>
      </div>

    </div>
  );
};

export default ParkingZonesMap;
