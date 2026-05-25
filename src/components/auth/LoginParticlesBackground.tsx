import * as React from "react";
import * as THREE from "three";

// Colors defined by user request
const SKY_BLUE = "#0ea5e9";
const VIBRANT_RED = "#ef4444";

interface Particle3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

export function LoginParticlesBackground() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Mouse coordinate refs for easing (parallax)
  const targetMouseX = React.useRef<number>(0);
  const targetMouseY = React.useRef<number>(0);
  const currentMouseX = React.useRef<number>(0);
  const currentMouseY = React.useRef<number>(0);

  // Track if WebGL failed and we are running Canvas 2D fallback
  const [isFallbackMode, setIsFallbackMode] = React.useState<boolean>(false);

  // 1. WebGL Availability Gate Check
  const checkWebGLSupport = (): boolean => {
    try {
      const canvas = document.createElement("canvas");
      const support = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      return support;
    } catch {
      return false;
    }
  };

  // Listen to mousemove event on window to build parallax
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize to [-1, 1]
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -(event.clientY / window.innerHeight) * 2 + 1;
      targetMouseX.current = nx;
      targetMouseY.current = ny;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  React.useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const useWebGL = checkWebGLSupport();
    let animationFrameId: number;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Canvas sizing setup helper
    const handleResize = (
      rendererResize?: (w: number, h: number) => void
    ) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvasRef.current) {
        canvasRef.current.width = w;
        canvasRef.current.height = h;
      }
      if (rendererResize) {
        rendererResize(w, h);
      }
    };

    // Helper to generate circular glowing textures for elegant soft dots
    const createCircularTexture = (colorHex: string): THREE.Texture => {
      const pCanvas = document.createElement("canvas");
      pCanvas.width = 32;
      pCanvas.height = 32;
      const pCtx = pCanvas.getContext("2d");
      if (pCtx) {
        // Soft glowing radial gradient
        const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, colorHex);
        gradient.addColorStop(0.3, colorHex);
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        pCtx.fillStyle = gradient;
        pCtx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(pCanvas);
    };

    // ─────────────────────────────────────────────────────────────
    // METHOD A: WebGL Three.js Renderer
    // ─────────────────────────────────────────────────────────────
    const initThreeJS = () => {
      try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
        camera.position.z = 150;

        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current!,
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create groups and particle counts (80 to 100 dots total)
        const totalCount = 90;
        const groupObj = new THREE.Group();
        scene.add(groupObj);

        // Geometries for blue and red points
        const blueGeo = new THREE.BufferGeometry();
        const redGeo = new THREE.BufferGeometry();

        const bluePositions: number[] = [];
        const redPositions: number[] = [];

        // Randomly distribute positions
        for (let i = 0; i < totalCount; i++) {
          const x = (Math.random() - 0.5) * 220;
          const y = (Math.random() - 0.5) * 220;
          const z = (Math.random() - 0.5) * 220;

          if (i % 2 === 0) {
            bluePositions.push(x, y, z);
          } else {
            redPositions.push(x, y, z);
          }
        }

        blueGeo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(bluePositions, 3)
        );
        redGeo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(redPositions, 3)
        );

        // Materials using high-quality textures
        const blueTex = createCircularTexture(SKY_BLUE);
        const redTex = createCircularTexture(VIBRANT_RED);

        const blueMat = new THREE.PointsMaterial({
          size: 7,
          map: blueTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const redMat = new THREE.PointsMaterial({
          size: 7,
          map: redTex,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const bluePoints = new THREE.Points(blueGeo, blueMat);
        const redPoints = new THREE.Points(redGeo, redMat);

        groupObj.add(bluePoints);
        groupObj.add(redPoints);

        // Store standard continuous rotation angles
        let rotX = 0;
        let rotY = 0;

        const animateWebGL = () => {
          animationFrameId = requestAnimationFrame(animateWebGL);

          // Apply slow natural rotation as mandated
          rotY += 0.0008;
          rotX += 0.0004;

          // Mouse parallax easing tracking
          currentMouseX.current += (targetMouseX.current - currentMouseX.current) * 0.03;
          currentMouseY.current += (targetMouseY.current - currentMouseY.current) * 0.03;

          // Combine auto-rotation with parallax lerp adjustments
          groupObj.rotation.x = rotX + currentMouseY.current * 0.15;
          groupObj.rotation.y = rotY + currentMouseX.current * 0.15;

          renderer.render(scene, camera);
        };

        animateWebGL();

        const handleResizeWebGL = () => {
          handleResize((w, h) => {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          });
        };

        window.addEventListener("resize", handleResizeWebGL);
        handleResizeWebGL();

        return () => {
          window.removeEventListener("resize", handleResizeWebGL);
          cancelAnimationFrame(animationFrameId);
          renderer.dispose();
          blueGeo.dispose();
          redGeo.dispose();
          blueMat.dispose();
          redMat.dispose();
          blueTex.dispose();
          redTex.dispose();
        };
      } catch (err) {
        console.warn("WebGL Renderer initialization failed. Switching to 2D Fallback:", err);
        setIsFallbackMode(true);
        return initCanvas2DFallback();
      }
    };

    // ─────────────────────────────────────────────────────────────
    // METHOD B: HTML5 Canvas 2D Fallback Engine (Math Projected 3D)
    // ─────────────────────────────────────────────────────────────
    const initCanvas2DFallback = () => {
      const ctx = canvasRef.current!.getContext("2d")!;
      setIsFallbackMode(true);

      // Sizing setup
      canvasRef.current!.width = width;
      canvasRef.current!.height = height;

      // Make 90 particles matching the bi-ton color palette
      const particles: Particle3D[] = [];
      const totalCount = 90;

      for (let i = 0; i < totalCount; i++) {
        particles.push({
          x: (Math.random() - 0.5) * 300,
          y: (Math.random() - 0.5) * 300,
          z: (Math.random() - 0.5) * 300,
          color: i % 2 === 0 ? SKY_BLUE : VIBRANT_RED,
          size: Math.random() * 2.5 + 2.5,
        });
      }

      let rotY = 0;
      let rotX = 0;

      const animateFallback = () => {
        animationFrameId = requestAnimationFrame(animateFallback);

        // Clean Canvas using request client bounding size details
        const w = canvasRef.current!.width;
        const h = canvasRef.current!.height;
        ctx.clearRect(0, 0, w, h);

        // Constant automatic rotations requested
        rotY += 0.0008;
        rotX += 0.0004;

        // Interactive mouse parallax easing math (lerp)
        currentMouseX.current += (targetMouseX.current - currentMouseX.current) * 0.03;
        currentMouseY.current += (targetMouseY.current - currentMouseY.current) * 0.03;

        // Effective overall 3D angles applied
        const angleY = rotY + currentMouseX.current * 0.25;
        const angleX = rotX + currentMouseY.current * 0.25;

        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);

        // Projection math settings (fake camera properties)
        const fov = 200;
        const cx = w / 2;
        const cy = h / 2;

        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];

          // 1. Rotate around Y axis
          const x1 = pt.x * cosY - pt.z * sinY;
          const z1 = pt.x * sinY + pt.z * cosY;

          // 2. Rotate around X axis
          const y2 = pt.y * cosX - z1 * sinX;
          const z2 = pt.y * sinX + z1 * cosX;

          // 3. Move camera simulation away
          const finalZ = z2 + 250;

          // Skip if clipped behind viewport
          if (finalZ <= 10) continue;

          // 4. Perspective Projection
          const scale = fov / finalZ;
          const projX = x1 * scale + cx;
          const projY = y2 * scale + cy;

          // Gentle blur glow representation for Canvas 2D circles
          const alphaFactor = Math.max(0.2, Math.min(1.0, (1 - finalZ / 500)));
          ctx.beginPath();
          const rG = ctx.createRadialGradient(
            projX,
            projY,
            0,
            projX,
            projY,
            pt.size * scale * 1.8
          );
          
          rG.addColorStop(0, pt.color);
          rG.addColorStop(0.3, pt.color);
          rG.addColorStop(1, "rgba(0,0,0,0)");

          ctx.fillStyle = rG;
          ctx.arc(projX, projY, pt.size * scale * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      animateFallback();

      const handleResizeFallback = () => {
        handleResize();
      };

      window.addEventListener("resize", handleResizeFallback);
      handleResizeFallback();

      return () => {
        window.removeEventListener("resize", handleResizeFallback);
        cancelAnimationFrame(animationFrameId);
      };
    };

    // Run WebGL or Fallback setup accordingly
    let cleanup: (() => void) | undefined;
    if (useWebGL) {
      cleanup = initThreeJS();
    } else {
      cleanup = initCanvas2DFallback();
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="login-particles-container"
      className="absolute inset-0 pointer-events-none w-full h-full select-none"
      style={{
        zIndex: 0,
        opacity: 0.22, // Soft premium balance as specified (15% - 25%)
        mixBlendMode: isFallbackMode ? "normal" : "screen",
      }}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}
