import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPointType, MapReport, VehicleProfile } from '../../types';
import { n8nService } from '../../services/n8nService';
import { sounds } from '../../services/soundEffects';
import { leafletLoader } from '../../services/leafletLoader';
import { loadCameras, getGeorgiaRegionName } from '../../services/cameraService';
import { mapDataService } from '../../services/mapDataService';
import { getPreferredLocation, watchPreferredLocation, LocationFix } from '../../services/locationService';
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
  RotateCcw,
  Zap,
  Wrench,
  Droplets,
  Cog
} from 'lucide-react';

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

  const [mapTheme, setMapTheme] = useState<'dark' | 'street' | 'satellite'>('street');
  const [cameraStatus, setCameraStatus] = useState('მონაცემები იტვირთება…');
  const [reports, setReports] = useState<MapReport[]>([]);
  const [communityReports, setCommunityReports] = useState<MapReport[]>([]);
  const [backendPois, setBackendPois] = useState<MapReport[]>([]);
  const [filterType, setFilterType] = useState<MapPointType | 'all' | 'none'>('radar');
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFix, setLocationFix] = useState<LocationFix | null>(null);
  const [locationError, setLocationError] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLeafletReady, setIsLeafletReady] = useState(false);
  const [activeReportCount, setActiveReportCount] = useState(0);
  const [mapRevision, setMapRevision] = useState(0);
  const [activeMapView, setActiveMapView] = useState<'autohub_map' | 'waze_live'>('autohub_map');
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  useEffect(() => { setActiveReportCount(reports.length); }, [reports]);

  // Sync combined reports from community (n8n) and backend POIs
  useEffect(() => {
    if (filterType === 'none' && !searchQuery.trim()) {
      setReports([]);
      return;
    }
    const comm = communityReports.filter(r => !/^(radar-[1-3]|patrol-[1-3]|hazard-[1-2])$/.test(r.id));
    const seen = new Set<string>();
    const merged: MapReport[] = [];
    for (const p of [...comm, ...backendPois]) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        merged.push(p);
      }
    }
    setReports(merged);
  }, [communityReports, backendPois, filterType, searchQuery]);

  // Viewport POI fetcher (queries standalone backend based on map bbox)
  const fetchViewportPois = useCallback(async (currentFilter: MapPointType | 'all' | 'none') => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentFilter === 'none') {
      setBackendPois([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const ac = new AbortController();
    abortControllerRef.current = ac;

    try {
      let bbox: [number, number, number, number] | undefined;
      const bounds = map.getBounds();
      if (bounds && bounds.isValid && bounds.isValid() && bounds.getWest() !== bounds.getEast()) {
        const padded = bounds.pad(0.15);
        bbox = [
          padded.getWest(),
          padded.getSouth(),
          padded.getEast(),
          padded.getNorth()
        ];
      }

      const pois = await mapDataService.fetchPois({
        filterType: currentFilter,
        bbox,
        limit: 350,
        signal: ac.signal
      });

      if (!ac.signal.aborted) {
        setBackendPois(pois);
        const modeLabel = mapDataService.isStaticMode() ? 'სტატიკური ბაზა' : 'Live API';
        setCameraStatus(`🟢 AutoHub Map (${modeLabel}) • ${pois.length} ობიექტი ეკრანზე • 9 000+ ბაზაში`);
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        console.warn('Backend POIs viewport query error:', e);
      }
    }
  }, []);

  // 2. Fetch Initial Reports & Check Backend on Mount
  useEffect(() => {
    loadReports();
  }, []);

  // Update POIs on map movement or filter change
  useEffect(() => {
    if (mapInstanceRef.current && isLeafletReady) {
      fetchViewportPois(filterType);
    }
  }, [filterType, mapRevision, isLeafletReady, fetchViewportPois]);

  const loadReports = async () => {
    setIsRefreshing(true);
    try {
      let reportTimeout: ReturnType<typeof setTimeout>;
      const communityRequest = Promise.race([
        n8nService.getReports(),
        new Promise<MapReport[]>((_, reject) => { reportTimeout = setTimeout(() => reject(new Error('Reports timeout')), 10000); })
      ]).finally(() => clearTimeout(reportTimeout));

      const [community, isBackendHealthy, fallbackCameras] = await Promise.allSettled([
        communityRequest,
        mapDataService.checkHealth(),
        loadCameras()
      ]);

      const points = community.status === 'fulfilled' ? community.value : [];
      setCommunityReports(points);

      const backendAlive = isBackendHealthy.status === 'fulfilled' && isBackendHealthy.value;
      if (backendAlive) {
        const modeLabel = mapDataService.isStaticMode() ? 'სტატიკური ბაზა' : 'Live API';
        setCameraStatus(`🟢 AutoHub Map აქტიურია (${modeLabel}) • 9 000+ ობიექტი (OSM & მუნიციპალური პარკინგი)`);
        if (filterType !== 'none') {
          if (mapInstanceRef.current) {
            fetchViewportPois(filterType);
          }
        } else {
          setBackendPois([]);
        }
      } else {
        // Fallback to local cameras dataset if standalone server is not running
        const cameraPoints = fallbackCameras.status === 'fulfilled' ? fallbackCameras.value.reports : [];
        if (fallbackCameras.status === 'fulfilled') {
          const date = new Date(fallbackCameras.value.updatedAt).toLocaleString('ka-GE');
          setCameraStatus(`🟡 ლოკალური რეჟიმი (${cameraPoints.length} კამერა) • სერვერი: npm run map:server`);
          setBackendPois(cameraPoints);
        } else {
          setCameraStatus('კამერების ფაილი ვერ ჩაიტვირთა — სცადეთ განახლება.');
        }
      }
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
      attributionControl: true,
      preferCanvas: true
    });

    map.on('moveend', () => setMapRevision(v => v + 1));

    // Pre-create and cache both tile layers for instant, lag-free switching
    // OpenStreetMap standard tiles (identical to Parking page, 100% reliable)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
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
      setSelectedReport(null);
    });

    // Invalidate size after render to prevent grey/empty tile glitch
    const t1 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 50);
    const t2 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 180);
    const t3 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 450);
    const t4 = setTimeout(() => { try { map.invalidateSize(); } catch {} }, 900);

    const handleResize = () => { try { map.invalidateSize(); } catch {} };
    window.addEventListener('resize', handleResize);

    // ResizeObserver ensures canvas always matches container size on tab switches and layouts
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        try { map.invalidateSize(); } catch {}
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
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

    // ახალი ფენა ჯერ დავამატოთ, ძველი მერე მოვხსნათ — რომ რუკა არ „ჩაქრეს" ცვლილებისას
    if (mapTheme === 'satellite') {
      if (!map.hasLayer(sat)) sat.addTo(map);
      sat.bringToBack();
      if (map.hasLayer(osm)) map.removeLayer(osm);
      if (mapContainerRef.current) {
        mapContainerRef.current.classList.remove('dark-map-tiles');
        mapContainerRef.current.style.backgroundColor = '#000000';
      }
    } else {
      // Both 'dark' and 'street' use cached OpenStreetMap
      if (!map.hasLayer(osm)) osm.addTo(map);
      osm.bringToBack();
      if (map.hasLayer(sat)) map.removeLayer(sat);

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
    // ფენის გადართვის შემდეგ ხელახალი დახატვა — თეთრი/ნაცრისფერი ფილების თავიდან ასაცილებლად
    setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 60);
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
    const qLower = searchQuery.trim().toLowerCase();
    const filtered = reports.filter(r => {
      const matchesFilter = filterType === 'all' || r.type === filterType;
      const matchesSearch = !qLower ||
        r.title.toLowerCase().includes(qLower) ||
        (r.description && r.description.toLowerCase().includes(qLower)) ||
        (r.brand && r.brand.toLowerCase().includes(qLower)) ||
        (r.address && r.address.toLowerCase().includes(qLower)) ||
        (r.code && r.code.toLowerCase().includes(qLower)) ||
        (r.speedLimit && r.speedLimit.toLowerCase().includes(qLower)) ||
        (r.cameraKind && r.cameraKind.toLowerCase().includes(qLower));
      return matchesFilter && matchesSearch;
    });

    const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
    filtered.forEach(rawItem => {
      const item = {...rawItem, title:escapeHtml(rawItem.title), description:escapeHtml(rawItem.description)};
      // Create clean, aesthetic Google Maps / European standard POI pins (Approved design)
      let iconHtml = '';
      let markerClass = '';

      switch (item.type) {
        case 'patrol':
          markerClass = 'patrol-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-[#1A73E8] text-white font-mono font-bold text-[9px] shadow-sm border border-white -mb-1.5 z-20 whitespace-nowrap">
                LIVE პატრული
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1A73E8] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'radar':
          markerClass = 'radar-marker';
          if (item.speed_limit_kmh) {
            // Authentic European/Georgian Speed Limit Road Sign (Red Ring, White Interior, Bold Black Speed)
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-1.5 py-0.2 rounded-full bg-[#202124] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1 z-20 whitespace-nowrap">
                  ${item.speed_limit_kmh} კმ/სთ
                </div>
                <div class="relative w-9 h-9 rounded-full bg-white border-[3.5px] border-[#E53935] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform z-10">
                  <span class="text-[#202124] font-black font-mono text-[13px] tracking-tight leading-none">${item.speed_limit_kmh}</span>
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#E53935] -mt-[1px]"></div>
              </div>
            `;
          } else if (item.camera_kind === 'average_speed') {
            // Average Speed Camera Section
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-2 py-0.5 rounded-full bg-[#1A73E8] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1 z-20 whitespace-nowrap">
                  A ⇢ B სექციური
                </div>
                <div class="relative w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                  <span class="text-[9px] font-black font-mono">AVG</span>
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1A73E8] -mt-[1px]"></div>
              </div>
            `;
          } else if (item.camera_kind === 'traffic_signals') {
            // Traffic Light Camera
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-1.5 py-0.2 rounded-full bg-[#3C4043] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1 z-20 whitespace-nowrap">
                  შუქნიშანი
                </div>
                <div class="relative w-8 h-8 rounded-full bg-[#202124] text-white flex flex-col items-center justify-center gap-0.5 shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                  <div class="flex items-center gap-0.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-[#EA4335]"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-[#FBBC04]"></span>
                    <span class="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
                  </div>
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#202124] -mt-[1px]"></div>
              </div>
            `;
          } else {
            // General Radar / Camera
            iconHtml = `
              <div class="relative flex flex-col items-center cursor-pointer group">
                <div class="px-1.5 py-0.2 rounded-full bg-[#1A73E8] text-white font-mono font-bold text-[9px] shadow-xs border border-white -mb-1 z-20 whitespace-nowrap">
                  რადარი
                </div>
                <div class="relative w-8 h-8 rounded-full bg-[#1A73E8] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1A73E8] -mt-[1px]"></div>
              </div>
            `;
          }
          break;

        case 'hazard':
          markerClass = 'hazard-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-[#EA4335] text-white font-bold text-[9px] shadow-xs border border-white -mb-1.5 z-20 whitespace-nowrap">
                საფრთხე
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#EA4335] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#EA4335] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'fuel':
          markerClass = 'fuel-marker';
          const brandUpper = (item.brand || item.title || '').toUpperCase();
          const fuelBrand =
            brandUpper.includes('WISSOL') || brandUpper.includes('ვისოლ') ? 'Wissol' :
            brandUpper.includes('GULF') || brandUpper.includes('გალფ') ? 'Gulf' :
            brandUpper.includes('ROMPETROL') || brandUpper.includes('რომპეტროლ') ? 'Rompetrol' :
            brandUpper.includes('SOCAR') || brandUpper.includes('სოკარ') ? 'Socar' :
            brandUpper.includes('LUKOIL') || brandUpper.includes('ლუკოილ') ? 'Lukoil' :
            brandUpper.includes('PORTAL') || brandUpper.includes('პორტალ') ? 'Portal' :
            (item.brand || 'საწვავი');
          const lowestPrice = item.fuel_prices ? (item.fuel_prices.regular_92 || item.fuel_prices.premium_95) : null;
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#202124] font-bold text-[9px] font-mono shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                ${lowestPrice ? `${lowestPrice.toFixed(2)}₾` : fuelBrand}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#1E8E3E] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9h2a2 2 0 012 2v7a2 2 0 01-2 2h-2"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1E8E3E] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'charging':
          markerClass = 'charging-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#007B83] font-bold text-[9px] font-mono shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                ⚡ ${item.brand || 'EV Fast'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#007B83] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#007B83] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'service':
          markerClass = 'service-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#202124] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                🔧 ${item.brand || 'სერვისი'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#1967D2] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1967D2] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'car_wash':
          markerClass = 'car-wash-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#129EAF] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                🧼 ${item.brand || 'სამრეცხაო'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#129EAF] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#129EAF] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'parts':
          markerClass = 'parts-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#7B1FA2] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                🔩 ${item.brand || 'ნაწილები'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#7B1FA2] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#7B1FA2] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'parking':
          markerClass = 'parking-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#1A73E8] font-bold text-[9px] font-mono shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                ${item.code ? `#${item.code}` : '🅿️ პარკინგი'}
              </div>
              <div class="relative w-8 h-8 rounded-lg bg-[#1A73E8] text-white flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <span class="text-white font-black text-sm font-mono">P</span>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#1A73E8] -mt-[1px]"></div>
            </div>
          `;
          break;

        case 'showroom':
          markerClass = 'showroom-marker';
          iconHtml = `
            <div class="relative flex flex-col items-center cursor-pointer group">
              <div class="px-2 py-0.5 rounded-full bg-white text-[#202124] font-bold text-[9px] shadow-xs border border-[#DADCE0] -mb-1.5 z-20 whitespace-nowrap">
                👑 ${item.brand || 'ავტოსალონი'}
              </div>
              <div class="relative w-8 h-8 rounded-full bg-[#202124] text-[#D97706] flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform z-10">
                <svg class="w-4 h-4 text-[#D97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-[#202124] -mt-[1px]"></div>
            </div>
          `;
          break;
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      // Construct Clean Google Maps Light Popup HTML
      let popupBodyHtml = '';
      if (item.type === 'radar') {
        popupBodyHtml += `
          <div class="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1.5 text-xs text-[#3C4043]">
            <div class="flex items-center justify-between">
              <span class="text-[#5F6368]">კამერის ტიპი:</span>
              <span class="font-bold text-[#202124]">${escapeHtml(item.cameraKind || 'სტაციონარული რადარი')}</span>
            </div>
            ${item.speed_limit_kmh ? `
              <div class="flex items-center justify-between pt-1.5 border-t border-[#E8EAED]">
                <span class="text-[#5F6368]">მაქს. სიჩქარე:</span>
                <span class="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono font-bold text-xs">
                  ${item.speed_limit_kmh} კმ/სთ
                </span>
              </div>
            ` : ''}
            <div class="text-[10px] text-[#5F6368] pt-1.5 border-t border-[#E8EAED] flex items-center justify-between">
              <span>წყარო: ${escapeHtml(item.cameraSource || 'OpenStreetMap')}</span>
              ${item.osmId ? `<a href="https://www.openstreetmap.org/node/${item.osmId}" target="_blank" rel="noopener noreferrer" class="text-[#1A73E8] underline font-mono">OSM #${item.osmId} ↗</a>` : ''}
            </div>
          </div>
        `;
      } else if (item.cameraSource) {
        popupBodyHtml += `
          <div class="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] text-xs text-[#3C4043] space-y-1">
            ${item.speedLimit ? `<div>ლიმიტი: <strong class="text-[#202124]">${escapeHtml(item.speedLimit)}</strong></div>` : ''}
            <div>წყარო: ${escapeHtml(item.cameraSource)}</div>
            ${item.cameraUpdatedAt ? `<div>განახლდა: ${escapeHtml(new Date(item.cameraUpdatedAt).toLocaleDateString('ka-GE'))}</div>` : ''}
            ${item.osmId ? `<a href="https://www.openstreetmap.org/node/${item.osmId}" target="_blank" rel="noopener noreferrer" class="text-[#1A73E8] underline font-mono">წყაროს ნახვა ↗</a>` : ''}
          </div>
        `;
      }
      if (item.type === 'fuel' && item.fuel_prices) {
        popupBodyHtml += `
          <div class="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0]">
            <div class="text-[10px] uppercase tracking-wider font-bold text-[#5F6368] mb-1.5 flex justify-between">
              <span>საწვავის ტიპი</span>
              <span>ფასი / 1 ლ</span>
            </div>
            <div class="space-y-1 text-xs font-mono">
              ${item.fuel_prices.super_98 ? `<div class="flex justify-between text-[#3C4043]"><span>Super 98:</span><span class="font-bold text-[#137333]">${item.fuel_prices.super_98.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.premium_95 ? `<div class="flex justify-between text-[#3C4043]"><span>Premium 95:</span><span class="font-bold text-[#137333]">${item.fuel_prices.premium_95.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.regular_92 ? `<div class="flex justify-between text-[#3C4043]"><span>Euro Regular 92:</span><span class="font-bold text-[#137333]">${item.fuel_prices.regular_92.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.diesel ? `<div class="flex justify-between text-[#3C4043]"><span>Euro Diesel:</span><span class="font-bold text-[#137333]">${item.fuel_prices.diesel.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.lpg ? `<div class="flex justify-between text-[#3C4043]"><span>LPG / გაზი:</span><span class="font-bold text-[#1A73E8]">${item.fuel_prices.lpg.toFixed(2)} ₾</span></div>` : ''}
              ${item.fuel_prices.ev_kwh ? `<div class="flex justify-between text-[#3C4043]"><span>EV დამტენი:</span><span class="font-bold text-[#D97706]">${item.fuel_prices.ev_kwh.toFixed(2)} ₾/კვტ</span></div>` : ''}
            </div>
          </div>
        `;
      }
      if (item.phone || item.website || item.opening_hours || item.code) {
        popupBodyHtml += `
          <div class="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1.5 text-xs text-[#3C4043]">
            ${item.code ? `<div class="font-mono text-[#1A73E8] font-bold flex items-center justify-between"><span>🅿️ საპარკინგე ლოტი #${escapeHtml(item.code)}</span><span class="text-[#D97706] text-[10px]">15 წთ უფასო</span></div>` : ''}
            ${item.rating ? `<div class="flex items-center gap-1.5 text-[#D97706] font-bold"><span>შეფასება:</span><span>${item.rating} / 5.0 ★</span></div>` : ''}
            ${item.phone ? `<div class="flex items-center gap-1"><span>📞</span><a href="tel:${escapeHtml(item.phone)}" class="text-[#1A73E8] font-mono font-bold hover:underline">${escapeHtml(item.phone)}</a></div>` : ''}
            ${item.website ? `<div class="flex items-center gap-1"><span>🌐</span><a href="${escapeHtml(item.website)}" target="_blank" rel="noopener noreferrer" class="text-[#1A73E8] hover:underline">ვებსაიტი ↗</a></div>` : ''}
            ${item.opening_hours ? `<div class="text-[11px] text-[#5F6368] flex items-center gap-1"><span>🕒</span><span>${escapeHtml(item.opening_hours)}</span></div>` : ''}
          </div>
        `;
      }

      const displayAddress = item.address || `${getGeorgiaRegionName(item.lat, item.lng)} • საგზაო მონაკვეთი (${item.lat.toFixed(4)}, ${item.lng.toFixed(4)})`;
      const wazeDeepLink = `https://waze.com/ul?ll=${item.lat},${item.lng}&navigate=yes`;
      const gmapsLink = `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`;

      const popupContent = `
        <div class="w-72 font-sans text-[#202124] p-1">
          <div class="flex items-center justify-between pb-2 border-b border-[#E8EAED]">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              item.type === 'patrol' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              item.type === 'radar' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
              item.type === 'hazard' ? 'bg-red-50 text-red-700 border border-red-200' :
              item.type === 'fuel' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              item.type === 'charging' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
              item.type === 'service' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' :
              item.type === 'car_wash' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
              item.type === 'parts' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
              item.type === 'parking' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
              'bg-amber-50 text-amber-900 border border-amber-200'
            }">
              ${item.type === 'patrol' ? '🚓 საპატრულო ეკიპაჟი' :
                item.type === 'radar' ? (item.speed_limit_kmh ? `⚡ რადარი · ${item.speed_limit_kmh} კმ/სთ` : '📷 ' + escapeHtml(item.cameraKind || 'რადარი / კამერა')) :
                item.type === 'hazard' ? '⚠️ საგზაო საფრთხე' :
                item.type === 'fuel' ? '⛽ ავტოგასამართი' :
                item.type === 'charging' ? '⚡ დამტენი სადგური' :
                item.type === 'service' ? '🔧 ავტოსერვისი & საბურავები' :
                item.type === 'car_wash' ? '🧼 ავტოსამრეცხაო' :
                item.type === 'parts' ? '🔩 ავტონაწილები' :
                item.type === 'parking' ? (item.code ? `🅿️ საპარკინგე ლოტი #${escapeHtml(item.code)}` : '🅿️ პარკინგი') : '🏢 ავტო სალონი'}
            </span>
            <span class="text-[10px] text-[#5F6368] font-mono">${item.cameraSource ? 'OSM OpenData' : formatTimeAgo(item.timestamp)}</span>
          </div>

          <h4 class="font-bold text-sm text-[#202124] mt-2 leading-tight">${item.title}</h4>
          <div class="text-xs text-[#5F6368] flex items-start gap-1 mt-1 font-medium">
            <span class="shrink-0 mt-0.5">📍</span>
            <span>${escapeHtml(displayAddress)}</span>
          </div>
          ${item.description && item.description !== item.address && item.description !== displayAddress ? `<p class="text-xs text-[#5F6368] mt-1 leading-snug">${item.description}</p>` : ''}
          ${popupBodyHtml}

          <div class="mt-3 pt-2.5 border-t border-[#E8EAED] flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <div class="flex items-center gap-1.5">
              <a href="${wazeDeepLink}" target="_blank" rel="noreferrer" class="px-2.5 py-1 rounded-xl bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#1A73E8] border border-[#DADCE0] font-bold flex items-center gap-1 transition-all">
                <span>Waze ↗</span>
              </a>
              <a href="${gmapsLink}" target="_blank" rel="noreferrer" class="px-2.5 py-1 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold flex items-center gap-1 transition-all shadow-xs">
                <span>Google Maps ↗</span>
              </a>
            </div>
            ${item.phone ? `<a href="tel:${escapeHtml(item.phone)}" class="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1 transition-all"><span>📞 დარეკვა</span></a>` : ''}
          </div>
        </div>
      `;

      const marker = L.marker([item.lat, item.lng], { icon: customIcon });
      marker.bindPopup(popupContent, {
        className: 'light-google-popup',
        maxWidth: 320,
        autoPan: false
      });

      marker.on('click', (e: any) => {
        if (e?.originalEvent) {
          e.originalEvent.stopPropagation();
        }
        sounds.playClick();
        setSelectedReport(item);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([item.lat, item.lng], { animate: true, duration: 0.35 });
        }
        marker.openPopup();
      });

      marker.addTo(layer);
    });
  }, [reports, filterType, searchQuery, isLeafletReady]);

  // Real OBD GPS has priority; the current device provides the fallback.
  useEffect(() => {
    return watchPreferredLocation(vehicle?.id, fix => {setLocationFix(fix);setUserLocation({lat:fix.lat,lng:fix.lng});setLocationError('');}, message => {setLocationError(message);setLocationFix(null);setUserLocation(null);});
  }, [vehicle?.id]);
  useEffect(() => {
    const map=mapInstanceRef.current,L=(window as any).L;
    if(!map||!L)return;
    if(!locationFix){userMarkerRef.current?.remove();userMarkerRef.current=null;return;}
    const label=locationFix.source==='obd'?'თქვენი მანქანა • 4G OBD GPS':'თქვენი მოწყობილობა • GPS';
    const content=`<div class="p-2 text-xs font-bold text-[#202124]">${label}<br><span class="text-[#5F6368] font-normal font-mono">სიზუსტე: ±${Math.round(locationFix.accuracy)} მ</span></div>`;
    if(userMarkerRef.current){userMarkerRef.current.setLatLng([locationFix.lat,locationFix.lng]);userMarkerRef.current.setPopupContent(content);}
    else {
      const icon=L.divIcon({className:'user-car-marker',html:'<div style="width:24px;height:24px;border:3px solid white;border-radius:50%;background:#1A73E8;box-shadow:0 0 0 6px rgba(26,115,232,0.25)"></div>',iconSize:[24,24],iconAnchor:[12,12]});
      userMarkerRef.current=L.marker([locationFix.lat,locationFix.lng],{icon}).bindPopup(content,{className:'light-google-popup'}).addTo(map);
    }
  },[locationFix,isLeafletReady]);
  const handleLocateMe = async () => {
    sounds.playClick();setIsLocating(true);
    try {
      const fix=await getPreferredLocation(vehicle?.id);
      setLocationFix(fix);setUserLocation({lat:fix.lat,lng:fix.lng});setLocationError('');
      mapInstanceRef.current?.flyTo([fix.lat,fix.lng],15,{duration:1});sounds.playSuccess();
    } catch(error) {setLocationError(error instanceof Error?error.message:'მდებარეობა ვერ განისაზღვრა.');}
    finally {setIsLocating(false);}
  };

  // 6. Handle New Report Add
  const handleAddNewReport = async (newReportPayload: Omit<MapReport, 'id' | 'confirmations' | 'active'>) => {
    try {
      const res = await n8nService.addReport(newReportPayload);
      if (res && res.report) {
        setReports(prev => [res.report, ...prev]);


        // Center map to new point
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([res.report.lat, res.report.lng], 14, { duration: 1 });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Structured categories grouped by functional areas (Parking & Patrol removed per user request)
  const categoryGroups = [
    {
      id: 'safety',
      title: '🚨 უსაფრთხოება & მოძრაობა',
      color: 'border-amber-200/90 bg-amber-50/50',
      items: [
        {
          key: 'radar' as const,
          label: 'რადარები & კამერები',
          badge: '260',
          desc: 'სიჩქარის & შუქნიშნის კამერები',
          icon: Camera,
          accent: 'text-amber-600 bg-amber-100/90 border-amber-300'
        },
        {
          key: 'hazard' as const,
          label: 'საგზაო საფრთხე',
          badge: 'Live',
          desc: 'შემთხვევები & შეფერხებები',
          icon: AlertTriangle,
          accent: 'text-rose-600 bg-rose-100/90 border-rose-300'
        }
      ]
    },
    {
      id: 'energy',
      title: '⛽ საწვავი & ენერგია',
      color: 'border-emerald-200/90 bg-emerald-50/50',
      items: [
        {
          key: 'fuel' as const,
          label: 'ავტოგასამართი & ფასები',
          badge: '1 421',
          desc: 'Gulf, Wissol, Socar, Rompetrol, Lukoil',
          icon: Fuel,
          accent: 'text-emerald-700 bg-emerald-100/90 border-emerald-300'
        },
        {
          key: 'charging' as const,
          label: 'EV დამტენები',
          badge: '254',
          desc: 'ელექტრომობილების სწრაფი დამტენები',
          icon: Zap,
          accent: 'text-teal-700 bg-teal-100/90 border-teal-300'
        }
      ]
    },
    {
      id: 'service',
      title: '🔧 ავტოსერვისი & მოვლა',
      color: 'border-blue-200/90 bg-blue-50/50',
      items: [
        {
          key: 'service' as const,
          label: 'სერვისი & ვულკანიზაცია',
          badge: '1 344',
          desc: 'დიაგნოსტიკა, სავალი ნაწილი, საბურავები',
          icon: Wrench,
          accent: 'text-indigo-700 bg-indigo-100/90 border-indigo-300'
        },
        {
          key: 'car_wash' as const,
          label: 'ავტოსამრეცხაო',
          badge: '902',
          desc: 'თვითმომსახურება & ქიმწმენდა',
          icon: Droplets,
          accent: 'text-sky-700 bg-sky-100/90 border-sky-300'
        },
        {
          key: 'parts' as const,
          label: 'ავტონაწილები',
          badge: '619',
          desc: 'ნაწილები, დეტალები & ზეთები',
          icon: Cog,
          accent: 'text-purple-700 bg-purple-100/90 border-purple-300'
        },
        {
          key: 'showroom' as const,
          label: 'ავტოსალონები',
          badge: '122',
          desc: 'ოფიციალური დილერები & ცენტრები',
          icon: Building2,
          accent: 'text-amber-700 bg-amber-100/90 border-amber-300'
        }
      ]
    }
  ];

  return (
    <div className="space-y-4">
      {/* 1. Map Top Control Bar (Search, Filters, Geo) — მოცულობითი დაფა */}
      <div className="p-5 sm:p-6 lg:p-7 rounded-3xl neu-card shadow-neu-card border border-white/90 bg-[#ECEAE5] text-navy space-y-5 transition-all">
        {/* Header Row: Title, Live indicator & Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          
          {/* Title & Live indicator */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl neu-circle flex items-center justify-center text-navy shadow-md shrink-0 bg-white border border-white">
              <Navigation className="w-6 h-6 text-navy" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-navy">
                  AutoHub ცოცხალი საგზაო რუკა
                </h3>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE {reports.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                რადარები, საწვავის ფასები, EV დამტენები და ავტოსერვისები
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Switcher: AutoHub Map vs Waze Live Map */}
            <div className="flex items-center gap-1 p-1 bg-white/90 rounded-2xl border border-slate-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveMapView('autohub_map');
                  setTimeout(() => { mapInstanceRef.current?.invalidateSize(); }, 80);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMapView === 'autohub_map'
                    ? 'bg-navy text-gold shadow-sm font-black'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                }`}
              >
                <span>🗺️ საგზაო რუკა</span>
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setActiveMapView('waze_live'); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMapView === 'waze_live'
                    ? 'bg-cyan-600 text-white shadow-sm font-black'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-100'
                }`}
              >
                <span>🚗 Waze Live Map</span>
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={() => {
                sounds.playClick();
                loadReports();
              }}
              disabled={isRefreshing}
              title="მონაცემების განახლება"
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-navy border border-slate-200/80 shadow-2xs transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-gold' : ''} />
            </button>

            {/* Locate Me (GPS) */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-navy border border-slate-200/80 shadow-2xs text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
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
              className="btn-stitch-navy px-4 py-2.5 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
            >
              <Plus size={16} className="text-gold" />
              <span>+ შეტყობინება</span>
            </button>
          </div>
        </div>

        {/* Category Cards Section — მოცულობითი, შესამჩნევი და დაჯგუფებული კატეგორიები */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {categoryGroups.map(group => (
            <div
              key={group.id}
              className={`p-3.5 rounded-2xl border ${group.color} space-y-2.5 shadow-2xs`}
            >
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-between px-1">
                <span>{group.title}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {group.items.map(opt => {
                  const isActive = filterType === opt.key;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        sounds.playClick();
                        setFilterType(isActive ? 'all' : opt.key);
                        setSelectedReport(null);
                      }}
                      className={`w-full p-2.5 sm:p-3 rounded-xl transition-all duration-200 flex items-center justify-between gap-2.5 text-left ${
                        isActive
                          ? 'bg-[#1A2232] text-white border-2 border-gold shadow-md shadow-navy/25 scale-[1.02] ring-2 ring-gold/25 font-black'
                          : 'bg-white/95 hover:bg-white text-slate-800 border-2 border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                            isActive
                              ? 'bg-gold/20 text-gold border-gold/40'
                              : opt.accent
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs truncate ${isActive ? 'text-white font-black' : 'text-slate-900 font-bold'}`}>
                            {opt.label}
                          </div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-gold/80' : 'text-slate-500'}`}>
                            {opt.desc}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-bold shrink-0 transition-colors ${
                          isActive
                            ? 'bg-gold text-navy font-black shadow-2xs'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar: "ყველა ობიექტი" Toggle + Quick Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
          <button
            onClick={() => {
              sounds.playClick();
              setFilterType('all');
              setSelectedReport(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border-2 ${
              filterType === 'all'
                ? 'bg-[#1A2232] text-gold border-gold shadow-md shadow-navy/20 font-black scale-102 ring-2 ring-gold/25'
                : 'bg-white text-slate-700 hover:text-navy hover:bg-slate-50 border-slate-200/90 shadow-2xs'
            }`}
          >
            <Layers size={16} className={filterType === 'all' ? 'text-gold' : 'text-slate-500'} />
            <span>ყველა ობიექტი ერთად (9 000+)</span>
          </button>

          {/* Quick Search */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ძიება: Wissol, Gulf, ვაკე, 80 კმ/სთ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-slate-200/90 text-xs text-navy placeholder-slate-400 focus:outline-hidden focus:border-gold focus:ring-1 focus:ring-gold shadow-2xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-navy p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Sleek Map Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs text-xs text-slate-700">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-navy flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {cameraStatus}
          </span>
          {locationFix && (
            <span className="text-[11px] text-slate-500 font-mono border-l border-slate-200 pl-2">
              {locationFix.source === 'obd' ? '🚗 OBD GPS' : '📱 მოწყობილობის GPS'}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          <span>იხელმძღვანელეთ საგზაო ნიშნებით • </span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-navy"
          >
            © OpenStreetMap contributors
          </a>
        </div>
      </div>

      {/* 3. Interactive Map Canvas OR Official Waze Live Map View */}
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
          <div className="relative w-full min-h-[560px] h-[560px] sm:h-[640px] rounded-3xl overflow-hidden border border-slate-700/60 shadow-xl bg-slate-950">
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
      <div className="relative w-full min-h-[560px] h-[560px] sm:h-[640px] rounded-3xl overflow-hidden border-2 border-slate-300/80 shadow-xl bg-[#F4F3F0]">
        
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

        {/* Selected Marker Rich Info Card (Slides up when any marker is clicked) */}
        {selectedReport && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-30 p-4 rounded-3xl bg-white/98 backdrop-blur-xl border border-[#DADCE0] text-[#202124] shadow-[0_12px_32px_rgba(60,64,67,0.22)] animate-fade-in"
          >
            {/* Header: Badge + Time + Close */}
            <div className="flex items-center justify-between pb-2 border-b border-[#E8EAED]">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                selectedReport.type === 'patrol' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                selectedReport.type === 'radar' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                selectedReport.type === 'hazard' ? 'bg-red-50 text-red-700 border border-red-200' :
                selectedReport.type === 'fuel' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                selectedReport.type === 'charging' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                selectedReport.type === 'service' ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' :
                selectedReport.type === 'car_wash' ? 'bg-sky-50 text-sky-800 border border-sky-200' :
                selectedReport.type === 'parts' ? 'bg-purple-50 text-purple-800 border border-purple-200' :
                selectedReport.type === 'parking' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                'bg-amber-50 text-amber-900 border border-amber-200'
              }`}>
                {selectedReport.type === 'patrol' ? '🚓 საპატრულო ეკიპაჟი' :
                 selectedReport.type === 'radar' ? (selectedReport.speed_limit_kmh ? `⚡ რადარი · ${selectedReport.speed_limit_kmh} კმ/სთ` : '📷 ' + (selectedReport.cameraKind || 'რადარი / კამერა')) :
                 selectedReport.type === 'hazard' ? '⚠️ საგზაო საფრთხე' :
                 selectedReport.type === 'fuel' ? `⛽ ავტოგასამართი ${selectedReport.brand ? `• ${selectedReport.brand}` : ''}` :
                 selectedReport.type === 'charging' ? `⚡ დამტენი სადგური ${selectedReport.brand ? `• ${selectedReport.brand}` : ''}` :
                 selectedReport.type === 'service' ? `🔧 ავტოსერვისი & საბურავები ${selectedReport.brand ? `• ${selectedReport.brand}` : ''}` :
                 selectedReport.type === 'car_wash' ? `🧼 ავტოსამრეცხაო ${selectedReport.brand ? `• ${selectedReport.brand}` : ''}` :
                 selectedReport.type === 'parts' ? `🔩 ავტონაწილები ${selectedReport.brand ? `• ${selectedReport.brand}` : ''}` :
                 selectedReport.type === 'parking' ? (selectedReport.code ? `🅿️ საპარკინგე ლოტი #${selectedReport.code}` : '🅿️ პარკინგი') :
                 '🏢 ავტოსალონი'}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#5F6368] font-mono">
                  {selectedReport.cameraSource ? 'OSM OpenData' : formatTimeAgo(selectedReport.timestamp)}
                </span>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-6 h-6 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#5F6368] hover:text-[#202124] flex items-center justify-center text-xs transition-all"
                  title="დახურვა"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <h4 className="font-bold text-base text-[#202124] mt-2 leading-tight">
              {selectedReport.title}
            </h4>
            <div className="flex items-start gap-1.5 mt-1 text-xs text-[#5F6368] font-medium">
              <span className="shrink-0 mt-0.5">📍</span>
              <span>
                {selectedReport.address || `${getGeorgiaRegionName(selectedReport.lat, selectedReport.lng)} • საგზაო მონაკვეთი (${selectedReport.lat.toFixed(4)}, ${selectedReport.lng.toFixed(4)})`}
              </span>
            </div>
            {selectedReport.description && selectedReport.description !== selectedReport.address && (
              <p className="text-xs text-[#5F6368] mt-1 leading-snug">
                {selectedReport.description}
              </p>
            )}

            {/* Details Box */}
            <div className="mt-2.5 p-2.5 rounded-2xl bg-[#F8F9FA] border border-[#DADCE0] space-y-1.5 text-xs text-[#3C4043]">
              {selectedReport.speed_limit_kmh && (
                <div className="flex items-center justify-between">
                  <span className="text-[#5F6368]">მაქს. სიჩქარე:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-mono font-bold text-xs">
                    ⚡ {selectedReport.speed_limit_kmh} კმ/სთ
                  </span>
                </div>
              )}
              {selectedReport.phone && (
                <div className="flex items-center gap-1.5">
                  <span>📞</span>
                  <a href={`tel:${selectedReport.phone}`} className="text-[#1A73E8] font-mono font-bold hover:underline">
                    {selectedReport.phone}
                  </a>
                </div>
              )}
              {selectedReport.opening_hours && (
                <div className="flex items-center gap-1.5 text-[11px] text-[#5F6368]">
                  <span>🕒</span>
                  <span>{selectedReport.opening_hours}</span>
                </div>
              )}
              {selectedReport.website && (
                <div className="flex items-center gap-1.5">
                  <span>🌐</span>
                  <a href={selectedReport.website} target="_blank" rel="noopener noreferrer" className="text-[#1A73E8] hover:underline">
                    ვებსაიტი ↗
                  </a>
                </div>
              )}
            </div>

            {/* Navigation & Action Buttons */}
            <div className="mt-3 pt-2.5 border-t border-[#E8EAED] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                <a
                  href={`https://waze.com/ul?ll=${selectedReport.lat},${selectedReport.lng}&navigate=yes`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#1A73E8] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#DADCE0] transition-all"
                >
                  <Navigation size={14} />
                  <span>Waze</span>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedReport.lat},${selectedReport.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <ExternalLink size={14} />
                  <span>Google Maps</span>
                </a>
              </div>
              {selectedReport.phone && (
                <a
                  href={`tel:${selectedReport.phone}`}
                  className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  <Phone size={14} />
                  <span>დარეკვა</span>
                </a>
              )}
            </div>
          </div>
        )}

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
