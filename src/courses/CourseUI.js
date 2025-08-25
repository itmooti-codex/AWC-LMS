import { UserConfig } from "../sdk/userConfig.js";

export class CourseUI {
  static renderNavSkeleton(container, count = 3) {
    if (!container) return;
    const items = Array.from({ length: count })
      .map(
        () => `
      <div class="flex items-center gap-2 p-2">
        <div class="w-6 h-6 rounded bg-gray-200 animate-pulse"></div>
        <div class="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
      </div>
    `
      )
      .join("");
    container.innerHTML = items;
  }

  static renderHomeSkeleton(container, count = 6) {
    if (!container) return;
    const items = Array.from({ length: count })
      .map(
        () => `
      <div class="bg-white p-4 flex flex-col gap-4 animate-pulse">
        <div class="w-full h-[180px] bg-gray-200 rounded"></div>
        <div class="flex flex-col gap-2">
          <div class="h-5 w-1/2 bg-gray-200 rounded"></div>
          <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
        </div>
        <div class="h-4 w-24 bg-gray-200 rounded"></div>
        <div class="h-10 w-28 bg-gray-200 rounded"></div>
      </div>
    `
      )
      .join("");
    container.innerHTML = items;
  }

  static renderNavItem(c) {
    const id = c.id;
    const img =
      c.courseImage ||
      "https://files.ontraport.com/media/bdd4701cb968467da95fce3f873cced4.phpcwxsax?Expires=4898813499&Signature=bvDMi4ZrbZScdIiAHOcHqU5kaiWAIFRyCCMXF80ZPc5NKcVLOQ1QndMga7Wh1wRIUuW70~lLBhIcqRErXyly6RiZtiGUAsclZa1x5KvLeuC83P-Wl8EvUblyvgPkVYYMf~u8vSYZlC4mPyHkCTkkpIUVUZTuSJ9xHilkAtXhvMOaP5-IIJiHRxTIVBqhmNu2H~J7~RPjPf3sgvgcSkczDGi6k5m8E6f3J8cHrRm7NEvb-XLk1J~zLkwf3nFDpdM4E7zTUZm3tXuyoHyqwQwe6bL9HSJx6VXUAtkQs29xaZM9xz5yujXKyiTui8UbrO8cTgW-9Rdsu2EzJxQwROYS5A__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA";
    const name = c.courseName || ""; 
    return `
    <a href="https://courses.writerscentre.com.au/students/course-details/${c.courseUid}?eid=${id}" class="flex items-center gap-2 p-2 text-sm text-neutral-600 hover:bg-[#ebf6f6] focus-visible:bg-neutral-900/10 focus-visible:text-neutral-900 focus-visible:outline-none" role="menuitem">
      <img src="${img}" class="w-[38px] h-[30px] object-cover" />
      <div class="text-[#586a80] h4 line-clamp-1">${name}</div>
    </a>
    `;
  }

