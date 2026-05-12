/* ════════════════════════════════════════════════════════════
   script.js — ULTRA PORTFOLIO v3
   Palette: Carbon #101211 · Velvet #29281E · Plum #48252F
            Sand #857861 · Almond #E7D4BB
   ════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   1. LOADER
   ───────────────────────────────────────────────────── */
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loader-bar');
const loaderPct = document.getElementById('loader-pct');

document.body.style.overflowY = 'hidden';

let progress = 0;
const loaderInterval = setInterval(() => {
  progress += Math.random() * 20;
  if (progress >= 100) {
    progress = 100;
    clearInterval(loaderInterval);
    loaderBar.style.width = '100%';
    loaderPct.textContent = '100%';
    setTimeout(finishLoading, 350);
  } else {
    loaderBar.style.width = progress + '%';
    loaderPct.textContent = Math.floor(progress) + '%';
  }
}, 75);

function finishLoading() {
  loader.classList.add('hide');
  document.body.style.overflowY = 'auto';
  initHeroEntrance();
}

/* ─────────────────────────────────────────────────────
   2. ADAPTIVE CURSOR
   ───────────────────────────────────────────────────── */
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
const cursorLabel = document.getElementById('cursor-label');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // transform is GPU-composited — doesn't trigger layout during scroll
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});

// Remove position: fixed left/top entirely — use transform only
cursorDot.style.left = '0';
cursorDot.style.top = '0';
cursorRing.style.left = '0';
cursorRing.style.top = '0';

(function animateRing() {
  ringX += (mouseX - ringX) * 0.13;
  ringY += (mouseY - ringY) * 0.13;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateRing);
})();

// ── 3-state cursor: default, cur-link (↗), cur-drag (⟷) ──
const LINK_SELECTORS = 'a, button, .nav-link, .btn, .rail-icon, .email-rotated, .plink-btn, .csocial';
const DRAG_SELECTORS = '.deck-card';

function setCursor(state) {
  document.body.classList.remove('cur-link', 'cur-drag');
  if (state) document.body.classList.add(state);
}

document.querySelectorAll(LINK_SELECTORS).forEach(el => {
  el.addEventListener('mouseenter', () => setCursor('cur-link'));
  el.addEventListener('mouseleave', () => setCursor(null));
});

document.querySelectorAll(DRAG_SELECTORS).forEach(el => {
  el.addEventListener('mouseenter', () => setCursor('cur-drag'));
  el.addEventListener('mouseleave', () => setCursor(null));
});

/* ─────────────────────────────────────────────────────
   3. THEME TOGGLE — removed
   ───────────────────────────────────────────────────── */


/* ─────────────────────────────────────────────────────
   4. TYPEWRITER
   ───────────────────────────────────────────────────── */
const typeEl = document.getElementById('typewriter');
const phrases = [
  'build web apps',
  'craft clean UIs',
  'solve hard problems',
  'design UI/UX',
  'ship products fast',
];
let pIdx = 0, cIdx = 0, deleting = false;

function typewrite() {
  const cur = phrases[pIdx];
  if (typeEl) {
    typeEl.textContent = deleting
      ? cur.substring(0, cIdx - 1)
      : cur.substring(0, cIdx + 1);
  }
  deleting ? cIdx-- : cIdx++;
  let delay = deleting ? 48 : 90;
  if (!deleting && cIdx === cur.length) { delay = 2200; deleting = true; }
  else if (deleting && cIdx === 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; delay = 380; }
  setTimeout(typewrite, delay);
}

/* ─────────────────────────────────────────────────────
   5. GSAP + HERO ENTRANCE
   ───────────────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function initHeroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Topbar
  tl.to('#hero-topbar', { opacity: 1, y: 0, duration: 0.8 }, 0.05);

  // Name words
  const words = document.querySelectorAll('.name-word');
  tl.to(words, { y: '0%', opacity: 1, duration: 1.0, stagger: 0.15 }, 0.2);

  // Bottom row
  tl.to('#hero-bottom', { opacity: 1, y: 0, duration: 0.9 }, 0.55);

  // Start typewriter
  tl.call(typewrite, [], 1.0);

  // Init scroll triggers
  tl.call(initScrollTriggers, [], 0.3);
}

/* ─────────────────────────────────────────────────────
   6. SCROLL TRIGGERS + REVEAL
   ───────────────────────────────────────────────────── */
function initScrollTriggers() {

  // Generic data-reveal
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObs.observe(el));

  // Section labels
  document.querySelectorAll('.section-label').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 85%',
      onEnter: () => el.classList.add('revealed'),
    });
  });

  // Skill bars
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.sbar-fill').forEach(b => { b.style.width = b.dataset.width + '%'; });
      skillObs.unobserve(e.target);
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('.skill-card').forEach(c => skillObs.observe(c));

  // Count-up — works for both bento-stat and about-stat-callout
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const numEl = e.target.querySelector('.stat-number');
      if (!numEl || numEl._counted) return;
      numEl._counted = true;
      const target = parseInt(numEl.dataset.count, 10);
      let cur = 0;
      const step = Math.ceil(target / 55);
      const timer = setInterval(() => {
        cur = Math.min(cur + step, target);
        numEl.textContent = cur;
        if (cur >= target) clearInterval(timer);
      }, 28);
    });
  }, { threshold: 0.4 });
  // Only target bento-stat if still present (legacy safety)
  document.querySelectorAll('.bento-stat').forEach(c => countObs.observe(c));

  // GSAP — principles items stagger in from right
  gsap.utils.toArray('.principle-item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: 30 },
      {
        opacity: 1, x: 0, duration: 0.65, delay: i * 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.about-principles-col', start: 'top 82%', once: true }
      }
    );
  });

  // GSAP — about text column
  gsap.fromTo('.about-text-col',
    { opacity: 0, y: 60 },
    {
      opacity: 1, y: 0, duration: 1.0, ease: 'expo.out',
      scrollTrigger: { trigger: '.about-main-grid', start: 'top 80%', once: true }
    }
  );

  // GSAP — principles col slide in from right
  gsap.fromTo('.about-principles-col',
    { opacity: 0, x: 40 },
    {
      opacity: 1, x: 0, duration: 1.0, ease: 'expo.out',
      scrollTrigger: { trigger: '.about-main-grid', start: 'top 80%', once: true }
    }
  );

  // GSAP — about watermark parallax
  gsap.to('.about-watermark', {
    y: -80,
    scrollTrigger: {
      trigger: '.about-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    }
  });

  // GSAP — skill cards (animate whole grid row)
  gsap.fromTo('.skills-grid',
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: '.skills-grid', start: 'top 85%', once: true }
    }
  );

  // GSAP — skills watermark parallax (opposite direction to About)
  gsap.to('.skills-watermark', {
    y: 60,
    scrollTrigger: {
      trigger: '.skills-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 2,
    }
  });

  // Initialize deck positions up-front so stacked cards are visible immediately.
  initDeckCards();

  // Animate the stage wrapper in, preserving each card's own transform stack.
  gsap.fromTo('.proj-deck-stage',
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: '.proj-deck-stage', start: 'top 80%', once: true }
    }
  );

  // Section titles
  document.querySelectorAll('.section-title').forEach(t => {
    gsap.fromTo(t,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1.0, ease: 'expo.out',
        scrollTrigger: { trigger: t, start: 'top 86%', once: true }
      }
    );
  });

  // Parallax orbs
  gsap.to('.h-orb-1', { y: -180, scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2 } });
  gsap.to('.h-orb-2', { y: 100, scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: 2.5 } });
}

