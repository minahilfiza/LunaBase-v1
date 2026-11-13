import * as THREE from 'three';
import { PlantStage } from '../types/game';

// Procedural Canvas Textures (Zero external 404 dependencies)
export function createRegolithTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#6e7078';
  ctx.fillRect(0, 0, 512, 512);

  // Noise & grit
  for (let i = 0; i < 40000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const shade = Math.floor(70 + Math.random() * 70);
    ctx.fillStyle = `rgb(${shade},${shade},${shade + 4})`;
    ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  // Micro craters
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const r = 4 + Math.random() * 16;
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.2, cx, cy, r);
    grad.addColorStop(0, '#55575e');
    grad.addColorStop(0.8, '#44464c');
    grad.addColorStop(1, '#7e808a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createSolarCellTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#081c3b';
  ctx.fillRect(0, 0, 256, 256);

  // Solar cell grid
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1;
  const step = 32;
  for (let x = 0; x <= 256; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 256);
    ctx.stroke();
  }
  for (let y = 0; y <= 256; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  // Silicon sparkle
  for (let x = 0; x < 256; x += step) {
    for (let y = 0; y < 256; y += step) {
      ctx.fillStyle = '#0c2752';
      ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 4, y + 4, step - 8, step - 8);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 8);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createEarthTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean blue
  ctx.fillStyle = '#0b2559';
  ctx.fillRect(0, 0, 1024, 512);

  // Continents stylized
  ctx.fillStyle = '#1e6840';
  // North America & South America
  drawBlob(ctx, 220, 160, 90, 80);
  drawBlob(ctx, 320, 320, 75, 120);
  // Eurasia & Africa
  drawBlob(ctx, 600, 150, 140, 90);
  drawBlob(ctx, 560, 280, 85, 110);
  // Australia
  drawBlob(ctx, 820, 360, 60, 45);

  // Ice caps
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 1024, 30);
  ctx.fillRect(0, 480, 1024, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function drawBlob(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.ellipse(
      x + (Math.random() * 2 - 1) * rx * 0.7,
      y + (Math.random() * 2 - 1) * ry * 0.7,
      rx * 0.45,
      ry * 0.45,
      Math.random(),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
}

// -------------------------------------------------------------
// Procedural Composite Models (3 - 12 Parts each)
// -------------------------------------------------------------

// 1. Procedural Human Astronaut Character with realistic human proportions & rigged joints
export interface AstronautModel {
  group: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftShin: THREE.Group;
  rightShin: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  updateAnimation: (
    isMoving: boolean,
    isWaving: boolean,
    time: number,
    isRepairing?: boolean,
    turnDelta?: number
  ) => void;
}

export function createProceduralAstronaut(): AstronautModel {
  const group = new THREE.Group();

  // Premium PBR spacesuit materials
  const suitFabric = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.6,
    metalness: 0.08,
  });
  const suitJointRibs = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
    metalness: 0.25,
  });
  const suitBlueAccent = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.35,
    metalness: 0.3,
  });
  const goldVisorMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    metalness: 0.25,
  });
  const goldVisorRim = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.15,
    metalness: 0.92,
  });
  const bootRubber = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
    metalness: 0.15,
  });
  const metalTrim = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.25,
    metalness: 0.85,
  });
  const humanSkinMat = new THREE.MeshStandardMaterial({
    color: 0xf6d5b0, // Warm, bright natural skin tone
    roughness: 0.55,
    metalness: 0.05,
  });
  const snoopyCapMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a, // NASA communications skullcap
    roughness: 0.8,
  });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.1 });
  const eyebrowMat = new THREE.MeshStandardMaterial({ color: 0x5a2d0c, roughness: 0.7 });
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0xdf6e57, roughness: 0.5 });

  // Pelvis / Hips (Root of body) - Height ~ 0.95m from ground
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.96;
  const hipMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.22, 12), suitJointRibs);
  pelvis.add(hipMesh);
  group.add(pelvis);

  // Torso / Chest (Mounted on Pelvis)
  const torso = new THREE.Group();
  torso.position.y = 0.15;
  pelvis.add(torso);

  // Anatomical upper torso suit
  const torsoGeom = new THREE.BoxGeometry(0.56, 0.52, 0.36);
  const torsoMesh = new THREE.Mesh(torsoGeom, suitFabric);
  torsoMesh.position.y = 0.28;
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  // NASA Chest Display & Control Module (DCM)
  const dcmBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.1), suitBlueAccent);
  dcmBox.position.set(0, 0.32, 0.22);
  torso.add(dcmBox);

  // DCM switches & pressure dials
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 10), metalTrim);
  dial.rotation.x = Math.PI * 0.5;
  dial.position.set(-0.08, 0.35, 0.28);
  torso.add(dial);
  const statusLcd = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.06, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.6 })
  );
  statusLcd.position.set(0.06, 0.35, 0.28);
  torso.add(statusLcd);

  // American / Artemis Commander Flag Decal on Left Shoulder
  const patchMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.05, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 })
  );
  patchMesh.position.set(-0.29, 0.42, 0.02);
  patchMesh.rotation.y = -Math.PI * 0.5;
  torso.add(patchMesh);

  // Portable Life Support System (PLSS) Backpack
  const plssGroup = new THREE.Group();
  plssGroup.position.set(0, 0.32, -0.26);
  const plssMain = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.22), suitFabric);
  plssMain.castShadow = true;
  plssGroup.add(plssMain);

  // Twin High-Pressure Oxygen / Purge Cylinders
  const tankGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.52, 12);
  const tankL = new THREE.Mesh(tankGeom, metalTrim);
  tankL.position.set(-0.14, 0.02, -0.12);
  const tankR = new THREE.Mesh(tankGeom, metalTrim);
  tankR.position.set(0.14, 0.02, -0.12);
  plssGroup.add(tankL, tankR);

  // PLSS Radio Antenna Whip
  const antGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.55, 6);
  const ant = new THREE.Mesh(antGeom, metalTrim);
  ant.position.set(0.2, 0.48, -0.06);
  ant.rotation.z = -0.08;
  plssGroup.add(ant);

  torso.add(plssGroup);

  // Neck Ring & Space Helmet
  const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 8, 20), metalTrim);
  neckRing.rotation.x = Math.PI * 0.5;
  neckRing.position.y = 0.58;
  torso.add(neckRing);

  const head = new THREE.Group();
  head.position.set(0, 0.74, 0);
  torso.add(head);

  // Outer White Polycarbonate Helmet Shell
  const helmetMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 24), suitFabric);
  helmetMesh.castShadow = true;
  head.add(helmetMesh);

  // Astronaut Inner Head & Face (Friendly Human Astronaut)
  const faceGroup = new THREE.Group();
  faceGroup.position.set(0, -0.01, 0.05);

  // Human Head base
  const faceMesh = new THREE.Mesh(new THREE.SphereGeometry(0.145, 18, 18), humanSkinMat);
  faceGroup.add(faceMesh);

  // NASA Snoopy Communications Cap (covers top, back and ears)
  const snoopyCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.148, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.45),
    snoopyCapMat
  );
  snoopyCap.rotation.x = -Math.PI * 0.15;
  faceGroup.add(snoopyCap);

  // Communications Earcups
  const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), snoopyCapMat);
  earL.rotation.z = Math.PI * 0.5;
  earL.position.set(-0.138, 0.01, 0.02);
  const earR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), snoopyCapMat);
  earR.rotation.z = Math.PI * 0.5;
  earR.position.set(0.138, 0.01, 0.02);
  faceGroup.add(earL, earR);

  // Communications Boom Microphone reaching to mouth
  const micArm = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.09, 6), metalTrim);
  micArm.rotation.set(0.3, 0.4, 1.2);
  micArm.position.set(-0.08, -0.04, 0.12);
  const micTip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 6), snoopyCapMat);
  micTip.position.set(-0.03, -0.05, 0.15);
  faceGroup.add(micArm, micTip);

  // Human Eyes (Left & Right)
  const eyeLWhite = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.008), eyeWhiteMat);
  eyeLWhite.position.set(-0.044, 0.025, 0.14);
  const eyeLPupil = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.01), pupilMat);
  eyeLPupil.position.set(-0.044, 0.025, 0.144);
  const browL = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.008, 0.008), eyebrowMat);
  browL.position.set(-0.044, 0.045, 0.138);

  const eyeRWhite = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.008), eyeWhiteMat);
  eyeRWhite.position.set(0.044, 0.025, 0.14);
  const eyeRPupil = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.016, 0.01), pupilMat);
  eyeRPupil.position.set(0.044, 0.025, 0.144);
  const browR = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.008, 0.008), eyebrowMat);
  browR.position.set(0.044, 0.045, 0.138);

  // Nose Bridge
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.028, 0.025), humanSkinMat);
  nose.position.set(0, 0.005, 0.15);

  // Warm, Friendly Human Smile
  const smile = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.01, 0.01), mouthMat);
  smile.position.set(0, -0.04, 0.142);

  faceGroup.add(eyeLWhite, eyeLPupil, browL, eyeRWhite, eyeRPupil, browR, nose, smile);

  // Warm interior helmet cockpit light (illuminates the face from inside helmet!)
  const faceLight = new THREE.PointLight(0xffedd5, 1.4, 0.8, 1.5);
  faceLight.position.set(0, 0.12, 0.12);
  faceGroup.add(faceLight);

  head.add(faceGroup);

  // Transparent Protective Visor Bubble with clear view of the astronaut face
  const visorGeom = new THREE.SphereGeometry(0.24, 24, 24, 0, Math.PI, 0, Math.PI * 0.72);
  const visor = new THREE.Mesh(visorGeom, goldVisorMat);
  visor.rotation.x = -Math.PI * 0.12;
  visor.position.set(0, 0.02, 0.09);
  head.add(visor);

  // Golden Sun Shield Brow Visor Trim (retracted upper gold visor)
  const visorRimGeom = new THREE.TorusGeometry(0.245, 0.015, 8, 24, Math.PI * 0.9);
  const visorRim = new THREE.Mesh(visorRimGeom, goldVisorRim);
  visorRim.rotation.set(-Math.PI * 0.18, 0, -Math.PI * 0.05);
  visorRim.position.set(0, 0.12, 0.07);
  head.add(visorRim);

  // Dual Helmet Utility EVA Lights
  const lightL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 8), metalTrim);
  lightL.rotation.z = Math.PI * 0.5;
  lightL.position.set(-0.25, 0.06, 0.08);
  const lightR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.06, 8), metalTrim);
  lightR.rotation.z = Math.PI * 0.5;
  lightR.position.set(0.25, 0.06, 0.08);
  head.add(lightL, lightR);

  // ---------------- Arms with Human Elbow Joint ----------------
  // Left Arm (Pivot at Shoulder)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.35, 0.46, 0);
  torso.add(leftArm);
  const leftShoulderPad = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), suitJointRibs);
  leftArm.add(leftShoulderPad);
  const upperArmGeom = new THREE.CylinderGeometry(0.075, 0.07, 0.28, 10);
  const leftUpperMesh = new THREE.Mesh(upperArmGeom, suitFabric);
  leftUpperMesh.position.y = -0.14;
  leftUpperMesh.castShadow = true;
  leftArm.add(leftUpperMesh);

  // Left Forearm (Pivot at Elbow)
  const leftForearm = new THREE.Group();
  leftForearm.position.set(0, -0.28, 0);
  leftArm.add(leftForearm);
  const leftElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), suitJointRibs);
  leftForearm.add(leftElbowJoint);
  const forearmGeom = new THREE.CylinderGeometry(0.07, 0.065, 0.25, 10);
  const leftLowerMesh = new THREE.Mesh(forearmGeom, suitFabric);
  leftLowerMesh.position.y = -0.13;
  leftLowerMesh.castShadow = true;
  leftForearm.add(leftLowerMesh);

  // Left Hand (Articulated Glove with Thumb)
  const glovePalm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.06), suitJointRibs);
  glovePalm.position.set(0, -0.28, 0);
  leftForearm.add(glovePalm);
  const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), suitJointRibs);
  thumb.position.set(0.04, -0.26, 0.03);
  leftForearm.add(thumb);

  // Right Arm (Pivot at Shoulder)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.35, 0.46, 0);
  torso.add(rightArm);
  const rightShoulderPad = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), suitJointRibs);
  rightArm.add(rightShoulderPad);
  const rightUpperMesh = new THREE.Mesh(upperArmGeom, suitFabric);
  rightUpperMesh.position.y = -0.14;
  rightUpperMesh.castShadow = true;
  rightArm.add(rightUpperMesh);

  // Right Forearm (Pivot at Elbow)
  const rightForearm = new THREE.Group();
  rightForearm.position.set(0, -0.28, 0);
  rightArm.add(rightForearm);
  const rightElbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), suitJointRibs);
  rightForearm.add(rightElbowJoint);
  const rightLowerMesh = new THREE.Mesh(forearmGeom, suitFabric);
  rightLowerMesh.position.y = -0.13;
  rightLowerMesh.castShadow = true;
  rightForearm.add(rightLowerMesh);

  const rightGlovePalm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.06), suitJointRibs);
  rightGlovePalm.position.set(0, -0.28, 0);
  rightForearm.add(rightGlovePalm);
  const rightThumb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.03), suitJointRibs);
  rightThumb.position.set(-0.04, -0.26, 0.03);
  rightForearm.add(rightThumb);

  // ---------------- Legs with Articulated Knee & Grounded Boots ----------------
  // Total leg length: Thigh (0.44m) + Shin (0.40m) + Boot (0.12m) = 0.96m (Exactly reaches y = 0!)
  
  // Left Leg (Pivot at Hip: y = 0.96m)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0, 0);
  pelvis.add(leftLeg);

  const thighGeom = new THREE.CylinderGeometry(0.1, 0.09, 0.44, 10);
  const leftThighMesh = new THREE.Mesh(thighGeom, suitFabric);
  leftThighMesh.position.y = -0.22;
  leftThighMesh.castShadow = true;
  leftLeg.add(leftThighMesh);

  // Left Knee & Shin (Pivot at Knee: y = -0.44m relative to hip)
  const leftShin = new THREE.Group();
  leftShin.position.set(0, -0.44, 0);
  leftLeg.add(leftShin);

  const leftKneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), suitJointRibs);
  leftShin.add(leftKneeCap);

  const shinGeom = new THREE.CylinderGeometry(0.09, 0.085, 0.4, 10);
  const leftShinMesh = new THREE.Mesh(shinGeom, suitFabric);
  leftShinMesh.position.y = -0.2;
  leftShinMesh.castShadow = true;
  leftShin.add(leftShinMesh);

  // Lunar Heavy-Tread Overboot (Sole sits flush at y = 0 when standing)
  const leftBoot = new THREE.Group();
  leftBoot.position.set(0, -0.4, 0.06);
  const bootBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.3), bootRubber);
  bootBody.position.y = -0.06;
  bootBody.castShadow = true;
  leftBoot.add(bootBody);
  const blueHeel = new THREE.Mesh(new THREE.BoxGeometry(0.182, 0.03, 0.12), suitBlueAccent);
  blueHeel.position.set(0, -0.1, -0.08);
  leftBoot.add(blueHeel);
  leftShin.add(leftBoot);

  // Right Leg (Pivot at Hip: y = 0.96m)
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0, 0);
  pelvis.add(rightLeg);

  const rightThighMesh = new THREE.Mesh(thighGeom, suitFabric);
  rightThighMesh.position.y = -0.22;
  rightThighMesh.castShadow = true;
  rightLeg.add(rightThighMesh);

  // Right Knee & Shin
  const rightShin = new THREE.Group();
  rightShin.position.set(0, -0.44, 0);
  rightLeg.add(rightShin);

  const rightKneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), suitJointRibs);
  rightShin.add(rightKneeCap);

  const rightShinMesh = new THREE.Mesh(shinGeom, suitFabric);
  rightShinMesh.position.y = -0.2;
  rightShinMesh.castShadow = true;
  rightShin.add(rightShinMesh);

  const rightBoot = new THREE.Group();
  rightBoot.position.set(0, -0.4, 0.06);
  const rBootBody = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.3), bootRubber);
  rBootBody.position.y = -0.06;
  rBootBody.castShadow = true;
  rightBoot.add(rBootBody);
  const rBlueHeel = new THREE.Mesh(new THREE.BoxGeometry(0.182, 0.03, 0.12), suitBlueAccent);
  rBlueHeel.position.set(0, -0.1, -0.08);
  rightBoot.add(rBlueHeel);
  rightShin.add(rightBoot);

  // ---------------- Human Walking & Interaction Kinematics ----------------
  const updateAnimation = (
    isMoving: boolean,
    isWaving: boolean,
    time: number,
    isRepairing?: boolean,
    turnDelta: number = 0
  ) => {
    if (isMoving) {
      const walkFreq = 7.5; // Natural astronaut strides in lunar 1/6th gravity
      const swingL = Math.sin(time * walkFreq);
      const swingR = -swingL;

      // Hip flexion / extension
      leftLeg.rotation.x = swingL * 0.45;
      rightLeg.rotation.x = swingR * 0.45;

      // Realistic human knee bend: leg bends backwards during forward swing
      leftShin.rotation.x = swingL < 0 ? Math.abs(swingL) * 0.65 : 0.08;
      rightShin.rotation.x = swingR < 0 ? Math.abs(swingR) * 0.65 : 0.08;

      // Ankle / boot level compensation so boots clear ground without dragging
      leftBoot.rotation.x = swingL < 0 ? -Math.abs(swingL) * 0.25 : 0.04;
      rightBoot.rotation.x = swingR < 0 ? -Math.abs(swingR) * 0.25 : 0.04;

      // Natural arm pendulum with slight elbow flexion
      leftArm.rotation.x = -swingL * 0.48;
      leftForearm.rotation.x = -0.28 - Math.abs(swingL) * 0.22;

      rightArm.rotation.x = swingL * 0.48;
      rightForearm.rotation.x = -0.28 - Math.abs(swingR) * 0.22;

      // Torso & Pelvis vertical lunar bounce and gentle sway
      const bounce = Math.abs(Math.sin(time * walkFreq)) * 0.065;
      pelvis.position.y = 0.96 + bounce;
      torso.rotation.y = Math.sin(time * walkFreq) * 0.09;
      head.rotation.y = -torso.rotation.y * 0.65; // Eyes stabilize forward
    } else if (isRepairing) {
      // Station Maintenance / Console Diagnostic Calibration pose
      const workPulse = Math.sin(time * 6.0) * 0.06;
      pelvis.position.y = 0.96;
      leftLeg.rotation.x = 0.08;
      rightLeg.rotation.x = -0.08;
      leftShin.rotation.x = 0.05;
      rightShin.rotation.x = 0.05;

      // Both arms raised forward at console height with active hands
      leftArm.rotation.x = -0.75 + workPulse * 0.5;
      leftArm.rotation.z = 0.18;
      leftForearm.rotation.x = -0.85 + workPulse;
      leftForearm.rotation.z = -0.15;

      rightArm.rotation.x = -0.82 - workPulse * 0.5;
      rightArm.rotation.z = -0.18;
      rightForearm.rotation.x = -0.88 - workPulse;
      rightForearm.rotation.z = 0.15;

      torso.rotation.x = 0.08; // Slight forward lean into console
      head.rotation.x = 0.14; // Looking down at diagnostic readout
      head.rotation.y = Math.sin(time * 1.5) * 0.08;
    } else if (isWaving) {
      // Friendly Astronaut Greeting Wave
      pelvis.position.y = 0.96;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftShin.rotation.x = 0.04;
      rightShin.rotation.x = 0.04;

      leftArm.rotation.x = 0.1;
      leftForearm.rotation.x = -0.15;

      // Right arm raised in greeting
      rightArm.rotation.x = Math.PI * 0.85;
      rightArm.rotation.z = -0.3;
      rightForearm.rotation.x = -0.4;
      rightForearm.rotation.z = Math.sin(time * 12) * 0.35;

      torso.rotation.y = 0;
      head.rotation.y = 0;
    } else if (Math.abs(turnDelta) > 0.01) {
      // In-place turning animation with leg shuffle
      const shuffle = Math.sin(time * 14.0) * Math.sign(turnDelta) * 0.25;
      pelvis.position.y = 0.96 + Math.abs(shuffle) * 0.03;
      leftLeg.rotation.x = shuffle;
      rightLeg.rotation.x = -shuffle;
      leftShin.rotation.x = Math.max(0.04, -shuffle * 0.5);
      rightShin.rotation.x = Math.max(0.04, shuffle * 0.5);

      torso.rotation.y = turnDelta * 0.4;
      head.rotation.y = turnDelta * 0.2;
    } else {
      // Idle: Realistic Human Breathing & Relaxed Posture
      const breath = Math.sin(time * 2.2) * 0.015;
      pelvis.position.y = 0.96 + breath;
      torso.position.y = 0.15 + breath * 0.5;
      torso.rotation.x = 0;
      head.rotation.x = 0;

      leftLeg.rotation.x = 0.04;
      rightLeg.rotation.x = -0.04;
      leftShin.rotation.x = 0.04;
      rightShin.rotation.x = 0.04;
      leftBoot.rotation.x = 0;
      rightBoot.rotation.x = 0;

      leftArm.rotation.x = 0.06 + breath;
      leftForearm.rotation.x = -0.18;
      rightArm.rotation.x = 0.06 + breath;
      rightForearm.rotation.x = -0.18;
      rightArm.rotation.z = 0;
      rightForearm.rotation.z = 0;

      // Head subtly surveying the lunar outpost
      head.rotation.y = Math.sin(time * 0.5) * 0.12;
    }
  };

  return {
    group,
    leftLeg,
    rightLeg,
    leftShin,
    rightShin,
    leftArm,
    rightArm,
    leftForearm,
    rightForearm,
    torso,
    head,
    updateAnimation,
  };
}

