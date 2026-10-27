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
  selectedComponent,
  onSelectComponent,
  hasErrors = false,
  dtcCodes = [],
  onAskAiAboutCode,
  vehicle,
  onStartScan
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

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
  const [isGhostMode, setIsGhostMode] = useState<boolean>(true); // Ghost X-Ray Wireframe body vs Solid
  const solidTargetRef = useRef(0);
  const [explodeFactor, setExplodeFactor] = useState<number>(0); // 0 to 1
  const [infoCardOpen, setInfoCardOpen] = useState<boolean>(false);
  const [leftHudOpen, setLeftHudOpen] = useState<boolean>(true);
  const [rightHudOpen, setRightHudOpen] = useState<boolean>(true);

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
    camera.position.set(5.7, 3.6, 6.5);
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // რეალისტური სტუდიური გარემოს ასახვა (PBR reflections მეტალზე/შუშაზე)
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.copy(initialTarget);
    controls.minDistance = 2.0;
    controls.maxDistance = 11.0;
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
    const podiumGeo = new THREE.CylinderGeometry(2.9, 3.0, 0.06, 64);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0xF1F5F9,
      roughness: 0.7,
      metalness: 0.15
    });
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = -0.03;
    podium.receiveShadow = true;
    stageGroup.add(podium);

    // Subtle Digital Blueprint Grid on Stage
    const gridHelper = new THREE.GridHelper(5.2, 26, 0x94A3B8, 0xCBD5E1);
    gridHelper.position.y = 0.001;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.35;
    stageGroup.add(gridHelper);

    // Warm Gold Outer Ring
    const goldRingGeo = new THREE.RingGeometry(2.84, 2.89, 64);
    const goldRingMat = new THREE.MeshBasicMaterial({ color: 0xFCA311, side: THREE.DoubleSide });
    const goldRing = new THREE.Mesh(goldRingGeo, goldRingMat);
    goldRing.rotation.x = -Math.PI / 2;
    goldRing.position.y = 0.002;
    stageGroup.add(goldRing);

    scene.add(stageGroup);

    // 7. Master Automotive Model Hierarchy
    const carMasterGroup = new THREE.Group();
    scene.add(carMasterGroup);

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
    gltfLoader.setDRACOLoader(dracoLoader);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const visual = {
      fill: { value: 0 }, lift: { value: 0 },
      scanZ: { value: -2.6 }, scanStrength: { value: 0 },
      carInverse: { value: new THREE.Matrix4() }
    };
    const ghostColor = new THREE.Color(0xaecbe6);
    const applySurfaceEffects = (mat: THREE.MeshStandardMaterial, body: boolean) => {
      const solidColor = new THREE.Color(mat.userData.solidColor ?? 0x91b6db);
      mat.onBeforeCompile = shader => {
        Object.assign(shader.uniforms, {
          uFill: visual.fill, uLift: visual.lift, uScanZ: visual.scanZ,
          uScanStrength: visual.scanStrength, uCarInverse: visual.carInverse,
          uGhostColor: { value: ghostColor }, uPaintColor: { value: solidColor },
          uGhostAlpha: { value: mat.userData.ghostOpacity ?? .26 }
        });
        shader.vertexShader = 'uniform mat4 uCarInverse; varying vec3 vCarSurface;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvCarSurface = (uCarInverse * modelMatrix * vec4(transformed, 1.0)).xyz;');
        shader.fragmentShader = `uniform float uFill, uLift, uScanZ, uScanStrength, uGhostAlpha;
          uniform vec3 uGhostColor, uPaintColor; varying vec3 vCarSurface;\n` + shader.fragmentShader;
        if (body) {
          shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
            // One shared blend for the entire shell: no late roof/cabin pieces.
            float painted = uFill;
            diffuseColor.rgb = mix(uGhostColor, uPaintColor, painted);
            diffuseColor.a = mix(uGhostAlpha, 1.0, painted);`);
          shader.fragmentShader = shader.fragmentShader.replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(.13, .25, painted);');
          shader.fragmentShader = shader.fragmentShader.replace('#include <metalnessmap_fragment>', '#include <metalnessmap_fragment>\nmetalnessFactor = mix(.03, .58, painted);');
        }
        shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
          float scanBand = exp(-pow((vCarSurface.z - uScanZ) / .075, 2.0));
          float scanHalo = exp(-pow((vCarSurface.z - uScanZ) / .25, 2.0));
          outgoingLight += (vec3(.48, .76, 1.0) * scanBand * 1.15 + vec3(.10, .30, .48) * scanHalo * .22) * uScanStrength;
          #include <opaque_fragment>`);
      };
      mat.customProgramCacheKey = () => body ? 'autohub-paint-fill-v2' : 'autohub-surface-scan-v2';
      mat.needsUpdate = true;
    };
    const engineParts: { node: THREE.Group; rest: THREE.Vector3; offset: THREE.Vector3 }[] = [];
    let disposed = false;
    gltfLoader.load(`${cleanBase}models/bmw-diagnostic.glb?v=8`, (gltf) => {
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

      // --- ბორბლები (გვერდზე სრიალებენ) ---
      const wheelNodeFor: { [k: string]: string } = { fl: 'Wheel_FL', fr: 'Wheel_FR', rl: 'Wheel_RL', rr: 'Wheel_RR' };
      wheelCorners.forEach(pos => {
        const wg = new THREE.Group();
        wg.position.set(pos.x, 0.33, pos.z);
        carMasterGroup.add(wg);
        groupsRef.current[`wheel_${pos.id}`] = wg;
        const suf = pos.id.toUpperCase();
        meshesOf('Wheel_' + suf).forEach(m => { m.castShadow = true; wg.attach(m); });
        meshesOf('Tire_' + suf).forEach(m => { m.castShadow = true; wg.attach(m); });
      });

      // Keep the BMW's native brake materials and use the same animation/highlight path.
      const brakeMats: THREE.MeshStandardMaterial[] = [];
      wheelCorners.forEach(pos => {
        const wg = groupsRef.current[`wheel_${pos.id}`];
        meshesOf('Brakes_' + pos.id.toUpperCase()).forEach(m => {
          const materials = (Array.isArray(m.material) ? m.material : [m.material])
            .map(mat => (mat as THREE.MeshStandardMaterial).clone());
          m.material = Array.isArray(m.material) ? materials : materials[0];
          brakeMats.push(...materials);
          wg.attach(m);
        });
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
      bodyMaterialsRef.current = [ghostGlassMat];
      meshesOf('Body_Paint').forEach(m => { m.material = ghostGlassMat; bodyGrp.attach(m); });

      // მინები — ყოველთვის გამჭვირვ. (საქარე მინა/ფანჯრები)
      const windowMat = new THREE.MeshPhysicalMaterial({
        color: 0xaecbe6, transmission: 0.0, opacity: 0.10, transparent: true,
        roughness: 0.05, ior: 1.5, metalness: 0.0, clearcoat: 1.0, depthWrite: false
      });
      meshesOf('Body_Glass').forEach(m => { m.material = windowMat; bodyGrp.attach(m); });

      const headLensMat = new THREE.MeshPhysicalMaterial({color: 0xc5dfed, transparent: true, opacity: .24, roughness: .08, metalness: 0, clearcoat: 1, ior: 1.49, depthWrite: false});
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
      const headMat = new THREE.MeshStandardMaterial({ color: 0xeaf2ff, emissive: 0xcfe2ff, emissiveIntensity: 1.8, roughness: 0.18, metalness: 0.0 });
      meshesOf('Body_LightsF').forEach(m => { m.material = headMat; bodyGrp.attach(m); });
      // უკანა ფარები — წითელი
      const tailMat = new THREE.MeshStandardMaterial({ color: 0xff2e2e, emissive: 0xff1818, emissiveIntensity: 1.3, roughness: 0.3, metalness: 0.0 });
      meshesOf('Body_LightsR').forEach(m => { m.material = tailMat; bodyGrp.attach(m); });

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
      carMasterGroup.remove(root);
    }, undefined, (err) => { if (!disposed) setModelError(true); console.error('BMW model load error', err); });

    // 3D hotspot pins removed — components light up in their own colour instead

    // Initial beauty perspective angle matching user's photo
    carMasterGroup.rotation.y = 0.45;

    // =========================================================================
    // J. ANIMATION LOOP (Exploded View, Neon Pulsing & Smooth Camera Glide)
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();
    const idlePodium = new THREE.Color(0xf1f5f9);
    const scanPodium = new THREE.Color(0x101e30);
    const idleRing = new THREE.Color(0xfca311);
    const scanRing = new THREE.Color(0x477da3);
    let fillProgress = 0;
    let scanPhase = 0;
    let previousTime = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      const delta = Math.min(elapsedTime - previousTime, .05);
      previousTime = elapsedTime;
      const fillStep = delta / (reducedMotion ? .15 : 2.8);
      fillProgress = THREE.MathUtils.clamp(fillProgress + Math.sign(solidTargetRef.current - fillProgress) * Math.min(Math.abs(solidTargetRef.current - fillProgress), fillStep), 0, 1);
      visual.fill.value = fillProgress * fillProgress * (3 - 2 * fillProgress);
      visual.lift.value = currentExplodeRef.current * 1.10;
      // All surfaces finish together and restore normal solid-body occlusion.
      bodyMaterialsRef.current.forEach(mat => { mat.depthWrite = fillProgress > .995; });

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

      // Displace Wheels (Slide outwards laterally)
      wheelCorners.forEach(pos => {
        const whl = groupsRef.current[`wheel_${pos.id}`];
        if (whl) {
          const lateralPush = pos.isRight ? 1.05 : -1.05;
          whl.position.x = pos.x + lateralPush * curExp;
        }
      });

      // Neon Emissive Breathing Highlight for Faulty Components
      const pulse = (Math.sin(elapsedTime * 4.2) + 1) / 2; // 0 to 1

      componentsList.forEach(comp => {
        const mats = glowMatsRef.current[comp.id];
        const light = lightsRef.current[comp.id];
        const hasFault = liveStateRef.current.dtcCodes.some(c =>
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
      if (liveStateRef.current.autoRotate && !targetCamPosRef.current && curExp < 0.05) {
        carMasterGroup.rotation.y += 0.0018;
      }

      // A calm surface-following sweep, independent of frame rate, with a soft exit.
      const scanning = liveStateRef.current.isScanning;
      visual.scanStrength.value = THREE.MathUtils.damp(visual.scanStrength.value, scanning ? 1 : 0, 4, delta);
      const focus = visual.scanStrength.value;
      podiumMat.color.copy(idlePodium).lerp(scanPodium, focus);
      goldRingMat.color.copy(idleRing).lerp(scanRing, focus);
      (gridHelper.material as THREE.Material).opacity = THREE.MathUtils.lerp(.35, .10, focus);
      if (scanning && !reducedMotion) scanPhase = (scanPhase + delta / 4.8) % 1;
      visual.scanZ.value = reducedMotion ? 0 : THREE.MathUtils.lerp(-2.65, 2.65, .5 - .5 * Math.cos(scanPhase * Math.PI * 2));
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
      cancelAnimationFrame(animId);
      dracoLoader.dispose();
      scene.traverse((o: any) => {
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
    targetCamPosRef.current = new THREE.Vector3(5.7, 3.6, 6.5);
    targetCamLookRef.current = new THREE.Vector3(0, 0.85, 0);
  };

  // Selected Component info for detail card
  const selectedCompData = componentsList.find(c => c.id === activePin);
  const selectedFault = selectedCompData ? getFaultForComponent(selectedCompData) : undefined;

  return (
    <div className="relative w-full h-[320px] sm:h-[450px] md:h-[530px] rounded-3xl overflow-hidden neu-surface border border-white shadow-neu-card bg-gradient-to-b from-[#FAFBFD] via-[#EEF3F8] to-[#E3EBF4] select-none touch-pan-y">
      
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ background: 'radial-gradient(ellipse at 50% 48%, #1a3047 0%, #0b1728 58%, #050b14 100%)', opacity: isScanning ? 1 : 0 }} />
      <div className="absolute bottom-2 left-3 z-20 max-w-[65%] text-[9px] text-slate-500 pointer-events-auto">
        BMW M4 • ილუსტრაციული აგებულება • შეცდომის კოდი დაზიანებულ ნაწილს საბოლოოდ არ ადგენს · <a className="underline" href={`${import.meta.env.BASE_URL}models/bmw-diagnostic-credits.json`} target="_blank" rel="noreferrer">3D ავტორები</a>
      </div>
      {modelError && <div role="alert" className="absolute inset-0 z-30 grid place-items-center bg-white/95 text-sm text-navy">3D მოდელი ვერ ჩაიტვირთა. განაახლეთ გვერდი.</div>}
      {/* 1. TOP FLOATING CONTROL HUD BAR */}
      <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 pointer-events-none">
        
        {/* Left: Window Status Badge & Active Vehicle Plate */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 pointer-events-auto shadow-sm">
          <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[11px] sm:text-xs font-black text-navy font-mono tracking-tight flex items-center gap-1 sm:gap-1.5">
            <Cpu size={12} className="text-gold" />
            <span>{vehicle ? `${vehicle.brand} ${vehicle.model}` : 'DIGITAL TWIN X-RAY'}</span>
          </span>
          {vehicle?.plate_number && (
            <div className="hidden min-[400px]:flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-white text-navy font-mono text-[10px] sm:text-[11px] font-black border border-slate-300 shadow-xs ml-0.5">
              <span className="text-blue-700 text-[9px] sm:text-[10px] font-bold">🇬🇪 GE</span>
              <span>{vehicle.plate_number}</span>
            </div>
          )}
        </div>

        {/* Right HUD Controls: Scan Button, Ghost / Solid Toggle, Exploded View Slider & Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          {/* Quick Scan Button right on 3D Screen */}
          {onStartScan && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onStartScan();
              }}
              disabled={isScanning}
              className={`px-3 sm:px-4 py-1.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95 border ${
                isScanning
                  ? 'bg-amber-400 text-slate-950 border-amber-500 animate-pulse cursor-wait'
                  : 'bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 hover:shadow-gold-soft hover:scale-105 border-gold shadow-sm'
              }`}
              title="3D დიაგნოსტიკური სკანირება"
            >
              <Zap size={13} className={isScanning ? 'animate-bounce' : 'fill-slate-950 text-slate-950'} />
              <span>{isScanning ? 'სკანირება...' : 'სკანირება'}</span>
            </button>
          )}
          
          {/* Ghost Glass / Solid Body Toggle */}
          <button
            onClick={toggleGhostMode}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
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
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-sm ${
              explodeFactor > 0.5
                ? 'bg-gold text-navy shadow-gold-soft'
                : 'neu-btn text-navy'
            }`}
          >
            <Layers size={13} />
            <span>{explodeFactor > 0.5 ? 'აწყობა (0%)' : 'დაშლა (100%)'}</span>
          </button>

          {/* Turntable Auto-Rotate Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setAutoRotate(r => !r);
            }}
            className="w-8 h-8 rounded-full neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
            title="ტრიალის ჩართვა/გამორთვა"
          >
            <RotateCw size={13} className={autoRotate ? 'text-gold' : 'text-slate-400'} />
          </button>

          {/* Reset Camera View */}
          <button
            onClick={handleResetCamera}
            className="w-8 h-8 rounded-full neu-circle flex items-center justify-center text-navy hover:text-gold transition-all"
            title="საწყის ხედზე დაბრუნება"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* 2. EXPLODED VIEW SCRUB SLIDER (Floating Top-Left) */}
      <div className="absolute top-12 sm:top-16 left-2.5 sm:left-4 z-20 pointer-events-auto bg-white/90 backdrop-blur-md px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
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
          className="w-16 min-[400px]:w-20 sm:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-gold"
        />
      </div>

      {/* 3. 3D WEBGL CANVAS MOUNT */}
      <div ref={containerRef} className="relative w-full h-full cursor-grab active:cursor-grabbing touch-pan-y" />

      {/* 3A. LEFT HUD PANEL: რას აანალიზებს (სისტემები) */}
      <div style={{ opacity: isScanning ? .32 : 1, transition: 'opacity .8s ease' }} className="absolute top-14 sm:top-16 left-2.5 sm:left-4 z-20 pointer-events-auto max-w-[230px] sm:max-w-[270px]">
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
      <div style={{ opacity: isScanning ? .32 : 1, transition: 'opacity .8s ease' }} className="absolute top-14 sm:top-16 right-2.5 sm:right-4 z-20 pointer-events-auto max-w-[240px] sm:max-w-[290px]">
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
        <div className="absolute top-12 sm:top-16 left-2.5 right-2.5 sm:left-auto sm:right-4 z-30 w-auto sm:w-80 max-w-sm rounded-3xl p-3.5 sm:p-4 bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl transition-all animate-in fade-in zoom-in-95">
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

      {isScanning ? (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none" role="status" aria-live="polite">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 border border-sky-100 shadow-sm text-slate-700">
            <Activity size={14} className="text-sky-500 motion-safe:animate-pulse" />
            <span className="text-xs font-semibold tracking-wide">მიმდინარეობს სკანირება...</span>
          </div>
        </div>
      ) : onStartScan && dtcCodes.length === 0 ? (
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onStartScan();
            }}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-gold via-amber-400 to-gold text-slate-950 text-xs sm:text-sm font-black shadow-lg hover:shadow-gold-soft hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-gold/40 group"
          >
            <Zap size={15} className="fill-slate-950 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>3D დიაგნოსტიკური სკანირება</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ThreeCarScene;
