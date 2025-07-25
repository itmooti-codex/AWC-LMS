export class CourseUtils {
  static mapSdkEnrolmentToUi(rec) {
    const course = rec.Course || {};
    const klass = rec.Class || {};
    return {
      id: rec.id,
      courseName: course.course_name || '',
      courseImage: course.image || '',
      courseUid: course.unique_id,
      classId: klass.id,
      classUid: klass.unique_id,
    };
  }
}