// -------------------------------------------------------------
// Historic Lost Spacecraft Crash Site & Memorial Beacon Probe
// -------------------------------------------------------------
export interface MysteryProbeModel {
  group: THREE.Group;
  beaconLight: THREE.PointLight;
  antennaDish: THREE.Mesh;
  updateAnimation: (time: number) => void;
}

export function createMysteryProbe(): MysteryProbeModel {
  const group = new THREE.Group();

  const goldFoil = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.92,
    roughness: 0.2,
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.8,
    roughness: 0.3,
  });
  const solarBlue = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.85,
    roughness: 0.25,
  });
  const memorialGold = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    metalness: 0.95,
    roughness: 0.1,
  });

  // Half-buried octagonal probe bus (resting in crater sand)
  const busGeom = new THREE.CylinderGeometry(1.6, 1.8, 1.4, 8);
  const bus = new THREE.Mesh(busGeom, goldFoil);
  bus.position.set(0, 0.6, 0);
  bus.rotation.z = 0.25; // Tilted crash pose
  bus.castShadow = true;
  group.add(bus);

  // Mangled Solar Panel Wing
  const wingGeom = new THREE.BoxGeometry(2.8, 1.2, 0.08);
  const wing = new THREE.Mesh(wingGeom, solarBlue);
  wing.position.set(-1.8, 1.2, 0.4);
  wing.rotation.set(0.3, 0.4, 0.5);
  wing.castShadow = true;
  group.add(wing);

  // Parabolic High-Gain Dish tilted toward stars
  const dishGeom = new THREE.CylinderGeometry(1.4, 0.2, 0.5, 18, 1, true);
  const antennaDish = new THREE.Mesh(dishGeom, darkMetal);
  antennaDish.position.set(0.6, 1.8, -0.3);
  antennaDish.rotation.set(-0.6, 0.2, -0.4);
  antennaDish.castShadow = true;
  group.add(antennaDish);

  // Golden Historical Flight Recorder Disc (Plaque to NASA Fallen Pioneers)
  const discGeom = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 24);
  const disc = new THREE.Mesh(discGeom, memorialGold);
  disc.position.set(0.2, 1.4, 0.8);
  disc.rotation.x = Math.PI * 0.4;
  group.add(disc);

  // Quantum Mystery Radio Beacon Light (Flashes mysterious cosmic purple/cyan)
  const beaconLight = new THREE.PointLight(0xa855f7, 2.5, 20, 1.2);
  beaconLight.position.set(0.6, 2.3, -0.3);
  group.add(beaconLight);

  const beaconBulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0xa855f7, emissiveIntensity: 1.0 })
  );
  beaconBulb.position.copy(beaconLight.position);
  group.add(beaconBulb);

  const updateAnimation = (time: number) => {
    // Pulsating distress pulse: flashes between purple and cyan
    const pulse = 0.5 + 0.5 * Math.sin(time * 4.0);
    beaconLight.intensity = 1.2 + pulse * 2.0;
    (beaconBulb.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + pulse * 1.5;
  };

  return { group, beaconLight, antennaDish, updateAnimation };
}

