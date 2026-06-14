/**
 * main.js — Gallery orchestrator
 *
 * 职责：
 * 1. 读取 demo 注册表，渲染左侧缩略图（每个 demo 跑一个小 canvas）
 * 2. 点击缩略图时，切换右侧主 viewer
 * 3. 管理 dispose（防内存泄漏）
 */

import * as demos from './demos/index.js';

// ─────────────────────────────────────────────
// State
// ─────────────────────────────────────────────
const demoList    = Object.values(demos);   // [{name, desc, tag, init}, ...]
const thumbDisposers = new Map();           // key → dispose fn
let   viewerDispose  = null;
let   activeKey      = null;

// ─────────────────────────────────────────────
// DOM refs
// ─────────────────────────────────────────────
const listEl      = document.getElementById('demo-list');
const viewerEl    = document.getElementById('viewer');
const viewerCanvas= document.getElementById('viewer-canvas');
const hudTitle    = document.getElementById('hud-title');
const hudDesc     = document.getElementById('hud-desc');

// ─────────────────────────────────────────────
// Build sidebar
// ─────────────────────────────────────────────
demoList.forEach((demo, idx) => {
  const key = demo.name;

  // Card
  const card = document.createElement('div');
  card.className = 'demo-card';
  card.dataset.key = key;

  // Thumbnail container
  const thumbWrap = document.createElement('div');
  thumbWrap.className = 'demo-thumb';

  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width  = 204;
  thumbCanvas.height = 130;
  thumbWrap.appendChild(thumbCanvas);

  // Meta
  const meta = document.createElement('div');
  meta.className = 'demo-meta';
  meta.innerHTML = `<strong>${demo.name}</strong><span>${demo.tag}</span>`;

  card.appendChild(thumbWrap);
  card.appendChild(meta);
  listEl.appendChild(card);

  // Lazy-init thumbnail with slight delay so they stagger
  setTimeout(() => {
    const dispose = demo.init(thumbCanvas);
    thumbDisposers.set(key, dispose);
    thumbWrap.classList.add('loaded');
  }, idx * 180);

  // Click → load in viewer
  card.addEventListener('click', () => loadInViewer(demo, card));
});

// Auto-load first demo
setTimeout(() => {
  const firstCard = listEl.querySelector('.demo-card');
  if (firstCard) firstCard.click();
}, 300);

// ─────────────────────────────────────────────
// Viewer loader
// ─────────────────────────────────────────────
function loadInViewer(demo, cardEl) {
  const key = demo.name;
  if (activeKey === key) return;
  activeKey = key;

  // Update active card highlight
  document.querySelectorAll('.demo-card').forEach(c => c.classList.remove('active'));
  cardEl.classList.add('active');

  // Animate out
  viewerEl.classList.add('switching');

  setTimeout(() => {
    // Dispose previous
    if (viewerDispose) {
      viewerDispose();
      viewerDispose = null;
    }

    // Init new demo on viewer canvas
    viewerDispose = demo.init(viewerCanvas);

    // Update HUD
    hudTitle.textContent = demo.name;
    hudDesc.textContent  = demo.desc;

    // Animate in
    viewerEl.classList.remove('switching');
  }, 250);
}