/* ─────────────────────────────────────────────────────
   7. NAVBAR
   ───────────────────────────────────────────────────── */
const navLinks = document.querySelectorAll('.nav-link');
const pageSects = document.querySelectorAll('.section');

const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    }
  });
}, { threshold: 0.35 });
pageSects.forEach(s => navObs.observe(s));

window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.top = window.scrollY > 50 ? '10px' : '20px';
}, { passive: true });

/* ─────────────────────────────────────────────────────
   8. SMOOTH SCROLL (GSAP)
   ───────────────────────────────────────────────────── */

// Calculate how far below the top of the viewport the navbar bottom sits,
// plus a small breathing gap. Recalculated on each click so it adapts
// if the navbar shifts (it moves from top:20 → top:10 on scroll).
function navOffset() {
  const nav = document.getElementById('navbar');
  if (!nav) return 90;
  const { top, height } = nav.getBoundingClientRect();
  // top is the current distance from viewport top; height is navbar height.
  // Add 20px breathing room so the section header is never tight against nav.
  return Math.round(top + height + 20);
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();

    // Immediately highlight the active nav link
    document.querySelectorAll('.nav-link').forEach(l =>
      l.classList.toggle('active', l.getAttribute('href') === href)
    );

    // Home link → snap to top of page
    if (href === '#home') {
      gsap.to(window, { scrollTo: 0, duration: 0.75, ease: 'expo.inOut', overwrite: true });
      return;
    }

    // Every other section → scroll slightly past the section top so the
    // section header is fully visible and content below isn't clipped.
    // Negative offsetY = scroll further DOWN (past the anchor point).
    gsap.to(window, {
      scrollTo: { y: target, offsetY: -80 },
      duration: 0.75,
      ease: 'expo.inOut',
      overwrite: true,
    });
  });
});




/* ─────────────────────────────────────────────────────
   9. THREE.JS — HERO BG PARTICLE FIELD (subtle)
   ───────────────────────────────────────────────────── */
