import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.168.0/build/three.module.js';

export default {
  name: 'Morphing Sphere',
  desc: 'Shader 噪声形变球体',
  tag: 'SHADER',

  init(canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.set(0, 0, 3.5);

    // ── Custom shader ──
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:  { value: 0 },
        uColor1: { value: new THREE.Color('#6c63ff') },
        uColor2: { value: new THREE.Color('#ff6584') },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying float vDisplace;

        // simple hash noise
        float hash(vec3 p) {
          p = fract(p * 0.3183099 + 0.1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }
        float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash(i),           hash(i+vec3(1,0,0)), f.x),
                mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)), f.x),
                mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)), f.x), f.y),
            f.z);
        }

        void main() {
          vNormal = normal;
          float n = noise(normal * 2.0 + uTime * 0.5);
          float disp = n * 0.4;
          vDisplace = disp;
          vec3 pos = position + normal * disp;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec3 vNormal;
        varying float vDisplace;

        void main() {
          float light = dot(vNormal, normalize(vec3(1.0, 1.0, 0.5))) * 0.5 + 0.5;
          vec3 col = mix(uColor1, uColor2, vDisplace * 2.5);
          gl_FragColor = vec4(col * light, 1.0);
        }
      `,
      wireframe: false,
    });

    const geo    = new THREE.IcosahedronGeometry(1.2, 64);
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    // Ambient glow via additive blending rim mesh
    const rimMat = new THREE.MeshBasicMaterial({
      color: '#6c63ff',
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    const rim = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 8), rimMat);
    scene.add(rim);

    // ── Mouse orbit ──
    let isDragging = false, prevX = 0, prevY = 0, rotX = 0, rotY = 0;
    canvas.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
    window.addEventListener('mouseup',   () => isDragging = false);
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      rotY += (e.clientX - prevX) * 0.008;
      rotX += (e.clientY - prevY) * 0.008;
      prevX = e.clientX; prevY = e.clientY;
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

    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      mat.uniforms.uTime.value += 0.01;
      sphere.rotation.y = rotY;
      sphere.rotation.x = rotX;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geo.dispose(); mat.dispose(); rimMat.dispose();
      renderer.dispose();
    };
  }
};
