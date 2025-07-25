import { CourseUI } from "./CourseUI.js";
import { CourseUtils } from './CourseUtils.js';
import { UserConfig } from './userConfig.js';

export class CourseCore {
  constructor({ plugin, targetElementId, limit = 100 }) {
    this.plugin = plugin;
    this.targetElementId = targetElementId;
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
      .include('Course', q => q.select(['unique_id', 'course_name', 'image']))
      .include('Class', q => q.select(['id', 'unique_id']))
      .limit(this.limit)
      .offset(0)
      .noDestroy();
    return q;
  }

  async loadAndRender() {
    const container = document.getElementById(this.targetElementId);
    if (!container) return;

    try {
      await this.query.fetch().pipe(window.toMainInstance(true)).toPromise();

      const rawRecords = this.query.getAllRecordsArray() || [];
      console.log("[DEBUG] rawRecords:", rawRecords);

      const recs = rawRecords.map(CourseUtils.mapSdkEnrolmentToUi);
      CourseUI.renderList(recs, container);

    } catch (err) {
      console.error("CourseCore load failed:", err);
      container.innerHTML = '<div class="p-2 text-red-500">Failed to load courses.</div>';
    }
  }

}