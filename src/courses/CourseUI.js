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
    const img =
      c.courseImage ||
      "https://files.ontraport.com/media/bdd4701cb968467da95fce3f873cced4.phpcwxsax?Expires=4898813499&Signature=bvDMi4ZrbZScdIiAHOcHqU5kaiWAIFRyCCMXF80ZPc5NKcVLOQ1QndMga7Wh1wRIUuW70~lLBhIcqRErXyly6RiZtiGUAsclZa1x5KvLeuC83P-Wl8EvUblyvgPkVYYMf~u8vSYZlC4mPyHkCTkkpIUVUZTuSJ9xHilkAtXhvMOaP5-IIJiHRxTIVBqhmNu2H~J7~RPjPf3sgvgcSkczDGi6k5m8E6f3J8cHrRm7NEvb-XLk1J~zLkwf3nFDpdM4E7zTUZm3tXuyoHyqwQwe6bL9HSJx6VXUAtkQs29xaZM9xz5yujXKyiTui8UbrO8cTgW-9Rdsu2EzJxQwROYS5A__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA";
    const name = c.courseName || "";
    return `
    <a href="https://courses.writerscentre.com.au/students/course-details/${c.courseUid}?eid=${id}" 
    class="flex items-center gap-2 p-2 text-sm text-neutral-600 hover:bg-[#ebf6f6] focus-visible:bg-neutral-900/10 focus-visible:text-neutral-900 focus-visible:outline-none" role="menuitem"> 
    <img src="{img}" class="w-[38px] h-[30px] object-cover"> 
    <div class="text-[#586a80] h4 line-clamp-1">${name}</div> 
    </a>
      `;
  }

  static renderHomeItem(c) {
    const { userType } = new UserConfig();
    const role = String(userType || "").toLowerCase();
    const img =
      c.courseImage ||
      "https://files.ontraport.com/media/bdd4701cb968467da95fce3f873cced4.phpcwxsax?Expires=4898813499&Signature=bvDMi4ZrbZScdIiAHOcHqU5kaiWAIFRyCCMXF80ZPc5NKcVLOQ1QndMga7Wh1wRIUuW70~lLBhIcqRErXyly6RiZtiGUAsclZa1x5KvLeuC83P-Wl8EvUblyvgPkVYYMf~u8vSYZlC4mPyHkCTkkpIUVUZTuSJ9xHilkAtXhvMOaP5-IIJiHRxTIVBqhmNu2H~J7~RPjPf3sgvgcSkczDGi6k5m8E6f3J8cHrRm7NEvb-XLk1J~zLkwf3nFDpdM4E7zTUZm3tXuyoHyqwQwe6bL9HSJx6VXUAtkQs29xaZM9xz5yujXKyiTui8UbrO8cTgW-9Rdsu2EzJxQwROYS5A__&Key-Pair-Id=APKAJVAAMVW6XQYWSTNA";
    const courseName = c.courseName || "";
    const moduleCount = c.moduleCount || "";
    const description = c.description || "";
    const className = c.className || "";
    const start = c.startDate || "";
    const url = `https://courses.writerscentre.com.au/students/course-details/${c.courseUid}?eid=${c.classUid}`;

    if (role === "teacher" || role === "admin") {
      const wrap = document.createElement("div");
      wrap.className =
        "flex flex-col items-start gap-[24px] bg-white px-4 py-[24px]";
      wrap.dataset.key = c.classUid || c.courseUid || c.id;
      wrap.dataset.className = className;
      wrap.dataset.courseName = courseName;
      const inner = document.createElement("div");
      inner.className = "flex flex-col gap-4 w-full";
      if (start) {
        const badge = document.createElement("div");
        badge.className =
          "flex items-center justify-center gap-2 rounded bg-[#ebf6f6] px-2 py-0.5";
        const badgeText = document.createElement("div");
        badgeText.className = "serif text-smallText text-[#007b8e]";
        badgeText.textContent = `Start Date: ${start}`;
        badge.appendChild(badgeText);
        wrap.appendChild(badge);
      }
      const titleA = document.createElement("a");
      titleA.href = url;
      titleA.className = "serif text-h3 text-[#414042] line-clamp-1";
      titleA.textContent = className;
      inner.appendChild(titleA);
      const row = document.createElement("div");
      row.className = "flex items-center gap-3 text-[#586A80]";
      const image = document.createElement("img");
      image.src = img;
      image.alt = courseName;
      image.loading = "lazy";
      image.className = "w-10 h-10 rounded object-cover";
      const label = document.createElement("div");
      label.className = "text-sm line-clamp-2";
      label.textContent = courseName;
      row.appendChild(image);
      row.appendChild(label);
      inner.appendChild(row);
      const cta = document.createElement("a");
      cta.href = url;
      cta.className = "primaryButton w-fit";
      cta.textContent = "View Class";
      inner.appendChild(cta);
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
    btn.className = "primaryButton w-fit text-[#ccc]";
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
    const nextKeys = new Set(
      (list || []).map((c) => String(c.classUid || c.courseUid || c.id))
    );
    // Move non-needed children to pool (preserve image nodes to avoid reload)
    const toMove = [];
    for (const child of Array.from(container.children)) {
      const key = child.dataset?.key;
      if (!key || !nextKeys.has(key)) toMove.push(child);
    }
    toMove.forEach((el) => pool.appendChild(el));

    // Append in order, reusing from container or pool or creating new
    for (const c of list || []) {
      const key = String(c.classUid || c.courseUid || c.id);
      let node = Array.from(container.children).find(
        (ch) => ch.dataset?.key === key
      );
      if (!node)
        node = Array.from(pool.children).find((ch) => ch.dataset?.key === key);
      if (!node) node = CourseUI.renderHomeItem(c);
      // Ensure minimal text updates if node reused
      if (node && node.dataset) {
        node.dataset.className = c.className || "";
        node.dataset.courseName = c.courseName || "";
      }
      container.appendChild(node);
    }

    // If empty, show placeholder
    if (!container.children.length) {
      container.innerHTML =
        '<div class="p-2 text-sm text-gray-500">No courses</div>';
    }
  }
}
