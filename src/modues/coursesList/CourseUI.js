export class CourseUI {
  static renderCourseItem(c) {
    const img = c.courseImage || '';
    const name = c.courseName || '';
    return `
      <div class="flex items-center gap-2 p-2 hover:bg-gray-100">
        <img src="${img}" alt="${name}" class="w-6 h-6 rounded object-cover" />
        <span class="text-sm">${name}</span>
      </div>
    `;
  }

  static renderList(list, container) {
    if (!container) return;
    const html = (list || []).map(CourseUI.renderCourseItem).join('') || '<div class="p-2 text-sm text-gray-500">No courses</div>';
    container.innerHTML = html;
  }
}
