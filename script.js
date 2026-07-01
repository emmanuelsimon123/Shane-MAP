// Keep these values aligned with the map image dimensions in assets/europe-fall-rome-476.jpg.
const IMAGE_WIDTH = 5491;
const IMAGE_HEIGHT = 3506;
const FIT_SCALE_FLOOR = 0.15;
const MIN_SCALE_RATIO = 0.7;
const MIN_SCALE_FLOOR = 0.12;
const MAX_SCALE_FLOOR = 4;
const MAX_SCALE_RATIO = 12;
const WHEEL_ZOOM_IN_FACTOR = 1.12;
const WHEEL_ZOOM_OUT_FACTOR = 0.89;
const BUTTON_ZOOM_IN_FACTOR = 1.2;
const BUTTON_ZOOM_OUT_FACTOR = 0.84;

const mapViewport = document.getElementById('map-viewport');
const mapCanvas = document.getElementById('map-canvas');
const hotspotLayer = document.getElementById('hotspot-layer');
const legendList = document.getElementById('legend-list');

const detailName = document.getElementById('detail-name');
const detailOrigin = document.getElementById('detail-origin');
const detailRulers = document.getElementById('detail-rulers');
const detailCapital = document.getElementById('detail-capital');
const detailSummary = document.getElementById('detail-summary');
const detailFate = document.getElementById('detail-fate');

const zoomInButton = document.getElementById('zoom-in');
const zoomOutButton = document.getElementById('zoom-out');
const resetViewButton = document.getElementById('reset-view');
const quizModeCheckbox = document.getElementById('quiz-mode');

const state = {
  regions: [],
  selectedId: null,
  scale: 1,
  minScale: 0.2,
  maxScale: 5,
  tx: 0,
  ty: 0,
  dragging: false,
  pointerId: null,
  dragStartX: 0,
  dragStartY: 0,
  startTx: 0,
  startTy: 0
};

function applyTransform() {
  mapCanvas.style.transform = `translate(${state.tx}px, ${state.ty}px) scale(${state.scale})`;
}

function fitToViewport() {
  const viewW = mapViewport.clientWidth;
  const viewH = mapViewport.clientHeight;
  const fitScale = Math.min(viewW / IMAGE_WIDTH, viewH / IMAGE_HEIGHT);

  state.scale = Math.max(FIT_SCALE_FLOOR, fitScale);
  state.minScale = Math.max(MIN_SCALE_FLOOR, fitScale * MIN_SCALE_RATIO);
  state.maxScale = Math.max(MAX_SCALE_FLOOR, fitScale * MAX_SCALE_RATIO);

  state.tx = (viewW - IMAGE_WIDTH * state.scale) / 2;
  state.ty = (viewH - IMAGE_HEIGHT * state.scale) / 2;
  applyTransform();
}

function zoomAt(clientX, clientY, zoomFactor) {
  const rect = mapViewport.getBoundingClientRect();
  const px = clientX - rect.left;
  const py = clientY - rect.top;

  const nextScale = Math.max(state.minScale, Math.min(state.maxScale, state.scale * zoomFactor));
  if (nextScale === state.scale) {
    return;
  }

  const worldX = (px - state.tx) / state.scale;
  const worldY = (py - state.ty) / state.scale;

  state.scale = nextScale;
  state.tx = px - worldX * state.scale;
  state.ty = py - worldY * state.scale;
  applyTransform();
}

function setSelection(regionId) {
  state.selectedId = regionId;

  document.querySelectorAll('.region').forEach((node) => {
    node.classList.toggle('active', node.dataset.regionId === regionId);
  });

  document.querySelectorAll('.legend-item').forEach((node) => {
    node.classList.toggle('active', node.dataset.regionId === regionId);
  });

  const region = state.regions.find((item) => item.id === regionId);
  if (!region) {
    detailName.textContent = 'Select a region';
    detailOrigin.textContent = '';
    detailRulers.textContent = '';
    detailCapital.textContent = '';
    detailSummary.textContent = '';
    detailFate.textContent = '';
    return;
  }

  detailName.textContent = region.name;
  detailOrigin.textContent = `Origin: ${region.origin}`;
  detailRulers.textContent = `Key ruler(s) around 476: ${region.keyRulers}`;
  detailCapital.textContent = `Capital / key city: ${region.capital}`;
  detailSummary.textContent = region.summary;
  detailFate.textContent = `What happened later: ${region.eventualFate}`;
}

