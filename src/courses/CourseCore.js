import { CourseUI } from "./CourseUI.js";
import { CourseUtils } from './CourseUtils.js';
import { UserConfig } from '../sdk/userConfig.js';

export class CourseCore {
  constructor({ plugin, targetElementId, loadingElementId, limit = 100 }) {
    this.plugin = plugin;
    this.targetElementId = targetElementId;
    this.loadingElementId = loadingElementId;
    this.limit = limit;
    this.query = this.buildQuery();
  }

  buildQuery() {
    const userConfig = new UserConfig();
    const uid = Number(userConfig.userId);
    const type = String(userConfig.userType || '').toLowerCase();

    // Students: enrolments -> course + class
    if (type === 'student') {
      const enrolModel = this.plugin.switchTo('EduflowproEnrolment');
      const q = enrolModel
        .query()
        .select(['id'])
        .where('student_id', uid)
        .andWhere(query => query.where('status', 'Active').orWhere('status', 'New'))
        .andWhere('Course', query => query.whereNot('course_name', 'isNull'))
        .include('Course', q1 => q1.deSelectAll().select(['unique_id', 'course_name', 'image']))
        .include('Class', q1 => q1.select(['id', 'unique_id']))
        .limit(this.limit)
        .offset(0)
        .noDestroy();
      return q;
    }

    // Teachers/Admins: use Classes directly -> include Course
    const classModel = this.plugin.switchTo('EduflowproClass');
    const q = classModel
      .query()
      .select(['id', 'unique_id', 'class_name', 'start_date'])
      .include('Course', q1 => q1.deSelectAll().select(['unique_id', 'course_name', 'image']))
      .limit(this.limit)
      .offset(0)
      .noDestroy();

    // For teacher and admin: fetch all classes (no conditions)

    // Optional ordering by newest
    try { if (typeof q.orderBy === 'function') q.orderBy('created_at', 'desc'); } catch (_) {}
    return q;
  }

  async loadAndRender() {
    const container = document.getElementById(this.targetElementId);
    const loadingEl = this.loadingElementId
      ? document.getElementById(this.loadingElementId)
      : null;
    if (!container) return;
    try {
      if (loadingEl) loadingEl.classList.remove('hidden');
      container.classList.add('hidden');
      await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();
      const rawRecords = this.query.getAllRecordsArray() || [];
      const recs = rawRecords.map(CourseUtils.mapSdkEnrolmentToUi);
      CourseUI.renderList(recs, container);
      container.classList.remove('hidden');
    } catch (err) {
      container.innerHTML = '<div class="p-2 text-red-500">Failed to load courses.</div>';
    } finally {
      if (loadingEl) loadingEl.classList.add('hidden');
    }
  }
}