// 2. Central Habitat: Professional modular lunar research facility with walk-in airlock & interior
export function createHabitat(): THREE.Group {
  const group = new THREE.Group();

  // High-fidelity materials
  const compositeWallMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.35,
    metalness: 0.25,
  });
  const accentBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.3,
    metalness: 0.5,
  });
  const darkTrussMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.8,
    metalness: 0.4,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.08,
    metalness: 0.3,
    transparent: true,
    opacity: 0.55,
  });
  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.85,
    roughness: 0.25,
  });
  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.35,
    roughness: 0.6,
  });
  const interiorFloorMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.6,
    metalness: 0.5,
  });

  // --- Foundation & Hydraulic Leveling Jacks ---
  const foundation = new THREE.Mesh(
    new THREE.CylinderGeometry(5.8, 6.0, 0.4, 6),
    darkTrussMat
  );
  foundation.position.y = 0.2;
  foundation.receiveShadow = true;
  group.add(foundation);

  // 6 Heavy hydraulic leveling jacks at corners
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const px = Math.cos(angle) * 5.6;
    const pz = Math.sin(angle) * 5.6;

    const jackCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8), darkTrussMat);
    jackCyl.position.set(px, 0.2, pz);
    group.add(jackCyl);

    const footpad = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 8), goldFoilMat);
    footpad.position.set(px, 0.05, pz);
    group.add(footpad);
  }

  // --- Walk-in Interior Command Deck Floor ---
  const interiorFloor = new THREE.Mesh(
    new THREE.CylinderGeometry(4.7, 4.7, 0.1, 16),
    interiorFloorMat
  );
  interiorFloor.position.y = 0.35;
  interiorFloor.receiveShadow = true;
  group.add(interiorFloor);

  // --- Central Habitat Core (Octagonal / Cylindrical with Ribs) ---
  const coreBody = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 5.0, 3.2, 12, 1, true),
    compositeWallMat
  );
  coreBody.position.y = 1.9;
  coreBody.castShadow = true;
  coreBody.receiveShadow = true;
  group.add(coreBody);

  // Structural vertical support ribs
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    // Omit rib at the front doorway (angle near PI/2 or ~90 deg)
    if (Math.abs(angle - Math.PI * 0.5) < 0.25) continue;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.3, 0.35), accentBlueMat);
    rib.position.set(Math.cos(angle) * 4.95, 1.9, Math.sin(angle) * 4.95);
    rib.rotation.y = -angle;
    group.add(rib);
  }

  // Horizontal NASA Blue Accent Belt
  const beltRing = new THREE.Mesh(new THREE.TorusGeometry(4.92, 0.12, 8, 24), accentBlueMat);
  beltRing.rotation.x = Math.PI * 0.5;
  beltRing.position.y = 2.4;
  group.add(beltRing);

  // --- Flanking Laboratory Pods (East & West modules) ---
  const podPositions = [
    { x: -4.6, z: -0.6, rot: 0.3, label: 'LAB' },
    { x: 4.6, z: -0.6, rot: -0.3, label: 'ECLSS' },
  ];
  podPositions.forEach((pod) => {
    // Inter-module connector tunnel
    const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.8, 10), compositeWallMat);
    tunnel.rotation.z = Math.PI * 0.5;
    tunnel.position.set(pod.x * 0.65, 1.5, pod.z);
    group.add(tunnel);

    // Pod body
    const podBody = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.0, 2.6, 10), compositeWallMat);
    podBody.position.set(pod.x, 1.6, pod.z);
    podBody.castShadow = true;
    group.add(podBody);

    // Pod hemispherical cap
    const podCap = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
      compositeWallMat
    );
    podCap.position.set(pod.x, 2.9, pod.z);
    group.add(podCap);

    // Pod observation window
    const podWin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.1), glassMat);
    podWin.position.set(pod.x, 2.0, pod.z + 1.92);
    group.add(podWin);
  });

  // --- Observation Windows on Main Body ---
  const winAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
  winAngles.forEach((ang) => {
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.15), darkTrussMat);
    winFrame.position.set(Math.cos(ang) * 4.9, 2.3, Math.sin(ang) * 4.9);
    winFrame.rotation.y = -ang + Math.PI * 0.5;
    group.add(winFrame);

    const winGlass = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.08), glassMat);
    winGlass.position.copy(winFrame.position);
    winGlass.rotation.copy(winFrame.rotation);
    group.add(winGlass);
  });

  // --- Walk-in Forward Airlock Chamber (Protruding +Z) ---
  const airlockLength = 3.2;
  const airlockWidth = 2.4;
  const airlockHeight = 2.2;
  const airlockCenterZ = 4.7;

  // Airlock Side Walls (allowing interior walkway)
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, airlockHeight, airlockLength),
    compositeWallMat
  );
  leftWall.position.set(-airlockWidth * 0.5, airlockHeight * 0.5 + 0.35, airlockCenterZ);
  group.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, airlockHeight, airlockLength),
    compositeWallMat
  );
  rightWall.position.set(airlockWidth * 0.5, airlockHeight * 0.5 + 0.35, airlockCenterZ);
  group.add(rightWall);

  // Airlock Ceiling Roof
  const airlockRoof = new THREE.Mesh(
    new THREE.BoxGeometry(airlockWidth + 0.2, 0.2, airlockLength),
    compositeWallMat
  );
  airlockRoof.position.set(0, airlockHeight + 0.35, airlockCenterZ);
  group.add(airlockRoof);

  // Airlock Floor ramp leading inside smoothly
  const airlockRamp = new THREE.Mesh(
    new THREE.BoxGeometry(airlockWidth - 0.2, 0.12, airlockLength + 0.6),
    interiorFloorMat
  );
  airlockRamp.position.set(0, 0.38, airlockCenterZ);
  airlockRamp.receiveShadow = true;
  group.add(airlockRamp);

  // Outer Doorway Portal Frame with Open Walk-in Arch
  const portalZ = airlockCenterZ + airlockLength * 0.5;
  const doorHeader = new THREE.Mesh(new THREE.BoxGeometry(airlockWidth + 0.3, 0.5, 0.3), darkTrussMat);
  doorHeader.position.set(0, airlockHeight + 0.15, portalZ);
  group.add(doorHeader);

  const doorPostL = new THREE.Mesh(new THREE.BoxGeometry(0.4, airlockHeight, 0.3), darkTrussMat);
  doorPostL.position.set(-airlockWidth * 0.5, airlockHeight * 0.5 + 0.35, portalZ);
  group.add(doorPostL);

  const doorPostR = new THREE.Mesh(new THREE.BoxGeometry(0.4, airlockHeight, 0.3), darkTrussMat);
  doorPostR.position.set(airlockWidth * 0.5, airlockHeight * 0.5 + 0.35, portalZ);
  group.add(doorPostR);

  // Safety Hazard Chevron Threshold
  const hazardStep = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.4), hazardMat);
  hazardStep.position.set(0, 0.42, portalZ);
  group.add(hazardStep);

  // Airlock Exterior Status Light (Green = Pressurized & nominal)
  const lampGeom = new THREE.SphereGeometry(0.16, 12, 12);
  const lampMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.9,
  });
  const airlockStatusLamp = new THREE.Mesh(lampGeom, lampMat);
  airlockStatusLamp.position.set(0, airlockHeight + 0.55, portalZ + 0.15);
  group.add(airlockStatusLamp);

  // Airlock keypad console
  const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 0.08), accentBlueMat);
  keypad.position.set(airlockWidth * 0.5 + 0.22, 1.4, portalZ - 0.2);
  group.add(keypad);

  // --- Interior Command Room Features (Walk-in Accessible) ---
  // 1. Central Holographic Briefing Table
  const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, 0.7, 16), darkTrussMat);
  tableBase.position.set(0, 0.7, 0);
  tableBase.castShadow = true;
  group.add(tableBase);

  const holoProjectorRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, 0.08, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 0.8 })
  );
  holoProjectorRim.rotation.x = Math.PI * 0.5;
  holoProjectorRim.position.set(0, 1.06, 0);
  group.add(holoProjectorRim);

  // Floating 3D Holographic Moon Sphere
  const holoMoon = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.75,
    })
  );
  holoMoon.position.set(0, 1.6, 0);
  group.add(holoMoon);

  // Orbital coordinate ring around holographic moon
  const orbitRing = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.58, 24),
    new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide })
  );
  orbitRing.rotation.x = 0.5;
  orbitRing.position.set(0, 1.6, 0);
  group.add(orbitRing);

  // 2. Interior Workstations & Monitors
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0369a1,
    emissiveIntensity: 0.7,
  });
  const consoleDeskAngles = [-Math.PI * 0.7, Math.PI * 0.7, Math.PI];
  consoleDeskAngles.forEach((ang) => {
    const cDesk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.6), darkTrussMat);
    cDesk.position.set(Math.cos(ang) * 3.6, 0.7, Math.sin(ang) * 3.6);
    cDesk.rotation.y = -ang + Math.PI * 0.5;
    group.add(cDesk);

    const cScreen = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.05), screenMat);
    cScreen.position.set(Math.cos(ang) * 3.75, 1.3, Math.sin(ang) * 3.75);
    cScreen.rotation.y = -ang + Math.PI * 0.5;
    group.add(cScreen);

    // Operator Chair
    const chair = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.45), accentBlueMat);
    chair.position.set(Math.cos(ang) * 2.8, 0.6, Math.sin(ang) * 2.8);
    chair.rotation.y = -ang + Math.PI * 0.5;
    group.add(chair);
  });

  // Interior Warm Lighting
  const interiorLight = new THREE.PointLight(0xffedd5, 2.0, 10, 1.2);
  interiorLight.position.set(0, 2.8, 0);
  group.add(interiorLight);

  // Airlock corridor illumination
  const corridorLight = new THREE.PointLight(0xbae6fd, 1.2, 5, 1.5);
  corridorLight.position.set(0, 2.1, 4.2);
  group.add(corridorLight);

  // --- Top Observation Cupola Skylight ---
  const cupolaBase = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.2, 0.5, 8), darkTrussMat);
  cupolaBase.position.y = 3.65;
  group.add(cupolaBase);

  const cupolaDome = new THREE.Mesh(
    new THREE.SphereGeometry(1.9, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    glassMat
  );
  cupolaDome.position.y = 3.8;
  group.add(cupolaDome);

  // High-gain communication stub antenna on cupola
  const habAntenna = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), darkTrussMat);
  habAntenna.position.set(1.2, 5.0, -0.8);
  group.add(habAntenna);

  // Life support conduit lines emerging from base
  const conduitMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.4 });
  const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.0, 8), conduitMat);
  conduit.rotation.z = Math.PI * 0.5;
  conduit.position.set(3.5, 0.35, -2.5);
  group.add(conduit);

  return group;
}

