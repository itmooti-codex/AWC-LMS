import { CourseUI } from "./CourseUI.js";
import { CourseUtils } from './CourseUtils.js';
import { UserConfig } from '../sdk/userConfig.js';

export class CourseCore {
  constructor({ plugin, targetElementId, loadingElementId, limit = 100 }) {
    this.plugin = plugin;
    this.targetElementId = targetElementId;
    this.loadingElementId = loadingElementId;
    this.limit = limit;
    this.model = plugin.switchTo('EduflowproEnrolment');
    this.query = this.buildQuery();
  }

  buildQuery() {
    const userConfig = new UserConfig();
    const studentId = userConfig.userId;
    const q = this.model
      .query()
      .where('student_id', Number(studentId))
      .andWhere(query =>
        query.where('status', 'Active').orWhere('status', 'New')
      )
      .andWhere('Course', query => query.whereNot('course_name', 'isNull'))
      .include('Course', q => q.deSelectAll().select(['unique_id', 'course_name', 'image']))
      .deSelectAll().select(('Course', ['unique_id', 'course_name', 'image']))
      .include('Class', q => q.select(['id', 'unique_id']))
      .limit(this.limit)
      .offset(0)
      .noDestroy();
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