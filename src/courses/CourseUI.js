export class CourseUI {
  static renderNavItem(c) {
    const img = c.courseImage || '';
    const name = c.courseName || '';
    return `
      <div class="flex items-center gap-2 p-2 hover:bg-gray-100">
        <img src="${img}" alt="${name}" class="w-6 h-6 rounded object-cover" />
        <span class="text-sm">${name}</span>
      </div>
    `;
  }

  static renderHomeItem(c) {
    const img = c.courseImage || '';
    const name = c.courseName || '';
    const url = `https://courses.writerscentre.com.au/students/course-details/${c.courseUid}?eid=${c.classUid}`;
    return `
      <div class="bg-white p-4 flex flex-col gap-4">
        <a href="${url}">
          <img src="${img}" alt="Course Image" class="w-full h-[180px] object-cover" />
        </a>
        <div class="flex flex-col gap-2">
          <a href="${url}">
            <div class="button text-[#414042]">${name}</div>
          </a>
          <div class="text-[#586A80] extra-small-text line-clamp-1">${c.subtitle || 'null'}</div>
        </div>
        <div class="button text-[#586A80] flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.641 2.66602H4.41026C4.13824 2.66602 3.87736 2.77407 3.68502 2.96642C3.49267 3.15876 3.38462 3.41964 3.38462 3.69166V4.7173H2.35897C2.08696 4.7173 1.82608 4.82536 1.63374 5.0177C1.44139 5.21005 1.33333 5.47092 1.33333 5.74294V12.9224C1.33333 13.1944 1.44139 13.4553 1.63374 13.6477C1.82608 13.84 2.08696 13.9481 2.35897 13.9481H11.5897C11.8618 13.9481 12.1226 13.84 12.315 13.6477C12.5073 13.4553 12.6154 13.1944 12.6154 12.9224V11.8968H13.641C13.913 11.8968 14.1739 11.7887 14.3663 11.5964C14.5586 11.404 14.6667 11.1432 14.6667 10.8711V3.69166C14.6667 3.41964 14.5586 3.15876 14.3663 2.96642C14.1739 2.77407 13.913 2.66602 13.641 2.66602ZM11.5897 5.74294V6.76858H2.35897V5.74294H11.5897ZM13.641 10.8711H12.6154V5.74294C12.6154 5.47092 12.5073 5.21005 12.315 5.0177C12.1226 4.82536 11.8618 4.7173 11.5897 4.7173H4.41026V3.69166H13.641V10.8711Z" fill="#007C8F"/>
          </svg>
          <div>${c.modules || '0'} Modules</div>
        </div>
        <div class="body-text text-dark h-[48px] line-clamp-2">${c.description || ''}</div>
        <a href="${url}">
          <div class="primaryButton w-fit text-[#ccc]">View Course</div>
        </a>
        
      </div>
    `;
  }

  static renderList(list, container, type = 'nav') {
    if (!container) return;
    const renderer = type === 'home' ? CourseUI.renderHomeItem : CourseUI.renderNavItem;
    const html = (list || []).map(renderer).join('') || '<div class="p-2 text-sm text-gray-500">No courses</div>';
    container.innerHTML = html;
  }
}
