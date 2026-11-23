const hero = document.querySelector(".hero");
const visual = document.querySelector(".hero-visual");
const canvas = document.querySelector("#scene");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const pointerCapability = matchMedia(
  "(min-width: 901px) and (hover: hover) and (pointer: fine)",
);
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (current, target, amount) =>
  current + (target - current) * amount;

const vertexSource = `#version 300 es
precision highp float;
in vec2 a_position;
uniform float u_time;
uniform float u_scroll;
uniform float u_aspect;
uniform vec2 u_pointer;
out vec3 v_position;
out vec2 v_uv;
out float v_height;

void main() {
  vec2 uv = a_position;
  float broadWave =
    sin(uv.x * 2.8 + u_time * 0.32 + u_pointer.y * 0.45) *
    cos(uv.y * 3.4 - u_time * 0.26 + u_scroll * 1.2);
  float crossWave =
    cos((uv.x * 1.25 - uv.y * 1.7) * 3.4 - u_time * 0.18);
  float detailWave =
    sin((uv.x - uv.y * 0.7) * 6.0 + u_time * 0.13);
  vec2 cursorDelta = uv - u_pointer * 0.24;
  float cursorField =
    exp(-dot(cursorDelta, cursorDelta) * 3.0) *
    sin(u_time * 0.42 + uv.x * 2.0);
  float height =
    broadWave * 0.3 + crossWave * 0.15 + detailWave * 0.07 + cursorField * 0.12;
  float edgeWeight = smoothstep(0.2, 1.2, length(uv));
  vec2 warped = uv + vec2(
    sin(uv.y * 3.1 + u_time * 0.13) * 0.045 * edgeWeight,
    cos(uv.x * 3.4 - u_time * 0.12) * 0.035 * edgeWeight
  );
  vec3 position = vec3(warped.x * 1.5, warped.y * 1.2, height);
  float rotationX = u_pointer.y * 0.12 + u_scroll * 0.1;
  float rotationY = -u_pointer.x * 0.16 - u_scroll * 0.08;
  position.yz = mat2(cos(rotationX), -sin(rotationX), sin(rotationX), cos(rotationX)) * position.yz;
  position.xz = mat2(cos(rotationY), -sin(rotationY), sin(rotationY), cos(rotationY)) * position.xz;
  position.x *= u_aspect;
  float perspective = 2.4 / (3.4 - position.z * 0.3);
  gl_Position = vec4(position.xy * perspective, position.z * 0.04, 1.0);
  v_position = position;
  v_uv = warped;
  v_height = height;
}`;

const fragmentSource = `#version 300 es
precision highp float;
uniform float u_time;
uniform vec3 u_surface;
uniform vec3 u_ink;
uniform vec3 u_accent;
in vec3 v_position;
in vec2 v_uv;
in float v_height;
out vec4 outColor;

void main() {
  float rimWave =
    sin(v_uv.x * 5.0 + u_time * 0.12) * 0.035 +
    cos(v_uv.y * 4.0 - u_time * 0.1) * 0.025;
  float radius = length(v_uv * vec2(0.94, 1.0)) + rimWave + v_height * 0.08;
  float edge = 1.0 - smoothstep(0.8, 1.02, radius);
  vec3 normal = normalize(cross(dFdx(v_position), dFdy(v_position)));
  if (normal.z < 0.0) normal = -normal;
  vec3 lightDirection = normalize(vec3(-0.48, 0.72, 0.8));
  vec3 rimDirection = normalize(vec3(0.62, -0.32, 0.7));
  vec3 viewDirection = vec3(0.0, 0.0, 1.0);
  float diffuse = max(dot(normal, lightDirection), 0.0);
  float fresnel = pow(1.0 - max(normal.z, 0.0), 2.2);
  float specular = pow(
    max(dot(reflect(-lightDirection, normal), viewDirection), 0.0),
    22.0
  );
  float rimSpecular = pow(
    max(dot(reflect(-rimDirection, normal), viewDirection), 0.0),
    14.0
  );
  float flow = 0.5 + 0.5 * sin((v_uv.x * 1.6 + v_uv.y * 0.75) * 6.0 + u_time * 0.12);
  vec3 color = mix(u_surface, u_ink, 0.14 + diffuse * 0.2);
  color = mix(color, u_accent, 0.14 + fresnel * 0.28 + flow * 0.06);
  color = mix(
    color,
    u_surface,
    clamp(specular * 0.5 + rimSpecular * 0.18 + fresnel * 0.1, 0.0, 0.62)
  );
  float alpha = edge * (0.78 + specular * 0.16 + rimSpecular * 0.08);
  outColor = vec4(color, alpha);
}`;

