const root = document.documentElement;
const canvas = document.getElementById("scene");
const hero = document.querySelector(".hero");
const meta = document.querySelector(".meta");
const capability = matchMedia(
  "(min-width: 901px) and (hover: hover) and (pointer: fine)",
);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const colorScheme = matchMedia("(prefers-color-scheme: dark)");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const damp = (current, target, rate, delta) =>
  current + (target - current) * (1 - Math.exp(-rate * delta));

const supportsWebGL = () => "WebGL2RenderingContext" in window;
const isCapable = () =>
  capability.matches &&
  !reducedMotion.matches &&
  (navigator.hardwareConcurrency ?? 8) >= 4 &&
  (navigator.deviceMemory ?? 8) >= 4 &&
  "IntersectionObserver" in window &&
  "ResizeObserver" in window &&
  supportsWebGL();

const createMaterials = (THREE, environment, accent) => ({
  ring: new THREE.MeshPhysicalMaterial({
    color: accent.clone(),
    metalness: 0.78,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    envMap: environment,
    envMapIntensity: 0.8,
  }),
  secondaryRing: new THREE.MeshPhysicalMaterial({
    color: 0x8d7aff,
    metalness: 0.72,
    roughness: 0.24,
    clearcoat: 0.9,
    envMap: environment,
    envMapIntensity: 0.7,
  }),
  core: new THREE.MeshPhysicalMaterial({
    color: accent.clone(),
    metalness: 0.48,
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    iridescence: 0.85,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [180, 680],
    envMap: environment,
    envMapIntensity: 0.8,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
  }),
  wire: new THREE.MeshBasicMaterial({
    color: accent.clone(),
    wireframe: true,
    transparent: true,
    opacity: 0.52,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }),
  knot: new THREE.MeshPhysicalMaterial({
    color: 0x9bece2,
    metalness: 0.7,
    roughness: 0.18,
    clearcoat: 1,
    iridescence: 0.7,
    envMap: environment,
    envMapIntensity: 0.9,
  }),
  innerKnot: new THREE.MeshPhysicalMaterial({
    color: 0xd58cff,
    metalness: 0.64,
    roughness: 0.22,
    clearcoat: 1,
    envMap: environment,
    envMapIntensity: 0.8,
  }),
  center: new THREE.MeshPhysicalMaterial({
    color: 0xe6fbff,
    metalness: 0.78,
    roughness: 0.16,
    clearcoat: 1,
    envMap: environment,
    envMapIntensity: 1,
  }),
  particle: new THREE.PointsMaterial({
    color: accent.clone(),
    size: 0.055,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  }),
  satellite: new THREE.MeshPhysicalMaterial({
    color: 0xb9f9f0,
    emissive: 0x1a756f,
    emissiveIntensity: 0.5,
    metalness: 0.35,
    roughness: 0.16,
    clearcoat: 1,
    envMap: environment,
  }),
});

const createGyroscope = (THREE, materials) => {
  const createRing = (radius, tilt, material) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.024, 12, 192),
      material,
    );
    ring.rotation.x = tilt;
    return ring;
  };
  const shellGeometry = new THREE.IcosahedronGeometry(0.84, 3);
  const shell = new THREE.Mesh(shellGeometry, materials.core);
  const wireShell = new THREE.Mesh(shellGeometry, materials.wire);
  wireShell.scale.setScalar(1.025);
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.5, 0.11, 144, 12, 2, 3),
    materials.knot,
  );
  const innerKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.36, 0.06, 112, 10, 3, 2),
    materials.innerKnot,
  );
  innerKnot.rotation.set(0.7, 0.35, 0.2);
  const center = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.22, 2),
    materials.center,
  );
  const core = new THREE.Group();
  core.add(shell, wireShell, knot, innerKnot, center);
  core.scale.setScalar(1.15);

  const inner = new THREE.Group();
  inner.add(createRing(1.6, Math.PI / 2, materials.ring), core);
  const middle = new THREE.Group();
  middle.add(createRing(2.1, 0, materials.secondaryRing), inner);
  const outer = new THREE.Group();
  outer.add(createRing(2.6, Math.PI / 2, materials.ring), middle);
  return { outer, middle, inner, core, knot, innerKnot, center };
};

const createLights = (THREE) => {
  const ambient = new THREE.AmbientLight(0xdceeff, 0.7);
  const side = new THREE.DirectionalLight(0xffffff, 1.8);
  side.position.set(6, 2, 4);
  const rim = new THREE.DirectionalLight(0x9b85ff, 2);
  rim.position.set(-5, 3, -6);
  const teal = new THREE.PointLight(0x36e0c0, 18, 12, 2);
  teal.position.set(3, 1.5, 3);
  const violet = new THREE.PointLight(0x8c65ff, 14, 11, 2);
  violet.position.set(-3, -1.5, 2);
  return { all: [ambient, side, rim, teal, violet], teal, violet };
};

