"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MeetingMark } from "./Brand";

export function MeetingSculpture() {
  const host = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const [state, setState] = useState<"static" | "loading" | "ready">("static");
  const [retry, setRetry] = useState(0);
  const [motionAllowed, setMotionAllowed] = useState(false);
  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotionAllowed(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = matchMedia("(max-width: 700px)");
    const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const constrained = narrow.matches || device.connection?.saveData || (device.deviceMemory !== undefined && device.deviceMemory <= 4) || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 2);
    if (reduced.matches || (constrained && retry === 0)) return;
    let disposed = false;
    let starting = false;
    let cleanup: (() => void) | undefined;
    let stopRender = () => {};
    const observer = new IntersectionObserver(entries => {
      const visible = entries.some(entry => entry.isIntersecting);
      if (!visible) { stopRender(); return; }
      if (starting || disposed) return;
      starting = true;
      setState("loading");
      void import("three").then(THREE => {
        if (disposed) return;
        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
        } catch { setState("static"); return; }
        if (disposed) { renderer.dispose(); return; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.35;
        renderer.domElement.setAttribute("aria-hidden", "true");
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
        camera.position.set(0, .15, 7.6);
        camera.lookAt(0, 0, 0);
        scene.add(new THREE.HemisphereLight(0xfff9e7, 0x394335, 2.7));
        const key = new THREE.DirectionalLight(0xfff8e8, 4.2);
        key.position.set(-3, 5, 6);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0xb7d5c5, 1.7);
        fill.position.set(4, -1, 2);
        scene.add(fill);
        const rim = new THREE.DirectionalLight(0xffffff, 2.4);
        rim.position.set(2, 4, -3);
        scene.add(rim);
        // One open architectural form, mirrored by rotating its partner 180 degrees.
        const shape = new THREE.Shape();
        shape.moveTo(-1.45, -1.48);
        shape.lineTo(-1.45, .37);
        shape.bezierCurveTo(-1.45, 1.12, -1.08, 1.48, -.38, 1.48);
        shape.lineTo(.12, 1.48);
        shape.lineTo(.12, .9);
        shape.lineTo(-.3, .9);
        shape.bezierCurveTo(-.66, .9, -.83, .68, -.83, .3);
        shape.lineTo(-.83, -1.48);
        shape.closePath();
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: .44, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: .075, bevelThickness: .075, curveSegments: 24 });
        geometry.translate(0, 0, -.22);
        const material = new THREE.MeshStandardMaterial({ color: 0xe2ddca, roughness: .84, metalness: 0 });
        const sculpture = new THREE.Group();
        const first = new THREE.Mesh(geometry, material);
        const second = new THREE.Mesh(geometry, material);
        second.rotation.z = Math.PI;
        second.position.x = .3;
        sculpture.add(first, second);
        sculpture.rotation.set(-.16, -.32, -.12);
        scene.add(sculpture);
        container.append(renderer.domElement);
        let frame = 0;
        let visibleNow = true;
        let targetX = -.16;
        let targetY = -.32;
        function draw() {
          frame = 0;
          if (disposed || !visibleNow || document.hidden || reduced.matches) return;
          sculpture.rotation.x += (targetX - sculpture.rotation.x) * .12;
          sculpture.rotation.y += (targetY - sculpture.rotation.y) * .12;
          renderer.render(scene, camera);
          if (Math.abs(targetX - sculpture.rotation.x) + Math.abs(targetY - sculpture.rotation.y) > .001) frame = requestAnimationFrame(draw);
        }
        function requestDraw() { if (!frame && !disposed && visibleNow && !document.hidden) frame = requestAnimationFrame(draw); }
        function stop() { cancelAnimationFrame(frame); frame = 0; }
        stopRender = stop;
        function resize() {
          if (!container) return;
          const { width, height } = container.getBoundingClientRect();
          if (!width || !height) return;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          requestDraw();
        }
        function move(event: PointerEvent) {
          if (!container || event.pointerType === "touch" && event.buttons === 0) return;
          const rect = container.getBoundingClientRect();
          targetX = -.16 + ((event.clientY - rect.top) / rect.height - .5) * .5;
          targetY = -.32 + ((event.clientX - rect.left) / rect.width - .5) * .9;
          requestDraw();
        }
        function reset() { targetX = -.16; targetY = -.32; requestDraw(); }
        function keyboard(event: KeyboardEvent) {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(event.key)) return;
          event.preventDefault();
          if (event.key === "Home") { reset(); return; }
          if (event.key === "ArrowLeft") targetY -= .12;
          if (event.key === "ArrowRight") targetY += .12;
          if (event.key === "ArrowUp") targetX -= .12;
          if (event.key === "ArrowDown") targetX += .12;
          targetX = THREE.MathUtils.clamp(targetX, -.65, .5);
          targetY = THREE.MathUtils.clamp(targetY, -1, .6);
          requestDraw();
        }
        function visibility() { if (document.hidden) stop(); else requestDraw(); }
        function contextLost(event: Event) { event.preventDefault(); stop(); renderer.domElement.style.visibility = "hidden"; setState("static"); }
        function preference() { if (reduced.matches) { stop(); renderer.domElement.style.visibility = "hidden"; setState("static"); } }
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
        const visibilityObserver = new IntersectionObserver(values => { visibleNow = values.some(entry => entry.isIntersecting); if (visibleNow) requestDraw(); else stop(); });
        visibilityObserver.observe(container);
        container.addEventListener("pointermove", move);
        container.addEventListener("pointerleave", reset);
        container.addEventListener("keydown", keyboard);
        renderer.domElement.addEventListener("webglcontextlost", contextLost);
        document.addEventListener("visibilitychange", visibility);
        reduced.addEventListener("change", preference);
        resize();
        setState("ready");
        cleanup = () => {
          stop();
          resizeObserver.disconnect();
          visibilityObserver.disconnect();
          container.removeEventListener("pointermove", move);
          container.removeEventListener("pointerleave", reset);
          container.removeEventListener("keydown", keyboard);
          document.removeEventListener("visibilitychange", visibility);
          reduced.removeEventListener("change", preference);
          renderer.domElement.removeEventListener("webglcontextlost", contextLost);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          renderer.domElement.remove();
        };
      }).catch(() => { if (!disposed) setState("static"); });
    }, { rootMargin: "150px" });
    observer.observe(container);
    return () => { disposed = true; observer.disconnect(); stopRender(); cleanup?.(); };
  }, [retry]);

  return <figure className="meeting-sculpture">
    <div ref={host} className="meeting-sculpture-stage" role="group" tabIndex={state === "ready" ? 0 : -1}
      aria-label="Скульптура «Встреча»: два открытых матовых объёма" aria-describedby={hintId} data-state={state}>
      <div className="meeting-sculpture-static" aria-hidden="true"><MeetingMark /></div>
    </div>
    <figcaption><span className="meeting-sculpture-title">Встреча / 001</span><p id={hintId}>{state === "ready" ? "Поверните указателем или стрелками. Home — исходный ракурс." : state === "loading" ? "Загружаем объёмную сцену…" : "Статичный знак. Объёмная версия доступна на совместимых устройствах."}</p>
      {state === "static" && motionAllowed && <button type="button" onClick={() => {
        setRetry(value => value + 1);
      }}>Попробовать 3D</button>}
    </figcaption>
  </figure>;
}
