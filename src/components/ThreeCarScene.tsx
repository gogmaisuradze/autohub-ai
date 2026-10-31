import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DtcCode, VehicleProfile } from '../types';
import { CarScenePoster } from './CarScenePoster';
import { sounds } from '../services/soundEffects';
import { preloadCarModel, getPreloadedCarModel } from '../services/modelPreloader';
import {
  Layers,
  Sparkles,
  RotateCw,
  Eye,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  X,
  ArrowRight,
  Sliders,
  Cpu,
  Activity,
  Search,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  ZoomIn,
  ZoomOut,
  MousePointerClick,
  Lock,
  Unlock
} from 'lucide-react';

interface Props {
  isScanning: boolean;
  scanOutcome?: 'success' | 'error' | null;
  onSequenceBusyChange?: (busy: boolean) => void;
  selectedComponent: string | null;
  onSelectComponent: (componentId: string) => void;
  hasErrors?: boolean;
  dtcCodes?: DtcCode[];
  onAskAiAboutCode?: (code: DtcCode) => void;
  vehicle?: VehicleProfile;
  onStartScan?: () => void;
  entranceTrigger?: number;
}

interface ComponentDef {
  id: string;
  name_ge: string;
  sub_ge: string;
  color: string;
  baseRestPos: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  defaultError?: string;
  matchingCodes: string[];
  focusCameraPos: THREE.Vector3;
  focusTargetPos: THREE.Vector3;
}

// Helper to generate a realistic 3D spiral coil spring
function createCoilSpringGeometry(
  radius: number,
  height: number,
  turns: number,
  wireRadius: number,
  segments: number = 24
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  const totalPoints = Math.round(turns * segments);
  for (let i = 0; i <= totalPoints; i++) {
    const t = i / totalPoints;
    const angle = t * turns * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = (t - 0.5) * height;
    points.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, totalPoints, wireRadius, 8, false);
}

