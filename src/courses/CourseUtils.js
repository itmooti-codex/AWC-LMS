export class CourseUtils {
  static mapSdkEnrolmentToUi(rec) {
    // Support both enrolment-shaped and class-shaped records
    const isClassRecord = !rec.Class && (rec.unique_id || rec.Course);
    const course = rec.Course || {};
    const klass = isClassRecord ? rec : (rec.Class || {});
    let studentCount = '';
    if (isClassRecord) {
      const direct = rec.Student_Enrolements ?? rec.Student_Enrolments ?? rec.student_enrolments ?? rec.studentCount;
      if (direct !== undefined && direct !== null && direct !== '') studentCount = direct;
      else if (Array.isArray(rec.Enrolments)) studentCount = rec.Enrolments.length;
    }
    return {
      id: rec.id,
      courseName: course.course_name || '',
      courseImage: course.image || '',
      courseUid: course.unique_id,
      moduleCount: course.module__count__visible || '',
      description: course.description || '',
      classId: klass.id,
      classUid: klass.unique_id,
      className: klass.class_name || '',
      startDate: klass.start_date || '',
      studentCount: studentCount,
    };
  }
}
