const root = document.documentElement;
      const canvas = document.getElementById("scene");
      const hero = document.querySelector(".hero");
      const capability = matchMedia(
        "(min-width: 900px) and (hover: hover) and (pointer: fine)",
      );
      const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

      const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
      const damp = (current, target, rate, delta) =>
        current + (target - current) * (1 - Math.exp(-rate * delta));

      const supportsWebGL = () =>
        Boolean(document.createElement("canvas").getContext("webgl2"));
      const isCapable = () =>
        capability.matches &&
        !reducedMotion.matches &&
        (navigator.hardwareConcurrency ?? 8) >= 4 &&
        (navigator.deviceMemory ?? 8) >= 4 &&
        supportsWebGL();

      const createMaterials = (THREE, environment) => ({
        ring: new THREE.MeshPhysicalMaterial({
          color: 0x16171a,
          metalness: 0.6,
          roughness: 0.34,
          clearcoat: 0.7,
          clearcoatRoughness: 0.18,
          envMap: environment,
          envMapIntensity: 0.45,
        }),
        core: new THREE.MeshPhysicalMaterial({
          color: 0x1b1c1f,
          metalness: 0.2,
          roughness: 0.6,
          envMap: environment,
          envMapIntensity: 0.3,
        }),
      });

      const createGyroscope = (THREE, materials) => {
        const createRing = (radius, tilt) => {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.04, 48, 256),
            materials.ring,
          );
          ring.rotation.x = tilt;
          return ring;
        };
        const core = new THREE.Mesh(
          new THREE.SphereGeometry(0.78, 96, 96),
          materials.core,
        );
        const inner = new THREE.Group();
        inner.add(createRing(1.6, Math.PI / 2), core);
        const middle = new THREE.Group();
        middle.add(createRing(2.1, 0), inner);
        const outer = new THREE.Group();
        outer.add(createRing(2.6, 0), middle);
        return { outer, middle, inner };
      };

      const createLights = (THREE) => {
        const ambient = new THREE.AmbientLight(0xffffff, 0.35);
        const side = new THREE.DirectionalLight(0xffffff, 1);
        side.position.set(6, 2, 4);
        const rim = new THREE.DirectionalLight(0xffffff, 1.3);
        rim.position.set(-5, 3, -6);
        return [ambient, side, rim];
      };

      const mount = async () => {
        const [THREE, { RoomEnvironment }] = await Promise.all([
          import("three"),
          import("three/addons/environments/RoomEnvironment.js"),
        ]);

        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.9;

        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
        camera.position.z = 12;

        const generator = new THREE.PMREMGenerator(renderer);
        const environment = generator.fromScene(
          new RoomEnvironment(),
          0.04,
        ).texture;
        generator.dispose();

        const gyroscope = createGyroscope(
          THREE,
          createMaterials(THREE, environment),
        );
        const pivot = new THREE.Group();
        const fitGroup = new THREE.Group();
        pivot.add(gyroscope.outer);
        fitGroup.add(pivot);

        const scene = new THREE.Scene();
        scene.add(fitGroup, ...createLights(THREE));

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
        let revealed = false;

        const resize = () => {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          const visibleHeight =
            2 *
            camera.position.z *
            Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
          fitGroup.scale.setScalar(
            Math.min(0.7 * visibleHeight, 0.7 * visibleHeight * camera.aspect) /
              5.4,
          );
        };

        const onPointer = (event) => {
          state.pointerX = (event.clientX / innerWidth) * 2 - 1;
          state.pointerY = -((event.clientY / innerHeight) * 2 - 1);
        };

        const onScroll = () => {
          state.scrollTarget = clamp(scrollY / innerHeight, 0, 1);
        };

        const frame = (now) => {
          const delta = Math.min((now - last) / 1000, 0.05);
          last = now;
          elapsed += delta;
          state.x = damp(state.x, state.pointerX, 3.2, delta);
          state.y = damp(state.y, state.pointerY, 3.2, delta);
          state.scroll = damp(state.scroll, state.scrollTarget, 4, delta);

          gyroscope.outer.rotation.y = elapsed * 0.16;
          gyroscope.middle.rotation.x = elapsed * 0.24;
          gyroscope.inner.rotation.z = elapsed * 0.32;
          pivot.rotation.set(
            0.35 - state.y * 0.18 + state.scroll * 0.5,
            -0.4 + state.x * 0.3,
            0,
          );
          pivot.position.set(state.x * 0.12, 0.1 - state.scroll * 0.4, 0);

          renderer.render(scene, camera);
          if (!revealed) {
            revealed = true;
            root.classList.add("webgl-on");
          }
          if (running) frameId = requestAnimationFrame(frame);
        };

        const play = () => {
          if (running) return;
          running = true;
          last = performance.now();
          frameId = requestAnimationFrame(frame);
        };

        const pause = () => {
          running = false;
          cancelAnimationFrame(frameId);
        };

        const visibility = new IntersectionObserver(([entry]) =>
          entry.isIntersecting ? play() : pause(),
        );
        const sizing = new ResizeObserver(resize);

        const teardown = () => {
          pause();
          visibility.disconnect();
          sizing.disconnect();
          removeEventListener("pointermove", onPointer);
          removeEventListener("scroll", onScroll);
          renderer.dispose();
          canvas.style.display = "none";
          root.classList.remove("webgl-on");
        };

        addEventListener("pointermove", onPointer, { passive: true });
        addEventListener("scroll", onScroll, { passive: true });
        capability.addEventListener("change", () => {
          if (!isCapable()) teardown();
        });
        reducedMotion.addEventListener("change", () => {
          if (!isCapable()) teardown();
        });

        sizing.observe(canvas);
        visibility.observe(hero);
        resize();
        onScroll();
      };

      if (isCapable()) mount().catch(() => root.classList.remove("webgl-on"));