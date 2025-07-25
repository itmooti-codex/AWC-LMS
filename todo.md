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


<!-- We use above query to fetch courses. we will student from user config file. We will reuse sdk initliazation. we fetch courses and show name and image in course dropdown in navbar  -->