(function initBgParticles() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = canvas.parentElement.offsetWidth;
  const H = canvas.parentElement.offsetHeight;
  canvas.width = W;
  canvas.height = H;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 1000);
  camera.position.z = 40;

  const COUNT = 1400;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const cols = new Float32Array(COUNT * 3);
  const szs = new Float32Array(COUNT);

  // Palette colors as THREE.Color
  const c1 = new THREE.Color('#48252F'); // plum
  const c2 = new THREE.Color('#857861'); // sand
  const c3 = new THREE.Color('#E7D4BB'); // almond (rare bright dots)

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 110;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 70;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 55;

    const r = Math.random();
    const col = r < 0.5 ? c1.clone().lerp(c2, Math.random())
      : r < 0.9 ? c2.clone().lerp(c3, Math.random() * 0.4)
        : c3.clone();
    cols[i * 3] = col.r;
    cols[i * 3 + 1] = col.g;
    cols[i * 3 + 2] = col.b;

    szs[i] = Math.random() * 1.4 + 0.3;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(szs, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float time;
      void main() {
        vColor = color;
        vec3 p = position;
        p.y += sin(time * 0.25 + position.x * 0.04) * 0.6;
        p.x += cos(time * 0.18 + position.z * 0.04) * 0.4;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = size * (240.0 / -mv.z);
        gl_Position  = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = distance(gl_PointCoord, vec2(0.5));
        if (d > 0.5) discard;
        float a = (1.0 - d * 2.0) * 0.65;
        gl_FragColor = vec4(vColor, a);
      }
    `,
    transparent: true,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const pts = new THREE.Points(geo, mat);
  scene.add(pts);

  let tRX = 0, tRY = 0;
  document.addEventListener('mousemove', e => {
    tRY = (e.clientX / window.innerWidth - 0.5) * 0.25;
    tRX = (e.clientY / window.innerHeight - 0.5) * 0.18;
  });

  const clock = new THREE.Clock();
  function raf() {
    requestAnimationFrame(raf);
    mat.uniforms.time.value = clock.getElapsedTime();
    pts.rotation.y += (tRY - pts.rotation.y) * 0.04;
    pts.rotation.x += (tRX - pts.rotation.x) * 0.04;
    pts.rotation.z += 0.0003;
    renderer.render(scene, camera);
  }
  raf();

  window.addEventListener('resize', () => {
    const nW = canvas.parentElement.offsetWidth;
    const nH = canvas.parentElement.offsetHeight;
    renderer.setSize(nW, nH);
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
  }, { passive: true });
})();

/* ─────────────────────────────────────────────────────
   10. THREE.JS — HERO CENTER 3D OBJECT (the actual 3D)
   ───────────────────────────────────────────────────── */
(function initHero3D() {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const SIZE = 280;
  canvas.width = SIZE;
  canvas.height = SIZE;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(SIZE, SIZE);
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 4.5);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xE7D4BB, 0.2);
  scene.add(ambientLight);

  const plumLight = new THREE.PointLight(0x48252F, 3.5, 20);
  plumLight.position.set(-3, 2, 3);
  scene.add(plumLight);

  const sandLight = new THREE.PointLight(0x857861, 2.5, 20);
  sandLight.position.set(3, -1, 2);
  scene.add(sandLight);

  const almondLight = new THREE.DirectionalLight(0xE7D4BB, 0.4);
  almondLight.position.set(0, 5, 5);
  scene.add(almondLight);

  // ── Main shape: Icosahedron (geodesic sphere) ──
  const geoIco = new THREE.IcosahedronGeometry(1.1, 1);

  // Distort vertices slightly for organic feel
  const posAttr = geoIco.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const factor = 1 + (Math.random() - 0.5) * 0.12;
    posAttr.setXYZ(
      i,
      posAttr.getX(i) * factor,
      posAttr.getY(i) * factor,
      posAttr.getZ(i) * factor
    );
  }
  posAttr.needsUpdate = true;
  geoIco.computeVertexNormals();

  const matSolid = new THREE.MeshStandardMaterial({
    color: 0x2a1a1c,
    metalness: 0.7,
    roughness: 0.3,
    envMapIntensity: 1.0,
  });

  const mesh = new THREE.Mesh(geoIco, matSolid);
  scene.add(mesh);

  // ── Wireframe overlay ──
  const geoWire = new THREE.IcosahedronGeometry(1.12, 1);
  const matWire = new THREE.MeshBasicMaterial({
    color: 0x857861,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
  });
  const wire = new THREE.Mesh(geoWire, matWire);
  scene.add(wire);

  // ── Outer glow ring ──
  const torusGeo = new THREE.TorusGeometry(1.55, 0.012, 8, 80);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0x48252F, transparent: true, opacity: 0.6 });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI / 3;
  scene.add(torus);

  const torus2Geo = new THREE.TorusGeometry(1.75, 0.008, 8, 80);
  const torus2Mat = new THREE.MeshBasicMaterial({ color: 0x857861, transparent: true, opacity: 0.3 });
  const torus2 = new THREE.Mesh(torus2Geo, torus2Mat);
  torus2.rotation.x = -Math.PI / 5;
  torus2.rotation.y = Math.PI / 6;
  scene.add(torus2);

  // ── Floating orbital dots ──
  // Each dot must orbit in EXACTLY the same plane as its torus ring.
  // A torus lying flat (before rotation) has its normal along Z.
  // After rotation, the new normal = rotate(0,0,1) by the same angles.
  //
  // Torus 1:  rotation.x = PI/3   → normal = (0, -sin(PI/3), cos(PI/3))
  // Torus 2:  rotation.x = -PI/5, rotation.y = PI/6
  //           → apply Euler(x,y,0) to (0,0,1)
  //           → normal ≈ (sin(PI/6)*cos(PI/5), -sin(PI/5), cos(PI/6)*cos(PI/5))

  const t1Normal = new THREE.Vector3(0, -Math.sin(Math.PI/3), Math.cos(Math.PI/3)).normalize();
  const t2Normal = (() => {
    const n = new THREE.Vector3(0, 0, 1);
    const euler = new THREE.Euler(-Math.PI/5, Math.PI/6, 0, 'XYZ');
    n.applyEuler(euler);
    return n.normalize();
  })();

  const dotGeo = new THREE.SphereGeometry(0.042, 8, 8);
  const dotMat = new THREE.MeshBasicMaterial({ color: 0xE7D4BB });
  const orbits = [];
  const orbData = [
    // Two dots on torus 1 (r = 1.55), 180° apart
    { r: 1.55, speed:  0.9, axis: t1Normal, phase: 0 },
    { r: 1.55, speed:  0.9, axis: t1Normal, phase: Math.PI },
    // Two dots on torus 2 (r = 1.75), 180° apart
    { r: 1.75, speed: -0.7, axis: t2Normal, phase: 1.2 },
    { r: 1.75, speed: -0.7, axis: t2Normal, phase: 1.2 + Math.PI },
  ];
  orbData.forEach((o, i) => {
    const dot = new THREE.Mesh(dotGeo, dotMat.clone());
    dot.material.color.setHex(i < 2 ? 0xE7D4BB : 0x857861);
    scene.add(dot);
    orbits.push({ mesh: dot, ...o, angle: o.phase });
  });

  let targetRX = 0, targetRY = 0;

  // Mouse influence on 3D object
  const heroSection = document.getElementById('home');
  document.addEventListener('mousemove', e => {
    const rect = heroSection?.getBoundingClientRect();
    if (!rect || e.clientY > rect.bottom) return;
    targetRX = (e.clientY / window.innerHeight - 0.5) * -1.2;
    targetRY = (e.clientX / window.innerWidth - 0.5) * 1.6;
  });

  const clock = new THREE.Clock();

  function animate3d() {
    requestAnimationFrame(animate3d);
    const t = clock.getElapsedTime();

    // Smooth rotation toward mouse
    mesh.rotation.x += (targetRX - mesh.rotation.x) * 0.05;
    mesh.rotation.y += (targetRY - mesh.rotation.y) * 0.05;
    mesh.rotation.y += 0.004; // slow auto-spin

    // Sync wireframe
    wire.rotation.copy(mesh.rotation);

    // Torus rotate
    torus.rotation.z += 0.006;
    torus2.rotation.z -= 0.004;
    torus2.rotation.x += 0.003;

    // Slight mesh breathing
    const s = 1 + Math.sin(t * 0.8) * 0.025;
    mesh.scale.set(s, s, s);
    wire.scale.set(s * 1.01, s * 1.01, s * 1.01);

    // Orbital dots
    orbits.forEach(o => {
      o.angle += o.speed * 0.012;
      const q = new THREE.Quaternion().setFromAxisAngle(o.axis, o.angle);
      const startVec = new THREE.Vector3(o.r, 0, 0);
      startVec.applyQuaternion(q);
      o.mesh.position.copy(startVec);
    });

    // Animate point light for pulse effect
    plumLight.intensity = 3.0 + Math.sin(t * 1.2) * 0.8;
    sandLight.intensity = 2.0 + Math.cos(t * 0.9) * 0.6;

    renderer.render(scene, camera);
  }
  animate3d();
})();

/* ─────────────────────────────────────────────────────
   11. MAGNETIC BUTTONS
   ───────────────────────────────────────────────────── */
document.querySelectorAll('.mag-btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r = btn.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
    const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
    gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'expo.out' });
  });
});

// Ripple
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', e => {
    const ripple = btn.querySelector('.btn-ripple');
    if (!ripple) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;`;
    ripple.classList.remove('animate');
    void ripple.offsetWidth;
    ripple.classList.add('animate');
  });
});

