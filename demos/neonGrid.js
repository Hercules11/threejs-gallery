import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

export default {
  name: 'Neon Grid',
  desc: '无限霓虹隧道',
  tag: 'GEOMETRY',

  init(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor('#030308');

    const scene  = new THREE.Scene();
    scene.fog    = new THREE.Fog('#030308', 5, 30);
    const camera = new THREE.PerspectiveCamera(80, 1, 0.1, 100);
    camera.position.set(0, 0, 0);

    // ── Grid planes ──
    const COLS = 20, ROWS = 20, SPACING = 1.5, COUNT = 40;
    const gridGroup = new THREE.Group();
    scene.add(gridGroup);

    const lineMat = new THREE.LineBasicMaterial({
      color: '#00d4ff',
      transparent: true,
      opacity: 0.5,
    });

    const makeGrid = (z) => {
      const group = new THREE.Group();
      group.position.z = z;

      // horizontal lines
      for (let r = 0; r <= ROWS; r++) {
        const y = (r - ROWS / 2) * SPACING * 0.3;
        const pts = [new THREE.Vector3(-COLS * SPACING * 0.5, y, 0),
                     new THREE.Vector3( COLS * SPACING * 0.5, y, 0)];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
      }
      // vertical lines
      for (let c = 0; c <= COLS; c++) {
        const x = (c - COLS / 2) * SPACING * 0.5;
        const pts = [new THREE.Vector3(x, -ROWS * SPACING * 0.15, 0),
                     new THREE.Vector3(x,  ROWS * SPACING * 0.15, 0)];
        group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
      }
      return group;
    };

    const grids = [];
    for (let i = 0; i < COUNT; i++) {
      const g = makeGrid(-i * 2);
      gridGroup.add(g);
      grids.push(g);
    }

    // ── Mouse parallax ──
    let mx = 0, my = 0;
    canvas.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    });

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

    let raf, t = 0;
    const SPEED = 0.03;
    const TOTAL_DEPTH = COUNT * 2;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      t += SPEED;

      gridGroup.position.z = (t % 2); // seamless loop every 2 units
      camera.position.x += (mx * 1.5 - camera.position.x) * 0.05;
      camera.position.y += (-my * 0.8 - camera.position.y) * 0.05;
      camera.lookAt(camera.position.x * 0.1, camera.position.y * 0.1, -10);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
    };
  }
};