function regionPointsToString(points) {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

function renderRegions() {
  hotspotLayer.innerHTML = '';
  legendList.innerHTML = '';

  state.regions.forEach((region) => {
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', regionPointsToString(region.points));
    polygon.setAttribute('class', 'region');
    polygon.setAttribute('tabindex', '0');
    polygon.setAttribute('role', 'button');
    polygon.dataset.regionId = region.id;
    polygon.setAttribute('aria-label', region.name);
    polygon.addEventListener('click', () => setSelection(region.id));
    polygon.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setSelection(region.id);
      }
    });

    hotspotLayer.appendChild(polygon);

    const item = document.createElement('li');
    item.className = 'legend-item';
    item.dataset.regionId = region.id;
    item.tabIndex = 0;
    item.textContent = region.name;
    item.addEventListener('click', () => setSelection(region.id));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setSelection(region.id);
      }
    });

    legendList.appendChild(item);
  });
}

function bindPanAndZoom() {
  mapViewport.addEventListener('wheel', (event) => {
    event.preventDefault();
    const factor = event.deltaY < 0 ? WHEEL_ZOOM_IN_FACTOR : WHEEL_ZOOM_OUT_FACTOR;
    zoomAt(event.clientX, event.clientY, factor);
  }, { passive: false });

  mapViewport.addEventListener('pointerdown', (event) => {
    state.dragging = true;
    state.pointerId = event.pointerId;
    state.dragStartX = event.clientX;
    state.dragStartY = event.clientY;
    state.startTx = state.tx;
    state.startTy = state.ty;
    mapViewport.classList.add('dragging');
    mapViewport.setPointerCapture(event.pointerId);
  });

  mapViewport.addEventListener('pointermove', (event) => {
    if (!state.dragging || event.pointerId !== state.pointerId) {
      return;
    }

    const dx = event.clientX - state.dragStartX;
    const dy = event.clientY - state.dragStartY;
    state.tx = state.startTx + dx;
    state.ty = state.startTy + dy;
    applyTransform();
  });

  const stopDrag = (event) => {
    if (event.pointerId !== state.pointerId) {
      return;
    }
    state.dragging = false;
    state.pointerId = null;
    mapViewport.classList.remove('dragging');
  };

  mapViewport.addEventListener('pointerup', stopDrag);
  mapViewport.addEventListener('pointercancel', stopDrag);

  zoomInButton.addEventListener('click', () => {
    const rect = mapViewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, BUTTON_ZOOM_IN_FACTOR);
  });

  zoomOutButton.addEventListener('click', () => {
    const rect = mapViewport.getBoundingClientRect();
    zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, BUTTON_ZOOM_OUT_FACTOR);
  });

  resetViewButton.addEventListener('click', fitToViewport);

  quizModeCheckbox.addEventListener('change', () => {
    mapViewport.classList.toggle('quiz-mode', quizModeCheckbox.checked);
  });

  window.addEventListener('resize', fitToViewport);
}

async function loadRegions() {
  const response = await fetch('data/regions.json');
  if (!response.ok) {
    throw new Error(`Failed to load region data: ${response.status}`);
  }
  state.regions = await response.json();
}

async function init() {
  try {
    await loadRegions();
    renderRegions();
    bindPanAndZoom();
    fitToViewport();

    if (state.regions.length > 0) {
      setSelection(state.regions[0].id);
    }
  } catch (error) {
    detailName.textContent = 'Unable to load map data';
    detailSummary.textContent = `Please verify that this site is running from a local/server URL and that data/regions.json is present. Technical detail: ${String(error.message || error)}`;
    console.error(error);
  }
}

init();
