import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DtcCode, VehicleProfile } from '../types';
import { sounds } from '../services/soundEffects';
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
  Zap
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
  onStartScan
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
      ? new THREE.Vector3(3.45, 1.75, 3.95)
      : new THREE.Vector3(4.15, 2.05, 4.65);
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
  const liveStateRef = useRef({ dtcCodes, isScanning, autoRotate: true });
  liveStateRef.current.dtcCodes = dtcCodes;
  liveStateRef.current.isScanning = isScanning;
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  liveStateRef.current.autoRotate = autoRotate;
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
  const [isGhostMode, setIsGhostMode] = useState<boolean>(true); // Ghost X-Ray Wireframe body vs Solid
  const solidTargetRef = useRef(0);
  const [explodeFactor, setExplodeFactor] = useState<number>(0); // 0 to 1
  const [infoCardOpen, setInfoCardOpen] = useState<boolean>(false);
  const [leftHudOpen, setLeftHudOpen] = useState<boolean>(false);
  const [rightHudOpen, setRightHudOpen] = useState<boolean>(false);

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

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup (Perspective angle matching the user's digital twin blueprint photo)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(5.6, 3.8, 6.5);
    const initialTarget = new THREE.Vector3(0, 0.85, 0);
    camera.lookAt(initialTarget);
    cameraRef.current = camera;

    // 3. Renderer with ACES Filmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 640 ? 1.25 : 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // რეალისტური სტუდიური გარემოს ასახვა (PBR reflections მეტალზე/შუშაზე)
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
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
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      targetCamPosRef.current = null;
      targetCamLookRef.current = null;
    });

    // 5. Studio Lighting Rig (Clean blueprint studio lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 1.85);
    mainKeyLight.position.set(6, 12, 6);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    mainKeyLight.shadow.bias = -0.0004;
    scene.add(mainKeyLight);

    const softFillLight = new THREE.DirectionalLight(0xe0f2fe, 1.15);
    softFillLight.position.set(-6, 5, -5);
    scene.add(softFillLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    rimLight.position.set(4, 2, -6);
    scene.add(rimLight);

    // 6. High-Tech Blueprint Stage Floor (Matching the technical digital grid in photo)
    const stageGroup = new THREE.Group();

    // Stage Base Disc
    // A seamless white circular showroom: floor, rounded wall and ceiling.
    const roomProfile: THREE.Vector2[] = [new THREE.Vector2(0, -.25), new THREE.Vector2(15.5, -.25)];
    for (let i = 1; i <= 20; i++) {
      const angle = i / 20 * Math.PI / 2;
      roomProfile.push(new THREE.Vector2(15.5 + 2.5 * Math.sin(angle), -.25 + 2.5 * (1 - Math.cos(angle))));
    }
    roomProfile.push(new THREE.Vector2(18, 5.5));
    for (let i = 1; i <= 16; i++) {
      const angle = i / 16 * Math.PI / 2;
      roomProfile.push(new THREE.Vector2(18 - 2.5 * (1 - Math.cos(angle)), 5.5 + 2.5 * Math.sin(angle)));
    }
    roomProfile.push(new THREE.Vector2(0, 8));
    const backdropGeometry = new THREE.LatheGeometry(roomProfile, 96);
    const backdropMaterial = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: .86, metalness: 0, side: THREE.BackSide });
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    backdrop.receiveShadow = true; scene.add(backdrop);
    const showroomBeltMaterial = new THREE.MeshBasicMaterial({ color: 0xe0e5eb });
    const showroomBelt = new THREE.Mesh(new THREE.TorusGeometry(17.98, .018, 6, 144), showroomBeltMaterial);
    showroomBelt.rotation.x = Math.PI / 2; showroomBelt.position.y = 3.2;
    scene.add(showroomBelt);

    const podiumGeo = new THREE.CylinderGeometry(3.15, 3.28, .22, 72);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.28,
      metalness: 0.12
    });
    const podiumSide = new THREE.MeshStandardMaterial({ color: 0x293543, roughness: .30, metalness: .55 });
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
    const goldRingMat = new THREE.MeshBasicMaterial({ color: 0xc2cbd5, side: THREE.DoubleSide });
    const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
    goldRing.rotation.x = -Math.PI / 2;
    goldRing.position.y = -.025;
    goldRing.visible = true;
    stageGroup.add(goldRing);

    scene.add(stageGroup);

    // 7. Master Automotive Model Hierarchy
    const carMasterGroup = new THREE.Group();
    scene.add(carMasterGroup);
    const fitWholeAssembly = () => {
      carMasterGroup.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(carMasterGroup);
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
      distance *= 1.18;
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
          uGhostColor: { value: ghostColor }, uPaintColor: { value: solidColor },
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
            diffuseColor.rgb ${paintLayer && mat.userData.keepSurfaceColor ? '*=' : '='} ${paintLayer ? 'uPaintColor' : 'uGhostColor'};
            diffuseColor.a = surfaceAlpha * ${paintLayer ? 'painted' : 'uGhostAlpha * (1.0 - painted)'};
            ${!paintLayer ? 'diffuseColor.a *= 1.0 - exp(-pow((vCarSurface.z - uScanZ) / .18, 2.0)) * uScanStrength * .85;' : ''}
            ${paintLayer ? `
              float frontGrille = smoothstep(2.20, 2.28, vCarSurface.z) * (1.0 - smoothstep(.40, .48, abs(vCarSurface.x))) * step(.17, vCarSurface.y - uLift) * (1.0 - smoothstep(.66, .69, vCarSurface.y - uLift));
              diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.006, .008, .012), frontGrille);` : ''}`);
          shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = ' + (paintLayer ? 'mix(uSolidRoughness, .48, frontGrille);' : '.13;'));
          shader.fragmentShader = shader.fragmentShader.replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = ' + (paintLayer ? 'mix(uSolidMetalness, .03, frontGrille);' : '.03;'));
        }
        shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
          float scanBand = exp(-pow((vCarSurface.z - uScanZ) / .035, 2.0));
          float scanHalo = exp(-pow((vCarSurface.z - uScanZ) / .25, 2.0));
          outgoingLight += (vec3(.72, .93, 1.0) * scanBand * 1.6 + vec3(.06, .32, .60) * scanHalo * .32) * uScanStrength;
          #include <opaque_fragment>`);
      };
      mat.customProgramCacheKey = () => body ? (paintLayer ? (mat.userData.keepSurfaceColor ? 'autohub-native-trim-wave-v6' : 'autohub-opaque-paint-wave-v6') : 'autohub-glass-wave-v6') : 'autohub-surface-scan-v3';
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
    let roofMaterial: THREE.MeshPhysicalMaterial | null = null;
    let headlightMat: THREE.MeshStandardMaterial | null = null;
    let taillightMat: THREE.MeshStandardMaterial | null = null;
    let disposed = false;
    gltfLoader.load(`${cleanBase}models/bmw-diagnostic.glb?v=12`, (gltf) => {
      const root = gltf.scene;
      if (disposed) return;
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
      const ghostGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xaecbe6, transmission: 0.0, opacity: 0.26, transparent: true,
        roughness: 0.14, ior: 1.45, metalness: 0.05, clearcoat: 1.0, depthWrite: false
      });
      ghostGlassMat.userData.ghostOpacity = 0.26;
      ghostGlassMat.userData.solidColor = 0x34465e; // AutoHub: muted graphite-blue metallic, matched to the navy interface
      bodyMaterialsRef.current = [ghostGlassMat];
      meshesOf('Body_Paint').forEach(mesh => {
        const native = mesh.material as THREE.MeshStandardMaterial;
        const glass = ghostGlassMat.clone();
        glass.normalMap = native.normalMap;
        glass.normalScale.copy(native.normalScale);
        glass.userData.solidRoughness = .27;
        glass.userData.solidMetalness = .55;
        mesh.material = glass;
        bodyMaterialsRef.current.push(glass);
        bodyGrp.attach(mesh);
      });
      ['Body_Trim', 'Body_Grille'].forEach(name => meshesOf(name).forEach(mesh => {
        const native = mesh.material as THREE.MeshStandardMaterial;
        const material = new THREE.MeshPhysicalMaterial();
        THREE.MeshStandardMaterial.prototype.copy.call(material, native);
        material.transparent = true; material.opacity = .14; material.depthWrite = false;
        material.alphaTest = 0;
        material.clearcoat = .12; material.clearcoatRoughness = .22;
        material.userData = { ghostOpacity: .14, solidColor: 0xffffff, keepSurfaceColor: true,
          solidRoughness: name === 'Body_Grille' ? .34 : .48, solidMetalness: .03 };
        mesh.material = material;
        bodyMaterialsRef.current.push(material);
        bodyGrp.attach(mesh);
      }));

      // მინები — ყოველთვის გამჭვირვ. (საქარე მინა/ფანჯრები)
      const windowMat = new THREE.MeshPhysicalMaterial({
        color: 0x57758a, transmission: 0.0, opacity: 0.10, transparent: true,
        roughness: 0.05, ior: 1.5, metalness: 0.0, clearcoat: 1.0, depthWrite: false
      });
      windowMaterial = windowMat;
      roofMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x101b28, transparent: true, opacity: .16,
        roughness: .10, metalness: .12, clearcoat: 1, clearcoatRoughness: .06,
        ior: 1.5, transmission: 0, depthWrite: false, side: THREE.DoubleSide
      });
      meshesOf('Body_Glass').forEach(m => {
        // The downloaded model includes its panoramic roof in the glass mesh.
        // Separate the roof from the windows so solid mode has a complete shell.
        const geometry = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
        const positions = geometry.getAttribute('position');
        const roof: number[] = [], windows: number[] = [];
        const point = new THREE.Vector3(), normal = new THREE.Vector3();
        const triangle = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
        for (let i = 0; i < positions.count; i += 3) {
          for (let j = 0; j < 3; j++) triangle[j].fromBufferAttribute(positions, i + j).applyMatrix4(m.matrixWorld);
          point.copy(triangle[0]).add(triangle[1]).add(triangle[2]).multiplyScalar(1 / 3);
          normal.subVectors(triangle[1], triangle[0]).cross(new THREE.Vector3().subVectors(triangle[2], triangle[0])).normalize();
          const list = point.y > 1.31 && point.z > -.95 && point.z < .24 && Math.abs(normal.y) > .78 ? roof : windows;
          list.push(i, i + 1, i + 2);
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
          const roofMesh = new THREE.Mesh(subset(roof), roofMaterial!);
          roofMesh.name = 'BMW_Roof_Panel';
          roofMesh.matrix.copy(m.matrix); roofMesh.matrix.decompose(roofMesh.position, roofMesh.quaternion, roofMesh.scale);
          m.parent?.add(roofMesh); bodyGrp.attach(roofMesh);
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
      meshesOf('Body_Interior').forEach(m => { m.material = interiorMat; m.castShadow = true; bodyGrp.attach(m); });

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
      remaining.forEach(m => { m.material = interiorMat; bodyGrp.attach(m); });
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
      // Opaque hashed paint progressively replaces the glass, with depth testing
      // active from the first frame. There is no final material/depth-mode switch.
      const paintMeshes: THREE.Mesh[] = [];
      const paintMaterials = new Map<THREE.Material, THREE.MeshPhysicalMaterial>();
      bodyGrp.traverse(node => {
        if (!(node instanceof THREE.Mesh) || !bodyMaterials.has(node.material as THREE.Material)) return;
        const ghostMat = node.material as THREE.MeshPhysicalMaterial;
        let paintMat = paintMaterials.get(ghostMat);
        if (!paintMat) {
          paintMat = ghostMat.clone();
          paintMat.transparent = false; paintMat.depthWrite = true; paintMat.alphaHash = true;
          paintMat.polygonOffset = true; paintMat.polygonOffsetFactor = -1; paintMat.polygonOffsetUnits = -1;
          applySurfaceEffects(paintMat, true, true);
          paintMaterials.set(ghostMat, paintMat);
        }
        const paint = new THREE.Mesh(node.geometry, paintMat);
        paint.name = 'PaintLayer_' + node.name;
        paint.position.copy(node.position); paint.quaternion.copy(node.quaternion); paint.scale.copy(node.scale);
        paint.castShadow = false;
        paintMeshes.push(paint);
      });
      paintMeshes.forEach(mesh => bodyGrp.add(mesh));
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
      modelReadyRef.current = true;
      setModelLoading(false);
    }, (event) => {
      if (!disposed && event.lengthComputable && event.total > 0) setModelProgress(Math.min(100, Math.round(event.loaded / event.total * 100)));
    }, (err) => { if (!disposed) { setModelError(true); setModelLoading(false); } console.error('BMW model load error', err); });

    // 3D hotspot pins removed — components light up in their own colour instead

    // Initial beauty perspective angle matching user's photo
    carMasterGroup.rotation.y = -0.30;

    // =========================================================================
    // J. ANIMATION LOOP (Exploded View, Neon Pulsing & Smooth Camera Glide)
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();
    const idlePodium = new THREE.Color(0xf1f5f9);
    const scanPodium = new THREE.Color(0x101e30);
    const idleRing = new THREE.Color(0xc2cbd5);
    const scanRing = new THREE.Color(0x477da3);
    let fillProgress = 0;
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
      const fillStep = delta / (reducedMotion ? .15 : 2.8);
      fillProgress = THREE.MathUtils.clamp(fillProgress + Math.sign(solidTargetRef.current - fillProgress) * Math.min(Math.abs(solidTargetRef.current - fillProgress), fillStep), 0, 1);
      visual.fill.value = fillProgress * fillProgress * (3 - 2 * fillProgress);
      visual.lift.value = currentExplodeRef.current * 1.10;
      if (windowMaterial) windowMaterial.opacity = THREE.MathUtils.lerp(.10, .36, visual.fill.value);
      if (roofMaterial) roofMaterial.opacity = THREE.MathUtils.lerp(.16, .94, visual.fill.value);
      // ფარები ინთება როცა მანქანა მკაფიო/მყარი ხდება
      if (headlightMat) headlightMat.emissiveIntensity = 0.12 + fillProgress * .85;
      if (taillightMat) taillightMat.emissiveIntensity = 0.12 + fillProgress * .75;
      bodyMaterialsRef.current.forEach(mat => { mat.depthWrite = false; });

      const sequence = sequenceRef.current;
      if (sequence.active && modelReadyRef.current) {
        controls.enabled = false;
        const isMobileScreen = (containerRef.current?.clientWidth || window.innerWidth) < 640;
        const targetForegroundCam = isMobileScreen
          ? new THREE.Vector3(3.45, 1.75, 3.95)
          : new THREE.Vector3(4.15, 2.05, 4.65);
        const targetForegroundLook = new THREE.Vector3(0, 0.75, 0);

        if (Number.isNaN(sequence.startAngle)) {
          sequence.startAngle = carMasterGroup.rotation.y;
          fillProgress = 1; visual.fill.value = 1;
          sequence.initialCamPos = camera.position.clone();
          controls.target.copy(targetForegroundLook);
        }
        if (sequence.elapsed < 2.4 && !sequence.revealing) {
          const approach = THREE.MathUtils.smoothstep(sequence.elapsed, 0, 2.4);
          const startPos = sequence.initialCamPos || camera.position;
          camera.position.lerpVectors(startPos, targetForegroundCam, approach);
          controls.target.lerpVectors(controls.target, targetForegroundLook, approach * 0.15);
          targetCamPosRef.current = null;
          targetCamLookRef.current = null;
          if (sequence.elapsed > .3) { solidTargetRef.current = 0; setIsGhostMode(previous => previous ? previous : true); }
        } else if (!sequence.revealing && sequence.active) {
          camera.position.lerp(targetForegroundCam, 0.05);
          controls.target.lerp(targetForegroundLook, 0.05);
        }
        if (!sequence.revealing) {
          sequence.elapsed += delta;
          const turn = Math.min(sequence.elapsed / 18, 1);
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
        } else if (currentExplodeRef.current > .96) {
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

      // Smooth interpolation for Exploded View separation
      currentExplodeRef.current += (targetExplodeRef.current - currentExplodeRef.current) * 0.08;
      const curExp = currentExplodeRef.current;

      // Displace Unibody Cage & Ghost Body (Lifts high UP)
      if (groupsRef.current['body']) {
        groupsRef.current['body'].position.y = curExp * 1.10;
      }

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

      // Neon Emissive Breathing Highlight for Faulty Components
      const pulse = (Math.sin(elapsedTime * 4.2) + 1) / 2; // 0 to 1

      componentsList.forEach(comp => {
        const mats = glowMatsRef.current[comp.id];
        const light = lightsRef.current[comp.id];
        const hasFault = !(sequenceRef.current.active && liveStateRef.current.isScanning) && liveStateRef.current.dtcCodes.some(c =>
          comp.matchingCodes.some(m => c.code.toUpperCase().includes(m.toUpperCase()))
        );
        const isSelected = activePinRef.current === comp.id;
        // Only components with active DTC faults pulse/blink. Selected components without faults have a steady calm glow.
        const intensity = hasFault ? (.7 + pulse * .45) : isSelected ? 0.45 : 0;

        if (mats) {
          mats.forEach(mat => {
            if (intensity > 0) {
              mat.emissive.set(comp.color);
              mat.emissiveIntensity = intensity;
            } else {
              mat.emissive.set(0x000000);
              mat.emissiveIntensity = 0;
            }
          });
        }
        if (light) light.intensity = hasFault ? (.45 + pulse * .35) : isSelected ? 0.35 : 0;
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

      // Auto-turntable spin when not manually interacting
      if (!sequenceRef.current.active && liveStateRef.current.autoRotate && !targetCamPosRef.current && curExp < 0.05) {
        carMasterGroup.rotation.y += 0.0018;
      }

      // A calm surface-following sweep, independent of frame rate, with a soft exit.
      const scanning = liveStateRef.current.isScanning || sequenceRef.current.active;
      visual.scanStrength.value = THREE.MathUtils.damp(visual.scanStrength.value, scanning ? 1 : 0, 4, delta);
      const focus = visual.scanStrength.value;
      podiumMat.color.copy(idlePodium).lerp(scanPodium, focus);
      backdropMaterial.color.set(0xf5f7fa).lerp(new THREE.Color(0x081323), focus);
      goldRingMat.color.copy(idleRing).lerp(scanRing, focus);
      showroomBeltMaterial.color.set(0xe0e5eb).lerp(new THREE.Color(0x203951), focus);
      (gridHelper.material as THREE.Material).opacity = THREE.MathUtils.lerp(.35, .10, focus);
      if (scanning && !reducedMotion) scanPhase = (scanPhase + delta / 8.5) % 1;
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


      } else {
        carMasterGroup.position.set(0, 0, 0);
        carMasterGroup.rotation.z = 0;
        carMasterGroup.rotation.x = 0;
      }

      carMasterGroup.updateWorldMatrix(true, false);
      visual.carInverse.value.copy(carMasterGroup.matrixWorld).invert();

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Responsive Resizing
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth || 800;
      const h = containerRef.current.clientHeight || 450;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      modelReadyRef.current = false;
      sequenceCallbacks.current.onSequenceBusyChange?.(false);
      cancelAnimationFrame(animId);
      viewportObserver.disconnect();
      environmentTarget.dispose();
      dracoLoader.dispose();
      scene.traverse((o: any) => {
        if (o.isLine) { o.geometry.dispose(); o.material.dispose(); }
        if (o.isMesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m: THREE.Material) => m.dispose()); }
      });
      window.removeEventListener('resize', handleResize);
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
    targetCamPosRef.current = new THREE.Vector3(5.6, 3.8, 6.5);
    targetCamLookRef.current = new THREE.Vector3(0, 0.85, 0);
  };

  // Selected Component info for detail card
  const selectedCompData = componentsList.find(c => c.id === activePin);
  const selectedFault = selectedCompData ? getFaultForComponent(selectedCompData) : undefined;

  return (
    <div className={`relative w-full h-[430px] sm:h-[560px] md:h-[640px] rounded-3xl overflow-hidden neu-surface select-none touch-pan-y transition-all duration-700 ${
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
      {modelLoading && !modelError && <div role="status" className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"><span className="rounded-full bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm">{modelProgress === 100 ? '3D მოდელი მზადდება…' : modelProgress === null ? '3D მოდელი იტვირთება…' : `3D მოდელი იტვირთება… ${modelProgress}%`}</span></div>}
      {modelError && <div role="alert" className="absolute inset-0 z-30 grid place-items-center bg-white/95 text-sm text-navy">3D მოდელი ვერ ჩაიტვირთა. განაახლეთ გვერდი.</div>}
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
      <div ref={containerRef} className="relative w-full h-full cursor-grab active:cursor-grabbing touch-pan-y" />

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