// Dedicated Octagonal Reinforced Blast Landing Pad
export function createLandingPad(): THREE.Group {
  const group = new THREE.Group();

  const padMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.85,
    metalness: 0.3,
  });
  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.6,
  });
  const whiteMarkMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.7,
    roughness: 0.3,
  });

  // Elevated 18m Octagonal Blast Deck
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(9.0, 9.4, 0.35, 8), padMat);
  deck.position.y = 0.175;
  deck.receiveShadow = true;
  group.add(deck);

  // Blast-deflector chamfered curb
  const curb = new THREE.Mesh(new THREE.TorusGeometry(8.9, 0.25, 6, 8), metalMat);
  curb.rotation.x = Math.PI * 0.5;
  curb.position.y = 0.35;
  group.add(curb);

  // Outer Yellow Hazard Warning Ring
  const hazardRing = new THREE.Mesh(new THREE.RingGeometry(8.1, 8.6, 8), hazardMat);
  hazardRing.rotation.x = -Math.PI * 0.5;
  hazardRing.position.y = 0.36;
  group.add(hazardRing);

  // Center Touchdown Target Circles
  const outerCircle = new THREE.Mesh(new THREE.RingGeometry(5.2, 5.5, 32), whiteMarkMat);
  outerCircle.rotation.x = -Math.PI * 0.5;
  outerCircle.position.y = 0.36;
  group.add(outerCircle);

  const innerCircle = new THREE.Mesh(new THREE.RingGeometry(2.4, 2.65, 32), whiteMarkMat);
  innerCircle.rotation.x = -Math.PI * 0.5;
  innerCircle.position.y = 0.36;
  group.add(innerCircle);

  // Bold Artemis Touchdown Crosshair
  const crosshairA = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 3.6), whiteMarkMat);
  crosshairA.rotation.x = -Math.PI * 0.5;
  crosshairA.position.y = 0.365;
  group.add(crosshairA);

  const crosshairB = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.3), whiteMarkMat);
  crosshairB.rotation.x = -Math.PI * 0.5;
  crosshairB.position.y = 0.365;
  group.add(crosshairB);

  // 8 Perimeter Runway Taxiway Beacon Lights
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + Math.PI / 8;
    const px = Math.cos(angle) * 8.8;
    const pz = Math.sin(angle) * 8.8;

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), metalMat);
    post.position.set(px, 0.45, pz);
    group.add(post);

    const isGreen = i % 2 === 0;
    const beaconColor = isGreen ? 0x22c55e : 0xf59e0b;
    const beaconBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 8, 8),
      new THREE.MeshStandardMaterial({
        color: beaconColor,
        emissive: beaconColor,
        emissiveIntensity: 0.9,
      })
    );
    beaconBulb.position.set(px, 0.8, pz);
    group.add(beaconBulb);
  }

  // Cryogenic Fueling Umbilical Skid at edge of landing zone
  const skidBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.4), metalMat);
  skidBase.position.set(7.5, 0.35, 2.5);
  group.add(skidBase);

  // Umbilical fuel pipes routing towards lander
  const fuelPipeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.2, 8), fuelPipeMat);
  pipe.rotation.z = Math.PI * 0.45;
  pipe.position.set(5.8, 0.8, 1.8);
  group.add(pipe);

  return group;
}