  static renderHomeItem(c) {
    const { userType } = new UserConfig();
    const role = String(userType || "").toLowerCase();
    const id = c.id;
    const img =
      c.courseImage ||
      "https://files.ontraport.com/media/bdd4701cb968467da95fce3f873cced4.phpcwxsax?Expires=4898813499&Signature=bvDMi4ZrbZScdIiAHOcHqU5kaiWAIFRyCCMXF80ZPc5NKcVLOQ1QndMga7Wh1wRIUuW70~lLBhIcqRErXyly6RiZtiGUAsclZa1x5KvLeuC83P-Wl8EvUblyvgPkVYYMf~u8vSYZlC4mPyHkCTkkpIUVUZTuSJ9xHilkAtXhvMOaP5-IIJiHRxTIVBqhmNu2H~J7~RPjPf3sgvgcSkczDGi6k5m8E6f3J8cHrRm7NEvb-XLk1J~zLkwf3nFDpdM4E7zTUZm3tXuyoHyqwQwe6bL9HSJx6VXUAtkQs29xaZM9xz5yujXKyiTui8UbrO8cTgW-9Rdsu2EzJxQwROYS5A__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA";
    const courseName = c.courseName || "";
    const moduleCount = c.moduleCount || "";
    const description = c.description || "";
    const className = c.className || "";
    const start = c.startDate || "";
    const url = `https://courses.writerscentre.com.au/students/course-details/${c.courseUid}?eid=${id}`;
    const roleSeg = role === 'admin' ? 'admin' : 'teacher';
    const classUrl = `https://courses.writerscentre.com.au/${roleSeg}/class/${c.classUid}`;

    if (role === "teacher" || role === "admin") {
      // Require full content; skip incomplete cards for teacher/admin
      const required = (
        c.classUid && c.className && c.courseName && c.startDate && (c.studentCount !== undefined && c.studentCount !== '')
      );
      if (!required) return null;
      const wrap = document.createElement("div");
      wrap.className =
        "flex flex-col items-start gap-[24px] bg-white px-4 py-[24px]";
      wrap.dataset.key = c.classUid || c.courseUid || c.id;
      wrap.dataset.className = className;
      wrap.dataset.courseName = courseName;
      const inner = document.createElement("div");
      inner.className = "flex flex-col gap-4 w-full";
      // Render start date badge if we can parse a valid timestamp
      {
        const badge = document.createElement("div");
        badge.className =
          "flex items-center justify-center gap-2 rounded bg-[#ebf6f6] px-2 py-0.5";
        const badgeText = document.createElement("div");
        badgeText.className = "serif text-smallText text-[#007b8e]";
        // Format UNIX seconds or ms to DD-MM-YYYY
        const fmt = (d) => {
          try {
            let ms;
            if (d === null || d === undefined || d === '') return '';
            const n = Number(d);
            if (!Number.isNaN(n)) {
              // If seconds (e.g., 1736125200), convert to ms
              ms = n < 1e12 ? n * 1000 : n;
            } else {
              const dt2 = new Date(d);
              if (isNaN(dt2.getTime())) return '';
              ms = dt2.getTime();
            }
            const dt = new Date(ms);
            if (isNaN(dt.getTime())) return '';
            const dd = String(dt.getDate()).padStart(2, '0');
            const mm = String(dt.getMonth() + 1).padStart(2, '0');
            const yyyy = dt.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
          } catch (_) { return ''; }
        };
        const formatted = fmt(start);
        if (formatted) {
          badgeText.textContent = `Start Date: ${formatted}`;
          badge.appendChild(badgeText);
          wrap.appendChild(badge);
        }
      }
      // Class name (primary)
      const titleDiv = document.createElement("div");
      titleDiv.className = "serif text-h3 text-[#414042] line-clamp-1";
      titleDiv.textContent = className;
      inner.appendChild(titleDiv);
      // Course name row with small icon
      const courseRow = document.createElement("div");
      courseRow.className = "flex items-center justify-start gap-2";
      courseRow.innerHTML = '<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.1904 0H9.38087C8.8757 0 8.39121 0.20068 8.034 0.557892C7.67679 0.915104 7.47611 1.39959 7.47611 1.90476V7.12679C7.47776 7.24968 7.43283 7.36864 7.35034 7.45974C7.26784 7.55085 7.15392 7.60734 7.03147 7.61786C6.96633 7.62218 6.901 7.61307 6.83953 7.59108C6.77807 7.56909 6.72178 7.53471 6.67416 7.49005C6.62655 7.44539 6.58862 7.39142 6.56274 7.33149C6.53687 7.27156 6.52359 7.20695 6.52373 7.14167V1.90476C6.52373 1.39959 6.32305 0.915104 5.96584 0.557892C5.60862 0.20068 5.12414 0 4.61897 0H0.809442C0.683149 0 0.562028 0.05017 0.472725 0.139473C0.383422 0.228776 0.333252 0.349897 0.333252 0.47619V9.04762C0.333252 9.17391 0.383422 9.29503 0.472725 9.38434C0.562028 9.47364 0.683149 9.52381 0.809442 9.52381H5.09516C5.47342 9.52381 5.83624 9.67383 6.10405 9.94096C6.37186 10.2081 6.52278 10.5705 6.52373 10.9488C6.52182 11.046 6.55011 11.1415 6.60469 11.2219C6.65927 11.3024 6.73746 11.364 6.82849 11.3982C6.90076 11.4261 6.97873 11.4359 7.05566 11.4269C7.13259 11.4178 7.20614 11.3901 7.26994 11.3462C7.33374 11.3023 7.38587 11.2434 7.42179 11.1748C7.45772 11.1062 7.47637 11.0298 7.47611 10.9524C7.47611 10.5735 7.62662 10.2101 7.89453 9.94223C8.16244 9.67432 8.5258 9.52381 8.90468 9.52381H13.1904C13.3167 9.52381 13.4378 9.47364 13.5271 9.38434C13.6164 9.29503 13.6666 9.17391 13.6666 9.04762V0.47619C13.6666 0.349897 13.6164 0.228776 13.5271 0.139473C13.4378 0.05017 13.3167 0 13.1904 0ZM11.7618 7.14286H9.39694C9.27405 7.14451 9.15509 7.09957 9.06399 7.01708C8.97288 6.93459 8.91639 6.82067 8.90587 6.69821C8.90155 6.63308 8.91066 6.56775 8.93265 6.50628C8.95463 6.44482 8.98902 6.38853 9.03368 6.34091C9.07834 6.2933 9.13231 6.25537 9.19224 6.22949C9.25217 6.20361 9.31678 6.19033 9.38206 6.19048H11.7469C11.8698 6.18882 11.9888 6.23376 12.0799 6.31625C12.171 6.39874 12.2275 6.51267 12.238 6.63512C12.2423 6.70026 12.2332 6.76559 12.2112 6.82705C12.1893 6.88852 12.1549 6.94481 12.1102 6.99242C12.0655 7.04004 12.0116 7.07796 11.9516 7.10384C11.8917 7.12972 11.8271 7.143 11.7618 7.14286ZM11.7618 5.2381H9.39694C9.27405 5.23975 9.15509 5.19481 9.06399 5.11232C8.97288 5.02983 8.91639 4.9159 8.90587 4.79345C8.90155 4.72832 8.91066 4.66299 8.93265 4.60152C8.95463 4.54005 8.98902 4.48377 9.03368 4.43615C9.07834 4.38853 9.13231 4.35061 9.19224 4.32473C9.25217 4.29885 9.31678 4.28557 9.38206 4.28571H11.7469C11.8698 4.28406 11.9888 4.329 12.0799 4.41149C12.171 4.49398 12.2275 4.60791 12.238 4.73036C12.2423 4.79549 12.2332 4.86082 12.2112 4.92229C12.1893 4.98376 12.1549 5.04004 12.1102 5.08766C12.0655 5.13528 12.0116 5.1732 11.9516 5.19908C11.8917 5.22496 11.8271 5.23824 11.7618 5.2381ZM11.7618 3.33333H9.39694C9.27385 3.33529 9.15459 3.29049 9.06323 3.20797C8.97188 3.12545 8.91521 3.01135 8.90468 2.88869C8.90036 2.82355 8.90947 2.75822 8.93146 2.69676C8.95344 2.63529 8.98783 2.579 9.03249 2.53139C9.07715 2.48377 9.13112 2.44585 9.19105 2.41997C9.25098 2.39409 9.31559 2.38081 9.38087 2.38095H11.7458C11.8688 2.37899 11.9881 2.42379 12.0795 2.50632C12.1708 2.58884 12.2275 2.70294 12.238 2.8256C12.2423 2.89073 12.2332 2.95606 12.2112 3.01753C12.1893 3.07899 12.1549 3.13528 12.1102 3.1829C12.0655 3.23051 12.0116 3.26844 11.9516 3.29432C11.8917 3.3202 11.8271 3.33348 11.7618 3.33333Z" fill="#007C8F"></path></svg>';
      const courseText = document.createElement("div");
      courseText.className = "serif text-button text-[#586a80] line-clamp-1 leading-[24px]";
      courseText.textContent = courseName;
      courseRow.appendChild(courseText);
      inner.appendChild(courseRow);
      // Students count row
      const countRow = document.createElement("div");
      countRow.className = "flex items-center justify-start gap-2";
      const avatar = document.createElement("div");
      avatar.className = "relative h-4 w-4 overflow-hidden";
      avatar.innerHTML = `<img src="https://file.ontraport.com/media/7a63ff235f664be8af257390800637fc.phpremyez?Expires=4891665563&Signature=W9rhpaAwsYnuccv8skR3PmSO3o-vMAZP64AT5OvxHqG54IBDt4Gx~yZO~c6dTKj00h6YSmMjnqpAYgBpAYUt~Q7JQouBCNMM7tzXwkjv3rNzRm9J4m3rT9pKWMIS3kYTACQkt5W0sLy~A8okbSuUxA7e~-HhaD2TT5hhaX5AV3JZZF0lVdGdsXhQgDgjb-kcxpDVRYysszXvNLDTB~JgJRt7DYHL-Yiy11nFbrETm3vS9Ep68kIHqkQxjTIHBuoXWQ8mM~ae4eqS7kaui5T1T03YWdjJyelBhG9j~BFQwU~Lq6XnsCdSAgeAbTfKAQ8OY5v4kt4rBMdBhw6-sTn7DQ__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA" style="height:100%; width:100%;" />`;
      const countText = document.createElement("div");
      const total = Number(c.studentCount || 0) || 0;
      countText.innerHTML = `<span class="serif text-smallText text-[#586a80]">${total} ${total === 1 ? 'Student' : 'Students'}</span>`;
      countRow.appendChild(avatar);
      countRow.appendChild(countText);
      inner.appendChild(countRow);
      // Go to class link
      const gotoWrap = document.createElement("a");
      gotoWrap.href = classUrl;
      gotoWrap.className = "flex items-center gap-2";
      gotoWrap.innerHTML = `<div class="serif text-button text-[#007b8e] underline">Go to class</div><svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d=\"M13.5037 6.61572L8.50382 11.6156C8.39958 11.7198 8.2582 11.7784 8.11078 11.7784C7.96336 11.7784 7.82197 11.7198 7.71773 11.6156C7.61349 11.5113 7.55493 11.3699 7.55493 11.2225C7.55493 11.0751 7.61349 10.9337 7.71773 10.8295L11.7697 6.77821H0.888789C0.741452 6.77821 0.600149 6.71968 0.495965 6.6155C0.391782 6.51132 0.333252 6.37001 0.333252 6.22268C0.333252 6.07534 0.391782 5.93403 0.495965 5.82985C0.600149 5.72567 0.741452 5.66714 0.888789 5.66714H11.7697L7.71773 1.61588C7.61349 1.51164 7.55493 1.37026 7.55493 1.22284C7.55493 1.07542 7.61349 0.934037 7.71773 0.829796C7.82197 0.725554 7.96336 0.666992 8.11078 0.666992C8.2582 0.666992 8.39958 0.725554 8.50382 0.829796L13.5037 5.82963C13.5553 5.88123 13.5963 5.9425 13.6242 6.00994C13.6522 6.07738 13.6666 6.14967 13.6666 6.22268C13.6666 6.29568 13.6522 6.36797 13.6242 6.43541C13.5963 6.50285 13.5553 6.56412 13.5037 6.61572Z\" fill=\"#007C8F\"></path></svg>`;
      inner.appendChild(gotoWrap);
      wrap.appendChild(inner);
      return wrap;
    }

    const wrap = document.createElement("div");
    wrap.className = "bg-white p-4 flex flex-col gap-4";
    wrap.dataset.key = c.classUid || c.courseUid || c.id;
    const a1 = document.createElement("a");
    a1.href = url;
    const image = document.createElement("img");
    image.src = img;
    image.alt = "Course Image";
    image.loading = "lazy";
    image.className = "w-full h-[180px] object-cover";
    a1.appendChild(image);
    wrap.appendChild(a1);
    const info = document.createElement("div");
    info.className = "flex flex-col gap-2";
    const titleLink = document.createElement("a");
    titleLink.href = url;
    const title = document.createElement("div");
    title.className = "button text-[#414042]";
    title.textContent = courseName;
    titleLink.appendChild(title);
    const subtitle = document.createElement("div");
    subtitle.className = "text-[#586A80] extra-small-text line-clamp-1";
    subtitle.textContent = className || "null";
    info.appendChild(titleLink);
    info.appendChild(subtitle);
    wrap.appendChild(info);
    const modules = document.createElement("div");
    modules.className = "button text-[#586A80] flex items-center gap-2";
    modules.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.641 2.66602H4.41026C4.13824 2.66602 3.87736 2.77407 3.68502 2.96642C3.49267 3.15876 3.38462 3.41964 3.38462 3.69166V4.7173H2.35897C2.08696 4.7173 1.82608 4.82536 1.63374 5.0177C1.44139 5.21005 1.33333 5.47092 1.33333 5.74294V12.9224C1.33333 13.1944 1.44139 13.4553 1.63374 13.6477C1.82608 13.84 2.08696 13.9481 2.35897 13.9481H11.5897C11.8618 13.9481 12.1226 13.84 12.315 13.6477C12.5073 13.4553 12.6154 13.1944 12.6154 12.9224V11.8968H13.641C13.913 11.8968 14.1739 11.7887 14.3663 11.5964C14.5586 11.404 14.6667 11.1432 14.6667 10.8711V3.69166C14.6667 3.41964 14.5586 3.15876 14.3663 2.96642C14.1739 2.77407 13.913 2.66602 13.641 2.66602ZM11.5897 5.74294V6.76858H2.35897V5.74294H11.5897ZM13.641 10.8711H12.6154V5.74294C12.6154 5.47092 12.5073 5.21005 12.315 5.0177C12.1226 4.82536 11.8618 4.7173 11.5897 4.7173H4.41026V3.69166H13.641V10.8711Z" fill="#007C8F"/></svg>';
    const modulesText = document.createElement("div");
    modulesText.textContent = `${moduleCount || "0"} Modules`;
    modules.appendChild(modulesText);
    wrap.appendChild(modules);
    const desc = document.createElement("div");
    desc.className = "body-text text-dark h-[48px] line-clamp-2";
    desc.textContent = description || "";
    wrap.appendChild(desc);
    const a2 = document.createElement("a");
    a2.href = url;
    const btn = document.createElement("div");
    btn.className = "primaryButton w-fit text-[#FFF]";
    btn.textContent = "View Course";
    a2.appendChild(btn);
    wrap.appendChild(a2);
    return wrap;
  }

