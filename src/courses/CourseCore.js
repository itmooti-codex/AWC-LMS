import { CourseUI } from "./CourseUI.js";
import { CacheTTLs } from '../utils/cacheConfig.js';
import { CourseUtils } from './CourseUtils.js';
import { UserConfig } from '../sdk/userConfig.js';

export class CourseCore {
  constructor({ plugin, targetElementId, loadingElementId, limit = 100, scope = 'nav', alreadyRendered = false }) {
    this.plugin = plugin;
    this.targetElementId = targetElementId;
    this.loadingElementId = loadingElementId;
    this.limit = limit;
    this.scope = scope; // 'nav' | 'home'
    this.lastSig = null;
    this.alreadyRendered = alreadyRendered;
    this.query = this.buildQuery();
  }

  buildQuery() {
    const userConfig = new UserConfig();
    const uid = Number(userConfig.userId);
    const type = String(userConfig.userType || '').toLowerCase();

    // Students: enrolments -> course + class
    if (type === 'student') {
      const enrolModel = (typeof this.plugin.switchToId === 'function')
        ? this.plugin.switchToId('ENROLMENT')
        : this.plugin.switchTo('AwcEnrolment');
      const q = enrolModel
        .query()
        .select(['id'])
        .where('student_id', uid)
        .andWhere(query => query.where('status', 'Active').orWhere('status', 'New'))
        .andWhere('Course', query => query.whereNot('course_name', 'isNull'))
        .andWhere('Class', query => query.whereNot('class_name', 'isNull'))
        .include('Course', q1 => q1.deSelectAll().select(['unique_id', 'course_name', 'image', 'module__count__visible', 'description']))
        .include('Class', q1 => q1.select(['id', 'unique_id', 'class_name']))
        .limit(this.limit)
        .offset(0)
        .noDestroy();
      return q;
    }

    // Teachers/Admins: use Classes directly -> include Course
    const classModel = (typeof this.plugin.switchToId === 'function')
      ? this.plugin.switchToId('CLASS')
      : this.plugin.switchTo('AwcClass');
    const q = classModel
      .query()
      .select(['id', 'unique_id', 'class_name', 'start_date', 'Student_Enrolements'])
      .include('Course', q1 => q1.deSelectAll().select(['unique_id', 'course_name', 'image', 'module__count__visible', 'description']))
      .include('Enrolments', q1 => q1.select(['id']))
      .limit(this.limit)
      .offset(0)
      .noDestroy();

    // Admin: all classes; Teacher: only classes where Teacher.id = logged-in user id
    if (type === 'teacher') {
      q.andWhere('Teacher', qb => qb.where('id', uid));
    }
    return q;
  }

  async loadAndRender() {
    const container = document.getElementById(this.targetElementId);
    const loadingEl = this.loadingElementId
      ? document.getElementById(this.loadingElementId)
      : null;
    if (!container) return;
    try {
      // If we already pre-rendered outside, skip cache render to prevent flicker
      if (!this.alreadyRendered) {
        // Try to keep UI responsive: if cache exists, show it immediately
        const cached = this.readCache();
        if (Array.isArray(cached) && cached.length) {
          try { CourseUI.renderList(cached, container, this.scope === 'home' ? 'home' : undefined); } catch (_) { }
          container.classList.remove('hidden');
          loadingEl?.classList.add('hidden');
          this.lastSig = this.listSignature(cached);
        } else {
          if (loadingEl) loadingEl.classList.remove('hidden');
          container.classList.add('hidden');
        }
      }
      // Use fetchDirect to preserve server-side ordering in the returned payload
      const payload = await this.query.fetchDirect().toPromise();
      const rawRecords = Array.isArray(payload?.resp) ? payload.resp : [];
      let recs = rawRecords.map(CourseUtils.mapSdkEnrolmentToUi);
      // Sort by class name ascending (fallback to course name)
      try {
        recs.sort((a, b) => String(a.className || '').localeCompare(String(b.className || ''), undefined, { sensitivity: 'base' })
          || String(a.courseName || '').localeCompare(String(b.courseName || ''), undefined, { sensitivity: 'base' }));
      } catch (_) {}
      // Persist fresh list for warm reloads
      this.writeCache(recs);
      const newSig = this.listSignature(recs);
      if (this.lastSig && newSig === this.lastSig) {
        // No changes; avoid unnecessary re-render
      } else {
        CourseUI.renderList(recs, container, this.scope === 'home' ? 'home' : undefined);
        this.lastSig = newSig;
      }
      container.classList.remove('hidden');
    } catch (err) {
      container.innerHTML = '<div class="p-2 text-red-500">Failed to load courses.</div>';
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }

  // Caching helpers (localStorage)
  cacheKey() {
    try {
      const { userId, userType } = new UserConfig();
      const type = String(userType || 'unknown').toLowerCase();
      const scope = this.scope || (Number.isFinite(this.limit) && this.limit <= 12 ? 'nav' : 'home');
      return `awc:courses:${scope}:${type}:${userId}:${this.limit || 'all'}`;
    } catch (_) {
      return `awc:courses:${this.scope || 'nav'}:anon`;
    }
  }

  readCache() {
    try {
      const raw = localStorage.getItem(this.cacheKey());
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const ttlMs = (this.scope === 'nav') ? CacheTTLs.courses.nav() : CacheTTLs.courses.home();
      if (!parsed.ts || (Date.now() - parsed.ts) > ttlMs) return null;
      return Array.isArray(parsed.list) ? parsed.list : null;
    } catch (_) { return null; }
  }

  writeCache(list) {
    try {
      const cap = (this.scope === 'nav') ? (this.limit || 10) : 500;
      const trimmed = Array.isArray(list) ? list.slice(0, cap) : [];
      const payload = JSON.stringify({ ts: Date.now(), sig: this.listSignature(trimmed), list: trimmed });
      localStorage.setItem(this.cacheKey(), payload);
    } catch (_) { /* ignore */ }
  }

  // Generate a stable signature for list content to avoid re-rendering unchanged UI
  hashKey(str) {
    try {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
      return (h >>> 0).toString(36);
    } catch (_) { return String(Math.abs(str?.length || 0)); }
  }

  listSignature(list) {
    try {
      const items = Array.isArray(list) ? list : [];
      // Include identifiers and primary fields to detect meaningful changes
      const norm = items.map(x => [x.id, x.courseUid, x.classUid, x.courseName, x.moduleCount, x.description, x.className, x.startDate]).join('|');
      return this.hashKey(norm);
    } catch (_) { return 's0'; }
  }
}

