query getEnrolments($student_id: AwcContactID) {
  getEnrolments(
    query: [
      { where: { student_id: $student_id } }
      {
        andWhereGroup: [
          { where: { status: "Active" } }
          { orWhere: { status: "New" } }
        ]
      }
      {
        andWhere: {
          Course: [
            {
              whereNot: {
                course_name: null
                _OPERATOR_: isNull
              }
            }
          ]
        }
      }
    ]
  ) {
    ID: id
    Course {
      unique_id
      course_name
      image
    }
    Class {
      id
      unique_id
    }
  }
}
