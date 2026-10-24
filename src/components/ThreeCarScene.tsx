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
  Network,
  Activity,
  Search,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface Props {
  isScanning: boolean;
  selectedComponent: string | null;
  onSelectComponent: (componentId: string) => void;
  hasErrors?: boolean;
  dtcCodes?: DtcCode[];
  onAskAiAboutCode?: (code: DtcCode) => void;
  vehicle?: VehicleProfile;
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
  vehicle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // UI Interactive States
  const [activePin, setActivePin] = useState<string | null>(selectedComponent || null);
  const activePinRef = useRef<string | null>(selectedComponent || null);
  useEffect(() => { activePinRef.current = activePin; }, [activePin]);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isGhostMode, setIsGhostMode] = useState<boolean>(true); // Ghost X-Ray Wireframe body vs Solid
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
      sub_ge: 'ელექტრო/ჰიბრიდული ძრავი, შკივები, გენერატორი და ტურბინა',
      color: '#ff0033', // Neon Red
      baseRestPos: new THREE.Vector3(0, 0.50, 1.08),
      explodeOffset: new THREE.Vector3(0, 0.55, 0.35),
      defaultError: 'P0300',
      matchingCodes: ['P0300', 'P0301', 'P0302', 'P0303', 'P0304', 'P0171'],
      focusCameraPos: new THREE.Vector3(1.3, 1.3, 2.2),
      focusTargetPos: new THREE.Vector3(0, 0.65, 1.08)
    },
    {
      id: 'ecu',
      name_ge: 'ECU კომპიუტერები & გაყვანილობა',
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
      name_ge: 'სავალი ნაწილი (MacPherson Struts)',
      sub_ge: 'ზამბარიანი დგარები, საკიდარი, ბერკეტები (A-arms) და ყუმბარები',
      color: '#10b981', // Laser Green
      baseRestPos: new THREE.Vector3(0, 0.45, 0),
      explodeOffset: new THREE.Vector3(0, 0, 0),
      defaultError: 'P0500',
      matchingCodes: ['P0500', 'C0035', 'suspension'],
      focusCameraPos: new THREE.Vector3(1.9, 0.9, 1.7),
      focusTargetPos: new THREE.Vector3(0.9, 0.5, 1.15)
    },
    {
      id: 'exhaust',
      name_ge: 'გამონაბოლქვი & O2 სენსორი',
      sub_ge: 'კატალიზატორი, O2 ლამბდა ზონდები, მაყუჩი და სენსორები',
      color: '#ff6600', // Neon Fiery Orange
      baseRestPos: new THREE.Vector3(0, 0.28, -0.4),
      explodeOffset: new THREE.Vector3(0, -0.65, -0.7),
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
      baseRestPos: new THREE.Vector3(0, 0.48, 1.84),
      explodeOffset: new THREE.Vector3(0, 0.2, 0.95),
      defaultError: 'P0115',
      matchingCodes: ['P0115', 'P0128'],
      focusCameraPos: new THREE.Vector3(0.0, 1.2, 3.2),
      focusTargetPos: new THREE.Vector3(0, 0.55, 1.84)
    },
    {
      id: 'brakes',
      name_ge: 'სამუხრუჭე სისტემა & ხუნდები',
      sub_ge: 'ვენტილირებადი სამუხრუჭე დისკები, Brembo კალიპერები და ABS',
      color: '#ffb703', // Electric Amber / Gold
      baseRestPos: new THREE.Vector3(0, 0.34, 0),
      explodeOffset: new THREE.Vector3(0, 0, 0),
      defaultError: 'P0500',
      matchingCodes: ['P0500', 'brakes'],
      focusCameraPos: new THREE.Vector3(2.1, 0.75, 1.7),
      focusTargetPos: new THREE.Vector3(1.05, 0.35, 1.15)
    }
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
    camera.position.set(6.6, 4.4, 7.4);
    const initialTarget = new THREE.Vector3(0, -0.35, 0);
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
      { id: 'fl', x: 0.94, z: 1.15, isRight: true },
      { id: 'fr', x: -0.94, z: 1.15, isRight: false },
      { id: 'rl', x: 0.94, z: -1.15, isRight: true },
      { id: 'rr', x: -0.94, z: -1.15, isRight: false }
    ];

    const baseOf = (id: string): THREE.Vector3 =>
      componentsList.find(c => c.id === id)?.baseRestPos.clone() || new THREE.Vector3();

    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    dracoLoader.setDecoderPath(`${cleanBase}draco/`);
    gltfLoader.setDRACOLoader(dracoLoader);

    gltfLoader.load(`${cleanBase}models/ghost_car.glb?v=16`, (gltf) => {
      const root = gltf.scene;
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
        { id: 'suspension', src: ['Suspension'] }
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

      // --- მუხრუჭები: ინთება და ბორბლებთან ერთად მოძრაობენ ---
      const brakeMat = new THREE.MeshStandardMaterial({ color: 0x8a909a, metalness: 0.85, roughness: 0.3 });
      materialsRef.current['brakes'] = brakeMat;
      const brakesLight = new THREE.PointLight(new THREE.Color(0xffb703), 0, 2.6);
      brakesLight.position.copy(baseOf('brakes'));
      carMasterGroup.add(brakesLight);
      lightsRef.current['brakes'] = brakesLight;

      const cornerSwap: { [k: string]: string } = { FL: 'fr', FR: 'fl', RL: 'rr', RR: 'rl' };
      ['Brakes_Front', 'Brakes_Rear'].forEach(bn => {
        meshesOf(bn).forEach(m => {
          const suffix = m.name.slice(-2).toUpperCase();
          const corner = cornerSwap[suffix];
          const wg = corner ? groupsRef.current[`wheel_${corner}`] : null;
          m.material = brakeMat;
          if (wg) wg.attach(m);
        });
      });

      // --- გამჭვირვალე მინის კორპუსი ---
      const bodyGrp = new THREE.Group();
      carMasterGroup.add(bodyGrp);
      groupsRef.current['body'] = bodyGrp;
      const ghostGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0xaecbe6, transmission: 0.5, opacity: 0.55, transparent: true,
        roughness: 0.14, ior: 1.45, metalness: 0.05, clearcoat: 1.0, depthWrite: false
      });
      bodyMaterialsRef.current = [ghostGlassMat];
      meshesOf('Body_Paint').forEach(m => { m.material = ghostGlassMat; bodyGrp.attach(m); });

      // მინები — ყოველთვის გამჭვირვ. (საქარე მინა/ფანჯრები)
      const windowMat = new THREE.MeshPhysicalMaterial({
        color: 0x0e141b, transmission: 0.82, opacity: 0.45, transparent: true,
        roughness: 0.05, ior: 1.5, metalness: 0.0, clearcoat: 1.0, depthWrite: false
      });
      meshesOf('Body_Glass').forEach(m => { m.material = windowMat; bodyGrp.attach(m); });

      // სალონი — მუქი (მინაში ჩანს)
      const interiorMat = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.6, metalness: 0.1 });
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

      updateLicensePlateTexture(vehicle?.plate_number || 'FR-282-EE', vehicle?.brand || 'Mercedes-Benz');

      const plateMat = new THREE.MeshStandardMaterial({
        map: plateTex, emissive: 0xffffff, emissiveMap: plateTex, emissiveIntensity: 0.35,
        roughness: 0.5, metalness: 0.0, side: THREE.DoubleSide
      });
      const plateGeo = new THREE.PlaneGeometry(0.40, 0.13);
      const frontPlate = new THREE.Mesh(plateGeo, plateMat);
      frontPlate.position.set(0, 0.34, 2.30);
      bodyGrp.add(frontPlate);
      const rearPlate = new THREE.Mesh(plateGeo, plateMat);
      rearPlate.position.set(0, 0.42, -2.30);
      rearPlate.rotation.y = Math.PI;
      bodyGrp.add(rearPlate);

      // --- სტატიკური ჩასი / აკუმულატორი ---
      meshesOf('chassis').forEach(m => { m.material = steelDarkMat; m.receiveShadow = true; carMasterGroup.attach(m); });

      // დაცლილი root-ის მოშორება
      carMasterGroup.remove(root);
    }, undefined, (err) => { console.error('ghost_car.glb load error', err); });

    // 3D hotspot pins removed — components light up in their own colour instead

    // Holographic Laser Scan Plane
    const scanGeo = new THREE.PlaneGeometry(3.2, 2.2);
    const scanMat = new THREE.MeshBasicMaterial({
      color: 0xFCA311,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide
    });
    const scanMesh = new THREE.Mesh(scanGeo, scanMat);
    scanMesh.rotation.x = Math.PI / 2;
    scanMesh.position.y = 0.55;
    carMasterGroup.add(scanMesh);

    // Initial beauty perspective angle matching user's photo
    carMasterGroup.rotation.y = 0.45;

    // =========================================================================
    // J. ANIMATION LOOP (Exploded View, Neon Pulsing & Smooth Camera Glide)
    // =========================================================================
    let animId: number;
    const clock = new THREE.Clock();
    let scanZ = -1.9;
    let scanDir = 1;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for Exploded View separation
      currentExplodeRef.current += (targetExplodeRef.current - currentExplodeRef.current) * 0.08;
      const curExp = currentExplodeRef.current;

      // Displace Unibody Cage & Ghost Body (Lifts high UP)
      if (groupsRef.current['body']) {
        groupsRef.current['body'].position.y = curExp * 1.55;
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
        const hasFault = dtcCodes.some(c =>
          comp.matchingCodes.some(m => c.code.toUpperCase().includes(m.toUpperCase()))
        );
        const isSelected = activePinRef.current === comp.id;
        const intensity = hasFault ? (1.3 + pulse * 1.7) : isSelected ? (0.8 + pulse * 0.5) : 0;

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
        if (light) light.intensity = hasFault ? (0.9 + pulse * 1.6) : isSelected ? (0.6 + pulse * 0.4) : 0;
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
      if (autoRotate && !targetCamPosRef.current && curExp < 0.05) {
        carMasterGroup.rotation.y += 0.0018;
      }

      // Holographic Laser Scan Sweep
      if (isScanning) {
        scanMesh.visible = true;
        (scanMesh.material as THREE.MeshBasicMaterial).opacity = 0.35 + Math.sin(elapsedTime * 14) * 0.2;
        scanZ += 0.06 * scanDir;
        if (scanZ > 1.9) scanDir = -1;
        if (scanZ < -1.9) scanDir = 1;
        scanMesh.position.z = scanZ;
      } else {
        scanMesh.visible = false;
      }

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
      cancelAnimationFrame(animId);
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

    bodyMaterialsRef.current.forEach(mat => {
      if (newMode) {
        // Ghost Crystal Glass (Matching User Image)
        mat.transmission = 0.55;
        mat.opacity = 0.50;
        mat.color.set(0xaecbe6);
        mat.roughness = 0.16;
        mat.metalness = 0.0;
        mat.depthWrite = false;
      } else {
        // Solid Deep Metallic Obsidian Black (Mercedes-Benz GLA 250 Black)
        mat.transmission = 0.0;
        mat.opacity = 1.0;
        mat.color.set(0x111111);
        mat.roughness = 0.20;
        mat.metalness = 0.85;
        mat.depthWrite = true;
      }
      mat.needsUpdate = true;
    });

    // მყარ რეჟიმში შიდა აგრეგატები დავმალოთ (ხილული მხოლოდ ghost/x-ray-ში)
    ['engine', 'ecu', 'exhaust', 'cooling', 'suspension'].forEach(id => {
      const g = groupsRef.current[id];
      if (g) g.visible = newMode;
    });
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
    targetCamPosRef.current = new THREE.Vector3(3.9, 2.3, 4.0);
    targetCamLookRef.current = new THREE.Vector3(0, 0.48, 0);
  };

  // Selected Component info for detail card
  const selectedCompData = componentsList.find(c => c.id === activePin);
  const selectedFault = selectedCompData ? getFaultForComponent(selectedCompData) : undefined;

  return (
    <div className="relative w-full h-[320px] sm:h-[450px] md:h-[530px] rounded-3xl overflow-hidden neu-surface border border-white shadow-neu-card bg-gradient-to-b from-[#FAFBFD] via-[#EEF3F8] to-[#E3EBF4] select-none touch-pan-y">
      
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

        {/* Right HUD Controls: Ghost / Solid Toggle, Exploded View Slider & Reset */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          
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
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-pan-y" />

      {/* 3A. LEFT HUD PANEL: რას აანალიზებს (სისტემები) */}
      <div className="absolute top-14 sm:top-16 left-2.5 sm:left-4 z-20 pointer-events-auto max-w-[230px] sm:max-w-[270px]">
        {leftHudOpen ? (
          <div className="bg-white/92 backdrop-blur-xl p-3 sm:p-3.5 rounded-3xl border border-white/80 shadow-xl space-y-2 text-navy animate-fade-in">
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
      <div className="absolute top-14 sm:top-16 right-2.5 sm:right-4 z-20 pointer-events-auto max-w-[240px] sm:max-w-[290px]">
        {rightHudOpen ? (
          <div className="bg-white/92 backdrop-blur-xl p-3 sm:p-3.5 rounded-3xl border border-white/80 shadow-xl space-y-2 text-navy animate-fade-in">
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
                <p className="text-xs font-black text-emerald-900">სისტემა ნორმაშია</p>
                <p className="text-[10px] text-emerald-700">DTC შეცდომის კოდები ამ აგრეგატზე არ ფიქსირდება.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. FLOATING BOTTOM COMPONENT SELECTION PILLS */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {componentsList.map(comp => {
          const isSelected = activePin === comp.id;
          const fault = getFaultForComponent(comp);

          return (
            <button
              key={comp.id}
              onClick={() => handleSelectComponent(comp)}
              className={`px-3 py-1.5 rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm ${
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
      </div>

      {/* 6. HOLOGRAPHIC LASER SCAN OVERLAY */}
      {isScanning && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="w-52 h-52 rounded-full border-2 border-gold/50 animate-ping absolute"></div>
          <div className="relative px-6 py-3 rounded-2xl neu-surface border border-gold shadow-gold-soft text-center">
            <p className="text-navy font-black text-sm tracking-widest font-mono uppercase">
              ⚡ OBD-II X-Ray ლაზერული სკანირება...
            </p>
            <p className="text-slate-500 text-xs mt-1">DTC კოდების ამოკითხვა n8n ვებჰუკით</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeCarScene;
