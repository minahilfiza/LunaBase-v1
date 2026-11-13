import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createProceduralAstronaut,
  AstronautModel,
  createHabitat,
  createLandingPad,
  createLander,
  createSolarArray,
  SolarArrayModel,
  createPowerStationModule,
  createLifeSupportModule,
  createWaterRecoveryModule,
  createGreenhouse,
  GreenhouseModel,
  createRadiationShelter,
  createCommAntenna,
  CommAntennaModel,
  createRover,
  createEarthSky,
  EarthSkyModel,
  createRegolithTexture,
  createMissingSpaceship,
  MissingSpaceshipModel,
} from './proceduralModels';
import { BASE_EQUIPMENT } from '../data/equipment';
import { EquipmentId, PlantStage } from '../types/game';

export interface InteractionTarget {
  equipmentId: EquipmentId;
  name: string;
  distance: number;
  promptText: string;
}

/**
 * Generates an organic lunar regolith boulder geometry using a subdivided polyhedron
 * with subtle weathered ridges, impact facets, and a flattened base so it rests naturally
 * inside lunar dust rather than looking like a sharp black origami triangle or smooth egg.
 */
function createRealisticMoonStoneGeometry(): THREE.BufferGeometry {
  const baseGeom = new THREE.IcosahedronGeometry(1.0, 2);
  const pos = baseGeom.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    const vx = pos.getX(i);
    const vy = pos.getY(i);
    const vz = pos.getZ(i);

    // Multi-frequency pseudo-random geological deformation for weathered Moon boulders
    const n1 = Math.sin(vx * 2.4 + vy * 1.9 + vz * 2.1) * 0.14;
    const n2 = Math.cos(vx * 4.1 - vz * 3.6 + vy * 2.5) * 0.08;
    const n3 = Math.sin(vz * 6.2 + vx * 5.3) * 0.04;
    const radialWarp = 0.94 + n1 + n2 + n3;

    // Flatten bottom half slightly so boulders embed solidly into regolith
    const yFactor = vy < 0 ? 0.62 : 0.88;
    pos.setXYZ(i, vx * radialWarp, vy * yFactor * radialWarp, vz * radialWarp);
  }

  baseGeom.computeVertexNormals();
  return baseGeom;
}

/**
 * Procedural sunlit lunar regolith stone texture with highland anorthosite dust,
 * soft mineral grain, and subtle micrometeorite pits matching Moon surface lighting.
 */
function createMoonRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Sunlit dusty lunar grey-slate base
  ctx.fillStyle = '#8b95a5';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle mineral mottling & dust patches
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = 1 + Math.random() * 3.5;
    const shade = Math.random();
    if (shade > 0.65) {
      ctx.fillStyle = 'rgba(226, 232, 240, 0.42)';
    } else if (shade > 0.3) {
      ctx.fillStyle = 'rgba(71, 85, 105, 0.35)';
    } else {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.38)';
    }
    ctx.fillRect(x, y, size, size);
  }

  // Soft micrometeorite pockmarks
  for (let i = 0; i < 45; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const r = 3 + Math.random() * 10;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, 'rgba(51, 65, 85, 0.32)');
    grad.addColorStop(0.7, 'rgba(100, 116, 139, 0.16)');
    grad.addColorStop(1, 'rgba(148, 163, 184, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export class ThreeEngine {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  // Astronaut Actor
  public astronaut!: AstronautModel;
  public astronautPos = new THREE.Vector3(0, 0, 7.5);
  public astronautRot = 0;
  private moveSpeed = 7.5;
  private currentVelocity = new THREE.Vector2(0, 0);
  private isMoving = false;
  private isWaving = false;
  private isRepairing = false;
  private waveEndTime = 0;
  private contactShadow!: THREE.Mesh;

  // Interactive Object References
  public solarArray!: SolarArrayModel;
  public greenhouse!: GreenhouseModel;
  public commAntenna!: CommAntennaModel;
  public earthSky!: EarthSkyModel;
  public missingSpaceship!: MissingSpaceshipModel;
  private isMissingSpaceshipBeaconActive = false;
  public landerGroup!: THREE.Group;
  public landingPad!: THREE.Group;
  public habitatGroup!: THREE.Group;
  public powerStationGroup!: THREE.Group;
  private holoBadges: {
    equipmentId: EquipmentId;
    sprite: THREE.Sprite;
    baseY: number;
    anchorPos: THREE.Vector3;
    basePos: THREE.Vector3;
    texFar: THREE.CanvasTexture;
    texMed: THREE.CanvasTexture;
    texNear: THREE.CanvasTexture;
    currentLod: number;
  }[] = [];

  // Camera Orbit / Third-Person Tracking & Settings
  private cameraYaw = 0;
  private cameraPitch = 0.28;
  private cameraDistance = 7.5;
  private cameraSensitivity = 1.0;
  private invertY = false;
  private targetCameraPos = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();

  // Highlight Holo-Ring
  private holoRing!: THREE.Mesh;
  private currentNearestTarget: InteractionTarget | null = null;
  public onProximityChange?: (target: InteractionTarget | null) => void;
  public onPauseRequested?: () => void;
  public onBoundaryWarning?: (isNearEdge: boolean) => void;
  private wasNearBoundary = false;

  // Input states
  private keys: Record<string, boolean> = {};
  private joystickVector = { x: 0, y: 0 };
  private isPointerDown = false;
  private lastPointerPos = { x: 0, y: 0 };
  private isPointerLocked = false;
  private shouldRestorePointerLock = false;
  private isInteracting = false;

  // Mode: 'cinematic' (welcome screen auto-orbit) or 'gameplay' (third person)
  private mode: 'cinematic' | 'gameplay' = 'cinematic';
  private cinematicAngle = 0;

  // Collision Obstacles with physical radii (populated cleanly in initBaseModules & initEnvironment)
  private obstacles: { x: number; z: number; radius: number; name: string }[] = [];

  // Landing sequence animation
  private isLandingAnim = false;
  private landingProgress = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.loadCameraSettings();
    this.initRenderer();
    this.initScene();
    this.initLights();
    this.initEnvironment();
    this.initAstronaut();
    this.initBaseModules();
    this.initHoloRing();
    this.initHoloBadges();
    this.setupEvents();
    this.startLoop();
  }

  private loadCameraSettings() {
    try {
      const raw = localStorage.getItem('lunabase_camera_settings');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed.sensitivity === 'number') {
        this.cameraSensitivity = Math.max(0.2, Math.min(3.0, parsed.sensitivity));
      }
      if (typeof parsed.invertY === 'boolean') {
        this.invertY = parsed.invertY;
      }
      if (typeof parsed.distance === 'number') {
        this.cameraDistance = Math.max(4, Math.min(14, parsed.distance));
      }
    } catch {
      // Ignore storage error
    }
  }

  private saveCameraSettings() {
    try {
      localStorage.setItem(
        'lunabase_camera_settings',
        JSON.stringify({
          sensitivity: this.cameraSensitivity,
          invertY: this.invertY,
          distance: this.cameraDistance,
        })
      );
    } catch {
      // Ignore storage error
    }
  }

  public getCameraSettings() {
    return {
      sensitivity: this.cameraSensitivity,
      invertY: this.invertY,
      distance: this.cameraDistance,
    };
  }

  public setCameraSensitivity(val: number) {
    this.cameraSensitivity = Math.max(0.2, Math.min(3.0, val));
    this.saveCameraSettings();
  }

  public setInvertY(invert: boolean) {
    this.invertY = invert;
    this.saveCameraSettings();
  }

  public setCameraDistance(dist: number) {
    this.cameraDistance = Math.max(4, Math.min(14, dist));
    this.saveCameraSettings();
  }

  public resetCamera() {
    this.cameraYaw = this.astronautRot + Math.PI;
    this.cameraPitch = 0.28;
    this.cameraDistance = 7.5;
    this.saveCameraSettings();
  }

  private initRenderer() {
    // Software WebGL Detection
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.renderer.domElement.tabIndex = 0;
    this.renderer.domElement.style.outline = 'none';
    this.container.appendChild(this.renderer.domElement);
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020617); // Deep cosmic navy
    this.scene.fog = new THREE.FogExp2(0x020617, 0.008);

    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 800);
    this.camera.position.set(0, 8, 22);

    // Studio Environment Reflections
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }

  private initLights() {
    // Key Sun Light (Low-angle directional sunlight on the Moon)
    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.4);
    sunLight.position.set(80, 45, 60);
    if (!this.isSoftwareGl) {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 10;
      sunLight.shadow.camera.far = 250;
      sunLight.shadow.camera.left = -60;
      sunLight.shadow.camera.right = 60;
      sunLight.shadow.camera.top = 60;
      sunLight.shadow.camera.bottom = -60;
      sunLight.shadow.bias = -0.0005;
      sunLight.shadow.normalBias = 0.02;
    }
    this.scene.add(sunLight);

    // Cool Hemisphere fill (Deep space navy sky to grey lunar ground)
    const hemiLight = new THREE.HemisphereLight(0x0f172a, 0x334155, 0.85);
    this.scene.add(hemiLight);

    // Warm ambient habitat glow
    const habGlow = new THREE.PointLight(0x38bdf8, 1.5, 30, 1.2);
    habGlow.position.set(0, 3.5, 2);
    this.scene.add(habGlow);
  }

  private initEnvironment() {
    // 1. Lunar Regolith Surface Terrain
    const regolithTex = createRegolithTexture();
    const terrainGeom = new THREE.PlaneGeometry(280, 280, 48, 48);
    // Displace vertices to create authentic crater basins & rolling ridges
    const posAttr = terrainGeom.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Outer barrier hills
      const distFromCenter = Math.sqrt(x * x + y * y);
      let zElevation = 0;
      if (distFromCenter > 45) {
        zElevation += Math.pow((distFromCenter - 45) * 0.15, 1.7) * (0.8 + Math.sin(x * 0.1) * 0.2);
      }
      // Gentle craters inside
      zElevation += Math.sin(x * 0.08) * Math.cos(y * 0.08) * 0.6;
      posAttr.setZ(i, zElevation);
    }
    terrainGeom.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: regolithTex,
      roughness: 0.88,
      metalness: 0.12,
    });
    const terrain = new THREE.Mesh(terrainGeom, terrainMat);
    terrain.rotation.x = -Math.PI * 0.5;
    terrain.position.y = 0;
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // 2. Instanced Realistic Lunar Regolith Boulders & Surface Stones
    const rockGeom = createRealisticMoonStoneGeometry();
    const rockTex = createMoonRockTexture();
    const rockMat = new THREE.MeshStandardMaterial({
      map: rockTex,
      roughness: 0.94,
      metalness: 0.04,
      flatShading: false,
    });
    const rockCount = 95;
    const rocks = new THREE.InstancedMesh(rockGeom, rockMat, rockCount);
    const dummy = new THREE.Object3D();
    const tempColor = new THREE.Color();

    // Sunlit grey-silver lunar highland & mare regolith stone palette
    const rockColors = [
      0x7c8798, // Weathered Lunar Basalt
      0x8994a4, // Regolith Breccia
      0x94a0b0, // Highland Anorthosite
      0x9faab9, // Pale Lunar Feldspar
      0x717d8e, // Darker Mare Cobble
      0xa7b2c0, // Dust-Coated Ridge Boulder
    ];

    for (let i = 0; i < rockCount; i++) {
      const angle = (i / rockCount) * Math.PI * 2 + ((i * 3) % 11) * 0.15;
      let dist = 12 + ((i * 19) % 70);
      let rx = Math.cos(angle) * dist;
      let rz = Math.sin(angle) * dist;

      // Ensure lunar boulders never overlap base facilities, walkways, or spawn pad
      for (let attempt = 0; attempt < 8; attempt++) {
        const nearEquipment = BASE_EQUIPMENT.some(
          (eq) => Math.hypot(rx - eq.position[0], rz - eq.position[2]) < 7.8
        );
        const nearSpawn = Math.hypot(rx - 0, rz - 7.5) < 5.0;
        if (!nearEquipment && !nearSpawn) break;
        dist += 8.5;
        rx = Math.cos(angle) * dist;
        rz = Math.sin(angle) * dist;
      }

      // Low-profile asymmetric Moon boulders seated into terrain contours
      const baseScale = 0.48 + ((i * 7) % 12) * 0.075;
      const scaleX = baseScale * (1.1 + ((i * 3) % 4) * 0.16);
      const scaleY = baseScale * (0.55 + ((i * 5) % 3) * 0.1);
      const scaleZ = baseScale * (0.9 + ((i * 2) % 5) * 0.14);

      const terrainY = this.getGroundElevationAt(rx, rz);
      dummy.position.set(rx, terrainY + scaleY * 0.22, rz);
      dummy.rotation.set(
        ((i * 0.18) % 0.35) - 0.17,
        (i * 0.95) % (Math.PI * 2),
        ((i * 0.22) % 0.35) - 0.17
      );
      dummy.scale.set(scaleX, scaleY, scaleZ);
      dummy.updateMatrix();
      rocks.setMatrixAt(i, dummy.matrix);

      tempColor.setHex(rockColors[i % rockColors.length]);
      rocks.setColorAt(i, tempColor);

      const collisionRadius = Math.max(scaleX, scaleZ) * 0.85;
      this.obstacles.push({
        x: rx,
        z: rz,
        radius: collisionRadius,
        name: `Lunar Stone ${i + 1}`,
      });
    }
    rocks.instanceMatrix.needsUpdate = true;
    if (rocks.instanceColor) rocks.instanceColor.needsUpdate = true;
    rocks.castShadow = true;
    rocks.receiveShadow = true;
    this.scene.add(rocks);

    // 3. Large Earth in the sky (Floating air particles and twinkling stars removed as requested)
    this.earthSky = createEarthSky();
    this.scene.add(this.earthSky.group);
  }

  /**
   * Computes the exact lunar surface or elevated facility deck height at world (x, z),
   * keeping astronaut boots flush with slopes and indoor walkways without sinking or floating.
   */
  public getGroundElevationAt(x: number, z: number): number {
    // 1. Central Habitat elevated floor & front airlock ramp
    const distHab = Math.hypot(x, z);
    if (distHab < 4.5 && z < 4.2) {
      if (z > 2.2) {
        const rampT = Math.max(0, Math.min(1, (4.2 - z) / 2.0));
        return rampT * 0.36;
      }
      return 0.36;
    }

    // 2. Greenhouse indoor central walkway deck (centered at [18, 14])
    if (Math.abs(x - 18) < 2.1 && z > 10.2 && z < 18.2) {
      if (z > 16.5) {
        const rampT = Math.max(0, Math.min(1, (18.2 - z) / 1.7));
        return rampT * 0.38;
      }
      return 0.38;
    }

    // 3. Landing Pad octagon deck (centered at [-24, -22])
    const distPad = Math.hypot(x + 24, z + 22);
    if (distPad < 8.5) {
      const rampT = distPad > 6.5 ? (8.5 - distPad) / 2.0 : 1.0;
      return rampT * 0.32;
    }

    // 4. Match exact PlaneGeometry displacement rotated -PI/2 around X (planeY = -z)
    const planeY = -z;
    const distFromCenter = Math.hypot(x, planeY);
    let elevation = 0;
    if (distFromCenter > 45) {
      elevation += Math.pow((distFromCenter - 45) * 0.15, 1.7) * (0.8 + Math.sin(x * 0.1) * 0.2);
    }
    elevation += Math.sin(x * 0.08) * Math.cos(planeY * 0.08) * 0.6;
    return elevation;
  }

  private initAstronaut() {
    this.astronaut = createProceduralAstronaut();
    this.astronautPos.y = this.getGroundElevationAt(this.astronautPos.x, this.astronautPos.z);
    this.astronaut.group.position.copy(this.astronautPos);
    this.scene.add(this.astronaut.group);

    // Subtle soft contact shadow disc grounded under boots
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 64;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
      grad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
      grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeom = new THREE.PlaneGeometry(1.5, 1.5);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    this.contactShadow = new THREE.Mesh(shadowGeom, shadowMat);
    this.contactShadow.rotation.x = -Math.PI * 0.5;
    this.contactShadow.position.set(this.astronautPos.x, this.astronautPos.y + 0.03, this.astronautPos.z);
    this.scene.add(this.contactShadow);
  }

  private initBaseModules() {
    // 1. Dedicated Octagonal Blast Landing Pad & Artemis Lander
    this.landingPad = createLandingPad();
    this.landingPad.position.set(-24, 0, -22);
    this.scene.add(this.landingPad);

    this.landerGroup = createLander();
    this.landerGroup.position.set(-24, 0, -22);
    this.scene.add(this.landerGroup);

    // 2. Central Habitat (Modular human research facility with walk-in airlock & command deck)
    this.habitatGroup = createHabitat();
    this.habitatGroup.position.set(0, 0, 0);
    this.scene.add(this.habitatGroup);

    // 3. Life Support Module (Industrial Sabatier reactor + O2 electrolysis skid)
    const lifeSupport = createLifeSupportModule();
    lifeSupport.position.set(12, 0, -8);
    this.scene.add(lifeSupport);

    // 4. Photovoltaic Solar Farm Array (Dual-axis primary + flank tracking panels)
    this.solarArray = createSolarArray(60);
    this.solarArray.group.position.set(-22, 0, 18);
    this.scene.add(this.solarArray.group);

    // 5. Battery & Regenerative Power Station Module
    this.powerStationGroup = createPowerStationModule();
    this.powerStationGroup.position.set(-14, 0, 8);
    this.scene.add(this.powerStationGroup);

    // 6. Closed-Loop Water Recovery System (ECLSS Multi-Stage Filtration)
    const waterRecovery = createWaterRecoveryModule();
    waterRecovery.position.set(8, 0, -18);
    this.scene.add(waterRecovery);

    // 7. Lunar Greenhouse (Enclosed transparent biodome with walk-in central aisle)
    this.greenhouse = createGreenhouse();
    this.greenhouse.group.position.set(18, 0, 14);
    this.scene.add(this.greenhouse.group);

    // 8. Radiation Storm Shelter (Subterranean regolith vault with massive 6-spoke blast hatch)
    const shelter = createRadiationShelter();
    shelter.position.set(-8, 0, -20);
    this.scene.add(shelter);

    // 9. Deep Space Communications Station (Cassegrain dish on triangular lattice tower)
    this.commAntenna = createCommAntenna();
    this.commAntenna.group.position.set(22, 0, -18);
    this.scene.add(this.commAntenna.group);

    // 10. Lunar Exploration Rover (6-wheel rocker-bogie with cockpit & tool bed)
    const rover = createRover();
    rover.position.set(-6, 0, 18);
    rover.rotation.y = 0.5;
    this.scene.add(rover);

    // 11. Missing Supply & Rescue Spaceship (Southeast exploration target after Stage 7 signal)
    this.missingSpaceship = createMissingSpaceship();
    const shipGroundY = this.getGroundElevationAt(32, 26);
    this.missingSpaceship.group.position.set(32, shipGroundY, 26);
    this.missingSpaceship.group.rotation.y = -0.85;
    this.scene.add(this.missingSpaceship.group);

    // Register physical building collision obstacles:
    // Notice that entrances to Central Habitat and Greenhouse are deliberately kept clear
    // so the astronaut can walk directly through the airlocks and inside the facilities.
    this.obstacles.push(
      // Habitat: Flanking pods and rear wall, leaving front airlock walkway open
      { x: -4.6, z: -0.6, radius: 2.1, name: 'Habitat West Science Pod' },
      { x: 4.6, z: -0.6, radius: 2.1, name: 'Habitat East ECLSS Pod' },
      { x: 0, z: -3.4, radius: 2.0, name: 'Habitat North Core Wall' },
      // Greenhouse: Left and right cultivation racks, leaving central walk-through aisle open
      { x: 15.6, z: 14.0, radius: 1.5, name: 'Greenhouse West Racks' },
      { x: 20.4, z: 14.0, radius: 1.5, name: 'Greenhouse East Racks' },
      { x: 18.0, z: 9.6, radius: 1.5, name: 'Greenhouse North Retaining Wall' },
      // Other heavy engineering facilities
      { x: -24.0, z: -22.0, radius: 3.6, name: 'Lander Descent Core' },
      { x: 12.0, z: -8.0, radius: 2.2, name: 'Life Support Engineering Skid' },
      { x: -22.0, z: 18.0, radius: 2.4, name: 'Solar Farm Primary Mast' },
      { x: -14.0, z: 8.0, radius: 2.2, name: 'Power Station Battery Bank' },
      { x: 8.0, z: -18.0, radius: 2.0, name: 'Water Recovery Distillation Skid' },
      { x: -8.0, z: -20.0, radius: 3.0, name: 'Radiation Storm Shelter Berm' },
      { x: 22.0, z: -18.0, radius: 2.2, name: 'Comm Antenna Lattice Tower' },
      { x: -6.0, z: 18.0, radius: 1.8, name: 'Exploration Rover Body' },
      { x: 32.0, z: 26.0, radius: 3.2, name: 'Missing Spaceship Hull' }
    );
  }

  private initHoloRing() {
    // Holographic targeting ring on the ground for nearest interactive equipment
    const ringGeom = new THREE.RingGeometry(2.5, 2.7, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    this.holoRing = new THREE.Mesh(ringGeom, ringMat);
    this.holoRing.rotation.x = -Math.PI * 0.5;
    this.holoRing.position.y = 0.06;
    this.holoRing.visible = false;
    this.scene.add(this.holoRing);
  }

  private initHoloBadges() {
    // Object-specific side/lower label anchors so labels never float high above or obscure 3D structures
    const badgeConfigs: Record<
      string,
      {
        nameFar: string;
        nameMed: string;
        purposeMed: string;
        actionNear: string;
        height: number;
        offsetX: number;
        offsetZ: number;
        color: string;
      }
    > = {
      lander: {
        nameFar: 'SPACESHIP LANDER',
        nameMed: 'SPACESHIP LANDER',
        purposeMed: 'Moon Landing Rocket',
        actionNear: '[E] INSPECT LANDER',
        height: 3.1,
        offsetX: 4.8,
        offsetZ: 2.0,
        color: '#f59e0b',
      },
      habitat: {
        nameFar: 'CENTRAL HABITAT',
        nameMed: 'CENTRAL HABITAT',
        purposeMed: 'Living Dome & Airlock',
        actionNear: '[E] CHECK HABITAT',
        height: 3.0,
        offsetX: -4.4,
        offsetZ: 3.8,
        color: '#06b6d4',
      },
      life_support: {
        nameFar: 'LIFE SUPPORT',
        nameMed: 'LIFE-SUPPORT SYSTEM',
        purposeMed: 'Oxygen & Air Valves',
        actionNear: '[E] CHECK OXYGEN',
        height: 2.5,
        offsetX: 2.6,
        offsetZ: 1.8,
        color: '#06b6d4',
      },
      solar_array: {
        nameFar: 'SOLAR PANELS',
        nameMed: 'SOLAR PANELS',
        purposeMed: 'Sunlight Power Farm',
        actionNear: '[E] CLEAN PANELS',
        height: 3.0,
        offsetX: 3.8,
        offsetZ: -2.2,
        color: '#38bdf8',
      },
      power_station: {
        nameFar: 'BATTERY STATION',
        nameMed: 'BATTERY STATION',
        purposeMed: 'Backup Power Storage',
        actionNear: '[E] CHECK BATTERIES',
        height: 2.4,
        offsetX: 2.6,
        offsetZ: 1.6,
        color: '#38bdf8',
      },
      water_recovery: {
        nameFar: 'WATER RECOVERY',
        nameMed: 'WATER RECOVERY',
        purposeMed: 'Clean Water Station',
        actionNear: '[E] RESTORE WATER',
        height: 2.4,
        offsetX: -2.8,
        offsetZ: 1.8,
        color: '#06b6d4',
      },
      greenhouse: {
        nameFar: 'PLANT GREENHOUSE',
        nameMed: 'PLANT GREENHOUSE',
        purposeMed: 'Space Crop Dome',
        actionNear: '[E] OPEN GREENHOUSE',
        height: 3.0,
        offsetX: -4.0,
        offsetZ: 2.6,
        color: '#10b981',
      },
      radiation_shelter: {
        nameFar: 'RADIATION SHELTER',
        nameMed: 'RADIATION SHELTER',
        purposeMed: 'Storm Safety Shelter',
        actionNear: '[E] OPEN SHELTER',
        height: 2.6,
        offsetX: 3.4,
        offsetZ: 2.0,
        color: '#ef4444',
      },
      antenna: {
        nameFar: 'COMM STATION',
        nameMed: 'COMMUNICATION STATION',
        purposeMed: 'Earth Radio Dish',
        actionNear: '[E] OPEN COMMS',
        height: 3.2,
        offsetX: -3.2,
        offsetZ: 2.2,
        color: '#a855f7',
      },
      rover: {
        nameFar: 'MOON ROVER',
        nameMed: 'MOON ROVER',
        purposeMed: '6-Wheel Explorer',
        actionNear: '[E] CHECK ROVER',
        height: 2.0,
        offsetX: 2.4,
        offsetZ: 1.4,
        color: '#f59e0b',
      },
      missing_spaceship: {
        nameFar: 'SIGNAL BEACON',
        nameMed: 'MISSING SPACESHIP',
        purposeMed: 'Emergency Supply Craft',
        actionNear: '[E] INSPECT SPACESHIP',
        height: 3.1,
        offsetX: -3.2,
        offsetZ: -2.2,
        color: '#f59e0b',
      },
    };

    const makeCanvasTexture = (
      color: string,
      title: string,
      subtitle: string,
      isActionPrompt?: boolean
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 92;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      ctx.fillStyle = isActionPrompt ? 'rgba(6, 20, 38, 0.94)' : 'rgba(10, 17, 32, 0.86)';
      ctx.strokeStyle = isActionPrompt ? '#22d3ee' : color;
      ctx.lineWidth = isActionPrompt ? 4 : 3;
      ctx.beginPath();
      ctx.roundRect(4, 4, 392, 84, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isActionPrompt ? '#22d3ee' : color;
      ctx.beginPath();
      ctx.arc(26, 46, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 21px Outfit, sans-serif';
      ctx.fillText(title, 44, subtitle ? 41 : 54);

      if (subtitle) {
        ctx.fillStyle = isActionPrompt ? '#67e8f9' : '#94a3b8';
        ctx.font = isActionPrompt ? 'bold 15px monospace' : '600 15px sans-serif';
        ctx.fillText(subtitle, 44, 68);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      return texture;
    };

    for (const eq of BASE_EQUIPMENT) {
      const cfg = badgeConfigs[eq.id];
      if (!cfg) continue;

      const texFar = makeCanvasTexture(cfg.color, cfg.nameFar, '', false);
      const texMed = makeCanvasTexture(cfg.color, cfg.nameMed, cfg.purposeMed, false);
      const texNear = makeCanvasTexture(cfg.color, cfg.nameMed, cfg.actionNear, true);

      const material = new THREE.SpriteMaterial({
        map: texMed,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      });

      const groundY = this.getGroundElevationAt(eq.position[0] + cfg.offsetX, eq.position[2] + cfg.offsetZ);
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(3.4, 0.8, 1.0);
      sprite.position.set(eq.position[0] + cfg.offsetX, groundY + cfg.height, eq.position[2] + cfg.offsetZ);
      sprite.visible = false; // Hidden on landing page
      this.scene.add(sprite);

      this.holoBadges.push({
        equipmentId: eq.id,
        sprite,
        baseY: groundY + cfg.height,
        anchorPos: new THREE.Vector3(eq.position[0] + cfg.offsetX, groundY, eq.position[2] + cfg.offsetZ),
        basePos: new THREE.Vector3(eq.position[0], 0, eq.position[2]),
        texFar,
        texMed,
        texNear,
        currentLod: 1,
      });
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.keys[key] = true;
    if (e.code) {
      this.keys[e.code] = true;
    }

    if (
      this.mode === 'gameplay' &&
      !this.isInteracting &&
      (key.startsWith('arrow') || key === ' ')
    ) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
    if (e.code) {
      this.keys[e.code] = false;
    }
  };

  private onWindowBlur = () => {
    this.keys = {};
    this.joystickVector = { x: 0, y: 0 };
    this.isPointerDown = false;
    this.currentVelocity.set(0, 0);
    this.isMoving = false;
  };

  private onPointerLockChange = () => {
    const dom = this.renderer.domElement;
    const locked = document.pointerLockElement === dom;
    const wasLocked = this.isPointerLocked;
    this.isPointerLocked = locked;
    if (!locked) {
      this.isPointerDown = false;
    }

    if (wasLocked && !locked && this.mode === 'gameplay' && !this.isInteracting) {
      this.onPauseRequested?.();
    }
  };

  private setupEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', (e) => {
      try {
        dom.focus({ preventScroll: true });
      } catch {
        // Ignore focus error
      }
      if (this.mode === 'gameplay' && !this.isInteracting && e.button === 0 && !this.isPointerLocked) {
        this.requestPointerLock();
      }
      this.isPointerDown = true;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (this.mode !== 'gameplay' || this.isInteracting) return;

      const ySign = this.invertY ? -1 : 1;
      if (this.isPointerLocked) {
        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        this.cameraYaw -= dx * 0.0022 * this.cameraSensitivity;
        this.cameraPitch = Math.max(0.08, Math.min(1.22, this.cameraPitch + dy * ySign * 0.0022 * this.cameraSensitivity));
      } else if (this.isPointerDown) {
        const dx = e.clientX - this.lastPointerPos.x;
        const dy = e.clientY - this.lastPointerPos.y;
        this.lastPointerPos = { x: e.clientX, y: e.clientY };

        this.cameraYaw -= dx * 0.0045 * this.cameraSensitivity;
        this.cameraPitch = Math.max(0.08, Math.min(1.22, this.cameraPitch + dy * ySign * 0.0045 * this.cameraSensitivity));
      }
    });

    dom.addEventListener(
      'wheel',
      (e) => {
        if (this.mode !== 'gameplay' || this.isInteracting) return;
        this.cameraDistance = Math.max(4.0, Math.min(14.0, this.cameraDistance + e.deltaY * 0.008));
        this.saveCameraSettings();
      },
      { passive: true }
    );

    window.addEventListener('resize', this.onResize);
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public requestPointerLock() {
    try {
      const dom = this.renderer?.domElement;
      if (dom && document.pointerLockElement !== dom && dom.requestPointerLock) {
        dom.requestPointerLock();
      }
    } catch {
      // Fallback to left-button drag orbit if pointer lock is restricted
    }
  }

  public exitPointerLock() {
    try {
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    } catch {
      // Ignore
    }
  }

  private focusCanvas() {
    if (document.activeElement instanceof HTMLElement && document.activeElement !== this.renderer?.domElement) {
      document.activeElement.blur();
    }
    try {
      window.focus();
      this.renderer?.domElement?.focus({ preventScroll: true });
    } catch {
      // Ignore focus restriction
    }
  }

  public setInteracting(interacting: boolean) {
    if (interacting) {
      if (!this.isInteracting) {
        this.shouldRestorePointerLock =
          this.isPointerLocked || document.pointerLockElement === this.renderer?.domElement;
      }
      this.isInteracting = true;
      this.keys = {};
      this.joystickVector = { x: 0, y: 0 };
      this.currentVelocity.set(0, 0);
      this.isMoving = false;
      this.isPointerDown = false;
      this.exitPointerLock();
    } else if (this.isInteracting) {
      this.isInteracting = false;
      this.keys = {};
      this.joystickVector = { x: 0, y: 0 };
      this.isPointerDown = false;
      requestAnimationFrame(() => {
        if (!this.isInteracting && this.mode === 'gameplay') {
          this.focusCanvas();
        }
      });
    }
  }

  public resumeFromModal(forcePointerLock = false) {
    const restoreLock = forcePointerLock || this.shouldRestorePointerLock;
    this.shouldRestorePointerLock = false;
    this.isInteracting = false;
    this.keys = {};
    this.joystickVector = { x: 0, y: 0 };
    this.currentVelocity.set(0, 0);
    this.isMoving = false;
    this.isPointerDown = false;

    this.focusCanvas();
    requestAnimationFrame(() => {
      if (!this.isInteracting && this.mode === 'gameplay') {
        this.focusCanvas();
      }
    });

    if (restoreLock && this.mode === 'gameplay') {
      this.requestPointerLock();
    }
  }

  public setMode(mode: 'cinematic' | 'gameplay') {
    this.mode = mode;
    if (mode === 'cinematic') {
      this.exitPointerLock();
      this.keys = {};
    }
  }

  public setJoystickVector(vx: number, vy: number) {
    this.joystickVector = { x: vx, y: vy };
  }

  public setMissingSpaceshipBeaconActive(active: boolean) {
    this.isMissingSpaceshipBeaconActive = active;
  }

  public triggerWave() {
    this.isWaving = true;
    this.waveEndTime = this.clock.getElapsedTime() + 2.0;
  }

  public triggerRepair() {
    this.isRepairing = true;
    setTimeout(() => {
      this.isRepairing = false;
    }, 1500);
  }

  public triggerRocketLanding() {
    this.isLandingAnim = true;
    this.landingProgress = 0;
    this.landerGroup.position.set(-24, 25, -22);
  }

  public teleportAstronautTo(pos: [number, number, number]) {
    const groundY = this.getGroundElevationAt(pos[0], pos[2]);
    this.astronautPos.set(pos[0], groundY, pos[2]);
    this.astronaut.group.position.copy(this.astronautPos);
    if (this.contactShadow) {
      this.contactShadow.position.set(pos[0], groundY + 0.03, pos[2]);
    }
  }

  public getNearestTarget(): InteractionTarget | null {
    return this.currentNearestTarget;
  }

  private checkProximity() {
    let nearest: InteractionTarget | null = null;
    let minDistance = Infinity;

    for (const eq of BASE_EQUIPMENT) {
      const eqPos = new THREE.Vector3(eq.position[0], 0, eq.position[2]);
      const astroPos2D = new THREE.Vector3(this.astronautPos.x, 0, this.astronautPos.z);
      const dist = astroPos2D.distanceTo(eqPos);

      if (dist <= eq.interactionRadius) {
        if (dist < minDistance) {
          minDistance = dist;
          nearest = {
            equipmentId: eq.id,
            name: eq.name,
            distance: dist,
            promptText: eq.promptText,
          };
        }
      }
    }

    if (nearest) {
      const targetEq = BASE_EQUIPMENT.find((e) => e.id === nearest!.equipmentId)!;
      const ringY = this.getGroundElevationAt(targetEq.position[0], targetEq.position[2]) + 0.08;
      this.holoRing.position.set(targetEq.position[0], ringY, targetEq.position[2]);
      this.holoRing.scale.setScalar(targetEq.interactionRadius * 0.45);
      this.holoRing.visible = true;
    } else {
      this.holoRing.visible = false;
    }

    if (nearest?.equipmentId !== this.currentNearestTarget?.equipmentId) {
      this.currentNearestTarget = nearest;
      this.onProximityChange?.(nearest);
    }
  }

  private updateAstronaut(dt: number) {
    if (this.isInteracting) {
      this.astronaut.updateAnimation(false, this.isWaving, this.clock.getElapsedTime(), this.isRepairing, 0);
      return;
    }

    let forwardAmt = 0;
    let rightAmt = 0;

    if (this.keys['w'] || this.keys['KeyW'] || this.keys['arrowup'] || this.keys['ArrowUp']) forwardAmt += 1;
    if (this.keys['s'] || this.keys['KeyS'] || this.keys['arrowdown'] || this.keys['ArrowDown']) forwardAmt -= 1;
    if (this.keys['d'] || this.keys['KeyD'] || this.keys['arrowright'] || this.keys['ArrowRight']) rightAmt += 1;
    if (this.keys['a'] || this.keys['KeyA'] || this.keys['arrowleft'] || this.keys['ArrowLeft']) rightAmt -= 1;

    if (Math.abs(this.joystickVector.y) > 0.1) {
      forwardAmt -= this.joystickVector.y;
    }
    if (Math.abs(this.joystickVector.x) > 0.1) {
      rightAmt += this.joystickVector.x;
    }

    const inputLen = Math.hypot(forwardAmt, rightAmt);
    const hasInput = inputLen > 0.15;

    let targetVx = 0;
    let targetVz = 0;
    let targetRot = this.astronautRot;

    if (hasInput) {
      const camForwardX = -Math.sin(this.cameraYaw);
      const camForwardZ = -Math.cos(this.cameraYaw);
      const camRightX = -camForwardZ;
      const camRightZ = camForwardX;

      let moveX = camForwardX * forwardAmt + camRightX * rightAmt;
      let moveZ = camForwardZ * forwardAmt + camRightZ * rightAmt;
      const len = Math.hypot(moveX, moveZ);
      if (len > 0.001) {
        moveX /= len;
        moveZ /= len;
        targetVx = moveX * this.moveSpeed;
        targetVz = moveZ * this.moveSpeed;
        targetRot = Math.atan2(moveX, moveZ);
      }
    }

    // Smooth low-gravity acceleration & deceleration damping
    this.currentVelocity.x = THREE.MathUtils.damp(this.currentVelocity.x, targetVx, 12, dt);
    this.currentVelocity.y = THREE.MathUtils.damp(this.currentVelocity.y, targetVz, 12, dt);

    const speedNow = Math.hypot(this.currentVelocity.x, this.currentVelocity.y);
    this.isMoving = speedNow > 0.35;

    let turnDelta = 0;
    if (this.isMoving || hasInput) {
      let candX = this.astronautPos.x + this.currentVelocity.x * dt;
      let candZ = this.astronautPos.z + this.currentVelocity.y * dt;
      const astroRadius = 0.8;

      // Physical Obstacle Collision with tangential sliding
      for (let pass = 0; pass < 3; pass++) {
        for (const obs of this.obstacles) {
          const dx = candX - obs.x;
          const dz = candZ - obs.z;
          const distSq = dx * dx + dz * dz;
          const minDist = obs.radius + astroRadius;
          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq);
            if (dist > 0.0001) {
              const nx = dx / dist;
              const nz = dz / dist;
              candX = obs.x + nx * minDist;
              candZ = obs.z + nz * minDist;
            } else {
              candX = obs.x + minDist;
            }
          }
        }
      }

      // 75m safe exploration perimeter check with boundary warning callback
      const boundaryDist = Math.hypot(candX, candZ);
      const isNearBoundary = boundaryDist > 70;
      if (isNearBoundary !== this.wasNearBoundary) {
        this.wasNearBoundary = isNearBoundary;
        this.onBoundaryWarning?.(isNearBoundary);
      }

      if (boundaryDist <= 75.4) {
        this.astronautPos.x = candX;
        this.astronautPos.z = candZ;
      } else {
        this.astronautPos.x = (candX / boundaryDist) * 75.4;
        this.astronautPos.z = (candZ / boundaryDist) * 75.4;
      }

      // Shortest-angle smooth character turn
      if (hasInput) {
        let diff = targetRot - this.astronautRot;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const prevRot = this.astronautRot;
        this.astronautRot += diff * (1 - Math.exp(-14 * dt));
        turnDelta = (this.astronautRot - prevRot) / Math.max(dt, 0.001);
      }
    }

    if (this.isWaving && this.clock.getElapsedTime() > this.waveEndTime) {
      this.isWaving = false;
    }

    // Exact terrain & facility ramp elevation
    const groundY = this.getGroundElevationAt(this.astronautPos.x, this.astronautPos.z);
    this.astronautPos.y = THREE.MathUtils.damp(this.astronautPos.y, groundY, 20, dt);

    this.astronaut.group.position.copy(this.astronautPos);
    this.astronaut.group.rotation.y = this.astronautRot;
    this.astronaut.updateAnimation(this.isMoving, this.isWaving, this.clock.getElapsedTime(), this.isRepairing, turnDelta);

    if (this.contactShadow) {
      this.contactShadow.position.set(this.astronautPos.x, groundY + 0.03, this.astronautPos.z);
    }

    this.checkProximity();
  }

  private updateCamera(dt: number) {
    if (this.mode === 'cinematic') {
      // Gentle, slow cinematic camera orbit on landing screen so background never distracts
      this.cinematicAngle += dt * 0.008;
      const orbitRadius = 46;
      const cx = Math.sin(this.cinematicAngle) * orbitRadius;
      const cz = Math.cos(this.cinematicAngle) * orbitRadius;
      this.camera.position.set(cx, 15.5, cz);
      this.camera.lookAt(0, 2.2, 0);
    } else {
      // Smooth third-person follow camera framed cleanly at chest/head height
      const offset = new THREE.Vector3(
        Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance,
        Math.sin(this.cameraPitch) * this.cameraDistance + 1.25,
        Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance
      );

      this.targetCameraPos.copy(this.astronautPos).add(offset);
      const minCamGroundY = this.getGroundElevationAt(this.targetCameraPos.x, this.targetCameraPos.z) + 0.85;
      if (this.targetCameraPos.y < minCamGroundY) {
        this.targetCameraPos.y = minCamGroundY;
      }

      this.targetLookAt.copy(this.astronautPos).add(new THREE.Vector3(0, 1.45, 0));

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x, 9, dt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y, 9, dt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 9, dt);

      this.camera.lookAt(this.targetLookAt);
    }
  }

  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 80);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      const dt = Math.min(this.clock.getDelta(), 0.1);
      const time = this.clock.getElapsedTime();

      if (this.isLandingAnim) {
        this.landingProgress += dt * 0.45;
        this.landerGroup.position.y = Math.max(0, 25 * (1 - this.landingProgress));
        if (this.landingProgress >= 1.0) {
          this.isLandingAnim = false;
          this.landerGroup.position.y = 0;
        }
      }

      this.earthSky.update(dt);
      this.commAntenna.animateSignal(time, false);
      this.missingSpaceship?.updateBeacon(time, this.isMissingSpaceshipBeaconActive);

      if (this.holoRing.visible) {
        this.holoRing.rotation.z += dt * 1.5;
      }

      // Distance-based label visibility: hidden on landing screen, crisp & uncluttered during gameplay
      const showLabels = this.mode === 'gameplay';
      for (let i = 0; i < this.holoBadges.length; i++) {
        const badge = this.holoBadges[i];
        if (!showLabels) {
          badge.sprite.visible = false;
          continue;
        }

        const dist = this.astronautPos.distanceTo(badge.basePos);
        if (dist > 54) {
          badge.sprite.visible = false;
          continue;
        }

        badge.sprite.visible = true;
        badge.sprite.position.y = badge.baseY + Math.sin(time * 2.0 + i * 0.7) * 0.06;

        let lod = 0;
        if (dist < 10) lod = 2; // Within interaction range
        else if (dist <= 26) lod = 1; // Near object
        else lod = 0; // Far distance: facility name only

        if (badge.currentLod !== lod) {
          badge.currentLod = lod;
          if (lod === 2) badge.sprite.material.map = badge.texNear;
          else if (lod === 1) badge.sprite.material.map = badge.texMed;
          else badge.sprite.material.map = badge.texFar;
          badge.sprite.material.needsUpdate = true;
        }

        const isTarget = this.currentNearestTarget?.equipmentId === badge.equipmentId;
        if (isTarget || lod === 2) {
          badge.sprite.scale.set(3.8, 0.88, 1.0);
          (badge.sprite.material as THREE.SpriteMaterial).opacity = 0.96;
        } else if (lod === 1) {
          badge.sprite.scale.set(3.4, 0.8, 1.0);
          (badge.sprite.material as THREE.SpriteMaterial).opacity = 0.86;
        } else {
          badge.sprite.scale.set(2.9, 0.68, 1.0);
          (badge.sprite.material as THREE.SpriteMaterial).opacity = Math.max(0.25, 0.72 - (dist - 26) * 0.015);
        }
      }

      if (this.mode === 'gameplay') {
        this.updateAstronaut(dt);
      }
      this.updateCamera(dt);

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    this.exitPointerLock();
    if (this.isSoftwareGl) {
      window.clearTimeout(this.frameId);
    } else {
      cancelAnimationFrame(this.frameId);
    }
    this.renderer.dispose();
  }
}