/* ─────────────────────────────────────────────────────
   12. 3D TECH SPHERE
   ───────────────────────────────────────────────────── */
const TECH_ITEMS = [
  // ── Languages ──────────────────────────────────────────────
  { name: 'Python', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', categories: ['ai', 'backend', 'data'], tier: 'core', since: '2022', projects: ['FindIn\'.ai', 'SpecSync', 'T-CVAE'], summary: 'Primary language for AI pipelines, APIs, and research.' },
  { name: 'C', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg', categories: ['tools'], tier: 'core', since: '2022', projects: ['Systems coursework'], summary: 'Low-level systems, memory management, and algorithms.' },
  { name: 'C++', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg', categories: ['tools'], tier: 'core', since: '2022', projects: ['Performance work'], summary: 'Performance-critical computation and OOP problem solving.' },
  { name: 'JavaScript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', categories: ['frontend', 'backend'], tier: 'core', since: '2023', projects: ['SpecSync', 'Smart Shopping', 'Portfolio'], summary: 'Interactive UI logic and full-stack scripting.' },
  { name: 'Scala', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scala/scala-original.svg', categories: ['data'], tier: 'collab', since: '2024', projects: ['Big data coursework'], summary: 'Functional programming and Spark-based data processing.' },

  // ── AI & ML ────────────────────────────────────────────────
  { name: 'PyTorch', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg', categories: ['ai'], tier: 'core', since: '2023', projects: ['T-CVAE', 'Backstory Gen'], summary: 'Model training, VAEs, transformers, and custom architectures.' },
  { name: 'HuggingFace', src: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg', categories: ['ai'], tier: 'core', since: '2023', projects: ['T-CVAE', 'FindIn\'.ai'], summary: 'Pre-trained transformers and tokenizer pipelines.' },
  { name: 'LangChain', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/langchain/langchain-original.svg', categories: ['ai'], tier: 'collab', since: '2024', projects: ['FindIn\'.ai'], summary: 'LLM orchestration, memory chains, and tool-use agents.' },
  { name: 'Pinecone', src: 'https://avatars.githubusercontent.com/u/54333248?s=48', categories: ['ai', 'data'], tier: 'collab', since: '2024', projects: ['FindIn\'.ai'], summary: 'Vector database for semantic search and RAG retrieval.' },
  { name: 'Groq', src: 'https://avatars.githubusercontent.com/u/118523122?s=48', categories: ['ai'], tier: 'collab', since: '2024', projects: ['FindIn\'.ai'], summary: 'Ultra-fast LLM inference for real-time AI pipelines.' },

  // ── Computer Vision ────────────────────────────────────────
  { name: 'OpenCV', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opencv/opencv-original.svg', categories: ['cv', 'ai'], tier: 'core', since: '2023', projects: ['T-CVAE', 'Vision projects'], summary: 'Image preprocessing, feature detection, and visual pipelines.' },
  { name: 'MediaPipe', src: 'https://avatars.githubusercontent.com/u/2810481?s=48', categories: ['cv', 'ai'], tier: 'collab', since: '2024', projects: ['Vision projects'], summary: 'Real-time pose, hand, and face landmark detection.' },

  // ── Web & App Dev ──────────────────────────────────────────
  { name: 'React', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', categories: ['frontend'], tier: 'core', since: '2023', projects: ['FindIn\'.ai', 'SpecSync', 'Portfolio'], summary: 'Component systems and state-driven UI at production scale.' },
  { name: 'React Native', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', categories: ['frontend'], tier: 'collab', since: '2024', projects: ['Smart Shopping Assistant'], summary: 'Cross-platform mobile apps with native device APIs.' },
  { name: 'Flask', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg', invert: true, categories: ['backend'], tier: 'collab', since: '2023', projects: ['Vision projects'], summary: 'Lightweight Python web server for quick prototypes.' },
  { name: 'HTML5', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg', categories: ['frontend'], tier: 'core', since: '2022', projects: ['Portfolio', 'SpecSync'], summary: 'Semantic markup and accessible content architecture.' },
  { name: 'CSS3', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg', categories: ['frontend'], tier: 'core', since: '2022', projects: ['Portfolio'], summary: 'Layouts, animations, and visual system craft.' },
  { name: 'Tailwind', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', categories: ['frontend'], tier: 'collab', since: '2024', projects: ['Smart Shopping'], summary: 'Utility-first CSS for rapid UI composition.' },

  // ── Backend & APIs ─────────────────────────────────────────
  { name: 'FastAPI', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg', categories: ['backend', 'ai'], tier: 'core', since: '2023', projects: ['FindIn\'.ai', 'SpecSync'], summary: 'High-performance Python APIs with auto-generated OpenAPI docs.' },
  { name: 'Node.js', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', categories: ['backend'], tier: 'core', since: '2023', projects: ['SpecSync'], summary: 'Event-loop backend, WebSockets, and REST delivery.' },
  { name: 'Express', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg', invert: true, categories: ['backend'], tier: 'collab', since: '2023', projects: ['SpecSync'], summary: 'Minimal Node.js routing for REST and middleware chains.' },

  // ── Databases & Cloud ──────────────────────────────────────
  { name: 'MongoDB', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg', categories: ['data', 'backend'], tier: 'core', since: '2023', projects: ['SpecSync', 'FindIn\'.ai'], summary: 'Document modeling, aggregation pipelines, and live schemas.' },
  { name: 'Firebase', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg', categories: ['cloud', 'backend'], tier: 'core', since: '2023', projects: ['Smart Shopping Assistant'], summary: 'Real-time database sync and serverless backend support.' },
  { name: 'SQL', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg', categories: ['data', 'backend'], tier: 'core', since: '2022', projects: ['SpecSync', 'E-Commerce'], summary: 'Relational queries, schema design, and structured data.' },
  { name: 'Azure', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg', categories: ['cloud'], tier: 'collab', since: '2024', projects: ['FindIn\'.ai'], summary: 'Cloud deployment, blob storage, and managed services.' },
  { name: 'Hadoop', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/hadoop/hadoop-original.svg', categories: ['data', 'cloud'], tier: 'collab', since: '2024', projects: ['Big data coursework'], summary: 'Distributed storage and MapReduce for large-scale datasets.' },

  // ── Tools ──────────────────────────────────────────────────
  { name: 'Git', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', categories: ['tools'], tier: 'core', since: '2022', projects: ['All projects'], summary: 'Version control, branching strategy, and safe iteration.' },
  { name: 'GitHub', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg', invert: true, categories: ['tools'], tier: 'core', since: '2022', projects: ['All projects'], summary: 'Collaboration, code review, CI/CD, and project management.' },
  { name: 'Linux', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg', categories: ['tools'], tier: 'collab', since: '2022', projects: ['All projects'], summary: 'CLI workflows, shell scripting, and server environment fluency.' },
];
class TechSphere {
  constructor(container, items) {
    this.container = container;
    this.items = items;
    this.radius = 165;
    this.tooltip = document.getElementById('skill-tooltip');
    this.focusPanel = document.getElementById('skill-focus-panel');
    this.filterButtons = Array.from(document.querySelectorAll('.skill-filter'));
    this.activeFilter = 'all';
    this.hoveredItem = null;
    this.hybridConfig = {
      morphTarget: 0.82,
      remorphFloor: 0.18,
      remorphEase: 0.034,
      spinRetention: 0.42,
      baseVelX: 0.0008,
      baseVelY: 0.0011,
      driftX: 0.16,
      driftY: 0.14,
      driftZ: 0.1,
      gapX: 118,
      gapY: 124,
      peripheryX: 100,
      peripheryY: 58,
      peripheryZ: -190,
      activeScale: 1.03,
      mutedScale: 0.82,
    };
    this.morph = 0;
    this.morphTarget = 0;
    this.points = [];     // holds DOM elements + original coords
    // Accumulate angles instead of mutating positions
    this.angleX = 0;
    this.angleY = 0;
    // Current velocity (smoothly interpolates toward target)
    const cfg = this._activeHybridConfig();
    this.velX = cfg.baseVelX;
    this.velY = cfg.baseVelY;
    // Target velocity (set by mouse)
    this.tVelX = cfg.baseVelX;
    this.tVelY = cfg.baseVelY;
    this._build();
    this._bindControls();
    this._showDefaultTooltip();
  }

  _bindControls() {
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this._setFilter(btn.dataset.filter || 'all');
      });
    });

  }

  _activeHybridConfig() {
    return this.hybridConfig;
  }

  _setFilter(filter) {
    const changed = this.activeFilter !== filter;
    this.activeFilter = filter;
    const cfg = this._activeHybridConfig();
    // Re-trigger the unfold feel on each category switch so it doesn't become static.
    if (filter === 'all') {
      this.morphTarget = 0;
    } else {
      this.morph = changed ? Math.min(this.morph, cfg.remorphFloor) : this.morph;
      this.morphTarget = cfg.morphTarget;
    }
    this.filterButtons.forEach(btn => btn.classList.toggle('active', (btn.dataset.filter || 'all') === filter));
    this._refreshTooltipState();
    this._refreshFocusPanel();
  }

  _matchesScope(item) {
    if (this.activeFilter === 'all') return true;
    return (item.categories || []).includes(this.activeFilter);
  }

  _showDefaultTooltip() {
    if (!this.tooltip) return;
    const kicker = this.tooltip.querySelector('.skill-tooltip-kicker');
    const name = this.tooltip.querySelector('.skill-tooltip-name');
    const meta = this.tooltip.querySelector('.skill-tooltip-meta');
    const desc = this.tooltip.querySelector('.skill-tooltip-desc');
    const projects = this.tooltip.querySelector('.skill-tooltip-projects');
    const filterLabel = this._filterLabel(this.activeFilter);
    if (kicker) kicker.textContent = filterLabel;
    if (name) name.textContent = this.activeFilter === 'all' ? 'Stack, but contextual' : `${filterLabel} focus`;
    if (meta) meta.textContent = 'Hover any icon to see where it shows up in the portfolio.';
    if (desc) desc.textContent = this.activeFilter === 'all'
      ? 'A living map of the stack behind the projects in this portfolio.'
      : `Showing the parts of the stack that power ${filterLabel.toLowerCase()}.`;
    if (projects) projects.innerHTML = '';
  }

  _filterLabel(filter) {
    const labelMap = {
      all: 'All stack',
      frontend: 'Frontend',
      backend: 'Backend',
      data: 'Data',
      cloud: 'Cloud',
      ai: 'AI / ML',
      tools: 'Tools',
    };
    return labelMap[filter] || 'All stack';
  }

  _filterSummary(filter) {
    const summaryMap = {
      all: {
        copy: 'The full stack in one place, with the globe balanced across product, systems, and tooling.',
        chips: ['Production', 'Team-ready', 'Always learning'],
      },
      frontend: {
        copy: 'Interfaces, motion, and design systems that keep the product feeling sharp.',
        chips: ['React', 'Next.js', 'TypeScript', 'CSS'],
      },
      backend: {
        copy: 'APIs, orchestration, and business logic that keep features running cleanly.',
        chips: ['Python', 'FastAPI', 'Node.js', 'JavaScript'],
      },
      data: {
        copy: 'Storage, modelling, and data-heavy workflows behind the scenes.',
        chips: ['MongoDB', 'PostgreSQL', 'MySQL', 'Python'],
      },
      cloud: {
        copy: 'Deployment, environments, and the systems that make delivery reproducible.',
        chips: ['Docker', 'Firebase', 'Linux', 'Next.js'],
      },
      ai: {
        copy: 'AI-adjacent workflows, automation, and exploratory tooling.',
        chips: ['Python', 'FastAPI', 'Next.js', 'Node.js'],
      },
      tools: {
        copy: 'Version control, design, and workflow tools that keep work moving.',
        chips: ['Git', 'GitHub', 'Figma', 'Docker'],
      },
    };
    return summaryMap[filter] || summaryMap.all;
  }

  _refreshFocusPanel() {
    if (!this.focusPanel) return;
    const labelEl = this.focusPanel.querySelector('.skill-focus-label');
    const countEl = this.focusPanel.querySelector('.skill-focus-count');
    const titleEl = this.focusPanel.querySelector('.skill-focus-title');
    const copyEl = this.focusPanel.querySelector('.skill-focus-copy');
    const chipsEl = this.focusPanel.querySelector('.skill-focus-chips');
    const summary = this._filterSummary(this.activeFilter);
    const matchCount = this.items.filter(item => this._matchesScope(item)).length;
    if (labelEl) labelEl.textContent = 'Orbital focus';
    if (countEl) countEl.textContent = `${matchCount} icons`;
    if (titleEl) titleEl.textContent = this._filterLabel(this.activeFilter);
    if (copyEl) copyEl.textContent = summary.copy;
    if (chipsEl) {
      chipsEl.innerHTML = '';
      summary.chips.forEach(chipText => {
        const chip = document.createElement('span');
        chip.className = 'skill-tooltip-chip';
        chip.textContent = chipText;
        chipsEl.appendChild(chip);
      });
    }
  }

  _refreshTooltipState() {
    if (this.hoveredItem) {
      this._renderTooltip(this.hoveredItem);
    } else {
      this._showDefaultTooltip();
    }
  }

  _renderTooltip(item) {
    if (!this.tooltip) return;
    const kicker = this.tooltip.querySelector('.skill-tooltip-kicker');
    const name = this.tooltip.querySelector('.skill-tooltip-name');
    const meta = this.tooltip.querySelector('.skill-tooltip-meta');
    const desc = this.tooltip.querySelector('.skill-tooltip-desc');
    const projects = this.tooltip.querySelector('.skill-tooltip-projects');
    if (kicker) kicker.textContent = item.tier === 'core' ? 'Core Stack' : item.tier === 'collab' ? 'Collaborative / Familiar' : 'Learning / Exploratory';
    if (name) name.textContent = item.name;
    if (meta) meta.textContent = `Used since ${item.since}`;
    if (desc) desc.textContent = item.summary;
    if (projects) {
      const label = document.createElement('span');
      label.textContent = 'Used in:';
      const wrap = document.createElement('div');
      wrap.className = 'skill-tooltip-chip-row';
      item.projects.forEach(project => {
        const chip = document.createElement('span');
        chip.className = 'skill-tooltip-chip';
        chip.textContent = project;
        wrap.appendChild(chip);
      });
      projects.innerHTML = '';
      projects.appendChild(label);
      projects.appendChild(wrap);
    }
  }

  _build() {
    const n = this.items.length;
    // Compute & store ORIGINAL positions (never mutate these)
    this.points = this.items.map((item, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / n);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      return {
        item,
        ox: this.radius * Math.sin(phi) * Math.cos(theta),
        oy: this.radius * Math.sin(phi) * Math.sin(theta),
        oz: this.radius * Math.cos(phi),
        el: null,
      };
    });

    // Build DOM
    this.points.forEach(pt => {
      const el = document.createElement('div');
      el.className = 'sphere-item';
      el.tabIndex = 0;
      el.dataset.tier = pt.item.tier;
      el.dataset.categories = (pt.item.categories || []).join(' ');
      const wrap = document.createElement('div');
      wrap.className = 'sphere-icon-wrap';
      const img = document.createElement('img');
      img.src = pt.item.src; img.alt = pt.item.name;
      img.width = img.height = 24;
      if (pt.item.invert) img.style.filter = 'invert(1) brightness(1.6)';
      const span = document.createElement('span');
      span.textContent = pt.item.name;
      wrap.appendChild(img);
      el.appendChild(wrap);
      el.appendChild(span);
      this.container.appendChild(el);
      pt.el = el;

      const show = () => {
        this.hoveredItem = pt.item;
        this._renderTooltip(pt.item);
      };
      const clear = () => {
        this.hoveredItem = null;
        this._refreshTooltipState();
      };

      el.addEventListener('mouseenter', show);
      el.addEventListener('focus', show);
      el.addEventListener('mouseleave', clear);
      el.addEventListener('blur', clear);
    });

    // Mouse interaction: change target velocity
    this.container.addEventListener('mousemove', e => {
      const cfg = this._activeHybridConfig();
      const r = this.container.getBoundingClientRect();
      this.tVelY = cfg.baseVelY + ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 0.008;
      this.tVelX = cfg.baseVelX - ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 0.005;
    });
    this.container.addEventListener('mouseleave', () => {
      const cfg = this._activeHybridConfig();
      this.tVelX = cfg.baseVelX;
      this.tVelY = cfg.baseVelY;
    });

    this._animate();
  }

  _rotate() {
    const cfg = this._activeHybridConfig();
    this.morph += (this.morphTarget - this.morph) * cfg.remorphEase;

    // Smoothly lerp velocity toward target
    this.velX += (this.tVelX - this.velX) * 0.05;
    this.velY += (this.tVelY - this.velY) * 0.05;

    // Accumulate angles — always grow, never reset
    const spinFactor = 1 - this.morph * cfg.spinRetention;
    this.angleX += this.velX * spinFactor;
    this.angleY += this.velY * spinFactor;

    // Precompute trig once for all points
    const cosX = Math.cos(this.angleX), sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY), sinY = Math.sin(this.angleY);
    const fov = 380;

    const activePoints = this.points.filter(pt => this._matchesScope(pt.item));
    const activeRank = new Map();
    activePoints.forEach((pt, idx) => activeRank.set(pt, idx));

    const cols = Math.max(2, Math.min(5, Math.ceil(Math.sqrt(Math.max(activePoints.length, 1)))));
    const rows = Math.max(1, Math.ceil(Math.max(activePoints.length, 1) / cols));
    const gapX = cfg.gapX;
    const gapY = cfg.gapY;
    const startX = -((cols - 1) * gapX) / 2;
    const startY = -((rows - 1) * gapY) / 2;

    this.points.forEach(pt => {
      // Rotate from ORIGINAL (immutable) coordinates — zero error accumulation
      const x1 = pt.ox * cosY + pt.oz * sinY;
      const z1 = -pt.ox * sinY + pt.oz * cosY;
      const y2 = pt.oy * cosX - z1 * sinX;
      const z2 = pt.oy * sinX + z1 * cosX;

      const active = this._matchesScope(pt.item);
      const visibility = active ? 1 : 0.14;

      let tx = x1;
      let ty = y2;
      let tz = z2;

      if (active && activeRank.has(pt)) {
        const idx = activeRank.get(pt);
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        const gx = startX + col * gapX;
        const gy = startY + row * gapY;
        // Hybrid mode: readable grid anchor + a subtle spherical drift,
        // so the globe identity remains even after filtering.
        tx = gx + x1 * cfg.driftX;
        ty = gy + y2 * cfg.driftY;
        tz = 145 + z2 * cfg.driftZ;
      } else {
        // Muted items: collapse toward center of container so they
        // never escape the container bounds and interfere with filter buttons.
        // Keep a tiny drift so the sphere silhouette stays readable.
        const ang = Math.atan2(y2, x1);
        tx = Math.cos(ang) * this.radius * 0.18;  // stay well inside
        ty = Math.sin(ang) * this.radius * 0.18;
        tz = 0;
      }

      const mx = x1 + (tx - x1) * this.morph;
      const my = y2 + (ty - y2) * this.morph;
      const mz = z2 + (tz - z2) * this.morph;

      // Perspective scale after morph blend
      const sc = fov / (fov + mz);
      const alpha = 0.12 + 0.88 * ((mz + this.radius) / (2 * this.radius));
      const scaleBias = this.activeFilter === 'all' ? 1 : (active ? cfg.activeScale : cfg.mutedScale);

      // ── GPU-only update: single transform, no left/top ──
      // Items are anchored at top:50% left:50% in CSS.
      // translate3d moves them from that anchor — hits the compositor,
      // never triggers layout — same principle as Three.js WebGL.
      const mutedOpacity = active ? alpha * visibility : 0;  // fully invisible when muted
      pt.el.style.transform =
        `translate3d(calc(${mx * sc}px - 50%), calc(${my * sc}px - 50%), 0) scale(${(0.45 + sc * 0.72) * (active ? 1.04 : 0.9) * scaleBias})`;
      pt.el.style.opacity = mutedOpacity;
      pt.el.style.zIndex = Math.round(mz + this.radius + (active ? 24 : -36));
      // pointer-events: none on muted items — they're invisible and must
      // never intercept hover/click events meant for filter buttons.
      pt.el.style.pointerEvents = active ? '' : 'none';
      pt.el.classList.toggle('sphere-item-muted', !active);
    });
  }

  _animate() {
    // Primary: rAF for smooth 60fps when main thread is free
    const tick = () => {
      this._rotate();
      this._rafId = requestAnimationFrame(tick);
    };
    this._rafId = requestAnimationFrame(tick);

    // Heartbeat fallback: fires every 20ms independently of rAF
    // Ensures globe NEVER stops during scroll (rAF can be throttled
    // by scroll event handlers consuming the main thread)
    this._intervalId = setInterval(() => {
      // Cancel stale rAF and re-schedule so there's no double-frame
      cancelAnimationFrame(this._rafId);
      this._rotate();
      this._rafId = requestAnimationFrame(tick);
    }, 20);
  }
}

window.addEventListener('load', () => {
  const sc = document.getElementById('tech-sphere');
  if (sc) new TechSphere(sc, TECH_ITEMS);
});


/* ─────────────────────────────────────────────────────
   13. SMART PROGRESSIVE FORM
   ───────────────────────────────────────────────────── */
let currentStep = 1;

function showStep(step) {
  document.querySelectorAll('.sf-step').forEach((s, i) => s.classList.toggle('active', i + 1 === step));
  document.querySelectorAll('.sf-dot').forEach((d, i) => d.classList.toggle('active', i + 1 === step));
  const active = document.getElementById(`sf-step-${step}`);
  if (active) { const inp = active.querySelector('.sf-input'); if (inp) setTimeout(() => inp.focus(), 200); }
}

function advance(from) {
  const step = document.getElementById(`sf-step-${from}`);
  const inp = step?.querySelector('.sf-input');
  if (!inp?.value.trim()) {
    inp.style.borderColor = 'rgba(180,50,50,.6)';
    gsap.fromTo(inp, { x: -8 }, {
      x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)',
      onStart: () => { gsap.to(inp, { x: 8, duration: 0.08 }); },
      onComplete: () => { inp.style.borderColor = ''; }
    });
    return;
  }
  if (from < 3) {
    currentStep = from + 1;
    gsap.to(`#sf-step-${from}`, {
      opacity: 0, x: -30, duration: 0.28, ease: 'power2.in', onComplete: () => {
        showStep(currentStep);
        gsap.fromTo(`#sf-step-${currentStep}`, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, ease: 'expo.out' });
      }
    });
  }
}

document.getElementById('sf-next-1')?.addEventListener('click', () => advance(1));
document.getElementById('sf-next-2')?.addEventListener('click', () => advance(2));
document.getElementById('sf-name')?.addEventListener('keydown', e => { if (e.key === 'Enter') advance(1); });
document.getElementById('sf-email')?.addEventListener('keydown', e => { if (e.key === 'Enter') advance(2); });

document.querySelectorAll('.sf-dot').forEach(dot => {
  dot.addEventListener('click', () => {
    const s = parseInt(dot.dataset.step);
    if (s < currentStep) { currentStep = s; showStep(s); }
  });
});

document.getElementById('smart-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const n = document.getElementById('sf-name')?.value;
  const em = document.getElementById('sf-email')?.value;
  const m = document.getElementById('sf-msg')?.value;
  if (!n || !em || !m) return;
  gsap.to('.sf-step.active, .sf-progress', {
    opacity: 0, y: -20, duration: 0.3, onComplete: () => {
      document.querySelectorAll('.sf-step').forEach(s => s.classList.remove('active'));
      const prog = document.querySelector('.sf-progress');
      if (prog) prog.style.display = 'none';
      const succ = document.getElementById('sf-success');
      succ?.classList.add('show');
      gsap.from(succ, { opacity: 0, y: 30, duration: 0.7, ease: 'expo.out' });
    }
  });
});

/* ─────────────────────────────────────────────────────
   14. DECK CARD NAVIGATION — 3D expressive
   ───────────────────────────────────────────────────── */
function initDeckCards() {
  if (initDeckCards._inited) return;
  initDeckCards._inited = true;

  const cards = Array.from(document.querySelectorAll('.deck-card'));
  const dots = Array.from(document.querySelectorAll('.deck-dot'));
  const btnPrev = document.getElementById('deck-prev');
  const btnNext = document.getElementById('deck-next');
  const stage = document.getElementById('proj-deck-stage');
  if (!cards.length) return;

  let current = 0;
  let animating = false;
  const AUTO_DELAY = 1800;
  let autoTimer = null;

  function stopAutoCycle() {
    if (!autoTimer) return;
    clearInterval(autoTimer);
    autoTimer = null;
  }

  function startAutoCycle() {
    if (autoTimer || !stage) return;
    autoTimer = setInterval(() => {
      if (animating) return;
      const r = stage.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.08;
      if (!inView) return;
      goTo((current + 1) % cards.length, 'next');
    }, AUTO_DELAY);
  }

  function nudgeAutoCycle() {
    stopAutoCycle();
    startAutoCycle();
  }

  // Inject hover-hint label and spotlight glow into every card
  cards.forEach(card => {
    // Hint
    if (!card.querySelector('.dc-hover-hint')) {
      const hint = document.createElement('div');
      hint.className = 'dc-hover-hint';
      hint.textContent = 'hover to reveal';
      card.appendChild(hint);
    }
    // Make sure glow el exists
    const preview = card.querySelector('.dc-preview');
    if (preview && !preview.querySelector('.dc-preview-glow')) {
      const glow = document.createElement('div');
      glow.className = 'dc-preview-glow';
      preview.insertBefore(glow, preview.firstChild);
    }
  });

  // ── Position classes ──
  const CLASSES = ['dc-active', 'dc-behind-1', 'dc-behind-2', 'dc-behind-3', 'dc-hidden'];

  function applyClasses() {
    cards.forEach((card, i) => {
      card.classList.remove(...CLASSES, 'dc-exit-left', 'dc-exit-right', 'dc-enter-right', 'dc-enter-left');
      const offset = (i - current + cards.length) % cards.length;
      if (offset === 0) card.classList.add('dc-active');
      else if (offset === 1) card.classList.add('dc-behind-1');
      else if (offset === 2) card.classList.add('dc-behind-2');
      else if (offset === 3) card.classList.add('dc-behind-3');
      else card.classList.add('dc-hidden');
    });
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function goTo(next, direction) {
    if (animating || next === current) return;
    animating = true;

    const exitClass = direction === 'next' ? 'dc-exit-left' : 'dc-exit-right';
    const enterClass = direction === 'next' ? 'dc-enter-right' : 'dc-enter-left';
    const outCard = cards[current];
    const inCard = cards[next];

    // Neutralise any live tilt on outgoing card
    outCard.style.transform = '';

    // 1. Slide active card out
    outCard.classList.remove(...CLASSES);
    outCard.classList.add(exitClass);

    // 2. Place incoming card off-screen (no transition)
    inCard.classList.remove(...CLASSES, 'dc-exit-left', 'dc-exit-right', 'dc-enter-left', 'dc-enter-right');
    inCard.classList.add(enterClass);

    // Force reflow so enter offset is painted before we add the transition
    void inCard.offsetWidth;

    // 3. Bring it in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inCard.classList.remove(enterClass);
        inCard.classList.add('dc-active');

        current = next;

        // Re-apply full stack once exit animation finishes
        setTimeout(() => {
          outCard.classList.remove(exitClass);
          animating = false;
          applyClasses();
        }, 600);

        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
      });
    });
  }

  applyClasses();
  startAutoCycle();

  // ── Arrow & dot buttons ──
  btnNext?.addEventListener('click', () => {
    goTo((current + 1) % cards.length, 'next');
    nudgeAutoCycle();
  });
  btnPrev?.addEventListener('click', () => {
    goTo((current - 1 + cards.length) % cards.length, 'prev');
    nudgeAutoCycle();
  });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (i === current) return;
      goTo(i, i > current ? 'next' : 'prev');
      nudgeAutoCycle();
    });
  });

  // ── Keyboard ──
  document.addEventListener('keydown', e => {
    const stage = document.getElementById('proj-deck-stage');
    if (!stage) return;
    const r = stage.getBoundingClientRect();
    if (r.top > window.innerHeight || r.bottom < 0) return;
    if (e.key === 'ArrowRight') {
      goTo((current + 1) % cards.length, 'next');
      nudgeAutoCycle();
    }
    if (e.key === 'ArrowLeft') {
      goTo((current - 1 + cards.length) % cards.length, 'prev');
      nudgeAutoCycle();
    }
  });

  // ── Touch swipe ──
  let touchStartX = 0;
  stage?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  stage?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 44) return;
    dx < 0 ? goTo((current + 1) % cards.length, 'next')
      : goTo((current - 1 + cards.length) % cards.length, 'prev');
    nudgeAutoCycle();
  }, { passive: true });

  // Pause autoplay while user is intentionally exploring the deck.
  stage?.addEventListener('mouseenter', stopAutoCycle);
  stage?.addEventListener('mouseleave', startAutoCycle);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoCycle();
    else startAutoCycle();
  });

  // ── 3D mouse-tilt + spotlight on the ACTIVE card ──
  const MAX_TILT = 10; // degrees

  function getActiveCard() { return cards[current]; }

  stage?.addEventListener('mousemove', e => {
    const card = getActiveCard();
    if (!card || !card.classList.contains('dc-active')) return;

    const r = card.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2);  // -1..+1
    const dy = (e.clientY - cy) / (r.height / 2);  // -1..+1

    const tiltX = -dy * MAX_TILT;
    const tiltY = dx * MAX_TILT;

    // Update only the tilt variables so hover scale/lift remains controlled by CSS.
    card.style.setProperty('--deck-tilt-x', `${tiltX}deg`);
    card.style.setProperty('--deck-tilt-y', `${tiltY}deg`);

    // Move spotlight glow inside preview
    const preview = card.querySelector('.dc-preview');
    const glow = preview?.querySelector('.dc-preview-glow');
    if (glow && preview) {
      const pr = preview.getBoundingClientRect();
      const relX = ((e.clientX - pr.left) / pr.width) * 100;
      const relY = ((e.clientY - pr.top) / pr.height) * 100;
      glow.style.left = relX + '%';
      glow.style.top = relY + '%';
    }
  });

  stage?.addEventListener('mouseleave', () => {
    const card = getActiveCard();
    if (!card) return;
    card.style.setProperty('--deck-tilt-x', '0deg');
    card.style.setProperty('--deck-tilt-y', '0deg');
  });

  // Reset tilt when card changes (card itself mouseleave)
  cards.forEach(card => {
    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--deck-tilt-x', '0deg');
      card.style.setProperty('--deck-tilt-y', '0deg');
    });
  });
}

/* ─────────────────────────────────────────────────────
   15. FOOTER YEAR
   ───────────────────────────────────────────────────── */
const fy = document.querySelector('.footer-year');
if (fy) fy.textContent = `© ${new Date().getFullYear()}`;
