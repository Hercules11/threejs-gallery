import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

export default {
  name: 'Particle Galaxy',
  desc: '螺旋星系粒子场',
  tag: 'PARTICLES',

  init(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);

    // ── Galaxy geometry ──
    const COUNT     = 80000;
    const ARMS      = 3;
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const colorIn   = new THREE.Color('#6c63ff');
    const colorOut  = new THREE.Color('#00d4ff');

    for (let i = 0; i < COUNT; i++) {
      const i3    = i * 3;
      const r     = Math.random() * 4;
      const spin  = r * 1.2;
      const arm   = (i % ARMS) * ((Math.PI * 2) / ARMS);
      const angle = arm + spin;
      const rand  = (a) => (Math.random() - 0.5) * a;
      const spread = Math.pow(Math.random(), 3) * 0.5;

      positions[i3]     = Math.cos(angle) * r + rand(spread);
      positions[i3 + 1] = rand(spread * 0.4);
      positions[i3 + 2] = Math.sin(angle) * r + rand(spread);

      const mixed = new THREE.Color().lerpColors(colorIn, colorOut, r / 4);
      colors[i3]     = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.015,
      sizeAttenuation: true,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const galaxy = new THREE.Points(geo, mat);
    scene.add(galaxy);

    // ── Orbit controls (manual, no dep) ──
    let isDragging = false, prevX = 0, prevY = 0;
    let rotX = 0.3, rotY = 0;
    canvas.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup',   () => { isDragging = false; });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      rotY += (e.clientX - prevX) * 0.005;
      rotX += (e.clientY - prevY) * 0.005;
      prevX = e.clientX; prevY = e.clientY;
    });
    canvas.addEventListener('wheel', e => {
      camera.position.multiplyScalar(1 + e.deltaY * 0.001);
    }, { passive: true });

    // ── Resize ──
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas.parentElement;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    // ── Loop ──
    let raf, t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += 0.003;
      galaxy.rotation.y = t + rotY;
      galaxy.rotation.x = rotX;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose(); mat.dispose();
      renderer.dispose();
    };
  }
};
