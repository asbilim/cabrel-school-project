// CGV – Praktikum Aufgabe 1
// Thema: Rotationen im Sonnensystem

// Umrechnungsfaktor von Simulations-Minuten zu Millisekunden des Renderloops.
const MINUTES_TO_MILLISECONDS = 60_000;
// Vollwinkel in Radiant als Basis für Kreisbewegungen.
const FULL_ROTATION = Math.PI * 2;
// Dauer eines Erdjahres in echten Minuten, um den Simulationsfaktor zu ermitteln.
const EARTH_YEAR_IN_MINUTES_REAL = 365.24 * 24 * 60;

/**
 * Format-Helfer: wandelt Minuten in einen gut lesbaren String um.
 * @param {number} minutes – zu formatierende Dauer in Minuten
 * @returns {string} – formatierte Ausgabe in Minuten oder Sekunden
 */
function formatMinutes(minutes) {
  if (!isFinite(minutes)) {
    return '—';
  }
  if (minutes >= 1) {
    return `${minutes.toFixed(3)} min`;
  }
  const seconds = minutes * 60;
  return `${seconds.toFixed(2)} s`;
}

/**
 * Erzeugt ein Standard-Material mit Textur und sinnvollen Voreinstellungen.
 */
function createTexturedMaterial(scene, name, texturePath, options = {}) {
  const material = new BABYLON.StandardMaterial(name, scene);
  material.diffuseTexture = new BABYLON.Texture(texturePath, scene);
  material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
  material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
  material.diffuseTexture.vScale = -1;
  material.diffuseTexture.uScale = -1;
  material.specularColor = options.specularColor || new BABYLON.Color3(0.05, 0.05, 0.05);
  material.emissiveColor = options.emissiveColor || new BABYLON.Color3(0, 0, 0);
  material.disableLighting = !!options.disableLighting;
  material.alpha = options.alpha ?? 1.0;
  return material;
}

/**
 * Repräsentiert einen Himmelskörper mit optionaler Umlaufbahn und Eigenrotation.
 */
class OrbitalBody {
  constructor(scene, config) {
    this.name = config.name;
    this.scene = scene;
    this.parent = config.parent || null;
    this.orbitRadius = config.orbitRadius ?? 0;
    this.orbitPeriodMinutes = config.orbitPeriodMinutes || null;
    this.selfRotationMinutes = config.selfRotationMinutes || null;
    this.initialOrbitAngle = config.initialOrbitAngle || 0;
    this.initialRotationOffset = config.initialRotationOffset || 0;
    this.lockedToParent = !!config.lockedToParent;
    this.lockedFacingOffset = config.lockedFacingOffset || 0;
    this.basePosition = config.basePosition || (this.parent ? BABYLON.Vector3.Zero() : new BABYLON.Vector3(0, 0, 0));

    this.orbitalAngle = this.initialOrbitAngle;
    this.rotationAngle = this.initialRotationOffset;

    this.mesh = BABYLON.Mesh.CreateSphere(
      config.name,
      config.segments || 32,
      config.diameter || 1,
      scene
    );

    if (config.material) {
      this.mesh.material = config.material;
    }

    this.mesh.position = config.basePosition ? config.basePosition.clone() : new BABYLON.Vector3(0, 0, 0);
    if (!this.parent) {
      this.mesh.position.copyFrom(this.basePosition);
    }

    if (config.axisTilt) {
      this.mesh.rotation.z = config.axisTilt;
    }
  }

  setOrbitPeriod(minutes) {
    this.orbitPeriodMinutes = minutes;
  }

  setRotationPeriod(minutes) {
    this.selfRotationMinutes = minutes;
  }