const mount = async () => {
  const [THREE, { RoomEnvironment }] = await Promise.all([
    import("three"),
    import("three/addons/environments/RoomEnvironment.js"),
  ]);
  if (!isCapable()) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  });
  renderer.setPixelRatio(clamp(devicePixelRatio, 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  camera.position.z = 12;

  const generator = new THREE.PMREMGenerator(renderer);
  const environmentScene = new RoomEnvironment();
  const environment = generator.fromScene(
    environmentScene,
    0.04,
  ).texture;
  environmentScene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (Array.isArray(object.material))
      object.material.forEach((material) => material.dispose());
    else if (object.material) object.material.dispose();
  });
  generator.dispose();

  const colorContext = document.createElement("canvas").getContext("2d", {
    willReadFrequently: true,
  });
  if (!colorContext) throw new Error("Unable to read the portfolio accent color.");
  const readAccentColor = () => {
    colorContext.clearRect(0, 0, 1, 1);
    colorContext.fillStyle = getComputedStyle(root)
      .getPropertyValue("--accent")
      .trim();
    colorContext.fillRect(0, 0, 1, 1);
    const [red, green, blue] = colorContext.getImageData(0, 0, 1, 1).data;
    return new THREE.Color().setRGB(
      red / 255,
      green / 255,
      blue / 255,
      THREE.SRGBColorSpace,
    );
  };
  const materials = createMaterials(THREE, environment, readAccentColor());
  const gyroscope = createGyroscope(THREE, materials);
  const pivot = new THREE.Group();
  const fitGroup = new THREE.Group();
  pivot.add(gyroscope.outer);
  fitGroup.add(pivot);

  const satelliteGroup = new THREE.Group();
  gyroscope.outer.add(satelliteGroup);
  const satelliteGeometry = new THREE.SphereGeometry(0.055, 12, 10);
  const satellites = Array.from({ length: 5 }, (_, index) => {
    const satellite = new THREE.Mesh(satelliteGeometry, materials.satellite);
    satelliteGroup.add(satellite);
    return {
      mesh: satellite,
      phase: (index / 5) * Math.PI * 2,
      radius: 2.65 + (index % 2) * 0.2,
    };
  });

  const particleCount = 150;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let index = 0; index < particleCount; index += 1) {
    const radius = 2.75 + Math.random() * 0.45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    particlePositions[index * 3] =
      radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[index * 3 + 1] = radius * Math.cos(phi);
    particlePositions[index * 3 + 2] =
      radius * Math.sin(phi) * Math.sin(theta);
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3),
  );
  const particles = new THREE.Points(particleGeometry, materials.particle);
  pivot.add(particles);

  const scene = new THREE.Scene();
  const lights = createLights(THREE);
  scene.add(fitGroup, ...lights.all);

  const state = {
    pointerX: 0,
    pointerY: 0,
    x: 0,
    y: 0,
    scrollTarget: 0,
    scroll: 0,
  };
  let frameId = 0;
  let last = 0;
  let elapsed = 0;
  let running = false;
  let contextLost = false;
  let destroyed = false;
  let revealed = false;

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    renderer.setPixelRatio(clamp(devicePixelRatio, 1, 1.5));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const visibleHeight =
      2 *
      camera.position.z *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const canvasBounds = canvas.getBoundingClientRect();
    const metaBounds = meta.getBoundingClientRect();
    const targetX = metaBounds.left + metaBounds.width / 2;
    const gap = 16;
    const availableRadius = Math.max(
      0,
      Math.min(
        (metaBounds.top - canvasBounds.top) / 2 - gap,
        targetX - canvasBounds.left - gap,
        canvasBounds.right - targetX - gap,
      ),
    );
    const baseScale =
      Math.min(0.7 * visibleHeight, 0.7 * visibleHeight * camera.aspect) /
      5.2;
    const fitScale = Math.min(
      baseScale,
      (availableRadius * visibleHeight) / (3.3 * canvasBounds.height),
    );
    fitGroup.scale.setScalar(fitScale);
    const objectRadius =
      (3.3 * fitGroup.scale.x * canvasBounds.height) / visibleHeight;
    const targetY = metaBounds.top - objectRadius - gap;
    const ndcX = ((targetX - canvasBounds.left) / canvasBounds.width) * 2 - 1;
    const ndcY = 1 - ((targetY - canvasBounds.top) / canvasBounds.height) * 2;
    const viewWidth = visibleHeight * camera.aspect;
    pivot.position.set(
      (ndcX * viewWidth) / (2 * fitGroup.scale.x),
      (ndcY * visibleHeight) / (2 * fitGroup.scale.y),
      0,
    );
  };

  const onPointer = (event) => {
    const bounds = hero.getBoundingClientRect();
    state.pointerX = clamp(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      -1,
      1,
    );
    state.pointerY = clamp(
      1 - ((event.clientY - bounds.top) / bounds.height) * 2,
      -1,
      1,
    );
  };

  const resetPointer = () => {
    state.pointerX = 0;
    state.pointerY = 0;
  };

  const onScroll = () => {
    state.scrollTarget = clamp(scrollY / innerHeight, 0, 1);
  };

  const frame = (now) => {
    if (!running || destroyed || contextLost) return;
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;
    elapsed += delta;
    state.x = damp(state.x, state.pointerX, 3.2, delta);
    state.y = damp(state.y, state.pointerY, 3.2, delta);
    state.scroll = damp(state.scroll, state.scrollTarget, 4, delta);

    gyroscope.outer.rotation.y = elapsed * 0.16;
    gyroscope.middle.rotation.x = elapsed * 0.24;
    gyroscope.inner.rotation.z = elapsed * 0.32;
    gyroscope.core.rotation.x =
      state.y * 0.16 + Math.sin(elapsed * 0.42) * 0.04;
    gyroscope.core.rotation.y = elapsed * 0.1;
    gyroscope.knot.rotation.set(elapsed * 0.24, elapsed * 0.32, 0);
    gyroscope.innerKnot.rotation.y = 0.35 + elapsed * 0.28;
    gyroscope.center.rotation.set(
      elapsed * 0.36,
      elapsed * 0.52,
      elapsed * 0.22,
    );
    satelliteGroup.rotation.y = -elapsed * 0.11;
    particles.rotation.y = elapsed * 0.025;
    particles.rotation.x = Math.sin(elapsed * 0.14) * 0.035;
    lights.teal.position.x = Math.cos(elapsed * 0.38) * 3;
    lights.teal.position.z = 2.4 + Math.sin(elapsed * 0.38) * 0.6;
    satellites.forEach(({ mesh, phase, radius }) => {
      const angle = elapsed * 0.32 + phase;
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.3) * 0.35,
        Math.sin(angle) * 0.55,
      );
    });
    pivot.rotation.set(
      0.35 - state.y * 0.18 + state.scroll * 0.15,
      -0.4 + state.x * 0.3,
      0,
    );
    renderer.render(scene, camera);
    if (!revealed) {
      revealed = true;
      root.classList.add("webgl-on");
    }
    if (running) frameId = requestAnimationFrame(frame);
  };

  const play = () => {
    if (running || destroyed || contextLost) return;
    running = true;
    last = performance.now();
    frameId = requestAnimationFrame(frame);
  };

  const pause = () => {
    running = false;
    cancelAnimationFrame(frameId);
  };

  let inView = false;
  const visibility = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    if (inView && document.visibilityState === "visible") play();
    else pause();
  });
  const sizing = new ResizeObserver(resize);

  const updateColors = () => {
    const accent = readAccentColor();
    materials.core.color.copy(accent);
    materials.wire.color.copy(accent);
    materials.ring.color.copy(accent);
    materials.particle.color.copy(accent);
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "visible" && inView) play();
    else pause();
  };
  const onCapabilityChange = () => {
    if (!isCapable()) teardown();
  };
  const onContextLost = (event) => {
    event.preventDefault();
    contextLost = true;
    pause();
    root.classList.remove("webgl-on");
    console.warn("Three.js hero animation paused after WebGL context loss.");
  };
  const onContextRestored = () => {
    contextLost = false;
    revealed = false;
    if (inView && document.visibilityState === "visible") play();
  };

  const teardown = () => {
    if (destroyed) return;
    destroyed = true;
    pause();
    visibility.disconnect();
    sizing.disconnect();
    hero.removeEventListener("pointermove", onPointer);
    hero.removeEventListener("pointerleave", resetPointer);
    removeEventListener("scroll", onScroll);
    removeEventListener("resize", onCapabilityChange);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    colorScheme.removeEventListener("change", updateColors);
    capability.removeEventListener("change", onCapabilityChange);
    reducedMotion.removeEventListener("change", onCapabilityChange);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    const geometries = new Set();
    const sceneMaterials = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      if (Array.isArray(object.material))
        object.material.forEach((material) => sceneMaterials.add(material));
      else if (object.material) sceneMaterials.add(object.material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    sceneMaterials.forEach((material) => material.dispose());
    environment.dispose();
    renderer.dispose();
    canvas.style.display = "none";
    root.classList.remove("webgl-on");
  };

  hero.addEventListener("pointermove", onPointer, { passive: true });
  hero.addEventListener("pointerleave", resetPointer, { passive: true });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onCapabilityChange, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  colorScheme.addEventListener("change", updateColors);
  const themeObserver = new MutationObserver(updateColors);
  themeObserver.observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  capability.addEventListener("change", onCapabilityChange);
  reducedMotion.addEventListener("change", onCapabilityChange);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  sizing.observe(canvas);
  sizing.observe(meta);
  visibility.observe(hero);
  resize();
  onScroll();
};

if (isCapable())
  mount().catch((error) => {
    console.error("Unable to initialize the Three.js hero scene.", error);
    root.classList.remove("webgl-on");
  });