const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create the WebGL shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(message || "Unable to compile the WebGL shader.");
  }
  return shader;
};

const createProgram = (gl) => {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create the WebGL program.");
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(message || "Unable to link the WebGL program.");
  }
  return program;
};

const createSurface = (gl, segments) => {
  const vertices = new Float32Array((segments + 1) * (segments + 1) * 2);
  const indices = new Uint16Array(segments * segments * 6);
  let vertexIndex = 0;
  let index = 0;

  for (let y = 0; y <= segments; y += 1) {
    for (let x = 0; x <= segments; x += 1) {
      vertices[vertexIndex] = (x / segments) * 2 - 1;
      vertices[vertexIndex + 1] = 1 - (y / segments) * 2;
      vertexIndex += 2;
      if (x === segments || y === segments) continue;
      const current = y * (segments + 1) + x;
      const nextRow = current + segments + 1;
      indices[index] = current;
      indices[index + 1] = current + 1;
      indices[index + 2] = nextRow;
      indices[index + 3] = current + 1;
      indices[index + 4] = nextRow + 1;
      indices[index + 5] = nextRow;
      index += 6;
    }
  }

  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();
  if (!vertexBuffer || !indexBuffer)
    throw new Error("Unable to create the WebGL surface buffers.");
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  return { indexBuffer, indexCount: indices.length, vertexBuffer };
};

const readColor = (context, name) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  context.clearRect(0, 0, 1, 1);
  context.fillStyle = value;
  context.fillRect(0, 0, 1, 1);
  return new Float32Array(
    Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3), (channel) =>
      channel / 255,
    ),
  );
};

const canRender = () =>
  pointerCapability.matches &&
  !reducedMotion.matches &&
  (navigator.hardwareConcurrency ?? 8) >= 4 &&
  (navigator.deviceMemory ?? 8) >= 4 &&
  "IntersectionObserver" in window &&
  "ResizeObserver" in window &&
  "WebGL2RenderingContext" in window;