// 3. Artemis Lunar Lander Spacecraft
export function createLander(): THREE.Group {
  const group = new THREE.Group();

  const goldMylarMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.88,
    roughness: 0.22,
  });
  const silverCabinMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.85,
    roughness: 0.2,
  });
  const darkTitaniumMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.7,
    roughness: 0.35,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.65,
  });

  // --- Octagonal Descent Stage (MLI gold foil wrapped) ---
  const descentGeom = new THREE.CylinderGeometry(3.3, 3.6, 2.4, 8);
  const descentMesh = new THREE.Mesh(descentGeom, goldMylarMat);
  descentMesh.position.y = 2.6;
  descentMesh.castShadow = true;
  group.add(descentMesh);

  // Main Methalox Engine Bell
  const bellGeom = new THREE.ConeGeometry(1.2, 2.0, 20, 1, true);
  const bellMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.25 });
  const bell = new THREE.Mesh(bellGeom, bellMat);
  bell.position.y = 1.1;
  group.add(bell);

  // Engine regenerative cooling manifold ring
  const manifold = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 20), goldMylarMat);
  manifold.rotation.x = Math.PI * 0.5;
  manifold.position.y = 1.6;
  group.add(manifold);

  // --- 4 Heavy Outrigger Landing Gear Struts & Footpads ---
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const leg = new THREE.Group();
    leg.position.set(Math.cos(angle) * 3.1, 2.4, Math.sin(angle) * 3.1);

    // Primary shock-absorbing strut
    const strutGeom = new THREE.CylinderGeometry(0.12, 0.12, 3.6, 8);
    const strut = new THREE.Mesh(strutGeom, darkTitaniumMat);
    strut.rotation.z = (Math.PI / 4) * Math.sin(angle);
    strut.rotation.x = -(Math.PI / 4) * Math.cos(angle);
    strut.position.set(Math.cos(angle) * 1.4, -1.3, Math.sin(angle) * 1.4);
    leg.add(strut);

    // Secondary A-frame tension braces
    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 6), darkTitaniumMat);
    brace.position.set(Math.cos(angle) * 0.8, -0.6, Math.sin(angle) * 0.8);
    leg.add(brace);

    // Large circular dish footpad (diameter 1.4m)
    const padGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.14, 16);
    const pad = new THREE.Mesh(padGeom, goldMylarMat);
    pad.position.set(Math.cos(angle) * 2.5, -2.28, Math.sin(angle) * 2.5);
    leg.add(pad);

    group.add(leg);
  }

  // --- 4 Reaction Control System (RCS) Quad Thruster Pods ---
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const rcsPod = new THREE.Group();
    rcsPod.position.set(Math.cos(angle) * 3.4, 3.5, Math.sin(angle) * 3.4);

    const podBlock = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), darkTitaniumMat);
    rcsPod.add(podBlock);

    // 4 miniature thruster nozzles per pod
    const nozzleGeom = new THREE.ConeGeometry(0.06, 0.15, 8);
    const nozzleOffsets = [
      { pos: [0.18, 0, 0], rot: [0, 0, -Math.PI * 0.5] },
      { pos: [-0.18, 0, 0], rot: [0, 0, Math.PI * 0.5] },
      { pos: [0, 0.18, 0], rot: [0, 0, 0] },
      { pos: [0, 0, 0.18], rot: [Math.PI * 0.5, 0, 0] },
    ];
    nozzleOffsets.forEach((noz) => {
      const nMesh = new THREE.Mesh(nozzleGeom, bellMat);
      nMesh.position.set(noz.pos[0], noz.pos[1], noz.pos[2]);
      nMesh.rotation.set(noz.rot[0], noz.rot[1], noz.rot[2]);
      rcsPod.add(nMesh);
    });

    group.add(rcsPod);
  }

  // --- Upper Pressurized Crew Ascent Cabin ---
  const cabinGeom = new THREE.CylinderGeometry(2.4, 2.9, 3.4, 16);
  const cabin = new THREE.Mesh(cabinGeom, silverCabinMat);
  cabin.position.y = 5.2;
  cabin.castShadow = true;
  group.add(cabin);

  // Cockpit Forward Panoramic Flight Windows
  const cockpitWin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.7, 0.1), glassMat);
  cockpitWin.position.set(0, 5.8, 2.5);
  group.add(cockpitWin);

  // Conical Nose Fairing & Docking Mechanism
  const noseGeom = new THREE.ConeGeometry(2.4, 1.6, 16);
  const nose = new THREE.Mesh(noseGeom, silverCabinMat);
  nose.position.y = 7.7;
  group.add(nose);

  const dockRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.16, 8, 24), darkTitaniumMat);
  dockRing.rotation.x = Math.PI * 0.5;
  dockRing.position.y = 8.5;
  group.add(dockRing);

  // Deployable Crew Ingress/Egress Ladder down front strut
  const ladder = new THREE.Group();
  ladder.position.set(0, 2.3, 3.8);
  const railGeom = new THREE.CylinderGeometry(0.04, 0.04, 4.4, 6);
  const railL = new THREE.Mesh(railGeom, darkTitaniumMat);
  railL.position.x = -0.3;
  const railR = new THREE.Mesh(railGeom, darkTitaniumMat);
  railR.position.x = 0.3;
  ladder.add(railL, railR);
  for (let r = 0; r < 9; r++) {
    const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), darkTitaniumMat);
    rung.rotation.z = Math.PI * 0.5;
    rung.position.y = -1.8 + r * 0.45;
    ladder.add(rung);
  }
  ladder.rotation.x = -0.25;
  group.add(ladder);

  return group;
}

// 4. Photovoltaic Solar Array Farm with primary dual-axis tracking array and flank panels
export interface SolarArrayModel {
  group: THREE.Group;
  panelsGroup: THREE.Group;
  dustMesh: THREE.Mesh;
  setDustCleanliness: (percent: number) => void;
}

export function createSolarArray(initialCleanliness = 60): SolarArrayModel {
  const group = new THREE.Group();

  const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.3 });
  const solarCellMat = new THREE.MeshStandardMaterial({
    map: createSolarCellTexture(),
    metalness: 0.85,
    roughness: 0.15,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
  const goldFoilMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25 });
  const cableMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

  // Heavy hexagonal concrete foundation with perimeter anchor bolts
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.4, 6), darkMetalMat);
  base.position.y = 0.2;
  base.receiveShadow = true;
  group.add(base);

  // Heavy triangular lattice support mast (elevation 5.2m)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 5.2, 6), trussMat);
  mast.position.y = 2.8;
  mast.castShadow = true;
  group.add(mast);

  // Diagonal support guy braces
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 6), trussMat);
    brace.position.set(Math.cos(angle) * 1.0, 1.2, Math.sin(angle) * 1.0);
    brace.rotation.z = Math.sin(angle) * 0.45;
    brace.rotation.x = -Math.cos(angle) * 0.45;
    group.add(brace);
  }

  // Motorized dual-axis tracking gimbal
  const gimbal = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), darkMetalMat);
  gimbal.position.y = 5.4;
  group.add(gimbal);

  // Tilting primary panels group
  const panelsGroup = new THREE.Group();
  panelsGroup.position.y = 5.4;

  // Heavy horizontal backing crossbar
  const crossbar = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.35, 0.25), darkMetalMat);
  panelsGroup.add(crossbar);

  // Twin Solar Panel Wings (Left & Right) with multi-junction photovoltaic cells
  const panelGeom = new THREE.BoxGeometry(3.6, 5.2, 0.12);
  const leftPanel = new THREE.Mesh(panelGeom, solarCellMat);
  leftPanel.position.x = -2.1;
  leftPanel.castShadow = true;
  panelsGroup.add(leftPanel);

  const rightPanel = new THREE.Mesh(panelGeom, solarCellMat);
  rightPanel.position.x = 2.1;
  rightPanel.castShadow = true;
  panelsGroup.add(rightPanel);

  // Interactive Dust layer overlay mesh
  const dustMat = new THREE.MeshStandardMaterial({
    color: 0x78716c,
    roughness: 0.95,
    metalness: 0.05,
    transparent: true,
    opacity: ((100 - initialCleanliness) / 100) * 0.78,
  });
  const dustGeom = new THREE.BoxGeometry(7.9, 5.3, 0.16);
  const dustMesh = new THREE.Mesh(dustGeom, dustMat);
  dustMesh.position.z = 0.02;
  panelsGroup.add(dustMesh);

  // Tilt towards low-angle lunar polar sun
  panelsGroup.rotation.x = 0.25;
  panelsGroup.rotation.y = 0.4;
  group.add(panelsGroup);

  // --- Two Auxiliary Flank Tracking Panels (Solar Farm Array) ---
  const flankOffsets = [
    { x: -5.2, z: -1.8, rotY: 0.35 },
    { x: 5.2, z: -1.8, rotY: 0.45 },
  ];
  flankOffsets.forEach((flank) => {
    const fGroup = new THREE.Group();
    fGroup.position.set(flank.x, 0, flank.z);

    const fBase = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.3, 6), darkMetalMat);
    fBase.position.y = 0.15;
    fGroup.add(fBase);

    const fMast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.8, 6), trussMat);
    fMast.position.y = 2.0;
    fGroup.add(fMast);

    const fPanelGroup = new THREE.Group();
    fPanelGroup.position.y = 3.9;
    fPanelGroup.rotation.x = 0.28;
    fPanelGroup.rotation.y = flank.rotY;

    const fPanel = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.6, 0.1), solarCellMat);
    fPanel.castShadow = true;
    fPanelGroup.add(fPanel);

    fGroup.add(fPanelGroup);
    group.add(fGroup);
  });

  // High-voltage junction box at base with thick ground power cable
  const jBox = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, 0.6), darkMetalMat);
  jBox.position.set(0, 0.7, 1.4);
  group.add(jBox);

  // Status LED on junction box
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.8 })
  );
  led.position.set(0, 1.1, 1.72);
  group.add(led);

  // Heavy power conduit routing towards power station
  const mainCable = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4.5, 8), cableMat);
  mainCable.rotation.z = Math.PI * 0.5;
  mainCable.position.set(2.2, 0.1, 1.4);
  group.add(mainCable);

  const setDustCleanliness = (percent: number) => {
    const clamped = Math.max(0, Math.min(100, percent));
    dustMat.opacity = ((100 - clamped) / 100) * 0.78;
  };

  return { group, panelsGroup, dustMesh, setDustCleanliness };
}

// 5. Battery & Regenerative Power Station Module
export function createPowerStationModule(): THREE.Group {
  const group = new THREE.Group();

  const cabinetMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.7,
    roughness: 0.35,
  });
  const drawerMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.6,
    roughness: 0.4,
  });
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.85,
    roughness: 0.25,
  });
  const conduitMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    metalness: 0.75,
    roughness: 0.3,
  });

  // Base platform
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.35, 2.6), cabinetMat);
  base.position.y = 0.175;
  group.add(base);

  // Main high-density battery containment enclosure
  const mainBody = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 2.2), cabinetMat);
  mainBody.position.y = 1.45;
  mainBody.castShadow = true;
  group.add(mainBody);

  // 6 Modular rack-mounted lithium-sulfur battery drawers with animated green charge LEDs
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const dx = -0.8 + col * 1.6;
      const dy = 0.8 + row * 0.55;

      // Drawer front plate
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 0.08), drawerMat);
      drawer.position.set(dx, dy, 1.14);
      group.add(drawer);

      // Handle bar
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), finMat);
      handle.rotation.z = Math.PI * 0.5;
      handle.position.set(dx, dy, 1.2);
      group.add(handle);

      // 4 Green Charge Level LEDs per drawer
      for (let l = 0; l < 4; l++) {
        const led = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.06, 0.04),
          new THREE.MeshStandardMaterial({
            color: 0x22c55e,
            emissive: 0x22c55e,
            emissiveIntensity: 0.9,
          })
        );
        led.position.set(dx - 0.35 + l * 0.22, dy + 0.12, 1.19);
        group.add(led);
      }
    }
  }

  // Regenerative PEM Fuel Cell Stack on the left flank
  const fcStack = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.8, 12), finMat);
  fcStack.position.set(-1.95, 1.2, 0);
  group.add(fcStack);

  // Rooftop Heat-Pipe Radiator Fins (to reject waste heat into space)
  for (let f = 0; f < 7; f++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.6, 0.06), finMat);
    fin.position.set(0, 2.85, -0.8 + f * 0.26);
    group.add(fin);
  }

  // High-voltage DC bus disconnect switch and status display
  const dispScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.6, 0.05),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
    })
  );
  dispScreen.position.set(0, 2.15, 1.14);
  group.add(dispScreen);

  // Shielded high-voltage power conduits
  const conduit = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), conduitMat);
  conduit.rotation.z = Math.PI * 0.5;
  conduit.position.set(0, 0.45, 1.25);
  group.add(conduit);

  return group;
}

