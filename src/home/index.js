import { config } from '../sdk/config.js';
import { VitalStatsSDK } from '../sdk/init.js';
import { CourseCore } from '../courses/CourseCore.js';
import { CourseUtils } from '../courses/CourseUtils.js';
import { CourseUI } from '../courses/CourseUI.js';
import { UserConfig } from '../sdk/userConfig.js';
import { CacheTTLs } from '../utils/cacheConfig.js';


const { slug, apiKey } = config;

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const pageSize = 6;
let cachedHomeSig = null;

const loadingEl = document.getElementById('courses-loading');
const listEl = document.getElementById('courses-list');
const paginationEl = document.getElementById('pagination');

// Simple localStorage cache for courses on home
function homeCacheKey() {
  try {
    const u = new UserConfig();
    const type = String(u.userType || 'unknown').toLowerCase();
    return `awc:courses:home:${type}:${u.userId}`;
  } catch (_) { return 'awc:courses:home:anon'; }
}
function readHomeCache() {
  try {
    const raw = localStorage.getItem(homeCacheKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const ttlMs = CacheTTLs.courses.home();
    if (!parsed?.ts || (Date.now() - parsed.ts) > ttlMs) return null;
    return Array.isArray(parsed.list) ? parsed.list : null;
  } catch (_) { return null; }
}
function writeHomeCache(list) {
  try {
    const arr = Array.isArray(list) ? list.slice(0, 1000) : [];
    const sig = listSignature(arr);
    const payload = JSON.stringify({ ts: Date.now(), sig, list: arr });
    localStorage.setItem(homeCacheKey(), payload);
  } catch (_) {}
}

function listSignature(list) {
  try {
    const items = Array.isArray(list) ? list : [];
    const norm = items.map(x => [x.id, x.courseUid, x.classUid, x.courseName, x.className, x.startDate]).join('|');
    let h = 5381;
    for (let i = 0; i < norm.length; i++) h = ((h << 5) + h) ^ norm.charCodeAt(i);
    return (h >>> 0).toString(36);
  } catch (_) { return 's0'; }
}

function showLoading() {
  // Prefer skeletons in the list container
  if (listEl) {
    listEl.classList.remove('hidden');
    try { CourseUI.renderHomeSkeleton(listEl, pageSize); } catch (_) {}
  }
  loadingEl?.classList.add('hidden');
}

function hideLoading() {
  loadingEl?.classList.add('hidden');
  listEl?.classList.remove('hidden');
}

function renderPage() {
  const start = (currentPage - 1) * pageSize;
  const page = filteredCourses.slice(start, start + pageSize);
  CourseUI.renderList(page, document.getElementById('courses-list'), 'home');
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  renderPagination(totalPages);
}

function getPages(total, current, delta = 2) {
  const pages = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);
  pages.push(1);
  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('...');
  if (total > 1) pages.push(total);
  return pages;
}

function renderPagination(totalPages) {
  if (!paginationEl) return;
  paginationEl.innerHTML = '';

  const createButton = (label, page, disabled, active) => {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.className = 'px-3 py-1 bg-gray-200 rounded';
    if (disabled) {
      btn.classList.add('opacity-50', 'cursor-default');
      btn.disabled = true;
    }
    if (active) {
      btn.classList.add('bg-blue-500', 'text-white');
    }
    btn.addEventListener('click', () => {
      if (!disabled && page !== currentPage) {
        currentPage = page;
        renderPage();
      }
    });
    return btn;
  };

  paginationEl.appendChild(createButton('Prev', currentPage - 1, currentPage === 1));

  const pages = getPages(totalPages, currentPage);
  for (const p of pages) {
    if (p === '...') {
      const span = document.createElement('span');
      span.textContent = '...';
      paginationEl.appendChild(span);
    } else {
      paginationEl.appendChild(createButton(String(p), p, false, p === currentPage));
    }
  }

  paginationEl.appendChild(createButton('Next', currentPage + 1, currentPage === totalPages));
}

function applySearch(term) {
  const t = term.trim().toLowerCase();
  filteredCourses = allCourses.filter(c => c.courseName.toLowerCase().includes(t));
  currentPage = 1;
  renderPage();
}

(async function main() {
  try {
    showLoading();
    // Try render from cache immediately for fast paint
    const cached = readHomeCache();
    if (Array.isArray(cached) && cached.length) {
      allCourses = cached;
      filteredCourses = allCourses;
      renderPage();
      cachedHomeSig = listSignature(allCourses);
      hideLoading();
    }
    const sdk = new VitalStatsSDK({ slug, apiKey });
    const plugin = window.tempPlugin || await sdk.initialize();
    const core = new CourseCore({ plugin, targetElementId: 'courses-list', limit: 5000 });
    await core.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    const rawRecords = core.query.getAllRecordsArray() || [];
    allCourses = rawRecords.map(CourseUtils.mapSdkEnrolmentToUi);
    filteredCourses = allCourses;
    const newSig = listSignature(allCourses);
    // Persist to cache for warm reloads
    writeHomeCache(allCourses);
    if (!cachedHomeSig || newSig !== cachedHomeSig) {
      renderPage();
    }
  } catch (err) {
    console.error(err);
  } finally {
    hideLoading();
  }
})();
document.getElementById('course-search')?.addEventListener('input', e => applySearch(e.target.value));