  update(deltaMinutes) {
    if (this.orbitPeriodMinutes && this.orbitRadius !== 0) {
      // Umlaufwinkel anhand der vergangenen Simulationszeit fortschreiben.
      const orbitDelta = (FULL_ROTATION * deltaMinutes) / this.orbitPeriodMinutes;
      this.orbitalAngle = (this.orbitalAngle + orbitDelta) % FULL_ROTATION;

      // Position relativ zum Zentrum (Sonne oder Elternkörper) bestimmen.
      const parentPosition = this.parent ? this.parent.mesh.position : this.basePosition;
      const x = parentPosition.x + this.orbitRadius * Math.cos(this.orbitalAngle);
      const z = parentPosition.z + this.orbitRadius * Math.sin(this.orbitalAngle);
      this.mesh.position.x = x;
      this.mesh.position.z = z;
    } else if (!this.parent) {
      this.mesh.position.copyFrom(this.basePosition);
    }

    if (this.lockedToParent && this.parent) {
      // Tidal Locking: Orientierung immer zur Mutter richten.
      const parentPosition = this.parent.mesh.position;
      const dx = parentPosition.x - this.mesh.position.x;
      const dz = parentPosition.z - this.mesh.position.z;
      this.mesh.rotation.y = Math.atan2(dz, dx) + Math.PI + this.lockedFacingOffset;
    } else if (this.selfRotationMinutes) {
      // Eigenrotation aus aktueller Drehgeschwindigkeit ableiten.
      const spinDelta = (FULL_ROTATION * deltaMinutes) / this.selfRotationMinutes;
      this.rotationAngle = (this.rotationAngle + spinDelta) % FULL_ROTATION;
      this.mesh.rotation.y = this.rotationAngle;
    }
  }
}

// Container für mehrere OrbitalBody-Instanzen, der deren Aktualisierung bündelt.
class OrbitalSystem {
  constructor(scene) {
    this.scene = scene;
    this.bodies = [];
  }

  // Erzeugt einen neuen Himmelskörper und registriert ihn im System.
  createBody(config) {
    const body = new OrbitalBody(this.scene, config);
    this.bodies.push(body);
    return body;
  }

  // Aktualisiert alle registrierten Körper mit der vergangenen Simulationszeit.
  update(deltaMinutes) {
    for (const body of this.bodies) {
      body.update(deltaMinutes);
    }
  }
}

// Zeichnet ein kleines Achsenkreuz, um das linkshändige Koordinatensystem sichtbar zu machen.
function configureAxes(scene) {
  const axisLength = 0.3;
  const axisThickness = 0.01;
  const segments = 4;

  const axes = [
    { name: 'axisX', color: new BABYLON.Color3(1, 0, 0), position: new BABYLON.Vector3(axisLength, 0, 0), rotation: new BABYLON.Vector3(0, 0, Math.PI / 2) },
    { name: 'axisY', color: new BABYLON.Color3(1, 1, 0), position: new BABYLON.Vector3(0, axisLength, 0), rotation: new BABYLON.Vector3(0, 0, 0) },
    { name: 'axisZ', color: new BABYLON.Color3(0, 1, 0), position: new BABYLON.Vector3(0, 0, axisLength), rotation: new BABYLON.Vector3(Math.PI / 2, 0, 0) }
  ];

  axes.forEach(({ name, color, position, rotation }) => {
    const cylinder = BABYLON.Mesh.CreateCylinder(name, axisLength * 2, axisThickness, axisThickness, segments, scene, false);
    const material = new BABYLON.StandardMaterial(`${name}-mat`, scene);
    material.emissiveColor = color;
    cylinder.material = material;
    cylinder.position = position;
    cylinder.rotation = rotation;
  });
}

// Platziert eine punktförmige Lichtquelle an der Position der Sonne.
function configureLighting(scene, sun) {
  const light = new BABYLON.PointLight('sunLight', sun.mesh.position, scene);
  light.diffuse = new BABYLON.Color3(1, 1, 1);
  light.intensity = 2.1;
  return light;
}