// 6. Life Support Module (Sabatier + O2 Electrolysis + Cryo Spheres)
export function createLifeSupportModule(): THREE.Group {
  const group = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.5 });
  const metalWhite = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.35, metalness: 0.3 });
  const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.25, metalness: 0.85 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.8 });
  const tankMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.2, metalness: 0.75 });
  const valveMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
  const displayMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
  });

  // Heavy steel skid base platform with diamond pattern
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 3.4), frameMat);
  base.position.y = 0.175;
  base.receiveShadow = true;
  group.add(base);

  // --- Sabatier Catalytic Reactor Column with Spiral Copper Cooling Conduit ---
  const sabatierGroup = new THREE.Group();
  sabatierGroup.position.set(-1.4, 0, -0.4);

  const reactorBody = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.8, 16), metalWhite);
  reactorBody.position.y = 1.75;
  reactorBody.castShadow = true;
  sabatierGroup.add(reactorBody);

  const reactorCap = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), frameMat);
  reactorCap.position.y = 3.15;
  sabatierGroup.add(reactorCap);

  // Spiraling copper cooling heat-pipe coil around reactor
  for (let c = 0; c < 5; c++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 8, 20), copperMat);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.y = 0.8 + c * 0.45;
    sabatierGroup.add(ring);
  }
  group.add(sabatierGroup);

  // --- Dual Water Electrolysis High-Clarity Columns ---
  for (let e = 0; e < 2; e++) {
    const ex = -0.2 + e * 0.9;
    const colGroup = new THREE.Group();
    colGroup.position.set(ex, 0, -0.6);

    const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.4, 12), frameMat);
    baseCyl.position.y = 0.55;
    colGroup.add(baseCyl);

    // Sight-tube showing electrolysis bubbling fluid
    const sightTube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.8, 12),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.65,
      })
    );
    sightTube.position.y = 1.65;
    colGroup.add(sightTube);

    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12), metalWhite);
    topCap.position.y = 2.7;
    colGroup.add(topCap);

    group.add(colGroup);
  }

  // --- Trio of High-Pressure Cryogenic O2 Storage Spheres ---
  const sphereGeom = new THREE.SphereGeometry(0.65, 16, 16);
  const tankPositions = [
    { x: 1.5, z: -0.7 },
    { x: 1.5, z: 0.6 },
    { x: 0.5, z: 0.7 },
  ];
  tankPositions.forEach((pos) => {
    const tank = new THREE.Mesh(sphereGeom, tankMat);
    tank.position.set(pos.x, 1.25, pos.z);
    tank.castShadow = true;
    group.add(tank);

    // Tank support cradle
    const cradle = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.6, 8), frameMat);
    cradle.position.set(pos.x, 0.65, pos.z);
    group.add(cradle);

    // Brass manual isolation shutoff valve wheel
    const valve = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), valveMat);
    valve.position.set(pos.x, 1.95, pos.z);
    group.add(valve);

    // Analog dial pressure gauge
    const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12), frameMat);
    gauge.rotation.x = Math.PI * 0.5;
    gauge.position.set(pos.x, 1.45, pos.z + 0.66);
    group.add(gauge);
  });

  // --- High-Throughput Air Circulation Blower Unit ---
  const blowerBox = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.1), metalWhite);
  blowerBox.position.set(-1.4, 0.9, 0.9);
  group.add(blowerBox);

  // Protective circular safety grille
  const fanGrille = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 6, 16), frameMat);
  fanGrille.position.set(-1.4, 0.9, 1.46);
  group.add(fanGrille);

  // --- Overhead Manifold Conduit Pipes ---
  const pipeA = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8), pipeMat);
  pipeA.rotation.z = Math.PI * 0.5;
  pipeA.position.set(0, 2.9, -0.5);
  group.add(pipeA);

  const pipeB = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), pipeMat);
  pipeB.rotation.x = Math.PI * 0.5;
  pipeB.position.set(1.5, 2.4, 0);
  group.add(pipeB);

  // --- Diagnostic Operator Console & Telemetry Screen ---
  const consolePod = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.4), frameMat);
  consolePod.position.set(-0.3, 1.3, 1.3);
  group.add(consolePod);

  const diagScreen = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.6, 0.05), displayMat);
  diagScreen.position.set(-0.3, 1.4, 1.52);
  group.add(diagScreen);

  return group;
}

// 7. Closed-Loop Water Recovery System (ECLSS Multi-Stage Filtration)
export function createWaterRecoveryModule(): THREE.Group {
  const group = new THREE.Group();

  const cabinetMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.3 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.5 });
  const glassTubeMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.08,
    metalness: 0.2,
    transparent: true,
    opacity: 0.65,
  });
  const filterCapMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.6 });
  const valveMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.8 });
  const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.25 });

  // Main engineering skid base
  const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 2.8), darkMat);
  base.position.y = 0.175;
  base.receiveShadow = true;
  group.add(base);

  // Lower pump cabinet
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.9, 2.4), cabinetMat);
  cabinet.position.y = 0.8;
  cabinet.castShadow = true;
  group.add(cabinet);

  // Vacuum Rotary Distillation Centrifuge Drum on left
  const centrifuge = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.4, 16), darkMat);
  centrifuge.position.set(-1.3, 1.95, 0);
  centrifuge.castShadow = true;
  group.add(centrifuge);

  // Vibration dampeners beneath centrifuge
  const dampener = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.15, 16), filterCapMat);
  dampener.position.set(-1.3, 1.3, 0);
  group.add(dampener);

  // 4 Sequential Filtration Columns (Particulate, Catalytic Oxidizer, Ion Exchange, Microbial)
  for (let i = 0; i < 4; i++) {
    const colGroup = new THREE.Group();
    const xPos = -0.2 + i * 0.75;
    colGroup.position.set(xPos, 2.0, 0);

    // Translucent sight column showing purified water level
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 1.6, 14), glassTubeMat);
    colGroup.add(cyl);

    // Stainless top manifold cap
    const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 14), filterCapMat);
    topCap.position.y = 0.9;
    colGroup.add(topCap);

    // Brass manual sampling valve wheel
    const valve = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 16), valveMat);
    valve.position.set(0, 0, 0.3);
    colGroup.add(valve);

    group.add(colGroup);
  }

  // Interconnecting braided stainless steel fluid pipes
  const fluidPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), pipeMat);
  fluidPipe.rotation.z = Math.PI * 0.5;
  fluidPipe.position.set(0.9, 2.9, 0);
  group.add(fluidPipe);

  // Digital Water Purity Analyzer Screen (Showing 98.4% recycling efficiency)
  const display = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.5, 0.05),
    new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 0.85,
    })
  );
  display.position.set(-1.3, 1.8, 0.8);
  group.add(display);

  return group;
}

// 8. Lunar Greenhouse: Enclosed transparent biodome with walk-in central aisle & hydroponic racks
export interface GreenhouseModel {
  group: THREE.Group;
  plantsGroup: THREE.Group;
  growLight: THREE.PointLight;
  setPlantStage: (stage: PlantStage, seedType: string | null) => void;
}