// Helper to create structural tube between two 3D points (for unibody spaceframe)
function createFrameTube(p1: THREE.Vector3, p2: THREE.Vector3, radius: number = 0.016, material: THREE.Material): THREE.Mesh {
  const dir = new THREE.Vector3().subVectors(p2, p1);
  const length = dir.length();
  const geo = new THREE.CylinderGeometry(radius, radius, length, 12);
  const mesh = new THREE.Mesh(geo, material);
  
  mesh.position.copy(p1).add(dir.clone().multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
  return mesh;
}

export const ThreeCarScene: React.FC<Props> = ({
  isScanning,
  scanOutcome = null,
  onSequenceBusyChange,
  selectedComponent,
  onSelectComponent,
  hasErrors = false,
  dtcCodes = [],
  onAskAiAboutCode,
  vehicle,
  onStartScan,
  entranceTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [scanStage, setScanStage] = useState<'idle' | 'rotating' | 'waiting' | 'reveal' | 'fault' | 'clean' | 'error'>('idle');
  const sequenceRef = useRef<{
    active: boolean;
    elapsed: number;
    startAngle: number;
    revealing: boolean;
    initialCamPos?: THREE.Vector3 | null;
  }>({ active: false, elapsed: 0, startAngle: NaN, revealing: false, initialCamPos: null });
  const lastHapticRef = useRef<number>(0);
  const sequenceCallbacks = useRef({ onSequenceBusyChange, onSelectComponent });
  sequenceCallbacks.current = { onSequenceBusyChange, onSelectComponent };
  const scanOutcomeRef = useRef(scanOutcome);
  scanOutcomeRef.current = scanOutcome;
  const modelReadyRef = useRef(false);
  const scanVisualActive = isScanning || ['rotating', 'waiting', 'reveal'].includes(scanStage);
  // Brief physical pulses during the scan; unsupported browsers remain silent.
  useEffect(() => {
    if (!scanVisualActive || typeof navigator.vibrate !== 'function') return;
    let interval: ReturnType<typeof setInterval> | undefined;
    let stopped = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      if (interval !== undefined) clearInterval(interval);
      try { navigator.vibrate(0); } catch { /* Browser may deny haptics. */ }
    };
    const pulse = () => {
      if (stopped) return;
      if (document.hidden) { stop(); return; }
      try { if (!navigator.vibrate([30, 55, 30])) stop(); }
      catch { stop(); }
    };
    const onVisibility = () => { if (document.hidden) stop(); };
    pulse();
    if (!stopped) interval = setInterval(pulse, 850);
    const timeout = setTimeout(stop, 60000);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', stop);
    return () => {
      stop();
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', stop);
    };
  }, [scanVisualActive]);
  useEffect(() => {
    if (!isScanning) return;
    sequenceRef.current = { active: true, elapsed: 0, startAngle: NaN, revealing: false, initialCamPos: null };
    setScanStage('rotating');
    setExplodeFactor(0);
    targetExplodeRef.current = 0;
    solidTargetRef.current = 1;
    setIsGhostMode(false);
    setAutoRotate(false);
    setActivePin(null);
    activePinRef.current = null;
    setInfoCardOpen(false);
    const isMobileClient = (containerRef.current?.clientWidth || window.innerWidth) < 640;
    targetCamPosRef.current = isMobileClient
      ? new THREE.Vector3(3.95, 1.95, 4.55)
      : new THREE.Vector3(4.75, 2.35, 5.35);
    targetCamLookRef.current = new THREE.Vector3(0, .75, 0);
    sequenceCallbacks.current.onSequenceBusyChange?.(true);
    const viewport = containerRef.current;
    if (viewport) {
      const topOffset = 70;
      const targetScrollY = window.scrollY + viewport.getBoundingClientRect().top - topOffset;
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
  }, [isScanning]);

  // UI Interactive States
  const [activePin, setActivePin] = useState<string | null>(selectedComponent || null);
  const activePinRef = useRef<string | null>(selectedComponent || null);
  useEffect(() => { activePinRef.current = activePin; }, [activePin]);
  const liveStateRef = useRef({ dtcCodes, isScanning, autoRotate: false });
  liveStateRef.current.dtcCodes = dtcCodes;
  liveStateRef.current.isScanning = isScanning;
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  liveStateRef.current.autoRotate = autoRotate;

  const carMasterGroupRef = useRef<THREE.Group | null>(null);
  const pendingEntranceRef = useRef<boolean>(true);
  const entranceAnimRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
  }>({ active: false, startTime: 0, duration: 2.4 });
  const [modelError, setModelError] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [modelProgress, setModelProgress] = useState<number | null>(null);
  const topControlsRef = useRef<HTMLDivElement>(null);
  const [controlsHeight, setControlsHeight] = useState(160);
  useEffect(() => {
    const element = topControlsRef.current;
    if (!element) return;
    const update = () => setControlsHeight(element.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Trigger 3D car entrance drive-in: starts straight in background along floor, drives forward, then rotates to showcase angle
  const triggerEntranceFlyIn = useCallback(() => {
    if (!carMasterGroupRef.current) return;
    const car = carMasterGroupRef.current;
    car.position.set(0, 0, -13.0);
    car.scale.set(1, 1, 1);
    car.rotation.set(0, 0, 0); // Straight forward facing viewer
    entranceAnimRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 2.2
    };
    try { sounds.playScanSweep(); } catch {}
  }, []);

  // Re-trigger 3D car arrival fly-in animation when entering Diagnostics
  useEffect(() => {
    if (entranceTrigger && entranceTrigger > 0) {
      if (modelReadyRef.current && carMasterGroupRef.current) {
        // Slightly delay starting the fly-in (260ms) so as the page scroll
        // glides down to the 3D studio, the car zooms in right before the user's eyes
        const timer = setTimeout(() => {
          triggerEntranceFlyIn();
        }, 260);
        return () => clearTimeout(timer);
      } else {
        pendingEntranceRef.current = true;
      }
    }
  }, [entranceTrigger, triggerEntranceFlyIn]);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(false); // Show the finished paint first; X-ray remains available
  const solidTargetRef = useRef(1);
  const rippleTimeRef = useRef<number>(99);
  const rippleActiveRef = useRef<boolean>(false);
  const [explodeFactor, setExplodeFactor] = useState<number>(0); // 0 to 1
  const [infoCardOpen, setInfoCardOpen] = useState<boolean>(false);
  const [leftHudOpen, setLeftHudOpen] = useState<boolean>(false);
  const [rightHudOpen, setRightHudOpen] = useState<boolean>(false);

  // Scroll & Zoom Isolation states (Prevents trapping page scroll on wheel or touch)
  const [isControlsUnlocked, setIsControlsUnlocked] = useState<boolean>(false);
  const isControlsUnlockedRef = useRef<boolean>(false);
  const [showGestureHint, setShowGestureHint] = useState<boolean>(false);
  const gestureHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showTwoFingerOverlay, setShowTwoFingerOverlay] = useState<boolean>(false);
  const twoFingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleToggleControlsLock = useCallback(() => {
    sounds.playClick();
    setIsControlsUnlocked(prev => {
      const next = !prev;
      isControlsUnlockedRef.current = next;
      if (controlsRef.current) {
        controlsRef.current.enableZoom = next;
      }
      return next;
    });
  }, []);

  const handleZoomStep = useCallback((direction: 'in' | 'out') => {
    if (!cameraRef.current || !controlsRef.current) return;
    sounds.playClick();
    const cam = cameraRef.current;
    const target = controlsRef.current.target;
    const factor = direction === 'in' ? 0.82 : 1.22;
    const offset = new THREE.Vector3().subVectors(cam.position, target).multiplyScalar(factor);
    const newDistance = offset.length();
    if (newDistance >= controlsRef.current.minDistance && newDistance <= controlsRef.current.maxDistance) {
      cam.position.copy(target).add(offset);
      controlsRef.current.update();
    }
  }, []);

  const handleScrollPastStudio = useCallback(() => {
    sounds.playClick();
    setIsControlsUnlocked(false);
    isControlsUnlockedRef.current = false;
    if (controlsRef.current) {
      controlsRef.current.enableZoom = false;
    }
    const nextSection =
      document.getElementById('diagnostic-results-section') ||
      document.getElementById('three-car-studio')?.nextElementSibling;
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

  // Exit interactive mode on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isControlsUnlockedRef.current) {
          setIsControlsUnlocked(false);
          isControlsUnlockedRef.current = false;
          if (controlsRef.current) {
            controlsRef.current.enableZoom = false;
          }
        }
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isControlsUnlockedRef.current) {
        setIsControlsUnlocked(false);
        isControlsUnlockedRef.current = false;
        if (controlsRef.current) {
          controlsRef.current.enableZoom = false;
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

  // References to Three.js elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const plateCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const plateTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Helper to draw realistic Georgian license plate on 3D car body
  const updateLicensePlateTexture = (plateNumber: string, brandText?: string) => {
    if (!plateCanvasRef.current || !plateTextureRef.current) return;
    const canvas = plateCanvasRef.current;
    canvas.width = 512;
    canvas.height = 160;
    const pctx = canvas.getContext('2d');
    if (!pctx) return;

    // White background
    pctx.fillStyle = '#FFFFFF';
    pctx.fillRect(0, 0, 512, 160);

    // Dark border
    pctx.strokeStyle = '#14213D';
    pctx.lineWidth = 10;
    pctx.strokeRect(6, 6, 500, 148);

    // Georgian Flag Blue Strip on Left
    pctx.fillStyle = '#003399';
    pctx.fillRect(8, 8, 80, 144);

    // "GE" text
    pctx.fillStyle = '#FFFFFF';
    pctx.font = 'bold 36px Arial, sans-serif';
    pctx.textAlign = 'center';
    pctx.textBaseline = 'alphabetic';
    pctx.fillText('GE', 48, 120);

    // Georgian Flag Cross
    pctx.fillStyle = '#FFFFFF';
    pctx.fillRect(25, 26, 46, 28);
    pctx.fillStyle = '#EE0000';
    pctx.fillRect(25, 37, 46, 6);
    pctx.fillRect(45, 26, 6, 28);

    // Plate number text
    pctx.fillStyle = '#14213D';
    pctx.font = '900 84px Arial, sans-serif';
    pctx.textAlign = 'center';
    pctx.textBaseline = 'middle';
    pctx.fillText(plateNumber || 'FR-282-EE', 295, 84);

    // Brand watermark
    if (brandText) {
      pctx.fillStyle = '#718096';
      pctx.font = 'bold 18px Arial, sans-serif';
      pctx.fillText(brandText.toUpperCase(), 295, 138);
    }

    plateTextureRef.current.needsUpdate = true;
  };

  // Re-draw license plate when vehicle prop changes
  useEffect(() => {
    if (vehicle) {
      updateLicensePlateTexture(vehicle.plate_number, vehicle.brand);
    }
  }, [vehicle?.plate_number, vehicle?.brand, vehicle?.model]);

  // Component Assembly Groups & Dynamic Materials
  const groupsRef = useRef<{ [key: string]: THREE.Group }>({});
  const materialsRef = useRef<{ [key: string]: THREE.MeshStandardMaterial }>({});
  const glowMatsRef = useRef<{ [key: string]: THREE.MeshStandardMaterial[] }>({});
  const lightsRef = useRef<{ [key: string]: THREE.PointLight }>({});
  const bodyMaterialsRef = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const frameMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Animation Interpolation Targets
  const targetExplodeRef = useRef<number>(0);
  const currentExplodeRef = useRef<number>(0);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetCamLookRef = useRef<THREE.Vector3 | null>(null);

  // Component Definitions with Engineering Positions
  const componentsList: ComponentDef[] = useMemo(() => [
    {
      id: 'engine',
      name_ge: 'ძრავა & ტრანსმისია (Powertrain)',
      sub_ge: 'ძრავის ილუსტრაციული აგრეგატი და აალების სისტემა',
      color: '#ff0033', // Neon Red
      baseRestPos: new THREE.Vector3(0, 0.65, 1.50),
      explodeOffset: new THREE.Vector3(0, 0.55, 0.35),
      defaultError: 'P0300',
      matchingCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0171'],
      focusCameraPos: new THREE.Vector3(1.3, 1.3, 2.2),
      focusTargetPos: new THREE.Vector3(0, 0.65, 1.08)
    },
    {
      id: 'ecu',
      name_ge: 'ECU კომპიუტერები',
      sub_ge: 'მთავარი მართვის ბლოკი, Gateway მოდული, რელეები და CAN სადენები',
      color: '#00e5ff', // Neon Cyan
      baseRestPos: new THREE.Vector3(0, 0.30, 0.05),
      explodeOffset: new THREE.Vector3(0, 0.35, 0),
      defaultError: 'U0100',
      matchingCodes: ['U0100', 'U0101', 'P0600', 'ecu'],
      focusCameraPos: new THREE.Vector3(-1.4, 1.1, 0.6),
      focusTargetPos: new THREE.Vector3(0, 0.32, 0.05)
    },
    {
      id: 'suspension',
      name_ge: 'საკიდარი და ამორტიზატორები',
      sub_ge: 'ზამბარიანი დგარები, საკიდარი, ბერკეტები (A-arms) და ყუმბარები',
      color: '#10b981', // Laser Green
      baseRestPos: new THREE.Vector3(0, 0.45, 0),
      explodeOffset: new THREE.Vector3(0, 0, 0),
      matchingCodes: [],
      focusCameraPos: new THREE.Vector3(1.9, 0.9, 1.7),
      focusTargetPos: new THREE.Vector3(0.9, 0.5, 1.15)
    },
    {
      id: 'exhaust',
      name_ge: 'გამონაბოლქვი & O2 სენსორი',
      sub_ge: 'კატალიზატორი, O2 ლამბდა ზონდები, მაყუჩი და სენსორები',
      color: '#ff6600', // Neon Fiery Orange
      baseRestPos: new THREE.Vector3(0, 0.28, -0.4),
      explodeOffset: new THREE.Vector3(0, -0.12, -0.55),
      defaultError: 'P0133',
      matchingCodes: ['P0133', 'P0420', 'P0130', 'P0135'],
      focusCameraPos: new THREE.Vector3(1.7, 0.7, -1.1),
      focusTargetPos: new THREE.Vector3(0.3, 0.3, -0.5)
    },
    {
      id: 'cooling',
      name_ge: 'გაგრილების რადიატორი & ვენტილატორი',
      sub_ge: 'ალუმინის რადიატორი, ორმაგი ვენტილატორები და მილები',
      color: '#00ccff', // Electric Cyan
      baseRestPos: new THREE.Vector3(0, 0.60, 2.08),
      explodeOffset: new THREE.Vector3(0, 0.2, 0.95),
      defaultError: 'P0115',
      matchingCodes: ['P0115', 'P0128'],
      focusCameraPos: new THREE.Vector3(0.0, 1.2, 3.2),
      focusTargetPos: new THREE.Vector3(0, 0.55, 1.84)
    },
    {
      id: 'brakes',
      name_ge: 'სამუხრუჭე სისტემა & ხუნდები',
      sub_ge: 'BMW-ის საკუთარი დისკები და კალიპერები; ABS — მხოლოდ მხარდაჭერილი სკანერით',
      color: '#ffb703', // Electric Amber / Gold
      baseRestPos: new THREE.Vector3(0, 0.34, 0),
      explodeOffset: new THREE.Vector3(0, 0, 0),
      matchingCodes: ['C0035', 'C0040', 'C0045', 'C0050'],
      focusCameraPos: new THREE.Vector3(2.1, 0.75, 1.7),
      focusTargetPos: new THREE.Vector3(1.05, 0.35, 1.15)
    },
    {
      id: 'battery', name_ge: 'აკუმულატორი და კვება',
      sub_ge: 'სისტემის ძაბვა; დაბალი ძაბვა აკუმულატორის დაზიანებას თავისთავად არ ადასტურებს',
      color: '#a78bfa', baseRestPos: new THREE.Vector3(.53, .55, 1.03),
      explodeOffset: new THREE.Vector3(.60, .35, .15), matchingCodes: ['P0560', 'P0562', 'P0563'],
      focusCameraPos: new THREE.Vector3(2, 1.4, 2.2), focusTargetPos: new THREE.Vector3(.53, .55, 1.03)
    },
    {
      id: 'ignition_coil', name_ge: 'აალების სისტემა',
      sub_ge: 'ანთების გამოტოვება — შესამოწმებელია კოჭა, სანთელი, ინჟექტორი და სხვა შესაძლო მიზეზები',
      color: '#f472b6', baseRestPos: new THREE.Vector3(0, .60, 1.42),
      explodeOffset: new THREE.Vector3(-.5, .65, .2), matchingCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0351', 'P0352'],
      focusCameraPos: new THREE.Vector3(-1.5, 1.5, 2.2), focusTargetPos: new THREE.Vector3(0, .60, 1.42)
    },
    { id: 'oxygen_sensor', name_ge: 'O₂ სენსორი', sub_ge: 'ჟანგბადის სენსორის წრედი; ზედა და ქვედა სენსორის მდებარეობა ილუსტრაციულია', color: '#fb923c', baseRestPos: new THREE.Vector3(-0.14,0.29,0.5), explodeOffset: new THREE.Vector3(0.65,0.15,-0.35), matchingCodes: ['P0130', 'P0131', 'P0132', 'P0133', 'P0134', 'P0135', 'P0136', 'P0137', 'P0138', 'P0139', 'P0140', 'P0141'], focusCameraPos: new THREE.Vector3(0.31,0.69,1.0), focusTargetPos: new THREE.Vector3(-0.14,0.29,0.5) },
    { id: 'coolant_sensor', name_ge: 'ტემპერატურის სენსორი', sub_ge: 'გაგრილების სითხის ტემპერატურის სენსორი და მისი წრედი', color: '#38bdf8', baseRestPos: new THREE.Vector3(0.25,0.58,1.92), explodeOffset: new THREE.Vector3(-0.55,0.35,0.5), matchingCodes: ['P0115', 'P0116', 'P0117', 'P0118', 'P0119'], focusCameraPos: new THREE.Vector3(0.7,0.98,2.42), focusTargetPos: new THREE.Vector3(0.25,0.58,1.92) },
    { id: 'throttle_sensor', name_ge: 'დროსელის სენსორი', sub_ge: 'დროსელის პოზიციის სენსორი; შესამოწმებელია კონექტორიც და გაყვანილობაც', color: '#22d3ee', baseRestPos: new THREE.Vector3(0.4,0.64,1.3), explodeOffset: new THREE.Vector3(0.65,0.4,0.25), matchingCodes: ['P0120', 'P0121', 'P0122', 'P0123', 'P0124', 'P0220', 'P0221'], focusCameraPos: new THREE.Vector3(0.8500000000000001,1.04,1.8), focusTargetPos: new THREE.Vector3(0.4,0.64,1.3) },
    { id: 'fuel_injectors', name_ge: 'ინჟექტორები', sub_ge: 'საწვავის შეშხეფების წრედები; ვიზუალიზაცია დაზიანების საბოლოო დასკვნა არ არის', color: '#fbbf24', baseRestPos: new THREE.Vector3(0.2,0.66,1.4), explodeOffset: new THREE.Vector3(-0.65,0.5,0.15), matchingCodes: ['P0200', 'P0201', 'P0202', 'P0203', 'P0204', 'P0205', 'P0206'], focusCameraPos: new THREE.Vector3(0.65,1.06,1.9), focusTargetPos: new THREE.Vector3(0.2,0.66,1.4) },
    { id: 'fuel_pump', name_ge: 'საწვავის ტუმბო', sub_ge: 'საწვავის მიწოდების ტუმბო და ელექტრული მართვის წრედი', color: '#f59e0b', baseRestPos: new THREE.Vector3(0,0.32,-1), explodeOffset: new THREE.Vector3(0.55,0.25,-0.5), matchingCodes: ['P0230', 'P0231', 'P0232', 'P0233', 'P0087'], focusCameraPos: new THREE.Vector3(0.45,0.72,-0.5), focusTargetPos: new THREE.Vector3(0,0.32,-1) },
    { id: 'intake_sensor', name_ge: 'ჰაერის სენსორი', sub_ge: 'შემავალი ჰაერის ტემპერატურის სენსორი', color: '#34d399', baseRestPos: new THREE.Vector3(0.54,0.6,1.72), explodeOffset: new THREE.Vector3(0.7,0.2,0.1), matchingCodes: ['P0110', 'P0111', 'P0112', 'P0113', 'P0114'], focusCameraPos: new THREE.Vector3(0.99,1.0,2.2199999999999998), focusTargetPos: new THREE.Vector3(0.54,0.6,1.72) },
    { id: 'knock_sensor', name_ge: 'დეტონაციის სენსორი', sub_ge: 'ძრავის დეტონაციის სენსორისა და მისი წრედის შემოწმება', color: '#c084fc', baseRestPos: new THREE.Vector3(-0.28,0.51,1.45), explodeOffset: new THREE.Vector3(-0.65,0.25,0.3), matchingCodes: ['P0325', 'P0326', 'P0327', 'P0328', 'P0330'], focusCameraPos: new THREE.Vector3(0.16999999999999998,0.91,1.95), focusTargetPos: new THREE.Vector3(-0.28,0.51,1.45) },
    { id: 'map_sensor', name_ge: 'წნევის სენსორი', sub_ge: 'შემშვები კოლექტორის წნევის სენსორი და ვაკუუმის სისტემა', color: '#a3e635', baseRestPos: new THREE.Vector3(0.26,0.7,1.18), explodeOffset: new THREE.Vector3(0.6,0.6,-0.2), matchingCodes: ['P0105', 'P0106', 'P0107', 'P0108', 'P0109'], focusCameraPos: new THREE.Vector3(0.71,1.1,1.68), focusTargetPos: new THREE.Vector3(0.26,0.7,1.18) },
  ], []);

  // Determine active fault for a component
  const getFaultForComponent = (comp: ComponentDef): DtcCode | undefined => {
    return dtcCodes.find(code =>
      comp.matchingCodes.some(m => code.code.toUpperCase().includes(m.toUpperCase()))
    );
  };

  // Synchronize target explode factor
  useEffect(() => {
    targetExplodeRef.current = explodeFactor;
  }, [explodeFactor]);

  // Three.js Scene Initialization
  useEffect(() => {
    if (!containerRef.current) return;

    const measuredW = containerRef.current.clientWidth || containerRef.current.parentElement?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 390);
    const width = Math.min(measuredW, typeof window !== 'undefined' ? window.innerWidth : measuredW);
    const height = containerRef.current.clientHeight || 540;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup (Perspective angle with generous podium breathing margin)
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.copy(width < 640 ? new THREE.Vector3(7.2, 3.2, 8.6) : new THREE.Vector3(5.6, 2.6, 6.7));
    const initialTarget = new THREE.Vector3(0, 0.75, 0);
    camera.lookAt(initialTarget);
    cameraRef.current = camera;

    // 3. Renderer with ACES Filmic Tone Mapping
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
    } catch {
      setModelError(true);setModelLoading(false);return;
    }
    renderer.setSize(width, height);
    renderer.domElement.style.maxWidth = '100%';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 640 ? 1.25 : 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // რეალისტური სტუდიური გარემოს ასახვა (PBR reflections მეტალზე/შუშაზე)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    // Softbox reflections are baked once into the existing environment texture.
    const softbox = (w:number,h:number,position:THREE.Vector3,target:THREE.Vector3,strength:number) => {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(1,.98,.95).multiplyScalar(strength),side:THREE.DoubleSide,toneMapped:false}));
      panel.position.copy(position); panel.lookAt(target); room.add(panel);
    };
    softbox(8,1.2,new THREE.Vector3(-3,5,1),new THREE.Vector3(0,0,0),3.0);
    softbox(6,.8,new THREE.Vector3(4,3,-2),new THREE.Vector3(0,1,0),2.3);
    const environmentTarget = pmrem.fromScene(room, 0.04);
    scene.environment = environmentTarget.texture;
    room.dispose();
    pmrem.dispose();

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(initialTarget);
    controls.minDistance = 2.0;
    controls.maxDistance = 22.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    // Default wheel zoom disabled so normal page scroll is never trapped!
    controls.enableZoom = isControlsUnlockedRef.current;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      targetCamPosRef.current = null;
      targetCamLookRef.current = null;
    });

    // Cooperative wheel & 2-finger touch handling on canvas container
    const domEl = containerRef.current;
    const onCanvasWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || isControlsUnlockedRef.current) {
        controls.enableZoom = true;
      } else {
        controls.enableZoom = false;
        setShowGestureHint(true);
        if (gestureHintTimerRef.current) clearTimeout(gestureHintTimerRef.current);
        gestureHintTimerRef.current = setTimeout(() => {
          setShowGestureHint(false);
        }, 1600);
      }
    };

    const onCanvasTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && !isControlsUnlockedRef.current) {
        // 1 finger without unlock: disable rotation so webpage scrolls smoothly!
        controls.enableRotate = false;
        setShowTwoFingerOverlay(true);
        if (twoFingerTimerRef.current) clearTimeout(twoFingerTimerRef.current);
        twoFingerTimerRef.current = setTimeout(() => setShowTwoFingerOverlay(false), 1600);
      } else if (e.touches.length >= 2 || isControlsUnlockedRef.current) {
        // 2 fingers (or unlocked): full interactive rotate & pinch-zoom!
        controls.enableRotate = true;
        controls.enableZoom = true;
        setShowTwoFingerOverlay(false);
      }
    };

    const onCanvasTouchMove = (e: TouchEvent) => {
      if (e.touches.length >= 2 || isControlsUnlockedRef.current) {
        controls.enableRotate = true;
        controls.enableZoom = true;
        setShowTwoFingerOverlay(false);
      }
    };

    const onCanvasTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        setShowTwoFingerOverlay(false);
        controls.enableRotate = true;
      }
    };

    if (domEl) {
      domEl.addEventListener('wheel', onCanvasWheel, { passive: true });
      domEl.addEventListener('touchstart', onCanvasTouchStart, { passive: true });
      domEl.addEventListener('touchmove', onCanvasTouchMove, { passive: true });
      domEl.addEventListener('touchend', onCanvasTouchEnd, { passive: true });
    }

    // 5. Studio Lighting Rig (Clean blueprint studio lighting)
    const ambientLight = new THREE.AmbientLight(0xd9efff, 0.65);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xf1fbff, 3.0);
    mainKeyLight.position.set(6, 12, 6);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    mainKeyLight.shadow.bias = -0.0002;
    mainKeyLight.shadow.normalBias = .015;
    mainKeyLight.shadow.radius = 2;
    mainKeyLight.shadow.camera.left = -4;
    mainKeyLight.shadow.camera.right = 4;
    mainKeyLight.shadow.camera.top = 4;
    mainKeyLight.shadow.camera.bottom = -4;
    scene.add(mainKeyLight);

    const softFillLight = new THREE.DirectionalLight(0xecf0ff, 1.7);
    softFillLight.position.set(-6, 5, -5);
    scene.add(softFillLight);

    const rimLight = new THREE.DirectionalLight(0xf0f5ff, 0.85);
    rimLight.position.set(4, 2, -6);
    scene.add(rimLight);

    // 6. High-Tech Blueprint Stage Floor (Matching the technical digital grid in photo)
    const stageGroup = new THREE.Group();

    // Dark spherical showroom with a suspended honeycomb light canopy.
    const backdropGeometry = new THREE.SphereGeometry(28, 64, 40);
    const backdropMaterial = new THREE.MeshStandardMaterial({ color: 0x17191e, roughness: .55, metalness: .25, side: THREE.BackSide });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.position.y = 1.2; scene.add(backdrop);
    // Constellation reference adapted to a spherical, dots-only showroom backdrop.
    // The reference dots run in the existing GPU scene, without a second animation loop.
    const dotPositions: number[] = [], dotColors: number[] = [];
    const warmGold = new THREE.Color(0xcaa95a), paleGold = new THREE.Color(0xe9dfc6);
    const dotRingCount = 68;
    for (let ring=0; ring<dotRingCount; ring++) {
      // Cover both hemispheres, including the floor-facing half. Mid-ring
      // sampling avoids duplicate points at the poles.
      const latitude = -Math.PI/2 + (ring+.5)/dotRingCount*Math.PI;
      const y = Math.sin(latitude) * 27 + 1.2;
      const radius = Math.cos(latitude) * 27;
      const columns = Math.max(8, Math.round(144*Math.cos(latitude)));
      for (let column=0; column<columns; column++) {
        const angle = (column + (ring%2)*.5) / columns * Math.PI*2;
        dotPositions.push(Math.cos(angle)*radius,y,Math.sin(angle)*radius);
        const color = (column+ring)%5===0 ? paleGold : warmGold;
        dotColors.push(color.r,color.g,color.b);
      }
    }
    const dotsGeometry = new THREE.BufferGeometry();
    dotsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(dotPositions,3));
    dotsGeometry.setAttribute('color',new THREE.Float32BufferAttribute(dotColors,3));
    const constellationUniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(-10, -10) },
      uHover: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.5) },
      uRippleTime: { value: 99.0 },
      uRippleStrength: { value: 0.0 }
    };
    const dotsMaterial = new THREE.ShaderMaterial({
      uniforms: constellationUniforms,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      vertexShader: `
        uniform float uTime, uHover, uPixelRatio, uRippleTime, uRippleStrength;
        uniform vec2 uPointer;
        varying vec3 vDotColor;
        varying float vOpacity;
        void main(){
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec2 screen = clip.xy / max(abs(clip.w), .001);
          vec2 delta = screen - uPointer;
          float distanceToPointer = length(delta);
          float influence = (1.0 - smoothstep(.02, .33, distanceToPointer)) * uHover;
          // Soft repulsion and return to the grid, matching the supplied reference.
          clip.xy += normalize(delta + vec2(.0001)) * influence * .055 * clip.w;
          
          // Concentric water-droplet ripples radiating outward from center ("გეგონება წვეთი ჩავარდა წყალში ეფექტით")
          float distFromCenter = length(vec2(position.x, position.y - 1.2));
          float waveFront = distFromCenter - (uRippleTime * 14.0);
          float rippleWave = sin(waveFront * 1.4) * exp(-abs(waveFront) * 0.26);
          float rippleDecay = clamp(1.0 - (uRippleTime / 2.8), 0.0, 1.0) * uRippleStrength;
          float finalRipple = rippleWave * rippleDecay;
          
          vec2 rippleDir = normalize(vec2(position.x, position.y - 1.2) + vec2(0.0001));
          clip.xy += rippleDir * (finalRipple * 0.055) * clip.w;

          float pulse = .5 + .5 * sin(uTime * 1.1 + position.x * .6 + position.y * .8);
          gl_Position = clip;
          gl_PointSize = (2.4 + pulse * .5 + influence * 1.8 + abs(finalRipple) * 5.0) * uPixelRatio;
          
          vec3 waterGlow = vec3(0.55, 0.85, 1.0);
          vDotColor = mix(mix(color, vec3(1.0, .77, .30), influence), waterGlow, clamp(finalRipple * 1.8, 0.0, 1.0));
          vOpacity = .34 + pulse * .18 + influence * .25 + clamp(finalRipple * 0.65, -0.15, 0.55);
        }`,
      fragmentShader: `
        varying vec3 vDotColor;
        varying float vOpacity;
        void main(){
          float radius = length(gl_PointCoord - vec2(.5));
          float alpha = (1.0 - smoothstep(.12, .5, radius)) * vOpacity;
          if (alpha < .015) discard;
          gl_FragColor = vec4(vDotColor, alpha);
        }`
    });
    const showroomDots=new THREE.Points(dotsGeometry,dotsMaterial);showroomDots.name='ShowroomConstellationDots';scene.add(showroomDots);

    const canopy = new THREE.Group();canopy.position.y=4.1;
    const neonCore = new THREE.MeshBasicMaterial({color:new THREE.Color(.91,.96,1).multiplyScalar(1.1),toneMapped:false});
    const neonHalo = new THREE.MeshBasicMaterial({color:0xfff3df,transparent:true,opacity:.045,depthWrite:false});
    const edges=new Set<string>();
    const neonTube=(a:THREE.Vector3,b:THREE.Vector3)=>{
      const midpoint=a.clone().add(b).multiplyScalar(.5),direction=b.clone().sub(a);
      const length=direction.length();direction.normalize();
      for(const [radius,material] of [[.014,neonCore],[.044,neonHalo]] as const){
        const tube=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,6),material);
        tube.position.copy(midpoint);tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);canopy.add(tube);
      }
    };
    const hexSize=.85;
    for(let q=-1;q<=1;q++)for(let r=-1;r<=1;r++){
      if(Math.abs(q+r)>1)continue;
      const cx=hexSize*1.5*q,cz=hexSize*Math.sqrt(3)*(r+q/2);
      const corners=Array.from({length:6},(_,i)=>new THREE.Vector3(cx+hexSize*Math.cos(i*Math.PI/3),0,cz+hexSize*Math.sin(i*Math.PI/3)));
      for(let i=0;i<6;i++){
        const a=corners[i],b=corners[(i+1)%6];
        const key=[a.toArray().map(v=>v.toFixed(3)).join(','),b.toArray().map(v=>v.toFixed(3)).join(',')].sort().join('|');
        if(!edges.has(key)){edges.add(key);neonTube(a,b);}
      }
    }
    scene.add(canopy);

    const podiumGeo = new THREE.CylinderGeometry(3.15, 3.28, .22, 72);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x172b38,
      roughness: 0.12,
      metalness: 0.85
    });
    const podiumSide = new THREE.MeshStandardMaterial({ color: 0x0c1721, roughness: .22, metalness: .8 });
    const podium = new THREE.Mesh(podiumGeo, [podiumSide, podiumMat, podiumSide]);
    podium.position.y = -.14;
    podium.castShadow = true;
    podium.receiveShadow = true;
    stageGroup.add(podium);

    // Subtle Digital Blueprint Grid on Stage
    const gridHelper = new THREE.GridHelper(5.2, 26, 0x94A3B8, 0xCBD5E1);
    gridHelper.position.y = 0.001;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    gridHelper.visible = false;
    stageGroup.add(gridHelper);

    // Warm Gold Outer Ring
    const goldRingGeo = new THREE.RingGeometry(3.145, 3.17, 72);
    const goldRingMat = new THREE.MeshBasicMaterial({ color: 0xc3c8d0, side: THREE.DoubleSide });
    const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
    goldRing.rotation.x = -Math.PI / 2;
    goldRing.position.y = -.025;
    goldRing.visible = true;
    stageGroup.add(goldRing);

    scene.add(stageGroup);
    // Bake these exact ceiling lights into paint/window reflections once.
    const showroomPmrem=new THREE.PMREMGenerator(renderer);
    const showroomEnvironment=showroomPmrem.fromScene(scene,.045,.1,30);
    scene.environment=showroomEnvironment.texture;showroomPmrem.dispose();
    const floorMirror=new Reflector(new THREE.CircleGeometry(3.14,72),{
      textureWidth:width<640?512:768,textureHeight:width<640?512:768,clipBias:.003,color:0x5e6067
    });
    floorMirror.rotation.x=-Math.PI/2;floorMirror.position.y=-.026;stageGroup.add(floorMirror);

    // Dynamic podium illumination light for exploded view showcase ("ქვედა ფონი აინთოს თეთრ სარკისებრი ეფექტის პოდიუმზე")
    const podiumLight = new THREE.PointLight(0xffffff, 0, 9, 1.4);
    podiumLight.position.set(0, 3.2, 0);
    scene.add(podiumLight);



    // 7. Master Automotive Model Hierarchy
    const carMasterGroup = new THREE.Group();
    carMasterGroupRef.current = carMasterGroup;
    scene.add(carMasterGroup);
    const fitWholeAssembly = () => {
      carMasterGroup.updateWorldMatrix(true, true);
      // Frame physical geometry only; screen-space labels must not feed back
      // into the camera fit as they follow its projection.
      const box = new THREE.Box3();
      carMasterGroup.traverse(node => {
        if (!(node instanceof THREE.Mesh) || node.name.startsWith('LaserSection_')) return;
        if (!node.geometry.boundingBox) node.geometry.computeBoundingBox();
        if (node.geometry.boundingBox) box.union(node.geometry.boundingBox.clone().applyMatrix4(node.matrixWorld));
      });
      if (box.isEmpty()) return;
      const center = box.getCenter(new THREE.Vector3());
      const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
      const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
      const direction = new THREE.Vector3(.85, .6, 1).normalize();
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
      const up = new THREE.Vector3().crossVectors(direction, right).normalize();
      let distance = 0;
      for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
        const corner = new THREE.Vector3(x ? box.max.x : box.min.x, y ? box.max.y : box.min.y, z ? box.max.z : box.min.z).sub(center);
        distance = Math.max(distance, corner.dot(direction) + Math.max(Math.abs(corner.dot(right)) / Math.tan(horizontal), Math.abs(corner.dot(up)) / Math.tan(vertical)));
      }
      distance *= 1.32;
      targetCamLookRef.current = center;
      targetCamPosRef.current = center.clone().addScaledVector(direction, distance);
      controls.maxDistance = Math.max(22, distance * 1.2);
    };

    // =========================================================================
    // A. LOAD GHOST CAR MODEL (Blender GLB) + WIRE UP SUBSYSTEM GROUPS
    //    ანიმაცია/დაშლა/ანთება იგივე groupsRef/materialsRef/lightsRef-ზე მუშაობს
    // =========================================================================
    const steelDarkMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.35 });

    // ბორბლების კუთხეები აპის კოორდინატებში (ციკლი ამ x-ებს სრიალებს გვერდზე)
    const wheelCorners = [
      { id: 'fl', x: 0.80, z: 1.53, isRight: true },
      { id: 'fr', x: -0.80, z: 1.53, isRight: false },
      { id: 'rl', x: 0.80, z: -1.32, isRight: true },
      { id: 'rr', x: -0.80, z: -1.32, isRight: false }
    ];

    const baseOf = (id: string): THREE.Vector3 =>
      componentsList.find(c => c.id === id)?.baseRestPos.clone() || new THREE.Vector3();

    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    dracoLoader.setDecoderPath(`${cleanBase}draco/`);
    dracoLoader.setWorkerLimit(2);
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(dracoLoader);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visual = {
      fill: { value: 0 }, lift: { value: 0 },
      scanZ: { value: -2.6 }, scanStrength: { value: 0 },
      carInverse: { value: new THREE.Matrix4() },
      fillOrigin: { value: new THREE.Vector3(0, .5, 1.1) }, fillReach: { value: 4.0 }

    };
    const ghostColor = new THREE.Color(0xaecbe6);
    const applySurfaceEffects = (mat: THREE.MeshStandardMaterial, body: boolean, paintLayer = false) => {
      const solidColor = new THREE.Color(mat.userData.solidColor ?? 0x91b6db);
      mat.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, {
          uFill: visual.fill, uLift: visual.lift, uScanZ: visual.scanZ,
          uFillOrigin: visual.fillOrigin, uFillReach: visual.fillReach,
          uScanStrength: visual.scanStrength, uCarInverse: visual.carInverse,
          uGhostColor: { value: mat.userData.ghostColor ? new THREE.Color(mat.userData.ghostColor) : ghostColor }, uPaintColor: { value: solidColor },
          uGhostAlpha: { value: mat.userData.ghostOpacity ?? .26 },
          uSolidRoughness: { value: mat.userData.solidRoughness ?? .30 },
          uSolidMetalness: { value: mat.userData.solidMetalness ?? .40 }
        });
        shader.vertexShader = 'uniform mat4 uCarInverse; varying vec3 vCarSurface;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvCarSurface = (uCarInverse * modelMatrix * vec4(transformed, 1.0)).xyz;');
        shader.fragmentShader = `uniform float uFill, uLift, uScanZ, uScanStrength, uGhostAlpha, uSolidRoughness, uSolidMetalness, uFillReach;
          uniform vec3 uGhostColor, uPaintColor, uFillOrigin; varying vec3 vCarSurface;\n` + shader.fragmentShader;
        if (body) {
          shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
            vec3 fillPoint = vCarSurface - vec3(0.0, uLift, 0.0);
            float waveDistance = distance(fillPoint, uFillOrigin);
            float waveRadius = uFill * (uFillReach + .18);
            float painted = 1.0 - smoothstep(waveRadius - .12, waveRadius + .12, waveDistance);
            if (uFill <= .001) painted = 0.0;
            if (uFill >= .999) painted = 1.0;
            float surfaceAlpha = clamp(diffuseColor.a / max(opacity, .001), 0.0, 1.0);
            vec3 solidSurface = ${mat.userData.keepSurfaceColor ? 'diffuseColor.rgb * uPaintColor' : 'uPaintColor'};
            diffuseColor.rgb = mix(uGhostColor, solidSurface, painted);
            diffuseColor.a = surfaceAlpha * mix(uGhostAlpha, 1.0, painted);
            diffuseColor.a *= 1.0 - exp(-pow((vCarSurface.z - uScanZ) / .18, 2.0)) * uScanStrength * .85 * (1.0 - painted);`);
          shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(.13, uSolidRoughness, painted);');
          shader.fragmentShader = shader.fragmentShader.replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(.03, uSolidMetalness, painted);');
        }
        shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
          float scanBand = exp(-pow((vCarSurface.z - uScanZ) / .035, 2.0));
          float scanHalo = exp(-pow((vCarSurface.z - uScanZ) / .25, 2.0));
          outgoingLight += (vec3(.72, .93, 1.0) * scanBand * 1.6 + vec3(.06, .32, .60) * scanHalo * .32) * uScanStrength;
          #include <opaque_fragment>`);
      };
      mat.customProgramCacheKey = () => body ? (mat.userData.keepSurfaceColor ? 'autohub-single-native-v1' : 'autohub-single-paint-v1') : 'autohub-surface-scan-v3';
      mat.needsUpdate = true;
    };
    // A restrained volumetric light sheet moves through the whole vehicle.
    // Keep it outside the car hierarchy so camera framing ignores the effect.
    const laserRig = new THREE.Group();
    scene.add(laserRig);
    const laserMaterial = new THREE.ShaderMaterial({
      uniforms: { uStrength: visual.scanStrength },
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uStrength; varying vec2 vUv;
        void main() {
          float horizontal = pow(max(0.0, 1.0 - abs(vUv.x * 2.0 - 1.0)), .45);
          float vertical = smoothstep(0.0, .12, vUv.y) * (1.0 - smoothstep(.80, 1.0, vUv.y));
          float lowGlow = exp(-vUv.y * 4.0) * .04;
          float alpha = (horizontal * vertical * .055 + lowGlow * horizontal) * uStrength;
          gl_FragColor = vec4(.16, .64, 1.0, alpha);
        }`
    });
    const laserSheet = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 2.4), laserMaterial);
    laserSheet.position.y = 1.20;
    laserRig.add(laserSheet);
    const traceMaterial = new THREE.LineBasicMaterial({ color: 0x8edfff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    const traceGeometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.55, .035, 0), new THREE.Vector3(1.55, .035, 0)]);
    const laserTrace = new THREE.Line(traceGeometry, traceMaterial);
    laserRig.add(laserTrace);
    const laserLight = new THREE.PointLight(0x6bcfff, 0, 3.2, 2);
    laserLight.position.set(0, 1.75, 0);
    laserRig.add(laserLight);

    const scanLayerMaterial = new THREE.ShaderMaterial({
      uniforms: { uCarInverse: visual.carInverse, uScanZ: visual.scanZ, uStrength: visual.scanStrength },
      transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      vertexShader: `uniform mat4 uCarInverse; varying vec3 vCarP; varying vec3 vViewN;
        void main() { vCarP = (uCarInverse * modelMatrix * vec4(position, 1.0)).xyz;
          vViewN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uScanZ, uStrength; varying vec3 vCarP; varying vec3 vViewN;
        void main() {
          float band = exp(-pow((vCarP.z - uScanZ) / .10, 2.0));
          if (band * uStrength < .015) discard;
          float edge = pow(1.0 - abs(normalize(vViewN).z), 1.8);
          gl_FragColor = vec4(.25, .76, 1.0, band * uStrength * (.06 + edge * .30));
        }`
    });
    const scanLayerMeshes: THREE.Mesh[] = [];
    const engineParts: { node: THREE.Group; rest: THREE.Vector3; offset: THREE.Vector3 }[] = [];
    const wheelParts: { node: THREE.Group; rest: THREE.Vector3; offset: THREE.Vector3 }[] = [];
    let windowMaterial: THREE.MeshPhysicalMaterial | null = null;
    let headlightMat: THREE.MeshStandardMaterial | null = null;
    let taillightMat: THREE.MeshStandardMaterial | null = null;
    let disposed = false;
    let firstModelFramePending = false;

    const hoverParts = new Map<THREE.Mesh, string>();
    const namedPartRoots = new Map<THREE.Object3D, string>();
    const labelPart = (parent: THREE.Object3D, text: string, _lift = .18) => {
      namedPartRoots.set(parent, text);
    };
    const cabinParts: { group: THREE.Group; side: number; rear: boolean }[] = [];
    const tooltip = document.createElement('div');
    tooltip.setAttribute('role', 'tooltip'); tooltip.dataset.partTooltip = 'true';
    Object.assign(tooltip.style, {
      position:'absolute',display:'none',pointerEvents:'none',zIndex:'30',
      padding:'5px 8px',borderRadius:'7px',fontSize:'11px',fontWeight:'500',lineHeight:'1.4',
      maxWidth:'190px',color:'#f1f0eb',background:'rgba(15,23,42,.88)',
      border:'1px solid rgba(202,169,90,.22)',boxShadow:'0 2px 7px rgba(0,0,0,.12)',
      whiteSpace:'normal'
    });
    containerRef.current!.appendChild(tooltip);
    const hoverPointer = new THREE.Vector2();
    const hoverRay = new THREE.Raycaster();
    let hoverInside=false, hoverDragging=false, hoverX=0, hoverY=0, lastHoverCheck=0;
    let downPos = { x: 0, y: 0 };
    const hideHover = () => { hoverInside=false; tooltip.style.display='none'; };
    const onHoverMove = (event: PointerEvent) => {
      if(event.pointerType==='touch'||event.buttons||hoverDragging){hideHover();return;}
      const rect=renderer.domElement.getBoundingClientRect();
      hoverX=event.clientX-rect.left;hoverY=event.clientY-rect.top;
      hoverPointer.set(hoverX/rect.width*2-1,-hoverY/rect.height*2+1);hoverInside=true;
    };
    const onHoverDown = (event: PointerEvent) => {
      downPos = { x: event.clientX, y: event.clientY };
      hoverDragging = true;
    };
    const onHoverUp = (event: PointerEvent) => {
      const dist = Math.hypot(event.clientX - downPos.x, event.clientY - downPos.y);
      hoverDragging = false;
      if (dist > 8) {
        hideHover();
      } else {
        onHoverMove(event);
      }
    };
    renderer.domElement.addEventListener('pointermove',onHoverMove);
    renderer.domElement.addEventListener('pointerleave',hideHover);
    renderer.domElement.addEventListener('pointerdown',onHoverDown);
    window.addEventListener('pointerup',onHoverUp);
    window.addEventListener('blur',hideHover);
    const processLoadedGltf = (gltf: any) => {
      const root = gltf.scene.clone(true);
      if (disposed) return;
      // Assemble at the final transform. World-space attachments made while the
      // entrance group is scaled to 0.18 would grow 5.56x when it reaches 1.
      carMasterGroup.position.set(0, 0, 0);
      carMasterGroup.scale.set(1, 1, 1);
      carMasterGroup.rotation.set(0, -0.30, 0);
      carMasterGroup.updateWorldMatrix(true, true);
      root.rotation.y = Math.PI; // Blender-ის წინა მხარე -> three +Z
      carMasterGroup.add(root);
      root.updateWorldMatrix(true, true);

      const meshesOf = (name: string): THREE.Mesh[] => {
        const node = root.getObjectByName(name);
        const out: THREE.Mesh[] = [];
        if (node) node.traverse((o: any) => { if (o.isMesh) out.push(o as THREE.Mesh); });
        return out;
      };

      // --- შიდა აგრეგატები: იშლება და ინთება ---
      const subsystems: { id: string; src: string[] }[] = [
        { id: 'engine', src: ['engine'] },
        { id: 'ecu', src: ['ecu'] },
        { id: 'exhaust', src: ['exhaust'] },
        { id: 'cooling', src: ['cooling'] },
        { id: 'suspension', src: ['Suspension', 'drivetrain'] },
        { id: 'battery', src: ['battery'] },
        { id: 'ignition_coil', src: ['ignition_coil'] },
        { id: 'oxygen_sensor', src: ['oxygen_sensor'] },
        { id: 'coolant_sensor', src: ['coolant_sensor'] },
        { id: 'throttle_sensor', src: ['throttle_sensor'] },
        { id: 'fuel_injectors', src: ['fuel_injectors'] },
        { id: 'fuel_pump', src: ['fuel_pump'] },
        { id: 'intake_sensor', src: ['intake_sensor'] },
        { id: 'knock_sensor', src: ['knock_sensor'] },
        { id: 'map_sensor', src: ['map_sensor'] }
      ];
      subsystems.forEach(({ id, src }) => {
        const grp = new THREE.Group();
        grp.position.copy(baseOf(id));
        carMasterGroup.add(grp);
        groupsRef.current[id] = grp;

        const comp = componentsList.find(c => c.id === id);
        const mats: THREE.MeshStandardMaterial[] = [];
        src.forEach(nm => meshesOf(nm).forEach(m => {
          const cloned = (m.material as THREE.MeshStandardMaterial).clone();
          m.material = cloned;
          mats.push(cloned);
          m.castShadow = true;
          grp.attach(m);
        }));
        glowMatsRef.current[id] = mats;
        if (mats[0]) materialsRef.current[id] = mats[0];

        const light = new THREE.PointLight(comp ? new THREE.Color(comp.color) : new THREE.Color(0xffffff), 0, 2.6);
        light.position.copy(baseOf(id));
        carMasterGroup.add(light);
        lightsRef.current[id] = light;
      });

      const cooling = groupsRef.current.cooling;
      const fans: THREE.Group[] = [];
      if (cooling) {
        const coolingMeshes: THREE.Mesh[] = [];
        cooling.traverse(node => { if (node instanceof THREE.Mesh && /^cooling(?:_\d+)?$/.test(node.name)) coolingMeshes.push(node); });
        [-1,1].forEach(side => { const fan = new THREE.Group(); fan.name = side > 0 ? 'CoolingFanLeft' : 'CoolingFanRight'; cooling.add(fan); fans.push(fan); });
        coolingMeshes.forEach(mesh => {
          const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
          const positions=geometry.getAttribute('position'), count=positions.count/3;
          const parents=Array.from({length:count},(_,i)=>i);
          const find=(i:number):number=>{while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;};
          const welded=new Map<string,number>();
          for(let i=0;i<positions.count;i++){
            const key=[positions.getX(i),positions.getY(i),positions.getZ(i)].map(v=>Math.round(v*10000)).join(',');
            const other=welded.get(key), triangle=Math.floor(i/3);
            if(other===undefined)welded.set(key,triangle);else parents[find(triangle)]=find(other);
          }
          const bounds=new Map<number,THREE.Box3>(),point=new THREE.Vector3();
          for(let i=0;i<positions.count;i++){
            const key=find(Math.floor(i/3));if(!bounds.has(key))bounds.set(key,new THREE.Box3());
            point.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);carMasterGroup.worldToLocal(point);bounds.get(key)!.expandByPoint(point);
          }
          const sideByIsland=new Map<number,number>();
          bounds.forEach((box,key)=>{
            const size=box.getSize(new THREE.Vector3());
            // Whole, disconnected motor and blade islands lie on either side of the centre.
            if(size.x<.4&&size.y<.4&&box.min.y>.27&&box.max.y<.65&&box.min.z>2.065&&box.max.z<2.15){
              if(box.max.x<0)sideByIsland.set(key,0);else if(box.min.x>0)sideByIsland.set(key,1);
            }
          });
          const keep:number[]=[],split:[number[],number[]]=[[],[]];
          for(let i=0;i<positions.count;i+=3){const side=sideByIsland.get(find(i/3));(side===undefined?keep:split[side]).push(i,i+1,i+2);}
          const subset=(ids:number[])=>{const out=geometry.clone();out.clearGroups();out.setIndex(ids);return out;};
          split.forEach((ids,index)=>{
            if(!ids.length)return;
            const piece=new THREE.Mesh(subset(ids),mesh.material);piece.position.copy(mesh.position);piece.quaternion.copy(mesh.quaternion);piece.scale.copy(mesh.scale);
            mesh.parent!.add(piece);fans[index].attach(piece);piece.castShadow=true;
          });
          mesh.geometry=subset(keep);geometry.dispose();
        });
        fans.forEach((fan,index)=>{
          const side=index===0?-1:1;
          engineParts.push({node:fan,rest:fan.position.clone(),offset:new THREE.Vector3(side*.58,.12,.75)});
          labelPart(fan,side>0?'მარცხენა ვენტილატორი':'მარჯვენა ვენტილატორი',side>0?.35:.12);
        });
      }

      // Keep the material surfaces of each downloaded physical part together.
      const engineGroup = groupsRef.current.engine;
      if (engineGroup) {
        engineGroup.updateWorldMatrix(true, true);
        const engineCenter = engineGroup.worldToLocal(new THREE.Box3().setFromObject(engineGroup).getCenter(new THREE.Vector3()));
        const physicalParts = new Map<string, THREE.Group>();
        [...engineGroup.children].forEach(node => {
          if (!(node instanceof THREE.Mesh)) return;
          const source = String(node.userData.source_object || node.name);
          const key = source.replace(/_(?:Metall\d+|Trenie_C|Plastic\d+|plastic\d+|Collector|Metal_Paint|Filter|Ceramic|Procladka|Remen)_0(?:\.\d+)?$/i, '');
          let part = physicalParts.get(key);
          if (!part) {
            part = new THREE.Group();
            part.name = `EnginePart_${key}`;
            engineGroup.add(part);
            physicalParts.set(key, part);
          }
          part.attach(node);
        });
        physicalParts.forEach(part => {
          const center = engineGroup.worldToLocal(new THREE.Box3().setFromObject(part).getCenter(new THREE.Vector3()));
          const offset = center.sub(engineCenter).multiply(new THREE.Vector3(2.2, 2.0, 1.4));
          // Lift upper assemblies and lower the sump to reveal the engine block.
          offset.y += offset.y >= 0 ? .18 : -.12;
          engineParts.push({ node: part, rest: part.position.clone(), offset });
        });
      }

      // Four mirrored stacks: strut → caliper → brake disc → rim → tire.
      const brakeMats: THREE.MeshStandardMaterial[] = [];
      wheelCorners.forEach(corner => {
        const side = Math.sign(corner.x);
        const axle = corner.z > 0 ? 1 : -1;
        const makePart = (name: string, offset: THREE.Vector3) => {
          const group = new THREE.Group();
          group.name = `${name}_${corner.id.toUpperCase()}`;
          group.position.set(corner.x, .33, corner.z);
          carMasterGroup.add(group);
          wheelParts.push({ node: group, rest: group.position.clone(), offset });
          return group;
        };
        const rim = makePart('Rim', new THREE.Vector3(side * 1.12, .05, axle * .28));
        const tire = rim;
        const disc = makePart('BrakeDisc', new THREE.Vector3(side * .65, .05, axle * .28));
        const caliper = makePart('BrakeCaliper', new THREE.Vector3(side * .34, .23, axle * .46));
        const strut = makePart('Coilover', new THREE.Vector3(side * .24, .65, axle * .28));
        groupsRef.current[`wheel_${corner.id}`] = rim;
        const suffix = corner.id.toUpperCase();
        [...meshesOf('Wheel_' + suffix), ...meshesOf('Tire_' + suffix)].forEach(mesh => {
          mesh.castShadow = true;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          const isTire = materials.some(material => /tire|rubber/i.test(material.name));
          (isTire ? tire : rim).attach(mesh);
        });
        meshesOf('Brakes_' + suffix).forEach(mesh => {
          const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material])
            .map(material => (material as THREE.MeshStandardMaterial).clone());
          mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
          brakeMats.push(...materials);
          const isCaliper = /caliper/i.test(mesh.name) || materials.some(material => /caliper/i.test(material.name));
          (isCaliper ? caliper : disc).attach(mesh);
        });
        const coilovers: THREE.Mesh[] = [];
        groupsRef.current.suspension?.traverse(node => {
          if (node instanceof THREE.Mesh && node.name.startsWith('BMW_Coilover_' + suffix)) coilovers.push(node);
        });
        coilovers.forEach(mesh => strut.attach(mesh));
      });
      glowMatsRef.current.brakes = brakeMats;
      const brakesLight = new THREE.PointLight(0xffb703, 0, 2.6);
      brakesLight.position.copy(baseOf('brakes'));
      carMasterGroup.add(brakesLight);
      lightsRef.current.brakes = brakesLight;

      // --- გამჭვირვალე მინის კორპუსი ---
      const bodyGrp = new THREE.Group();
      carMasterGroup.add(bodyGrp);
      groupsRef.current['body'] = bodyGrp;
      // Mirror pieces were merged into paint, plastic and translucent cabin meshes.
      // Keep their original geometry, but give both housings one consistent finish.
      const mirrorHousingMaterial = new THREE.MeshPhysicalMaterial({
        color:0x0c1014,roughness:.38,metalness:.03,clearcoat:.45,clearcoatRoughness:.18,envMapIntensity:.35,side:THREE.DoubleSide
      });
      const mirrorGroups=['Body_Paint','Body_Trim','Body_Interior'];
      for(const groupName of mirrorGroups)for(const mesh of meshesOf(groupName)){
        if(Array.isArray(mesh.material))continue;
        const geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
        const positions=geometry.getAttribute('position');
        const keep:number[]=[],mirrors:number[]=[];
        const point=new THREE.Vector3();
        for(let i=0;i<positions.count;i+=3){
          point.set(0,0,0);
          for(let j=0;j<3;j++)point.add(new THREE.Vector3().fromBufferAttribute(positions,i+j).applyMatrix4(mesh.matrixWorld));
          point.multiplyScalar(1/3);
          carMasterGroup.worldToLocal(point);
          const mirror=Math.abs(point.x)>.84&&Math.abs(point.x)<1.15&&point.y>.88&&point.y<1.2&&point.z>.30&&point.z<.72;
          (mirror?mirrors:keep).push(i,i+1,i+2);
        }
        if(mirrors.length){
          const mirrorGeometry=geometry.clone();mirrorGeometry.clearGroups();mirrorGeometry.setIndex(mirrors);
          const mirrorMesh=new THREE.Mesh(mirrorGeometry,mirrorHousingMaterial);
          mirrorMesh.name='OriginalMirrorHousing_'+mesh.name;
          mirrorMesh.matrix.copy(mesh.matrix);mirrorMesh.matrix.decompose(mirrorMesh.position,mirrorMesh.quaternion,mirrorMesh.scale);
          mesh.parent?.add(mirrorMesh);bodyGrp.attach(mirrorMesh);mirrorMesh.castShadow=true;
          const rest=geometry.clone();rest.clearGroups();rest.setIndex(keep);rest.computeBoundingSphere();
          mesh.geometry=rest;
        }
        geometry.dispose();
      }

      const ghostGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xaecbe6, transmission: 0.0, opacity: 0.26, transparent: true,
        roughness: 0.14, ior: 1.45, metalness: 0.05, clearcoat: 1.0, depthWrite: false
      });
      ghostGlassMat.userData.ghostOpacity = 0.26;
      ghostGlassMat.userData.solidColor = 0xe5e8eb; // Pearl white automotive lacquer
      bodyMaterialsRef.current = [ghostGlassMat];
      meshesOf('Body_Paint').forEach(mesh => {
        const native = mesh.material as THREE.MeshStandardMaterial;
        const glass = ghostGlassMat.clone();
        glass.side = THREE.FrontSide; // Mirror housings are separate; do not paint inward-facing body surfaces.
        glass.normalMap = native.normalMap;
        glass.normalScale.copy(native.normalScale).multiplyScalar(.18);
        glass.userData.solidRoughness = .19;
        glass.userData.solidMetalness = .36;
        mesh.material = glass;
        bodyMaterialsRef.current.push(glass);
        bodyGrp.attach(mesh);
      });
      // წინა ცხაური (BMW M Kidney Grille — თანაბარი ქარხნული პრიალა შავი შეფერილობა)
      meshesOf('Body_Grille').forEach(mesh => {
        const native = mesh.material as THREE.MeshStandardMaterial;
        const material = new THREE.MeshPhysicalMaterial({
          color: 0x0e1014,
          roughness: 0.20,
          metalness: 0.12,
          clearcoat: 0.85,
          clearcoatRoughness: 0.10,
          side: THREE.DoubleSide
        });
        if (native && native.map) material.map = native.map;
        if (native && native.normalMap) {
          material.normalMap = native.normalMap;
          material.normalScale.copy(native.normalScale);
        }
        material.userData = {
          ghostOpacity: 0.18,
          solidColor: 0x0e1014,
          keepSurfaceColor: false,
          solidRoughness: 0.20,
          solidMetalness: 0.12
        };
        mesh.material = material;
        bodyMaterialsRef.current.push(material);
        bodyGrp.attach(mesh);
      });

      // ძარის დეკორატიული ელემენტები (M-Sport Shadowline Trim / Diffuser)
      meshesOf('Body_Trim').forEach(mesh => {
        const native = mesh.material as THREE.MeshStandardMaterial;
        const material = new THREE.MeshPhysicalMaterial({
          color: 0x14171c,
          roughness: 0.36,
          metalness: 0.05,
          clearcoat: 0.45,
          clearcoatRoughness: 0.20
        });
        if (native && native.map) material.map = native.map;
        material.userData = {
          ghostOpacity: 0.14,
          solidColor: 0x14171c,
          keepSurfaceColor: false,
          solidRoughness: 0.36,
          solidMetalness: 0.05
        };
        mesh.material = material;
        bodyMaterialsRef.current.push(material);
        bodyGrp.attach(mesh);
      });

      // მინები — ავთენტური ქარხნული ტონირებული საავტომობილო მინა (საქარე მინა/ფანჯრები)
      const windowMat = new THREE.MeshPhysicalMaterial({
        color: 0x16202c,
        transmission: 0.12,
        opacity: 0.72,
        transparent: true,
        roughness: 0.06,
        ior: 1.52,
        metalness: 0.08,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        depthWrite: true,
        side: THREE.DoubleSide
      });
      windowMat.userData = {
        ghostOpacity: 0.35,
        solidColor: 0x16202c,
        keepSurfaceColor: true,
        solidRoughness: 0.06,
        solidMetalness: 0.08
      };
      windowMaterial = windowMat;
      meshesOf('Body_Glass').forEach(m => {
        // The downloaded model includes its roof panel in the glass mesh.
        // Keep the panoramic roof black, separate from white paint and windows.
        const geometry = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        const positions = geometry.getAttribute('position');
        const roof: number[] = [], windows: number[] = [];
        // Split only complete connected glass panes, never cut triangles at a Z threshold.
        const count=positions.count/3;
        const parent=Array.from({length:count},(_,i)=>i);
        const find=(i:number):number=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
        const join=(a:number,b:number)=>{parent[find(a)]=find(b);};
        const welded=new Map<string,number>();
        for(let i=0;i<positions.count;i++){
          const key=[positions.getX(i),positions.getY(i),positions.getZ(i)].map(v=>Math.round(v*10000)).join(',');
          const triangle=Math.floor(i/3),other=welded.get(key);
          if(other===undefined)welded.set(key,triangle);else join(triangle,other);
        }
        const bounds=new Map<number,THREE.Box3>();
        const point=new THREE.Vector3();
        for(let i=0;i<positions.count;i++){
          const group=find(Math.floor(i/3));
          let box=bounds.get(group);if(!box){box=new THREE.Box3();bounds.set(group,box);}
          point.fromBufferAttribute(positions,i).applyMatrix4(m.matrixWorld);box.expandByPoint(point);
        }
        const roofGroups=new Set<number>();
        bounds.forEach((box,group)=>{
          const size=box.getSize(new THREE.Vector3());
          if(box.min.y>1.20&&size.x>.6&&size.z>.7)roofGroups.add(group);
        });
        for(let i=0;i<positions.count;i+=3){
          const list=roofGroups.has(find(i/3))?roof:windows;
          list.push(i,i+1,i+2);
        }
        const subset = (ids: number[]) => {
          const out = new THREE.BufferGeometry();
          Object.entries(geometry.attributes).forEach(([name, attribute]) => {
            const attr = attribute as THREE.BufferAttribute;
            const values = new (attr.array.constructor as any)(ids.length * attr.itemSize);
            ids.forEach((index, n) => { for (let c = 0; c < attr.itemSize; c++) values[n * attr.itemSize + c] = attr.array[index * attr.itemSize + c]; });
            out.setAttribute(name, new THREE.BufferAttribute(values, attr.itemSize, attr.normalized));
          });
          out.computeBoundingSphere();
          return out;
        };
        if (roof.length) {
          const roofGlass = new THREE.MeshPhysicalMaterial({color:0x080c12,roughness:.16,metalness:.05,clearcoat:1,clearcoatRoughness:.1,side:THREE.DoubleSide});
          roofGlass.userData = { ghostOpacity: .12, solidColor: 0x080c12,
            keepSurfaceColor: true, solidRoughness: .16, solidMetalness: .05 };
          bodyMaterialsRef.current.push(roofGlass);
          const roofMesh = new THREE.Mesh(subset(roof), roofGlass);
          roofMesh.name = 'BMW_Roof_Panel';
          roofMesh.matrix.copy(m.matrix); roofMesh.matrix.decompose(roofMesh.position, roofMesh.quaternion, roofMesh.scale);
          m.parent?.add(roofMesh); bodyGrp.attach(roofMesh);
        }
        if (windows.length) {
          m.geometry = subset(windows);
        }
        geometry.dispose();
        m.material = windowMat; bodyGrp.attach(m);
      });

      const headLensMat = new THREE.MeshPhysicalMaterial({color: 0xe6eef2, transparent: true, opacity: .16, roughness: .05, metalness: 0, clearcoat: 1, ior: 1.49, depthWrite: false});
      const tailLensMat = new THREE.MeshPhysicalMaterial({color: 0x9e101c, transparent: true, opacity: .55, roughness: .13, metalness: 0, clearcoat: 1, ior: 1.49, depthWrite: false});
      meshesOf('Headlight_Lenses').forEach(m => {m.material = headLensMat; bodyGrp.attach(m);});
      meshesOf('Taillight_Lenses').forEach(m => {m.material = tailLensMat; bodyGrp.attach(m);});

      // სალონი — მუქი (მინაში ჩანს)
      const interiorMat = new THREE.MeshPhysicalMaterial({ color: 0xb8daee, transparent: true, opacity: 0.10, transmission: 0, roughness: 0.08, metalness: 0.02, clearcoat: 1, depthWrite: false });
      interiorMat.userData.ghostOpacity = 0.10;
      interiorMat.userData.solidColor = 0x17202a;
      bodyMaterialsRef.current.push(interiorMat);
      // Keep upholstery, dashboard and small-detail textures instead of flattening them.
      const attachNativeDetail = (mesh:THREE.Mesh) => {
        const originals = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const materials = originals.map(original => {
          const native = original as THREE.MeshStandardMaterial;
          const material = new THREE.MeshPhysicalMaterial();
          THREE.MeshStandardMaterial.prototype.copy.call(material,native);
          material.transparent=true;material.opacity=.38;material.depthWrite=false;
          material.clearcoat=.08;material.clearcoatRoughness=.3;
          material.userData={ghostOpacity:.38,solidColor:0xffffff,keepSurfaceColor:true,
            solidRoughness:Math.max(.35,native.roughness ?? .6),solidMetalness:native.metalness ?? 0};
          bodyMaterialsRef.current.push(material);
          return material;
        });
        mesh.material=Array.isArray(mesh.material)?materials:materials[0];
        mesh.castShadow=true;mesh.receiveShadow=true;bodyGrp.attach(mesh);
      };
      // Fine, restrained leather grain shared by all upholstery surfaces.
      const grainCanvas = document.createElement('canvas'); grainCanvas.width = grainCanvas.height = 128;
      const grainCtx = grainCanvas.getContext('2d')!;
      const grain = grainCtx.createImageData(128,128);
      let grainSeed = 173;
      for (let i = 0; i < grain.data.length; i += 4) {
        grainSeed = (Math.imul(grainSeed,1664525) + 1013904223) >>> 0;
        const value = 110 + (grainSeed >>> 27);
        grain.data[i] = grain.data[i+1] = grain.data[i+2] = value; grain.data[i+3] = 255;
      }
      grainCtx.putImageData(grain,0,0);
      const leatherGrain = new THREE.CanvasTexture(grainCanvas);
      leatherGrain.wrapS = leatherGrain.wrapT = THREE.RepeatWrapping; leatherGrain.repeat.set(8,8);
      const leather = new THREE.MeshPhysicalMaterial({ color: 0x141619, roughness: .58, metalness: 0,
        clearcoat: .08, clearcoatRoughness: .55, sheen: .22, sheenColor: new THREE.Color(0x34383d),
        bumpMap: leatherGrain, bumpScale: .0012, side: THREE.DoubleSide });
      leather.userData = { keepSurfaceColor: true, solidColor: 0xffffff,
        ghostColor: 0x171b21, ghostOpacity: .72, solidRoughness: .58, solidMetalness: 0 };
      bodyMaterialsRef.current.push(leather);
      const seatGroups = new Map<string, THREE.Group>();
      const addSeat = (mesh: THREE.Mesh, side: number, rear = false) => {
        const key = rear ? 'rear_bench' : side > 0 ? 'seat_left' : 'seat_right';
        let group = seatGroups.get(key);
        if (!group) {
          group = new THREE.Group(); group.name = key; carMasterGroup.add(group);
          seatGroups.set(key, group);
          labelPart(group, rear ? 'უკანა სავარძლები' : side > 0 ? 'მარცხენა სავარძელი' : 'მარჯვენა სავარძელი');
          cabinParts.push({ group, side, rear });
        }
        group.attach(mesh);
      };
      meshesOf('Body_Interior').forEach(mesh => {
        attachNativeDetail(mesh);
        // Separate whole connected upholstery islands, rather than slicing triangles.
        const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
        const positions = geometry.getAttribute('position');
        const parent = Array.from({length: positions.count / 3}, (_, i) => i);
        const find = (i: number): number => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
        const welded = new Map<string, number>();
        for (let i = 0; i < positions.count; i++) {
          const key = [positions.getX(i),positions.getY(i),positions.getZ(i)].map(v => Math.round(v * 10000)).join(',');
          const other = welded.get(key), triangle = Math.floor(i / 3);
          if (other === undefined) welded.set(key, triangle); else parent[find(triangle)] = find(other);
        }
        const bounds = new Map<number, THREE.Box3>(); const point = new THREE.Vector3();
        for (let i = 0; i < positions.count; i++) {
          const key = find(Math.floor(i / 3));
          if (!bounds.has(key)) bounds.set(key, new THREE.Box3());
          point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld);
          carMasterGroup.worldToLocal(point); bounds.get(key)!.expandByPoint(point);
        }
        const seatSide = new Map<number, number>();
        bounds.forEach((box, key) => {
          const front = box.min.y >= .30 && box.max.y <= 1.30 && box.min.z >= -.50 && box.max.z <= .35;
          if (front && box.min.x >= .105 && box.max.x <= .65) seatSide.set(key, 1);
          if (front && box.max.x <= -.105 && box.min.x >= -.65) seatSide.set(key, -1);
          // The rear bench is a single continuous mesh, so keep it intact.
          if (box.min.y >= .38 && box.max.y <= 1.18 && box.min.z >= -1.37 && box.max.z <= -.47 && box.max.x - box.min.x > 1) seatSide.set(key, 0);
        });
        const subsets = new Map<number, number[]>(); const keep: number[] = [];
        for (let i = 0; i < positions.count; i += 3) {
          const side = seatSide.get(find(i / 3));
          if (side === undefined) keep.push(i,i+1,i+2);
          else { if (!subsets.has(side)) subsets.set(side, []); subsets.get(side)!.push(i,i+1,i+2); }
        }
        const subset = (ids: number[]) => { const out = geometry.clone(); out.clearGroups(); out.setIndex(ids); return out; };
        subsets.forEach((ids, side) => {
          const isRear = side === 0;
          const seat = new THREE.Mesh(subset(ids), leather);
          seat.name = isRear ? 'RearBench' : side > 0 ? 'SeatLeft' : 'SeatRight';
          seat.position.copy(mesh.position);
          seat.quaternion.copy(mesh.quaternion);
          seat.scale.copy(mesh.scale);
          mesh.parent!.add(seat);
          seat.castShadow = true;
          seat.receiveShadow = true;
          addSeat(seat, side, isRear);
        });
        if (subsets.size) mesh.geometry = subset(keep);
        geometry.dispose();
      });

      // თავფარები — ანათებს თეთრ-ცისფრად
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xddeeff, emissiveIntensity: 0.3, roughness: 0.12, metalness: 0.0 });
      meshesOf('Body_LightsF').forEach(m => { m.material = headMat; bodyGrp.attach(m); });
      headlightMat = headMat;
      // უკანა ფარები — წითელი
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xff3b3b, emissive: 0xff1818, emissiveIntensity: 0.3, roughness: 0.28, metalness: 0.0 });
      meshesOf('Body_LightsR').forEach(m => { m.material = tailMat; bodyGrp.attach(m); });
      taillightMat = tailMat;

      // --- ნომრის ფირფიტები (კორპუსთან ერთად მოძრაობენ, ნომერს აჩვენებენ) ---
      const plateCanvas = document.createElement('canvas');
      plateCanvasRef.current = plateCanvas;
      const plateTex = new THREE.CanvasTexture(plateCanvas);
      plateTex.anisotropy = 4;
      plateTextureRef.current = plateTex;

      updateLicensePlateTexture(vehicle?.plate_number || 'FR-282-EE', vehicle?.brand || 'BMW');

      const plateMat = new THREE.MeshStandardMaterial({
        map: plateTex, emissive: 0xffffff, emissiveMap: plateTex, emissiveIntensity: 0.35,
        roughness: 0.5, metalness: 0.0, side: THREE.DoubleSide
      });
      const plateGeo = new THREE.PlaneGeometry(0.52, 0.11);
      const attachPlate = (anchorName: string, fallback: THREE.Vector3, rear: boolean) => {
        const mesh = new THREE.Mesh(plateGeo, plateMat);
        mesh.name = anchorName === 'Plate_Front_Anchor' ? 'LicensePlate_Front' : 'LicensePlate_Rear';
        const anchor = root.getObjectByName(anchorName);
        if (anchor) {
          anchor.getWorldPosition(mesh.position);
          anchor.getWorldQuaternion(mesh.quaternion);
          // Blender's plate plane is XY; glTF converts it to XZ.
          // Three.PlaneGeometry uses XY, so correct its local basis before attachment.
          mesh.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
          scene.add(mesh);
          bodyGrp.attach(mesh);
        } else {
          mesh.position.copy(fallback);
          if (rear) mesh.rotation.set(.254, Math.PI, 0);
          bodyGrp.add(mesh);
        }
      };
      attachPlate('Plate_Front_Anchor', new THREE.Vector3(0, .54, 2.418), false);
      attachPlate('Plate_Rear_Anchor', new THREE.Vector3(0, .78, -2.263), true);

      // --- სტატიკური ჩასი / აკუმულატორი ---
      const chassisGlassMat = new THREE.MeshPhysicalMaterial({ color: 0xaecbe6, transparent: true, opacity: 0.12, roughness: 0.14, metalness: 0.04, depthWrite: false });
      chassisGlassMat.userData.ghostOpacity = 0.12;
      chassisGlassMat.userData.solidColor = 0x334155;
      bodyMaterialsRef.current.push(chassisGlassMat);
      meshesOf('chassis').forEach(m => { m.material = chassisGlassMat; carMasterGroup.attach(m); });

      // Never discard unclaimed native detail when removing the loader root.
      const remaining: THREE.Mesh[] = [];
      root.traverse((o: any) => { if (o.isMesh) remaining.push(o); });
      remaining.forEach(attachNativeDetail);
      const bodyMaterials = new Set<THREE.Material>(bodyMaterialsRef.current);
      const processedMaterials = new Set<THREE.Material>();
      carMasterGroup.traverse(node => {
        if (!(node instanceof THREE.Mesh) || node.name.startsWith('LicensePlate_')) return;
        (Array.isArray(node.material) ? node.material : [node.material]).forEach(mat => {
          if (mat instanceof THREE.MeshStandardMaterial && !processedMaterials.has(mat)) {
            processedMaterials.add(mat);
            applySurfaceEffects(mat, bodyMaterials.has(mat));
          }
        });
      });
      const shortNames: Record<string,string> = {
        engine:'ძრავა და ტრანსმისია',ecu:'ECU მართვის ბლოკი',cooling:'რადიატორი',
        suspension:'საკიდარი',exhaust:'გამონაბოლქვის სისტემა',battery:'აკუმულატორი',
        ignition_coil:'აალების კოჭები',oxygen_sensor:'ჟანგბადის სენსორი',coolant_sensor:'ტემპერატურის სენსორი',
        throttle_sensor:'დროსელის სენსორი',fuel_injectors:'ინჟექტორები',fuel_pump:'საწვავის ტუმბო',
        intake_sensor:'ჰაერის სენსორი',knock_sensor:'დეტონაციის სენსორი',map_sensor:'წნევის სენსორი'
      };
      componentsList.forEach((component,index)=>{
        const group=groupsRef.current[component.id];
        if(group&&component.id!=='brakes') labelPart(group,shortNames[component.id]||component.name_ge,.20+(index%3)*.22);
      });
      wheelParts.forEach(({node})=>{
        const name=node.name;
        const part=name.startsWith('Rim')?'დისკი და საბურავი':name.startsWith('BrakeDisc')?'სამუხრუჭე დისკი':name.startsWith('BrakeCaliper')?'სამუხრუჭე სუპორტი':'ამორტიზატორი';
        const corner=name.endsWith('FL')?'წინა მარცხენა':name.endsWith('FR')?'წინა მარჯვენა':name.endsWith('RL')?'უკანა მარცხენა':'უკანა მარჯვენა';
        const lift=name.startsWith('Rim')?.12:name.startsWith('BrakeDisc')?.32:name.startsWith('BrakeCaliper')?.55:.75;
        labelPart(node,`${corner} · ${part}`,lift);
      });

      // A single surface changes from glass to paint. No overlapping shells,
      // stochastic alpha dithering or displaced duplicate geometry.
      bodyMaterialsRef.current.forEach(material => {
        if(!material.userData.keepSurfaceColor){
          material.clearcoat=1;material.clearcoatRoughness=.08;material.ior=1.5;
        }
      });
      carMasterGroup.updateWorldMatrix(true, true);
      const engineBounds = new THREE.Box3().setFromObject(groupsRef.current.engine);
      const engineHeart = carMasterGroup.worldToLocal(engineBounds.getCenter(new THREE.Vector3()));
      visual.fillOrigin.value.copy(engineHeart);
      const shellBounds = new THREE.Box3().setFromObject(bodyGrp);
      let fillReach = 0;
      for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) {
        const point = new THREE.Vector3(x ? shellBounds.max.x : shellBounds.min.x, y ? shellBounds.max.y : shellBounds.min.y, z ? shellBounds.max.z : shellBounds.min.z);
        carMasterGroup.worldToLocal(point);
        fillReach = Math.max(fillReach, point.distanceTo(engineHeart));
      }
      visual.fillReach.value = fillReach;
      const mechanicalMeshes = new Set<THREE.Mesh>();
      ['engine', 'cooling', 'suspension', 'exhaust', 'battery', 'ecu', 'oxygen_sensor', 'ignition_coil', 'fuel_injectors'].forEach(id => {
        groupsRef.current[id]?.traverse(node => { if (node instanceof THREE.Mesh) mechanicalMeshes.add(node); });
      });
      wheelParts.forEach(({node}) => node.traverse(child => { if (child instanceof THREE.Mesh) mechanicalMeshes.add(child); }));
      mechanicalMeshes.forEach(source => {
        const layer = new THREE.Mesh(source.geometry, scanLayerMaterial);
        layer.name = 'LaserSection_' + source.name; layer.visible = false; layer.renderOrder = 5;
        source.add(layer); scanLayerMeshes.push(layer);
      });
      carMasterGroup.remove(root);
      hoverParts.clear();
      carMasterGroup.traverse(node => {
        if(!(node instanceof THREE.Mesh)||node.name.startsWith('LaserSection_'))return;
        let ancestor: THREE.Object3D | null=node;
        while(ancestor){
          const text=namedPartRoots.get(ancestor);
          if(text){hoverParts.set(node,text);break;}
          ancestor=ancestor.parent;
        }
      });
      modelReadyRef.current = true;
      firstModelFramePending = true;

      // Start entrance fly-in animation from depth
      if (pendingEntranceRef.current) {
        pendingEntranceRef.current = false;
        setTimeout(() => {
          triggerEntranceFlyIn();
        }, 180);
      } else {
        triggerEntranceFlyIn();
      }
    };

    // Initial arrival drive-in starting position: in background along floor, facing straight
    carMasterGroup.position.set(0, 0, -13.0);
    carMasterGroup.scale.set(1, 1, 1);
    carMasterGroup.rotation.set(0, 0, 0);

    // Load from preloaded cache if ready, or await preloader, or fallback to direct load
    const preloadedGltf = getPreloadedCarModel();
    if (preloadedGltf && !disposed) {
      processLoadedGltf(preloadedGltf);
    } else {
      preloadCarModel()
        .then((gltf) => {
          if (!disposed) processLoadedGltf(gltf);
        })
        .catch(() => {
          if (!disposed) {
            gltfLoader.load(
              `${cleanBase}models/bmw-diagnostic.glb?v=12`,
              (gltf) => {
                if (!disposed) processLoadedGltf(gltf);
              },
              (event) => {
                if (!disposed && event.lengthComputable && event.total > 0) {
                  setModelProgress(Math.min(100, Math.round(event.loaded / event.total * 100)));
                }
              },
              (err) => {
                if (!disposed) { setModelError(true); setModelLoading(false); }
                console.error('BMW model load error', err);
              }
            );
          }
        });
    }

    // =========================================================================
    // J. ANIMATION LOOP (Exploded View, Neon Pulsing & Smooth Camera Glide)
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();
    const idlePodium = new THREE.Color(0x172b38);
    const scanPodium = new THREE.Color(0x101e30);
    const whitePodium = new THREE.Color(0xf6f9fc);
    const idleSide = new THREE.Color(0x0c1721);
    const whiteSide = new THREE.Color(0xdce3ed);
    const idleRing = new THREE.Color(0xc3c8d0);
    const scanRing = new THREE.Color(0x477da3);
    const whiteRing = new THREE.Color(0xffffff);
    const idleMirror = new THREE.Color(0x5e6067);
    const whiteMirror = new THREE.Color(0xf4f8fc);
    let fillProgress = solidTargetRef.current;
    visual.fill.value = fillProgress;
    let scanPhase = 0;
    let previousTime = 0;
    let inViewport = true;
    const viewportObserver = new IntersectionObserver(entries => { inViewport = entries[0]?.isIntersecting ?? true; }, { rootMargin: '160px' });
    viewportObserver.observe(containerRef.current);
    let framedExplode = -1;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const delta = Math.min(elapsedTime - previousTime, .05);
      if (!inViewport || document.hidden) { previousTime = elapsedTime; return; }
      previousTime = elapsedTime;

      // Natural Water Droplet Ripple animation on showroom dome dots ("გეგონება წვეთი ჩავარდა წყალში ეფექტით")
      if (rippleActiveRef.current) {
        rippleTimeRef.current += delta;
        constellationUniforms.uRippleTime.value = rippleTimeRef.current;
        constellationUniforms.uRippleStrength.value = THREE.MathUtils.damp(
          constellationUniforms.uRippleStrength.value,
          1.0,
          5.0,
          delta
        );
        if (rippleTimeRef.current > 3.2) {
          rippleActiveRef.current = false;
        }
      } else {
        constellationUniforms.uRippleStrength.value = THREE.MathUtils.damp(
          constellationUniforms.uRippleStrength.value,
          0.0,
          3.0,
          delta
        );
      }

      const fillStep = delta / (reducedMotion ? .15 : 2.8);
      fillProgress = THREE.MathUtils.clamp(fillProgress + Math.sign(solidTargetRef.current - fillProgress) * Math.min(Math.abs(solidTargetRef.current - fillProgress), fillStep), 0, 1);
      visual.fill.value = fillProgress * fillProgress * (3 - 2 * fillProgress);
      visual.lift.value = currentExplodeRef.current * 1.10;
      if (windowMaterial) windowMaterial.opacity = THREE.MathUtils.lerp(0.32, 0.76, visual.fill.value);
      // ფარები ინთება როცა მანქანა მკაფიო/მყარი ხდება
      if (headlightMat) headlightMat.emissiveIntensity = 0.12 + fillProgress * .85;
      if (taillightMat) taillightMat.emissiveIntensity = 0.12 + fillProgress * .75;
      bodyMaterialsRef.current.forEach(mat => {
        const translucent = visual.fill.value < .999;
        if(mat.transparent !== translucent){mat.transparent=translucent;mat.needsUpdate=true;}
        mat.depthWrite=!translucent;
      });

      const sequence = sequenceRef.current;
      if (sequence.active && modelReadyRef.current) {
        controls.enabled = false;
        const isMobileScreen = (containerRef.current?.clientWidth || window.innerWidth) < 640;
        const targetForegroundCam = isMobileScreen
          ? new THREE.Vector3(3.95, 1.95, 4.55)
          : new THREE.Vector3(4.75, 2.35, 5.35);
        const targetForegroundLook = new THREE.Vector3(0, 0.75, 0);

        if (Number.isNaN(sequence.startAngle)) {
          sequence.startAngle = carMasterGroup.rotation.y;
          fillProgress = 1; visual.fill.value = 1;
          sequence.initialCamPos = camera.position.clone();
          controls.target.copy(targetForegroundLook);
        }
        if (sequence.elapsed < 0.85 && !sequence.revealing) {
          const approach = THREE.MathUtils.smoothstep(sequence.elapsed, 0, 0.85);
          const startPos = sequence.initialCamPos || camera.position;
          camera.position.lerpVectors(startPos, targetForegroundCam, approach);
          controls.target.lerpVectors(controls.target, targetForegroundLook, approach * 0.15);
          targetCamPosRef.current = null;
          targetCamLookRef.current = null;
          // Trigger X-Ray transparency and water drop ripple on background dots
          if (sequence.elapsed > 0.15 && solidTargetRef.current !== 0) {
            solidTargetRef.current = 0;
            setIsGhostMode(previous => previous ? previous : true);
            rippleTimeRef.current = 0;
            rippleActiveRef.current = true;
          }
        } else if (!sequence.revealing && sequence.active) {
          camera.position.lerp(targetForegroundCam, 0.05);
          controls.target.lerp(targetForegroundLook, 0.05);
        }
        if (!sequence.revealing) {
          sequence.elapsed += delta;
          // Snappy, agile scanning turn: 2.1 seconds ("ტესტირების მომენტი სკანირების აჩქარებული")
          const turn = Math.min(sequence.elapsed / 2.1, 1);
          const eased = turn * turn * (3 - 2 * turn);
          carMasterGroup.rotation.y = sequence.startAngle + Math.PI * 2 * eased;
          if (turn >= 1 && !liveStateRef.current.isScanning) {
            if (scanOutcomeRef.current === 'error') {
              sequence.active = false;
              setScanStage('error');
              sequenceCallbacks.current.onSequenceBusyChange?.(false);
            } else if (liveStateRef.current.dtcCodes.length > 0) {
              sequence.revealing = true;
              setScanStage('reveal');
              targetExplodeRef.current = 1;
              setExplodeFactor(1);
            } else {
              sequence.active = false;
              solidTargetRef.current = 1;
              setIsGhostMode(false);
              setScanStage('clean');
              sequenceCallbacks.current.onSequenceBusyChange?.(false);
            }
          } else if (turn >= 1) setScanStage(previous => previous === 'waiting' ? previous : 'waiting');
        } else if (currentExplodeRef.current > .94) {
          const matches = componentsList.filter(comp => liveStateRef.current.dtcCodes.some(code => comp.matchingCodes.some(prefix => code.code.toUpperCase().includes(prefix))));
          const matched = matches.find(comp => comp.id.endsWith('_sensor') || comp.id === 'fuel_injectors') || matches[0];
          if (matched) {
            fitWholeAssembly();
            activePinRef.current = matched.id;
            setActivePin(matched.id);
            setInfoCardOpen(true);
            sequenceCallbacks.current.onSelectComponent(matched.id);
          }
          sequence.active = false;
          setScanStage('fault');
          sequenceCallbacks.current.onSequenceBusyChange?.(false);
        }
      }
      if (!sequence.active) controls.enabled = true;

      // Smooth interpolation for Exploded View separation (frame-rate independent & calm transition)
      currentExplodeRef.current = THREE.MathUtils.damp(currentExplodeRef.current, targetExplodeRef.current, 3.4, delta);
      const curExp = currentExplodeRef.current;

      // Displace Unibody Cage & Ghost Body (Lifts high UP)
      if (groupsRef.current['body']) {
        groupsRef.current['body'].position.y = curExp * 1.10;
      }

      // Cabin parts return exactly to their original transform when assembled.
      cabinParts.forEach(({group, side, rear}) => {
        if (rear) {
          // Rear bench remains strictly grounded to the chassis floor - never rises up
          group.position.set(0, 0, 0);
        } else {
          group.position.set(side * 0.45 * curExp, 0, 0);
        }
      });

      // Displace Internal Aggregates according to their explosion vectors
      componentsList.forEach(comp => {
        const grp = groupsRef.current[comp.id];
        if (grp) {
          grp.position.x = comp.baseRestPos.x + comp.explodeOffset.x * curExp;
          grp.position.y = comp.baseRestPos.y + comp.explodeOffset.y * curExp;
          grp.position.z = comp.baseRestPos.z + comp.explodeOffset.z * curExp;
        }

        // Hotspot pin tracks its component position
        const pin = groupsRef.current[`pin_${comp.id}`];
        if (pin) {
          pin.position.x = comp.baseRestPos.x + comp.explodeOffset.x * curExp;
          pin.position.y = comp.baseRestPos.y + comp.explodeOffset.y * curExp + Math.sin(elapsedTime * 3.5 + comp.baseRestPos.x) * 0.035;
          pin.position.z = comp.baseRestPos.z + comp.explodeOffset.z * curExp;
        }
      });

      // Use the same smooth slider value; returning to zero restores exact rest transforms.
      engineParts.forEach(({ node, rest, offset }) => {
        node.position.copy(rest).addScaledVector(offset, curExp);
      });

      // Every layer shares one interpolation value and returns to its exact rest pose.
      wheelParts.forEach(({ node, rest, offset }) => {
        node.position.copy(rest).addScaledVector(offset, curExp);
      });

      // Sophisticated calm breathing highlight for faulty components ("უფრო დახვეწილად და მშვიდად")
      const calmPulse = 0.5 + 0.5 * Math.sin(elapsedTime * 2.2);
      // Defect glow softly eases in as the car parts expand
      const faultRevealEase = THREE.MathUtils.clamp(curExp * 1.35, 0, 1);

      componentsList.forEach(comp => {
        const mats = glowMatsRef.current[comp.id];
        const light = lightsRef.current[comp.id];
        const hasFault = liveStateRef.current.dtcCodes.some(c =>
          comp.matchingCodes.some(m => c.code.toUpperCase().includes(m.toUpperCase()))
        );
        const isSelected = activePinRef.current === comp.id;

        // Elegant, calm illumination: soft breathing glow instead of harsh flickering
        const intensity = hasFault
          ? (0.45 + calmPulse * 0.40) * faultRevealEase
          : isSelected
            ? 0.45
            : 0;

        if (mats) {
          mats.forEach(mat => {
            if (intensity > 0.01) {
              mat.emissive.set(comp.color);
              mat.emissiveIntensity = intensity;
            } else {
              mat.emissive.set(0x000000);
              mat.emissiveIntensity = 0;
            }
          });
        }
        if (light) light.intensity = hasFault ? (.45 + calmPulse * .35) * faultRevealEase : isSelected ? 0.35 : 0;
      });

      if (modelReadyRef.current && Math.abs(curExp - framedExplode) > .003) {
        if (curExp > .01 || framedExplode > .01) fitWholeAssembly();
        framedExplode = curExp;
      }

      // Smooth Camera & Target Gliding
      if (targetCamPosRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.05);
        if (camera.position.distanceTo(targetCamPosRef.current) < 0.05) {
          targetCamPosRef.current = null;
        }
      }
      if (targetCamLookRef.current) {
        controls.target.lerp(targetCamLookRef.current, 0.05);
        if (controls.target.distanceTo(targetCamLookRef.current) < 0.02) {
          targetCamLookRef.current = null;
        }
      }

      // Entrance drive-in animation: Car enters driving straight along ground, then smoothly turns into showcase angle
      if (entranceAnimRef.current.active && modelReadyRef.current && carMasterGroupRef.current) {
        const elapsed = (performance.now() - entranceAnimRef.current.startTime) / 1000;
        const duration = entranceAnimRef.current.duration;
        const t = Math.min(1, Math.max(0, elapsed / duration));

        const car = carMasterGroupRef.current;
        car.position.x = 0;
        car.position.y = 0;
        car.scale.set(1, 1, 1);

        // Phase 1: Drives straight forward along the floor from z = -13.0 to z = 0 (0% to 70% of motion)
        const tDrive = Math.min(1, t / 0.70);
        const easeDrive = 1 - Math.pow(1 - tDrive, 3); // Decelerates naturally as it reaches the center
        car.position.z = -13.0 * (1 - easeDrive);

        // Realistic wheel spinning during entrance drive-in ("შემოსვლის დროს მანქანას ბორბლები უტრიალებდეს")
        const wheelRadius = 0.34;
        const wheelRotationAngle = car.position.z / wheelRadius;
        wheelParts.forEach(({ node }) => {
          if (node.name.startsWith('Rim') || node.name.startsWith('BrakeDisc')) {
            node.rotation.x = wheelRotationAngle;
          }
        });

        // Phase 2: As it arrives on the podium, it smoothly rotates from straight (0) into showcase angle (-0.30 rad)
        let rotProgress = 0;
        if (t > 0.48) {
          const normRot = (t - 0.48) / 0.52;
          rotProgress = normRot * normRot * (3 - 2 * normRot); // Smooth easeInOut
        }
        car.rotation.y = -0.30 * rotProgress;

        if (t >= 1) {
          entranceAnimRef.current.active = false;
          car.position.set(0, 0, 0);
          car.scale.set(1, 1, 1);
          car.rotation.y = -0.30;
          // Settle wheels on arrival
          wheelParts.forEach(({ node }) => {
            if (node.name.startsWith('Rim') || node.name.startsWith('BrakeDisc')) {
              node.rotation.x = 0;
            }
          });
          // Strictly stop in the tilted presentation position!
          liveStateRef.current.autoRotate = false;
          setAutoRotate(false);
        }
      }

      // Auto-turntable spin when not manually interacting and entrance is complete
      if (
        !sequenceRef.current.active &&
        !entranceAnimRef.current.active &&
        liveStateRef.current.autoRotate &&
        !targetCamPosRef.current &&
        curExp < 0.05
      ) {
        carMasterGroup.rotation.y += 0.0018;
      }

      // A calm surface-following sweep, independent of frame rate, with a soft exit.
      const scanning = liveStateRef.current.isScanning || sequenceRef.current.active;
      visual.scanStrength.value = THREE.MathUtils.damp(visual.scanStrength.value, scanning ? 1 : 0, 4, delta);
      const focus = visual.scanStrength.value;

      // White Mirror Podium Transition when exploded ("როცა გაიშლება და ნაწილებად დადგება ქვედა ფონი აინთოს თეთრ სარკისებრი ეფექტის პოდიუმზე")
      const explodeBlend = THREE.MathUtils.smoothstep(curExp, 0.05, 0.95);

      const currentBasePodium = new THREE.Color().copy(idlePodium).lerp(scanPodium, focus);
      podiumMat.color.copy(currentBasePodium).lerp(whitePodium, explodeBlend);
      podiumMat.roughness = THREE.MathUtils.lerp(0.12, 0.025, explodeBlend); // Ultra-glossy mirror sheen
      podiumMat.metalness = THREE.MathUtils.lerp(0.85, 0.92, explodeBlend);

      podiumSide.color.copy(idleSide).lerp(whiteSide, explodeBlend);
      podiumSide.roughness = THREE.MathUtils.lerp(0.22, 0.08, explodeBlend);

      const currentBaseRing = new THREE.Color().copy(idleRing).lerp(scanRing, focus);
      goldRingMat.color.copy(currentBaseRing).lerp(whiteRing, explodeBlend);

      if (floorMirror && (floorMirror as any).material?.uniforms?.['color']) {
        (floorMirror as any).material.uniforms['color'].value.copy(idleMirror).lerp(whiteMirror, explodeBlend);
      }

      podiumLight.intensity = explodeBlend * 2.6;

      backdropMaterial.color.set(0x17191e).lerp(new THREE.Color(0x081323), focus);
      (gridHelper.material as THREE.Material).opacity = THREE.MathUtils.lerp(.35, .10, focus);
      if (scanning && !reducedMotion) scanPhase = (scanPhase + delta / 2.0) % 1;
      visual.scanZ.value = reducedMotion ? 0 : THREE.MathUtils.lerp(-2.65, 2.65, .5 - .5 * Math.cos(scanPhase * Math.PI * 2));
      laserRig.visible = visual.scanStrength.value > .005;
      scanLayerMeshes.forEach(mesh => { mesh.visible = visual.scanStrength.value > .03; });
      laserRig.rotation.copy(carMasterGroup.rotation);
      laserSheet.position.z = visual.scanZ.value;
      laserTrace.position.z = visual.scanZ.value;
      laserLight.position.z = visual.scanZ.value;
      traceMaterial.opacity = visual.scanStrength.value * .65;
      laserLight.intensity = visual.scanStrength.value * .55;
      rimLight.intensity = .7 + visual.scanStrength.value * .35;

      // Laser-Synchronized 3D Vibration ("ტესტირების დროს სკანირების ლაზერის მიხედვით ოდნავ ვიბრირებდეს")
      if (focus > 0.01) {
        const laserDist = Math.abs(visual.scanZ.value);
        const onCarProximity = Math.max(0.25, 1.0 - laserDist / 2.65);
        
        // High-frequency harmonic oscillation (simulating laser ultrasonic scan resonance)
        const vib1 = Math.sin(elapsedTime * 64.0);
        const vib2 = Math.cos(elapsedTime * 92.0);
        const vib3 = Math.sin(elapsedTime * 128.0);
        
        // Intensity factor modulated by laser scan strength and beam proximity on vehicle
        const intensityFactor = focus * (0.65 + 0.35 * onCarProximity);
        const vibAmp = 0.0032 * intensityFactor; // Subtle 3.2mm micro-vibration in 3D world units
        
        carMasterGroup.position.x = (vib1 * 0.7 + vib2 * 0.3) * vibAmp;
        carMasterGroup.position.y = (vib2 * 0.8 + vib3 * 0.2) * (vibAmp * 0.65);
        carMasterGroup.position.z = (vib3 * 0.7 + vib1 * 0.3) * (vibAmp * 0.8);
        
        // Subtle micro-rotational tremor
        carMasterGroup.rotation.z = Math.sin(elapsedTime * 70.0) * (vibAmp * 0.35);
        carMasterGroup.rotation.x = Math.cos(elapsedTime * 58.0) * (vibAmp * 0.25);


      } else if (!entranceAnimRef.current.active) {
        carMasterGroup.position.set(0, 0, 0);
        carMasterGroup.rotation.z = 0;
        carMasterGroup.rotation.x = 0;
      }

      carMasterGroup.updateWorldMatrix(true, false);
      visual.carInverse.value.copy(carMasterGroup.matrixWorld).invert();

      for(const id of ['engine','ecu','cooling','suspension','battery','ignition_coil','oxygen_sensor','coolant_sensor','throttle_sensor','fuel_injectors','fuel_pump','intake_sensor','knock_sensor','map_sensor']){
        const group=groupsRef.current[id];if(group)group.visible=visual.fill.value<.999||curExp>.01;
      }
      controls.update();
      canopy.visible = camera.position.y < canopy.position.y - .3;
      if(hoverInside&&!hoverDragging&&performance.now()-lastHoverCheck>65){
        lastHoverCheck=performance.now();
        carMasterGroup.updateWorldMatrix(true,true);
        hoverRay.setFromCamera(hoverPointer,camera);
        const visibleMeshes=[...hoverParts.keys()].filter(mesh=>{
          let parent:THREE.Object3D|null=mesh;
          while(parent){if(!parent.visible)return false;parent=parent.parent;}
          return true;
        });
        const hit=hoverRay.intersectObjects(visibleMeshes,false)[0];
        const text=hit?hoverParts.get(hit.object as THREE.Mesh):undefined;
        if(text){
          tooltip.textContent=text;tooltip.style.display='block';
          const rect=renderer.domElement.getBoundingClientRect();
          tooltip.style.left=`${Math.max(6,Math.min(hoverX+12,rect.width-tooltip.offsetWidth-6))}px`;
          tooltip.style.top=`${Math.max(6,Math.min(hoverY+14,rect.height-tooltip.offsetHeight-6))}px`;
        }else tooltip.style.display='none';
      }
      constellationUniforms.uTime.value=reducedMotion?0:elapsedTime;
      constellationUniforms.uPointer.value.copy(hoverPointer);
      constellationUniforms.uHover.value+=(Number(hoverInside&&!reducedMotion)-constellationUniforms.uHover.value)*.10;
      renderer.render(scene, camera);
      if (firstModelFramePending) {
        firstModelFramePending = false;
        requestAnimationFrame(() => { if (!disposed) setModelLoading(false); });
      }
    };

    animate();

    // Responsive Resizing
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const parentW = containerRef.current.parentElement?.clientWidth || window.innerWidth || 390;
      const w = Math.min(containerRef.current.clientWidth || parentW, window.innerWidth || parentW);
      const h = containerRef.current.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      modelReadyRef.current = false;
      carMasterGroupRef.current = null;
      sequenceCallbacks.current.onSequenceBusyChange?.(false);
      cancelAnimationFrame(animId);
      viewportObserver.disconnect();
      dotsGeometry.dispose(); dotsMaterial.dispose();
      floorMirror.getRenderTarget().dispose();
      showroomEnvironment.dispose();
      environmentTarget.dispose();
      dracoLoader.dispose();
      scene.traverse((o: any) => {
        if (o.isSprite) { o.material.map?.dispose(); o.material.dispose(); }
        if (o.isLine) { o.geometry.dispose(); o.material.dispose(); }
        if (o.isMesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: THREE.Material) => m.dispose()); }
      });
      window.removeEventListener('resize', handleResize);
      if (domEl) {
        domEl.removeEventListener('wheel', onCanvasWheel);
        domEl.removeEventListener('touchstart', onCanvasTouchStart);
        domEl.removeEventListener('touchmove', onCanvasTouchMove);
        domEl.removeEventListener('touchend', onCanvasTouchEnd);
      }
      if (gestureHintTimerRef.current) clearTimeout(gestureHintTimerRef.current);
      if (twoFingerTimerRef.current) clearTimeout(twoFingerTimerRef.current);
      renderer.domElement.removeEventListener('pointermove',onHoverMove);
      renderer.domElement.removeEventListener('pointerleave',hideHover);
      renderer.domElement.removeEventListener('pointerdown',onHoverDown);
      window.removeEventListener('pointerup',onHoverUp);
      window.removeEventListener('blur',hideHover);
      tooltip.remove();hoverParts.clear();namedPartRoots.clear();
      controls.dispose();
      renderer.dispose();
    };
  }, []); // Run once on mount

  // Toggle Ghost Glass vs Solid Body Shell
  const toggleGhostMode = () => {
    sounds.playClick();
    const newMode = !isGhostMode;
    setIsGhostMode(newMode);

    solidTargetRef.current = newMode ? 0 : 1;
    if (newMode) {
      rippleTimeRef.current = 0;
      rippleActiveRef.current = true;
    }
  };

  // Focus and Zoom Camera onto Selected Component
  const handleSelectComponent = (comp: ComponentDef) => {
    sounds.playClick();
    setActivePin(comp.id);
    onSelectComponent(comp.id);
    setInfoCardOpen(true);

    targetCamPosRef.current = comp.focusCameraPos.clone();
    targetCamLookRef.current = comp.focusTargetPos.clone();
  };

  // Reset Camera to Master Perspective View
  const handleResetCamera = () => {
    sounds.playClick();
    setActivePin(null);
    setInfoCardOpen(false);
    targetCamPosRef.current = (containerRef.current?.clientWidth || 800) < 640 ? new THREE.Vector3(6.4,2.8,7.6) : new THREE.Vector3(4.9,2.25,5.8);
    targetCamLookRef.current = new THREE.Vector3(0, 1.65, 0);
  };

  // Selected Component info for detail card
  const selectedCompData = componentsList.find(c => c.id === activePin);
  const selectedFault = selectedCompData ? getFaultForComponent(selectedCompData) : undefined;

  return (
    <div className={`relative w-full h-[540px] sm:h-[620px] md:h-[640px] rounded-3xl overflow-hidden neu-surface select-none touch-pan-y transition-all duration-700 ${
      scanVisualActive
        ? 'ring-4 ring-cyan-500/60 shadow-[0_0_45px_rgba(34,211,238,0.35),0_16px_36px_rgba(15,23,42,0.25)] border border-cyan-400 z-30'
        : 'border border-white shadow-sm bg-gradient-to-b from-[#FAFBFC] via-[#F2F3F5] to-[#E8EBEF]'
    }`}>
      
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ background: 'radial-gradient(ellipse at 50% 48%, #1a3047 0%, #0b1728 58%, #050b14 100%)', opacity: scanVisualActive ? 1 : 0 }} />
      {/* Active Laser Scanning Badge */}
      {scanVisualActive && (
        <div className="absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-400/60 backdrop-blur-md shadow-[0_0_25px_rgba(34,211,238,0.4)] animate-pulse text-xs font-black">
          <Zap size={14} className="text-cyan-400 animate-bounce" />
          <span>სკანირება</span>
        </div>
      )}
      <div className="absolute bottom-2 left-3 z-20 max-w-[65%] text-[11px] text-slate-500 pointer-events-auto">
        BMW M4 · 3D ვიზუალიზაცია · <a className="underline" href={`${import.meta.env.BASE_URL}models/bmw-diagnostic-credits.json`} target="_blank" rel="noreferrer">3D ავტორები</a>
      </div>
      <CarScenePoster hidden={!modelLoading && !modelError} message={modelError ? '3D ვერ ჩაიტვირთა — ნაჩვენებია ფოტო' : modelProgress === 100 ? '3D მოდელი მზადდება…' : modelProgress === null ? '3D მოდელი იტვირთება…' : `3D მოდელი იტვირთება… ${modelProgress}%`} />
      {/* 1. TOP FLOATING CONTROL HUD BAR */}
      <div ref={topControlsRef} className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-20 flex flex-col lg:flex-row lg:flex-wrap lg:items-center lg:justify-between gap-2 pointer-events-none">
        
        {/* Left: Window Status Badge & Active Vehicle Plate */}
        <div className="flex w-full lg:w-auto min-w-0 flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 pointer-events-auto shadow-sm">
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] sm:text-xs font-black text-navy font-mono tracking-tight flex items-center gap-1 sm:gap-1.5">
            <Cpu size={12} className="text-gold" />
            <span className="break-words">{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'DIGITAL TWIN X-RAY'}</span>
          </span>
          {vehicle?.plate_number && (
            <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-white text-navy font-mono text-[10px] sm:text-[11px] font-black border border-slate-300 shadow-xs ml-0.5">
              <span className="text-blue-700 text-[9px] sm:text-[10px] font-bold">🇬🇪 GE</span>
              <span>{vehicle.plate_number}</span>
            </div>
          )}
        </div>

        {/* Right HUD Controls: Ghost / Solid Toggle, Exploded View Slider & Reset */}
        <div className="grid w-full lg:w-auto grid-cols-6 lg:flex lg:flex-wrap items-center gap-2 pointer-events-auto">
          
          {/* Quick Scan Button right on 3D Screen */}
          {onStartScan && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onStartScan();
              }}
              disabled={scanVisualActive || modelLoading || modelError}
              className={`col-span-2 min-w-0 min-h-[44px] justify-center px-1.5 sm:px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 border ${
                scanVisualActive
                  ? 'bg-amber-400 text-slate-950 border-amber-500 animate-pulse cursor-wait'
                  : 'bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 hover:shadow-gold-soft hover:scale-105 border-gold shadow-sm'
              }`}
              title="3D დიაგნოსტიკური სკანირება"
            >
              <Zap size={13} className={scanVisualActive ? 'animate-bounce' : 'fill-slate-950 text-slate-950'} />
              <span>{scanVisualActive ? 'სკანირება...' : 'სკანირება'}</span>
            </button>
          )}
          
          {/* Ghost Glass / Solid Body Toggle */}
          <button
            onClick={toggleGhostMode}
            className={`col-span-2 min-w-0 min-h-[44px] justify-center px-1.5 sm:px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
              isGhostMode
                ? 'bg-navy text-white shadow-md'
                : 'neu-btn text-navy'
            }`}
            title="გადართვა: გამჭვირვალე Ghost X-Ray / მყარი ძარა"
          >
            <Eye size={13} className={isGhostMode ? 'text-gold' : 'text-navy'} />
            <span>{isGhostMode ? 'Ghost მინა' : 'მყარი ძარა'}</span>
          </button>

          {/* Quick Exploded View Toggle Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setExplodeFactor(prev => (prev > 0.5 ? 0 : 1));
            }}
            className={`col-span-2 min-w-0 min-h-[44px] justify-center px-1.5 sm:px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
              explodeFactor > 0.5
                ? 'bg-gold text-navy shadow-gold-soft'
                : 'neu-btn text-navy'
            }`}
          >
            <Layers size={13} />
            <span>{explodeFactor > 0.5 ? 'აწყობა' : 'დაშლა'}</span>
          </button>

          {/* Turntable Auto-Rotate Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setAutoRotate(r => !r);
            }}
            className="w-full lg:w-11 h-11 rounded-xl neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
            title="ტრიალის ჩართვა/გამორთვა"
            aria-label="ტრიალის ჩართვა/გამორთვა"
            aria-pressed={autoRotate}
          >
            <RotateCw size={13} className={autoRotate ? 'text-gold' : 'text-slate-400'} />
          </button>

          {/* Reset Camera View */}
          <button
            onClick={handleResetCamera}
            className="w-full lg:w-11 h-11 rounded-xl neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
            title="საწყის ხედზე დაბრუნება"
            aria-label="საწყის ხედზე დაბრუნება"
          >
            <Maximize2 size={13} />
          </button>

          {/* Interactive 3D Zoom Lock/Unlock Toggle */}
          <button
            onClick={handleToggleControlsLock}
            className={`w-full lg:w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              isControlsUnlocked
                ? 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300'
                : 'neu-circle text-navy hover:text-gold'
            }`}
            title={isControlsUnlocked ? '3D ზუმი ჩართულია (დაკლიკეთ ჩასაკეტად)' : '3D ზუმის განბლოკვა (ორჯერ დაკლიკეთ)'}
            aria-label="3D ზუმის რეჟიმი"
            aria-pressed={isControlsUnlocked}
          >
            {isControlsUnlocked ? <Unlock size={13} /> : <Lock size={13} />}
          </button>

          {/* Step Zoom In (+) */}
          <button
            onClick={() => handleZoomStep('in')}
            className="w-full lg:w-11 h-11 rounded-xl neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
            title="3D მოახლოება (+)"
            aria-label="3D მოახლოება"
          >
            <ZoomIn size={13} />
          </button>

          {/* Step Zoom Out (-) */}
          <button
            onClick={() => handleZoomStep('out')}
            className="w-full lg:w-11 h-11 rounded-xl neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
            title="3D დაშორება (-)"
            aria-label="3D დაშორება"
          >
            <ZoomOut size={13} />
          </button>

      {/* 2. EXPLODED VIEW SCRUB SLIDER (Floating Top-Left) */}
      <div className="col-span-4 min-w-0 h-11 lg:w-48 pointer-events-auto bg-white/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Sliders size={12} className="text-gold" />
        <span className="text-[10px] sm:text-[11px] font-bold text-navy whitespace-nowrap">
          {Math.round(explodeFactor * 100)}%
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={explodeFactor}
          onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
          aria-label="დაშლის დონე"
          className="min-w-0 w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold"
        />
      </div>

        </div>
      </div>

      {/* 3. 3D WEBGL CANVAS MOUNT */}
      <div
        ref={containerRef}
        onDoubleClick={handleToggleControlsLock}
        className="relative w-full h-full max-w-full overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
        title="ორჯერ დაკლიკეთ 3D ზუმის გასააქტიურებლად/გასათიშად"
      />

      {/* Active Interactive 3D Zoom Pill Badge */}
      {isControlsUnlocked && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md text-emerald-300 border border-emerald-400/50 shadow-xl flex items-center gap-2 animate-fade-in text-xs font-bold pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>3D ზუმი ჩართულია • ორჯერ დაკლიკეთ ან დააჭირეთ Esc-ს</span>
          <button
            onClick={handleToggleControlsLock}
            className="p-1 rounded-full hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            title="3D ზუმის გამორთვა"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* 2-Finger Touch Overlay (Mobile/Tablet Google-style gesture hint) */}
      {showTwoFingerOverlay && !isControlsUnlocked && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px] pointer-events-none animate-fade-in transition-opacity">
          <div className="px-5 py-3 rounded-2xl bg-slate-950/90 text-white text-xs sm:text-sm font-bold border border-white/20 shadow-2xl flex items-center gap-2.5">
            <span className="text-xl">✌️</span>
            <span>გამოიყენეთ <strong>2 თითი</strong> 3D მოდელის სამართავად</span>
          </div>
        </div>
      )}

      {/* Momentary Wheel Scroll Hint */}
      {showGestureHint && !isControlsUnlocked && !showTwoFingerOverlay && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-2xl flex items-center gap-2 pointer-events-none animate-fade-in">
          <MousePointerClick size={16} className="text-gold animate-bounce" />
          <span>გამოიყენეთ <strong>2 თითი (Pinch)</strong> ან <strong>⌘ / Ctrl + Scroll</strong> 3D ზუმისთვის</span>
        </div>
      )}

      {/* Floating Quick Exit / Scroll Past Button */}
      <button
        type="button"
        onClick={handleScrollPastStudio}
        className="absolute bottom-4 right-4 z-20 px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-white text-navy font-bold text-xs shadow-md border border-slate-200/90 flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 group pointer-events-auto"
        title="დიაგნოსტიკის შედეგებზე ჩასვლა"
      >
        <span>ქვემოთ ჩასვლა</span>
        <ChevronDown size={14} className="text-gold group-hover:translate-y-0.5 transition-transform" />
      </button>

      {/* 3A. LEFT HUD PANEL: რას აანალიზებს (სისტემები) */}
      <div style={{ top: controlsHeight + 26, opacity: scanVisualActive ? .32 : 1, transition: 'opacity .8s ease' }} className="absolute left-2.5 sm:left-4 z-20 pointer-events-auto max-w-[230px] sm:max-w-[270px]">
        {leftHudOpen ? (
          <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-3xl border border-white/80 shadow-xl space-y-2 text-navy animate-fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <Activity size={13} className="text-gold shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-navy">
                  სისტემების ანალიზი
                </span>
              </div>
              <button
                onClick={() => setLeftHudOpen(false)}
                className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-navy transition-colors"
                title="ჩაკეცვა"
              >
                <ChevronLeft size={13} />
              </button>
            </div>

            <div className="space-y-1.5 text-[10px] sm:text-[11px]">
              {/* 1. Engine ECU */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/90 border border-slate-200/60 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <div className="font-bold text-navy truncate">ძრავის ECU</div>
                  <div className="text-[9px] text-slate-400 font-mono">ანთება, O2, ჰაერი</div>
                </div>
                {isScanning ? (
                  <span className="w-2 h-2 rounded-full bg-gold animate-ping shrink-0" />
                ) : hasErrors ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-rose-100 text-rose-700 border border-rose-200 shrink-0">
                    3 ხარვეზი
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    OK
                  </span>
                )}
              </div>

              {/* 2. Transmission TCM */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/90 border border-slate-200/60 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <div className="font-bold text-navy truncate">გადაცემათა კოლოფი TCM</div>
                  <div className="text-[9px] text-slate-400 font-mono">ZF 8HP წნევა, ATF</div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  OK
                </span>
              </div>

              {/* 3. Exhaust EVAP */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/90 border border-slate-200/60 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <div className="font-bold text-navy truncate">გამონაბოლქვი EVAP</div>
                  <div className="text-[9px] text-slate-400 font-mono">კატალიზატორი, O2 Bank 1</div>
                </div>
                {isScanning ? (
                  <span className="w-2 h-2 rounded-full bg-gold animate-ping shrink-0" />
                ) : hasErrors ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                    საყურადღებო
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    OK
                  </span>
                )}
              </div>

              {/* 4. Electrical BCM */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/90 border border-slate-200/60 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <div className="font-bold text-navy truncate">ელექტროობა & სენსორები</div>
                  <div className="text-[9px] text-slate-400 font-mono">14.2V, CAN 11/500</div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  OK
                </span>
              </div>

              {/* 5. Braking ABS */}
              <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50/90 border border-slate-200/60 flex items-center justify-between">
                <div className="min-w-0 pr-1">
                  <div className="font-bold text-navy truncate">სამუხრუჭე & ABS/ESP</div>
                  <div className="text-[9px] text-slate-400 font-mono">წნევა, სენსორები</div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 shrink-0">
                  OK
                </span>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setLeftHudOpen(true)}
            className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md text-navy hover:text-gold flex items-center gap-1.5 font-bold text-xs"
            title="სისტემების ანალიზის გახსნა"
          >
            <Activity size={14} className="text-gold" />
            <span className="text-[11px] hidden sm:inline">ანალიზი</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* 3B. RIGHT HUD PANEL: რას ნახულობს და რა იპოვა */}
      <div style={{ top: controlsHeight + 26, opacity: scanVisualActive ? .32 : 1, transition: 'opacity .8s ease' }} className="absolute right-2.5 sm:right-4 z-20 pointer-events-auto max-w-[240px] sm:max-w-[290px]">
        {rightHudOpen ? (
          <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-3xl border border-white/80 shadow-xl space-y-2 text-navy animate-fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <Cpu size={13} className="text-gold shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-navy">
                  ნახულობს & იპოვა
                </span>
              </div>
              <button
                onClick={() => setRightHudOpen(false)}
                className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-navy transition-colors"
                title="ჩაკეცვა"
              >
                <ChevronRight size={13} />
              </button>
            </div>

            {/* რას ნახულობს: Live PIDs */}
            <div>
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Search size={9} />
                <span>რას ნახულობს (სენსორები):</span>
              </div>
              <div className="grid grid-cols-2 gap-1 font-mono text-[9px] sm:text-[10px]">
                <div className="p-1 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[8px]">PID 01 0C (RPM)</span>
                  <span className="font-bold text-navy">780 rpm</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[8px]">PID 01 05 (Temp)</span>
                  <span className="font-bold text-navy">92°C</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[8px]">PID 01 04 (Load)</span>
                  <span className="font-bold text-navy">22%</span>
                </div>
                <div className="p-1 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-400 block text-[8px]">PID 01 06 (Trim)</span>
                  <span className="font-bold text-amber-700">+4.8%</span>
                </div>
              </div>
            </div>

            {/* რა იპოვა: Found Faults */}
            <div className="pt-1 border-t border-slate-100">
              <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <AlertTriangle size={9} className="text-rose-500" />
                  <span>რა იპოვა (ხარვეზები):</span>
                </span>
                <span className="font-mono text-rose-600 font-black">{dtcCodes.length} DTC</span>
              </div>

              {dtcCodes.length > 0 ? (
                <div className="space-y-1 max-h-28 overflow-y-auto pr-0.5">
                  {dtcCodes.map((dtc) => (
                    <div
                      key={dtc.code}
                      onClick={() => {
                        sounds.playClick();
                        if (onAskAiAboutCode) onAskAiAboutCode(dtc);
                      }}
                      className="p-1.5 rounded-xl bg-rose-50/90 hover:bg-rose-100/80 cursor-pointer border border-rose-200 transition-colors flex items-center justify-between text-[9px] sm:text-[10px]"
                      title="დააჭირეთ AI კონსულტაციისთვის"
                    >
                      <div className="min-w-0 pr-1">
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-black text-rose-700 bg-rose-200/70 px-1 rounded text-[9px]">
                            {dtc.code}
                          </span>
                          <span className="font-bold text-navy truncate">
                            {dtc.title_ge.split('(')[0]}
                          </span>
                        </div>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span>სისტემა სუფთაა! Check Engine არ ანთია.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setRightHudOpen(true)}
            className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md text-navy hover:text-gold flex items-center gap-1.5 font-bold text-xs"
            title="შედეგების გახსნა"
          >
            <ChevronLeft size={13} />
            <Cpu size={14} className="text-gold" />
            <span className="text-[11px] hidden sm:inline">იპოვა ({dtcCodes.length})</span>
          </button>
        )}
      </div>

      {/* 4. INTERACTIVE GLASSMORPHISM DETAIL CARD (Opens when component is selected) */}
      {infoCardOpen && selectedCompData && (
        <div style={{top: controlsHeight + 26}} className="absolute left-2.5 right-2.5 sm:left-auto sm:right-4 z-30 w-auto sm:w-80 max-w-sm rounded-3xl p-3.5 sm:p-4 bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl transition-all animate-in fade-in zoom-in-95">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full animate-ping"
                style={{ backgroundColor: selectedCompData.color }}
              />
              <span
                className="w-3.5 h-3.5 rounded-full absolute"
                style={{ backgroundColor: selectedCompData.color }}
              />
              <h4 className="text-sm font-black text-navy ml-2">
                {selectedCompData.name_ge}
              </h4>
            </div>
            <button
              onClick={() => setInfoCardOpen(false)}
              className="w-6 h-6 rounded-full neu-circle flex items-center justify-center text-slate-400 hover:text-navy"
            >
              <X size={13} />
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            {selectedCompData.sub_ge}
          </p>

          {/* Fault Status Banner */}
          {selectedFault ? (
            <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-rose-500 text-white">
                  {selectedFault.code}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                  {selectedFault.severity === 'critical' ? '● კრიტიკული ხარვეზი' : '● საყურადღებო'}
                </span>
              </div>
              <p className="text-xs font-bold text-navy mt-1">
                {selectedFault.title_ge}
              </p>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                {selectedFault.advice}
              </p>
              {selectedFault.estimated_cost_gel && (
                <p className="text-xs font-extrabold text-navy mt-2">
                  სავარაუდო ხარჯი: <span className="text-gold font-mono">{selectedFault.estimated_cost_gel} ₾</span>
                </p>
              )}

              {/* AI Mechanic Action Button */}
              {onAskAiAboutCode && (
                <button
                  onClick={() => {
                    sounds.playSuccess();
                    onAskAiAboutCode(selectedFault);
                  }}
                  className="w-full mt-2.5 py-2 rounded-xl bg-navy hover:bg-slate-900 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Bot size={14} className="text-gold" />
                  <span>AI მექანიკოსის რჩევა</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-900">შესაბამისი DTC არ არის მოწოდებული</p>
                <p className="text-[10px] text-emerald-700">ეს ნაწილის გამართულობას არ ადასტურებს; შესაძლებლობები სკანერზეა დამოკიდებული.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. FLOATING BOTTOM COMPONENT SELECTION PILLS */}
      {dtcCodes.length > 0 && <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-nowrap overflow-x-auto items-center justify-start gap-1.5 sm:gap-2 pb-1">
        {componentsList.filter(comp => getFaultForComponent(comp)).map(comp => {
          const isSelected = activePin === comp.id;
          const fault = getFaultForComponent(comp);

          return (
            <button
              key={comp.id}
              onClick={() => handleSelectComponent(comp)}
              className={`shrink-0 px-3 py-1.5 rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm ${
                isSelected
                  ? 'bg-navy text-white shadow-md scale-105 border border-gold font-black'
                  : 'neu-btn text-navy hover:text-gold'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${fault ? 'animate-ping' : ''}`}
                style={{ backgroundColor: comp.color, boxShadow: `0 0 6px ${comp.color}` }}
              />
              <span className="truncate max-w-[120px] sm:max-w-none">
                {comp.name_ge.split(' ')[0]}
              </span>
              {fault && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-black bg-rose-500 text-white animate-pulse">
                  {fault.code}
                </span>
              )}
            </button>
          );
        })}
      </div>}

      {['clean', 'fault', 'error'].includes(scanStage) && !scanVisualActive && (
        <div role="status" aria-live="polite" className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 max-w-[90%] rounded-2xl bg-white/95 border border-slate-200 px-4 py-2 text-center shadow-sm">
          <p className={`text-sm font-bold ${scanStage === 'clean' ? 'text-emerald-700' : scanStage === 'error' ? 'text-slate-700' : 'text-amber-700'}`}>
            {scanStage === 'clean' ? 'ხარვეზი არ გამოვლენილა' : scanStage === 'error' ? 'სკანირება ვერ დასრულდა' : 'აღმოჩენილი სისტემის შემოწმება საჭიროა'}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">{scanStage === 'clean' ? 'მიღებულ პასუხში DTC კოდები არ არის' : scanStage === 'error' ? 'კავშირი შეამოწმე და თავიდან სცადე' : 'შეცდომის კოდი საბოლოო დიაგნოზი არ არის'}</p>
        </div>
      )}
      {scanVisualActive && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-sky-100 shadow-sm text-slate-700">
            <Activity size={14} className="text-sky-500 motion-safe:animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">{scanStage === 'waiting' ? 'ველოდებით სკანირების პასუხს' : scanStage === 'reveal' ? 'პრობლემური სისტემის გამოყოფა' : 'მიმდინარეობს სკანირება'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeCarScene;