// Umhüllt die Szene mit einer Skybox, die aus lokalen Sternen-Texturen besteht.
function createSkybox(scene) {
  const skyboxSize = 120;
  const skybox = BABYLON.Mesh.CreateBox('skyBox', skyboxSize, scene);
  const skyboxMaterial = new BABYLON.StandardMaterial('skyBoxMaterial', scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.disableLighting = true;
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  skybox.material = skyboxMaterial;

  const cubeTexture = new BABYLON.CubeTexture(
    'textures/skybox',
    scene,
    ['_px.png', '_py.png', '_pz.png', '_nx.png', '_ny.png', '_nz.png']
  );
  skyboxMaterial.reflectionTexture = cubeTexture;
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

  return skybox;
}

/**
 * Leitet alle relevanten Zeitspannen aus der Vorgabe für ein Erdjahr ab.
 * @param {number} earthOrbitMinutes – Dauer eines simulierten Erdjahres
 * @returns {{earthOrbitMinutes:number, earthDayMinutes:number, moonOrbitMinutes:number, satelliteOrbitMinutes:number, marsOrbitMinutes:number, marsDayMinutes:number, timeScale:number}}
 */
function computeTemporalConfig(earthOrbitMinutes) {
  const earthDayMinutes = earthOrbitMinutes / 365.24;
  const moonOrbitMinutes = earthOrbitMinutes * (27.3 / 365.24);
  const satelliteOrbitMinutes = moonOrbitMinutes / 3;
  const marsOrbitMinutes = earthOrbitMinutes * (686.98 / 365.24);
  const marsDayMinutes = earthDayMinutes * 1.027491;
  const timeScale = EARTH_YEAR_IN_MINUTES_REAL / earthOrbitMinutes;

  return {
    earthOrbitMinutes,
    earthDayMinutes,
    moonOrbitMinutes,
    satelliteOrbitMinutes,
    marsOrbitMinutes,
    marsDayMinutes,
    timeScale
  };
}

// Schreibt die berechneten Zeitwerte in das UI, damit sie beim Erklären sichtbar sind.
function updateReadouts(config, ui) {
  ui.earthDay.textContent = formatMinutes(config.earthDayMinutes);
  ui.moonMonth.textContent = formatMinutes(config.moonOrbitMinutes);
  ui.satelliteOrbit.textContent = formatMinutes(config.satelliteOrbitMinutes);
  ui.timeScale.textContent = `${config.timeScale.toLocaleString(undefined, { maximumFractionDigits: 0 })}× schneller als Echtzeit`;
}

// Überschreibt alle Umlauf- und Rotationsperioden mit den neu berechneten Werten.
function applyTemporalConfig(config, bodies) {
  bodies.earth.setOrbitPeriod(config.earthOrbitMinutes);
  bodies.earth.setRotationPeriod(config.earthDayMinutes);

  bodies.moon.setOrbitPeriod(config.moonOrbitMinutes);
  bodies.moon.setRotationPeriod(config.moonOrbitMinutes);

  bodies.satellite.setOrbitPeriod(config.satelliteOrbitMinutes);
  bodies.satellite.setRotationPeriod(config.satelliteOrbitMinutes);

  bodies.mars.setOrbitPeriod(config.marsOrbitMinutes);
  bodies.mars.setRotationPeriod(config.marsDayMinutes);
}

function init() {
  // Verhindern, dass die Szene auf Geräten ohne Babylon-Unterstützung gestartet wird.
  if (!window.BABYLON || !BABYLON.Engine || !BABYLON.Engine.isSupported()) {
    window.alert('Babylon.js wird von diesem Browser nicht unterstützt.');
    return;
  }

  // Canvas, Engine und Szene vorbereiten.
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true, { adaptToDeviceRatio: true });
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.02, 0.02, 0.08);

  // Orbitalkamera, die sich um das Sonnensystem drehen lässt.
  const camera = new BABYLON.ArcRotateCamera(
    'camera',
    -Math.PI / 3,
    Math.PI / 3.5,
    5,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.lowerRadiusLimit = 2.0;
  camera.upperRadiusLimit = 20.0;
  camera.wheelDeltaPercentage = 0.01;
  camera.panningSensibility = 1000;
  camera.attachControl(canvas, true);

  // Zentrale Datenstruktur initialisieren.
  const system = new OrbitalSystem(scene);

  // Sonne als Referenzkörper ohne Umlaufbahn anlegen.
  const sunMaterial = createTexturedMaterial(scene, 'sunMat', 'assets/sun.jpg', {
    emissiveColor: new BABYLON.Color3(1, 1, 1),
    specularColor: new BABYLON.Color3(0, 0, 0)
  });
  const sun = system.createBody({
    name: 'Sun',
    diameter: 0.6,
    segments: 32,
    material: sunMaterial,
    basePosition: new BABYLON.Vector3(0, 0, 0)
  });

  // Lichtquelle und Hilfsachsen sichtbar machen.
  configureLighting(scene, sun);
  configureAxes(scene);

  // Erde mit Textur, Achsenneigung und Basisparametern registrieren.
  const earthMaterial = createTexturedMaterial(scene, 'earthMat', 'assets/earth.jpg', {
    specularColor: new BABYLON.Color3(0.15, 0.15, 0.15),
    emissiveColor: new BABYLON.Color3(0.08, 0.08, 0.08)
  });
  const earth = system.createBody({
    name: 'Earth',
    parent: sun,
    orbitRadius: 1.2,
    orbitPeriodMinutes: 1,
    selfRotationMinutes: 1 / 365.24,
    initialOrbitAngle: 0,
    diameter: 0.35,
    segments: 48,
    material: earthMaterial,
    axisTilt: (23.5 * Math.PI) / 180
  });

  // Mond als abhängiges Objekt der Erde mit Tidal-Locking hinzufügen.
  const moonMaterial = createTexturedMaterial(scene, 'moonMat', 'assets/moon.jpg', {
    emissiveColor: new BABYLON.Color3(0.15, 0.15, 0.15),
    specularColor: new BABYLON.Color3(0, 0, 0)
  });
  const moon = system.createBody({
    name: 'Moon',
    parent: earth,
    orbitRadius: 0.4,
    orbitPeriodMinutes: 1,
    selfRotationMinutes: 1,
    initialOrbitAngle: Math.PI,
    diameter: 0.12,
    segments: 32,
    material: moonMaterial,
    lockedToParent: true
  });

  // Künstlichen Satelliten modellieren, der den Mond dreimal pro Umlauf umrundet.
  const satelliteMaterial = createTexturedMaterial(scene, 'satelliteMat', 'assets/metal.jpg', {
    specularColor: new BABYLON.Color3(0.3, 0.3, 0.3),
    emissiveColor: new BABYLON.Color3(0.05, 0.05, 0.05)
  });
  const satellite = system.createBody({
    name: 'Satellite',
    parent: moon,
    orbitRadius: 0.18,
    orbitPeriodMinutes: 0.333,
    selfRotationMinutes: 0.333,
    initialOrbitAngle: Math.PI / 2,
    diameter: 0.05,
    segments: 24,
    material: satelliteMaterial,
    lockedToParent: true
  });

  // Zweiter Planet (Mars) dient als Testfall für das flexible Design.
  const marsMaterial = createTexturedMaterial(scene, 'marsMat', 'assets/mars.jpg', {
    emissiveColor: new BABYLON.Color3(0.12, 0.06, 0.02)
  });
  const mars = system.createBody({
    name: 'Mars',
    parent: sun,
    orbitRadius: 1.9,
    orbitPeriodMinutes: 1.5,
    selfRotationMinutes: 0.01,
    initialOrbitAngle: Math.PI / 3,
    diameter: 0.25,
    segments: 48,
    material: marsMaterial,
    axisTilt: (25 * Math.PI) / 180
  });

  // Himmelskuppel erstellen, damit die Szene nicht im Leeren endet.
  createSkybox(scene);

  // UI-Elemente einmalig ermitteln, um sie später effizient zu aktualisieren.
  const ui = {
    input: document.getElementById('yearMinutes'),
    earthDay: document.getElementById('earth-day-readout'),
    moonMonth: document.getElementById('moon-month-readout'),
    satelliteOrbit: document.getElementById('satellite-readout'),
    timeScale: document.getElementById('time-scale-readout')
  };

  // Bündelung der Himmelskörper für spätere Aktualisierungen.
  const bodies = { sun, earth, moon, satellite, mars };

  // Startkonfiguration anhand des aktuellen Eingabewertes berechnen.
  let config = computeTemporalConfig(parseFloat(ui.input.value) || 1);
  applyTemporalConfig(config, bodies);
  system.update(0);
  updateReadouts(config, ui);

  // Eingabe auf Änderungen überwachen und das System dynamisch neu konfigurieren.
  ui.input.addEventListener('input', (event) => {
    const value = parseFloat(event.target.value);
    if (!isFinite(value) || value <= 0) {
      return;
    }
    config = computeTemporalConfig(value);
    applyTemporalConfig(config, bodies);
    updateReadouts(config, ui);
  });

  // Vor jedem Bild die Simulationszeit fortschreiben.
  scene.registerBeforeRender(() => {
    const deltaMinutes = engine.getDeltaTime() / MINUTES_TO_MILLISECONDS;
    system.update(deltaMinutes);
  });

  // Renderloop der Engine aktivieren.
  engine.runRenderLoop(() => {
    scene.render();
  });

  // Canvas-Größe bei Fensteränderungen synchron halten.
  window.addEventListener('resize', () => {
    engine.resize();
  });
}

// Startpunkt der Anwendung, sobald das DOM geladen ist.
document.addEventListener('DOMContentLoaded', init);