if (canRender()) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    preserveDrawingBuffer: false,
  });

  if (gl) {
    const program = createProgram(gl);
    const surface = createSurface(gl, 72);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const uniforms = {
      accent: gl.getUniformLocation(program, "u_accent"),
      aspect: gl.getUniformLocation(program, "u_aspect"),
      ink: gl.getUniformLocation(program, "u_ink"),
      pointer: gl.getUniformLocation(program, "u_pointer"),
      scroll: gl.getUniformLocation(program, "u_scroll"),
      surface: gl.getUniformLocation(program, "u_surface"),
      time: gl.getUniformLocation(program, "u_time"),
    };
    const colorCanvas = document.createElement("canvas");
    const colorContext = colorCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!colorContext) throw new Error("Unable to read the portfolio colors.");
    const state = {
      pointer: [0, 0],
      pointerTarget: [0, 0],
      scroll: 0,
      scrollTarget: 0,
      time: 0,
    };
    let frameId = 0;
    let lastFrame = 0;
    let running = false;
    let destroyed = false;
    let contextLost = false;
    let inView = false;
    let hasRendered = false;
    const pixelRatio = () => clamp(window.devicePixelRatio || 1, 1, 2);
    const colorScheme = matchMedia("(prefers-color-scheme: dark)");

    const updateColors = () => {
      gl.useProgram(program);
      gl.uniform3fv(uniforms.surface, readColor(colorContext, "--surface"));
      gl.uniform3fv(uniforms.ink, readColor(colorContext, "--ink"));
      gl.uniform3fv(uniforms.accent, readColor(colorContext, "--accent"));
    };

    const resize = () => {
      const width = visual.clientWidth;
      const height = visual.clientHeight;
      if (!width || !height) return;
      const ratio = pixelRatio();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const updatePointer = (event) => {
      const bounds = hero.getBoundingClientRect();
      state.pointerTarget[0] = clamp(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -1,
        1,
      );
      state.pointerTarget[1] = clamp(
        1 - ((event.clientY - bounds.top) / bounds.height) * 2,
        -1,
        1,
      );
    };

    const updateScroll = () => {
      const distance =
        document.documentElement.scrollHeight - window.innerHeight;
      state.scrollTarget = distance > 0 ? clamp(window.scrollY / distance, 0, 1) : 0;
    };

    const render = (now) => {
      if (!running || destroyed || contextLost) return;
      const delta = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      const blend = Math.min(delta * 2.4, 1);
      state.pointer[0] = lerp(state.pointer[0], state.pointerTarget[0], blend);
      state.pointer[1] = lerp(state.pointer[1], state.pointerTarget[1], blend);
      state.scroll = lerp(state.scroll, state.scrollTarget, blend);
      state.time += delta;
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, surface.vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, surface.indexBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uniforms.time, state.time);
      gl.uniform1f(
        uniforms.aspect,
        clamp(visual.clientWidth / visual.clientHeight, 0.72, 1.1),
      );
      gl.uniform1f(uniforms.scroll, state.scroll);
      gl.uniform2f(uniforms.pointer, state.pointer[0], state.pointer[1]);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, surface.indexCount, gl.UNSIGNED_SHORT, 0);
      if (!hasRendered) {
        hasRendered = true;
        document.documentElement.classList.add("webgl-on");
      }
      frameId = requestAnimationFrame(render);
    };

    const play = () => {
      if (running || destroyed || contextLost) return;
      running = true;
      lastFrame = performance.now();
      frameId = requestAnimationFrame(render);
    };

    const pause = () => {
      running = false;
      cancelAnimationFrame(frameId);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView && document.visibilityState === "visible") {
        play();
      } else {
        pause();
      }
    });

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && inView) {
        updateScroll();
        play();
      } else {
        pause();
      }
    };

    const destroy = () => {
      if (destroyed) return;
      destroyed = true;
      pause();
      visibility.disconnect();
      resizeObserver.disconnect();
      hero.removeEventListener("pointermove", updatePointer);
      hero.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", checkCapability);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      colorScheme.removeEventListener("change", updateColors);
      pointerCapability.removeEventListener("change", checkCapability);
      reducedMotion.removeEventListener("change", checkCapability);
      document.documentElement.classList.remove("webgl-on");
      gl.deleteBuffer(surface.vertexBuffer);
      gl.deleteBuffer(surface.indexBuffer);
      gl.deleteProgram(program);
    };

    const resetPointer = () => {
      state.pointerTarget[0] = 0;
      state.pointerTarget[1] = 0;
    };

    const checkCapability = () => {
      if (!canRender() || window.innerWidth < 901) destroy();
    };

    const onContextLost = (event) => {
      event.preventDefault();
      contextLost = true;
      pause();
      document.documentElement.classList.remove("webgl-on");
      console.warn("WebGL background paused because its context was lost.");
    };

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    updateColors();
    resize();
    updateScroll();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(visual);
    visibility.observe(hero);
    hero.addEventListener("pointermove", updatePointer, { passive: true });
    hero.addEventListener("pointerleave", resetPointer, { passive: true });
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", checkCapability, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    colorScheme.addEventListener("change", updateColors);
    pointerCapability.addEventListener("change", checkCapability);
    reducedMotion.addEventListener("change", checkCapability);
    canvas.addEventListener("webglcontextlost", onContextLost, false);
  }
}