  static _ensurePool() {
    let pool = document.getElementById("awc-course-el-pool");
    if (!pool) {
      pool = document.createElement("div");
      pool.id = "awc-course-el-pool";
      pool.style.display = "none";
      document.body.appendChild(pool);
    }
    return pool;
  }

  static renderList(list, container, type = "nav") {
    if (!container) return;
    if (type !== "home") {
      const html =
        (list || []).map(CourseUI.renderNavItem).join("") ||
        '<div class="p-2 text-sm text-gray-500">No courses</div>';
      container.innerHTML = html;
      return;
    }
    const pool = CourseUI._ensurePool();
    // Build nodes first (allows skipping invalid teacher/admin cards)
    const nodes = [];
    for (const c of (list || [])) {
      const node = CourseUI.renderHomeItem(c);
      if (node) nodes.push({ key: String(c.classUid || c.courseUid || c.id), node });
    }
    const nextKeys = new Set(nodes.map(n => n.key));
    // Move non-needed children to pool (preserve image nodes to avoid reload)
    const toMove = [];
    for (const child of Array.from(container.children)) {
      const key = child.dataset?.key;
      if (!key || !nextKeys.has(key)) toMove.push(child);
    }
    toMove.forEach((el) => pool.appendChild(el));

    // Append in order, reusing from container or pool or creating new
    for (const { key, node: desired } of nodes) {
      let node = Array.from(container.children).find((ch) => ch.dataset?.key === key);
      if (!node) node = Array.from(pool.children).find((ch) => ch.dataset?.key === key);
      if (!node) node = desired;
      container.appendChild(node);
    }

    // If empty, show placeholder
    if (!container.children.length) {
      container.innerHTML = '<div class="p-2 text-sm text-gray-500">No courses</div>';
    }
  }
}