export function createGreenhouse(): GreenhouseModel {
  const group = new THREE.Group();

  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.35, metalness: 0.25 });
  const darkTrussMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.5 });
  const domeGlass = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.2,
    transparent: true,
    opacity: 0.45,
  });
  const aisleMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7, metalness: 0.4 });
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.3 });
  const nutrientMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });

  // Foundation octagonal platform
  const base = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.2, 0.4, 8), darkTrussMat);
  base.position.y = 0.2;
  base.receiveShadow = true;
  group.add(base);

  // Transparent Geodesic Biodome Enclosure (Height 4.8m)
  const domeGeom = new THREE.SphereGeometry(4.8, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const dome = new THREE.Mesh(domeGeom, domeGlass);
  dome.position.y = 0.4;
  dome.castShadow = true;
  group.add(dome);

  // Structural aluminum geodesic dome rib arches
  for (let i = 0; i < 4; i++) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(4.78, 0.06, 6, 24, Math.PI), rackMat);
    arch.rotation.y = (i * Math.PI) / 4;
    arch.position.y = 0.4;
    group.add(arch);
  }

  // --- Walk-in Front Airlock Entrance (facing +Z at z = 4.6) ---
  const airlockFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 1.4), whiteMat);
  airlockFrame.position.set(0, 1.3, 4.6);
  airlockFrame.castShadow = true;
  group.add(airlockFrame);

  // Walk-in open archway opening
  const portalOuter = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.9, 0.2), darkTrussMat);
  portalOuter.position.set(0, 1.25, 5.3);
  group.add(portalOuter);

  // Green operational status lamp over entrance
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.9 })
  );
  lamp.position.set(0, 2.35, 5.32);
  group.add(lamp);

  // --- Central Walk-through Aisle (Walk-in Accessible) ---
  const aisle = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 8.4), aisleMat);
  aisle.position.set(0, 0.42, 0.4);
  aisle.receiveShadow = true;
  group.add(aisle);

  // --- Multi-Tier Aeroponic / Hydroponic Cultivation Racks (Left & Right) ---
  const rackSides = [-2.4, 2.4];
  rackSides.forEach((rx) => {
    // 3 tiered horizontal growing trays
    for (let tier = 0; tier < 3; tier++) {
      const ty = 0.8 + tier * 0.9;
      const tray = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 6.2), whiteMat);
      tray.position.set(rx, ty, 0);
      tray.castShadow = true;
      group.add(tray);

      // Water/nutrient delivery pipe along tray
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 6.0, 6), nutrientMat);
      pipe.rotation.x = Math.PI * 0.5;
      pipe.position.set(rx + (rx > 0 ? -0.85 : 0.85), ty + 0.1, 0);
      group.add(pipe);
    }

    // Vertical structural rack stanchions
    for (let s = 0; s < 3; s++) {
      const sz = -2.5 + s * 2.5;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.8, 6), rackMat);
      post.position.set(rx, 1.7, sz);
      group.add(post);
    }
  });

  // --- Nutrient Dosing Tank & Environmental Control Console ---
  const nutrientTank = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 12), nutrientMat);
  nutrientTank.position.set(-3.2, 1.1, -2.4);
  group.add(nutrientTank);

  const hydroConsole = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.6, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.8 })
  );
  hydroConsole.position.set(-1.2, 1.3, -3.2);
  hydroConsole.rotation.y = 0.4;
  group.add(hydroConsole);

  // --- Overhead LED Spectrum Grow Light Array (Pink / Magenta) ---
  const growLight = new THREE.PointLight(0xf43f5e, 2.2, 14, 1.2);
  growLight.position.set(0, 4.2, 0);
  group.add(growLight);

  const fixtureRig = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.2, 5.0),
    new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xf43f5e,
      emissiveIntensity: 0.95,
      roughness: 0.3,
    })
  );
  fixtureRig.position.set(0, 4.4, 0);
  group.add(fixtureRig);

  // Dynamic plants container (positioned along the trays)
  const plantsGroup = new THREE.Group();
  group.add(plantsGroup);

  const setPlantStage = (stage: PlantStage, seedType: string | null) => {
    while (plantsGroup.children.length > 0) {
      plantsGroup.remove(plantsGroup.children[0]);
    }

    if (stage === 'none') return;

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 });
    const fruitColor = seedType === 'tomato' ? 0xef4444 : seedType === 'radish' ? 0xe11d48 : 0xfacc15;
    const fruitMat = new THREE.MeshStandardMaterial({ color: fruitColor, roughness: 0.3 });

    // Populate rows on left and right growing racks
    const sideX = [-2.4, 2.4];
    sideX.forEach((sx) => {
      for (let zIndex = 0; zIndex < 5; zIndex++) {
        const pz = -2.0 + zIndex * 1.0;
        const py = 0.9; // Lower tray elevation

        const singlePlant = new THREE.Group();
        singlePlant.position.set(sx, py, pz);

        if (stage === 'seed') {
          const seed = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshStandardMaterial({ color: 0x78350f }));
          singlePlant.add(seed);
        } else if (stage === 'germination') {
          const sprout = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), stemMat);
          sprout.position.y = 0.09;
          singlePlant.add(sprout);
        } else if (stage === 'sprout') {
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.4, 6), stemMat);
          stem.position.y = 0.2;
          singlePlant.add(stem);
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), leafMat);
          leaf.scale.set(1.6, 0.2, 0.8);
          leaf.position.set(0.12, 0.36, 0);
          singlePlant.add(leaf);
        } else if (stage === 'growing') {
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.75, 8), stemMat);
          stem.position.y = 0.38;
          singlePlant.add(stem);
          for (let l = 0; l < 4; l++) {
            const lAngle = (l * Math.PI) / 2;
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), leafMat);
            leaf.scale.set(1.8, 0.2, 0.9);
            leaf.position.set(Math.cos(lAngle) * 0.25, 0.35 + l * 0.1, Math.sin(lAngle) * 0.25);
            singlePlant.add(leaf);
          }
        } else if (stage === 'harvest_ready' || stage === 'harvested') {
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.95, 8), stemMat);
          stem.position.y = 0.48;
          singlePlant.add(stem);
          for (let l = 0; l < 6; l++) {
            const lAngle = (l * Math.PI) / 3;
            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), leafMat);
            leaf.scale.set(2.0, 0.2, 1.0);
            leaf.position.set(Math.cos(lAngle) * 0.32, 0.38 + l * 0.08, Math.sin(lAngle) * 0.32);
            singlePlant.add(leaf);
          }
          if (stage === 'harvest_ready') {
            for (let f = 0; f < 3; f++) {
              const fAngle = (f * Math.PI * 2) / 3;
              const fruit = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), fruitMat);
              fruit.position.set(Math.cos(fAngle) * 0.3, 0.55, Math.sin(fAngle) * 0.3);
              singlePlant.add(fruit);
            }
          }
        }

        plantsGroup.add(singlePlant);
      }
    });
  };

  return { group, plantsGroup, growLight, setPlantStage };
}

// 9. Radiation Storm Shelter (Subterranean regolith vault with massive 6-spoke blast hatch)
export function createRadiationShelter(): THREE.Group {
  const group = new THREE.Group();

  const regolithMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
  const blockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.3 });
  const blastHatchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.3 });
  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xca8a04,
    emissiveIntensity: 0.4,
  });

  // Massive protective regolith berm mound
  const mound = new THREE.Mesh(new THREE.ConeGeometry(5.8, 3.2, 16), regolithMat);
  mound.position.y = 1.6;
  mound.castShadow = true;
  group.add(mound);

  // Retaining wall of interlocking regolith radiation shielding blocks
  for (let b = 0; b < 10; b++) {
    const angle = -0.7 + (b / 10) * 1.4;
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.6), blockMat);
    block.position.set(Math.sin(angle) * 3.6, 0.3, Math.cos(angle) * 3.6 + 0.4);
    block.rotation.y = angle;
    group.add(block);
  }

  // Heavy inclined blast entryway vestibule
  const vestibule = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.8, 2.2), blockMat);
  vestibule.position.set(0, 1.5, 2.2);
  vestibule.rotation.x = 0.25;
  group.add(vestibule);

  // Circular heavy vault blast door
  const doorCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.35, 24), blastHatchMat);
  doorCyl.rotation.x = Math.PI * 0.5 + 0.25;
  doorCyl.position.set(0, 1.55, 3.2);
  group.add(doorCyl);

  // Yellow & black hazard warning chevron border ring
  const chevronRing = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.1, 8, 24), hazardMat);
  chevronRing.rotation.x = Math.PI * 0.5 + 0.25;
  chevronRing.position.set(0, 1.55, 3.22);
  group.add(chevronRing);

  // Massive 6-spoke locking handwheel on blast hatch
  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 20), wheelMat);
  wheelRim.rotation.x = Math.PI * 0.5 + 0.25;
  wheelRim.position.set(0, 1.55, 3.42);
  group.add(wheelRim);

  for (let s = 0; s < 3; s++) {
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 6), wheelMat);
    spoke.position.set(0, 1.55, 3.42);
    spoke.rotation.x = Math.PI * 0.5 + 0.25;
    spoke.rotation.z = (s * Math.PI) / 3;
    group.add(spoke);
  }

  // Air filtration intake scrubber tower with HEPA filter grille
  const scrubber = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 2.2, 12), blockMat);
  scrubber.position.set(-2.4, 2.2, 0);
  group.add(scrubber);

  const scrubberCap = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.4, 12), blockMat);
  scrubberCap.position.set(-2.4, 3.4, 0);
  group.add(scrubberCap);

  // High-visibility rotating red radiation storm alert beacon atop berm
  const beaconMast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 8), blockMat);
  beaconMast.position.set(0, 3.5, 0);
  group.add(beaconMast);

  const beaconLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xef4444,
      emissiveIntensity: 1.0,
      roughness: 0.2,
    })
  );
  beaconLight.position.set(0, 4.2, 0);
  group.add(beaconLight);

  return group;
}

// 10. Deep Space High-Gain Comm Antenna Cassegrain Station
export interface CommAntennaModel {
  group: THREE.Group;
  dishGroup: THREE.Group;
  signalPulse: THREE.Mesh;
  animateSignal: (time: number, isPinging: boolean) => void;
}

export function createCommAntenna(): CommAntennaModel {
  const group = new THREE.Group();

  const steelMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85, roughness: 0.25 });
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.6, roughness: 0.25 });
  const subReflectMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 });
  const beamMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.9,
    transparent: true,
    opacity: 0.0,
  });

  // Base equipment shelter building beneath tower
  const shelter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 2.8), steelMat);
  shelter.position.y = 0.7;
  shelter.receiveShadow = true;
  group.add(shelter);

  // RF amplifier cabinet door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.0, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 })
  );
  door.position.set(0, 0.7, 1.44);
  group.add(door);

  // Triangular lattice steel tower (elevation 7.2m)
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.9, 6.4, 3), steelMat);
  tower.position.y = 4.2;
  tower.castShadow = true;
  group.add(tower);

  // Motorized dual-axis tracking gimbal mount
  const dishGroup = new THREE.Group();
  dishGroup.position.set(0, 7.4, 0);

  const gimbalBase = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), steelMat);
  dishGroup.add(gimbalBase);

  // Main Cassegrain Parabolic Reflector Dish (Diameter 5.2m)
  const dishGeom = new THREE.CylinderGeometry(2.6, 0.4, 0.9, 24, 1, true);
  const dish = new THREE.Mesh(dishGeom, dishMat);
  dish.rotation.x = Math.PI * 0.45;
  dish.castShadow = true;
  dishGroup.add(dish);

  // Central Feed Horn
  const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.6, 10), steelMat);
  horn.rotation.x = Math.PI * 0.45;
  horn.position.set(0, 0.5, 0.7);
  dishGroup.add(horn);

  // Sub-reflector tripod struts
  for (let t = 0; t < 3; t++) {
    const angle = (t * Math.PI * 2) / 3;
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.2, 6), steelMat);
    strut.position.set(Math.cos(angle) * 1.1, 0.7 + Math.sin(angle) * 0.4, 0.9);
    dishGroup.add(strut);
  }

  // Hyperbolic Sub-reflector cap
  const subReflector = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), subReflectMat);
  subReflector.rotation.x = -Math.PI * 0.55;
  subReflector.position.set(0, 1.1, 1.5);
  dishGroup.add(subReflector);

  // Animated wavefront pulse ring
  const signalRingGeom = new THREE.TorusGeometry(1.2, 0.08, 8, 24);
  const signalPulse = new THREE.Mesh(signalRingGeom, beamMat);
  signalPulse.position.set(0, 1.4, 2.0);
  signalPulse.rotation.x = Math.PI * 0.45;
  dishGroup.add(signalPulse);

  group.add(dishGroup);

  const animateSignal = (time: number, isPinging: boolean) => {
    // Smooth dish azimuthal tracking
    dishGroup.rotation.y = Math.sin(time * 0.15) * 0.2;

    if (isPinging) {
      const cycle = (time * 2.8) % 1;
      signalPulse.scale.setScalar(1 + cycle * 4.5);
      beamMat.opacity = Math.max(0, 1 - cycle);
    } else {
      beamMat.opacity = 0;
    }
  };

  return { group, dishGroup, signalPulse, animateSignal };
}

