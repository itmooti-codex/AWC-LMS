import { config } from '../sdk/config.js';
import { VitalStatsSDK } from '../sdk/init.js';
import { CourseCore } from '../courses/CourseCore.js';
import { CourseUtils } from '../courses/CourseUtils.js';
import { CourseUI } from '../courses/CourseUI.js';
import { initDOMInteractions } from '../domEvents/DomInit.js';

const { slug, apiKey } = config;

let allCourses = [];
let filteredCourses = [];
let currentPage = 1;
const pageSize = 6;

function renderPage() {
  const start = (currentPage - 1) * pageSize;
  const page = filteredCourses.slice(start, start + pageSize);
  CourseUI.renderList(page, document.getElementById('courses-list'));
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const indicator = document.getElementById('page-indicator');
  if (indicator) indicator.textContent = `Page ${currentPage} of ${totalPages}`;
}

function applySearch(term) {
  const t = term.trim().toLowerCase();
  filteredCourses = allCourses.filter(c => c.courseName.toLowerCase().includes(t));
  currentPage = 1;
  renderPage();
}

(async function main() {
  try {
    const sdk = new VitalStatsSDK({ slug, apiKey });
    const plugin = window.tempPlugin || await sdk.initialize();
    const core = new CourseCore({ plugin, targetElementId: 'courses-list', limit: 5000 });
    await core.query.fetch().pipe(window.toMainInstance(true)).toPromise();
    const rawRecords = core.query.getAllRecordsArray() || [];
    allCourses = rawRecords.map(CourseUtils.mapSdkEnrolmentToUi);
    filteredCourses = allCourses;
    renderPage();
  } catch (err) {
    console.error(err);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initDOMInteractions();
  document.getElementById('course-search')?.addEventListener('input', e => applySearch(e.target.value));
  document.getElementById('prev-page')?.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  });
  document.getElementById('next-page')?.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredCourses.length / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
    }
  });
});