// 11. Artemis Lunar Exploration Rover (6-wheel rocker-bogie with cockpit & tool bed)
export function createRover(): THREE.Group {
  const group = new THREE.Group();

  const chassisMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.7, roughness: 0.3 });
  const darkMetalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.35 });
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.6,
  });

  // Main chassis tub platform
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 1.8), chassisMat);
  chassis.position.y = 0.95;
  chassis.castShadow = true;
  group.add(chassis);

  // Articulated Rocker-Bogie Suspension side bars
  const rockerBarL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), darkMetalMat);
  rockerBarL.rotation.z = Math.PI * 0.5;
  rockerBarL.position.set(0, 0.75, -1.05);
  group.add(rockerBarL);

  const rockerBarR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.4, 6), darkMetalMat);
  rockerBarR.rotation.z = Math.PI * 0.5;
  rockerBarR.position.set(0, 0.75, 1.05);
  group.add(rockerBarR);

  // 6 Non-pneumatic wire-mesh lunar tires (Front, Middle, Rear pairs)
  const wheelGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 16);
  const wheelPositions = [
    [-1.4, 0.48, -1.15],
    [0.0, 0.48, -1.15],
    [1.4, 0.48, -1.15],
    [-1.4, 0.48, 1.15],
    [0.0, 0.48, 1.15],
    [1.4, 0.48, 1.15],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat);
    wheel.rotation.x = Math.PI * 0.5;
    wheel.position.set(x, y, z);
    wheel.castShadow = true;
    group.add(wheel);
  });

  // Tubular protective roll cage
  const rollCageL = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 6, 12, Math.PI), darkMetalMat);
  rollCageL.rotation.y = Math.PI * 0.5;
  rollCageL.position.set(0.2, 1.45, -0.65);
  group.add(rollCageL);

  const rollCageR = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 6, 12, Math.PI), darkMetalMat);
  rollCageR.rotation.y = Math.PI * 0.5;
  rollCageR.position.set(0.2, 1.45, 0.65);
  group.add(rollCageR);

  // Forward panoramic windscreen canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 1.4), glassMat);
  canopy.position.set(-0.6, 1.5, 0);
  group.add(canopy);

  // Twin Astronaut Seats with harness contours
  const seat1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.5), seatMat);
  seat1.position.set(0.0, 1.35, -0.38);
  const seat2 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.5), seatMat);
  seat2.position.set(0.0, 1.35, 0.38);
  group.add(seat1, seat2);

  // Center navigation joystick console
  const consoleStick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), darkMetalMat);
  consoleStick.position.set(-0.35, 1.4, 0);
  group.add(consoleStick);

  // High-intensity twin LED searchlights on roof
  const lightL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 })
  );
  lightL.rotation.z = Math.PI * 0.5;
  lightL.position.set(-0.95, 2.1, -0.45);
  group.add(lightL);

  const lightR = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.15, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 })
  );
  lightR.rotation.z = Math.PI * 0.5;
  lightR.position.set(-0.95, 2.1, 0.45);
  group.add(lightR);

  // Rear utility flatbed equipment (Rock sample crate, core drill, and O2 canisters)
  const sampleCrate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.6), darkMetalMat);
  sampleCrate.position.set(1.0, 1.35, -0.35);
  group.add(sampleCrate);

  // Twin spare oxygen tanks on rear bed
  const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 });
  const o2TankA = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.7, 10), tankMat);
  o2TankA.rotation.z = Math.PI * 0.5;
  o2TankA.position.set(1.0, 1.3, 0.35);
  group.add(o2TankA);

  const o2TankB = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.7, 10), tankMat);
  o2TankB.rotation.z = Math.PI * 0.5;
  o2TankB.position.set(1.0, 1.55, 0.35);
  group.add(o2TankB);

  return group;
}

// 11. Rotating Earth in the deep space skybox
export interface EarthSkyModel {
  group: THREE.Group;
  earthMesh: THREE.Mesh;
  cloudsMesh: THREE.Mesh;
  update: (delta: number) => void;
}

export function createEarthSky(): EarthSkyModel {
  const group = new THREE.Group();

  const earthMat = new THREE.MeshStandardMaterial({
    map: createEarthTexture(),
    roughness: 0.7,
    metalness: 0.1,
  });

  const earthGeom = new THREE.SphereGeometry(18, 32, 32);
  const earthMesh = new THREE.Mesh(earthGeom, earthMat);
  group.add(earthMesh);

  // Swirling translucent cloud layer
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.35,
    roughness: 0.9,
  });
  const cloudsMesh = new THREE.Mesh(new THREE.SphereGeometry(18.25, 32, 32), cloudMat);
  group.add(cloudsMesh);

  // Position high in the sky over the horizon
  group.position.set(120, 95, -160);

  const update = (delta: number) => {
    earthMesh.rotation.y += delta * 0.02;
    cloudsMesh.rotation.y += delta * 0.035;
  };

  return { group, earthMesh, cloudsMesh, update };
}

// 12. Missing Supply & Rescue Spaceship with Pulsing Distress Beacon
export interface MissingSpaceshipModel {
  group: THREE.Group;
  updateBeacon: (time: number, isActiveTarget: boolean) => void;
}

export function createMissingSpaceship(): MissingSpaceshipModel {
  const group = new THREE.Group();

  const hullWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.35,
    metalness: 0.45,
  });
  const darkSlateMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.6,
    metalness: 0.65,
  });
  const goldFoilMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.25,
    metalness: 0.85,
  });
  const canopyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.72,
  });

  // Main angled shuttle body (slightly tilted like an emergency touchdown in lunar regolith)
  const craftBody = new THREE.Group();
  craftBody.rotation.z = 0.08;
  craftBody.rotation.x = -0.05;
  craftBody.position.y = 1.25;
  group.add(craftBody);

  // Pressurized fuselage
  const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.15, 4.4, 14), hullWhiteMat);
  fuselage.rotation.x = Math.PI * 0.5;
  fuselage.castShadow = true;
  fuselage.receiveShadow = true;
  craftBody.add(fuselage);

  // Nose cone
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.65, 14), hullWhiteMat);
  nose.rotation.x = Math.PI * 0.5;
  nose.position.z = 3.0;
  nose.castShadow = true;
  craftBody.add(nose);

  // Gold thermal collar band
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(1.17, 1.17, 0.5, 14), goldFoilMat);
  collar.rotation.x = Math.PI * 0.5;
  collar.position.z = -1.6;
  craftBody.add(collar);

  // Cockpit canopy
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.55, 1.25), canopyMat);
  canopy.position.set(0, 0.82, 1.45);
  canopy.rotation.x = 0.22;
  craftBody.add(canopy);

  // Swept delta wings
  const wingGeom = new THREE.BoxGeometry(5.6, 0.14, 1.9);
  const wings = new THREE.Mesh(wingGeom, darkSlateMat);
  wings.position.set(0, -0.25, -0.5);
  wings.castShadow = true;
  craftBody.add(wings);

  // Wingtip marker strips
  for (const side of [-1, 1]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.1, 1.1), goldFoilMat);
    fin.position.set(side * 2.75, 0.35, -0.95);
    fin.rotation.z = side * -0.18;
    fin.castShadow = true;
    craftBody.add(fin);
  }

  // Twin rear thruster nozzles
  for (const side of [-0.52, 0.52]) {
    const nozzle = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.75, 12, 1, true), darkSlateMat);
    nozzle.rotation.x = -Math.PI * 0.5;
    nozzle.position.set(side, 0, -2.55);
    craftBody.add(nozzle);
  }

  // 4 landing skids
  for (const [sx, sz] of [
    [-1.25, 1.1],
    [1.25, 1.1],
    [-1.4, -1.3],
    [1.4, -1.3],
  ]) {
    const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.25, 8), darkSlateMat);
    strut.position.set(sx * 0.78, -0.75, sz);
    strut.rotation.z = sx > 0 ? -0.35 : 0.35;
    craftBody.add(strut);

    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.1, 10), goldFoilMat);
    foot.position.set(sx, -1.25, sz);
    craftBody.add(foot);
  }

  // Emergency Beacon Mast + Pulsing Distress Orb & Sky Ring
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.8, 8), darkSlateMat);
  mast.position.set(0, 1.65, -0.5);
  craftBody.add(mast);

  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  const beaconOrb = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), beaconMat);
  beaconOrb.position.set(0, 2.6, -0.5);
  craftBody.add(beaconOrb);

  const beaconRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const beaconRing = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.7, 32), beaconRingMat);
  beaconRing.rotation.x = -Math.PI * 0.5;
  beaconRing.position.y = 0.18;
  group.add(beaconRing);

  const updateBeacon = (time: number, isActiveTarget: boolean) => {
    const pulse = 0.5 + 0.5 * Math.sin(time * (isActiveTarget ? 5.5 : 2.2));
    beaconMat.emissive.setHex(isActiveTarget ? 0x22d3ee : 0xf59e0b);
    beaconMat.color.setHex(isActiveTarget ? 0x38bdf8 : 0xf59e0b);
    beaconMat.emissiveIntensity = isActiveTarget ? 1.0 + pulse * 2.2 : 0.45 + pulse * 0.65;
    beaconRing.visible = isActiveTarget;
    if (isActiveTarget) {
      const scale = 1.0 + pulse * 1.1;
      beaconRing.scale.setScalar(scale);
      beaconRingMat.opacity = 0.72 * (1 - pulse * 0.6);
    }
  };

  return { group, updateBeacon };
}
