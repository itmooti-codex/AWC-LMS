export class DropdownManager {
  toggle(triggerId, dropdownId, excludeIds = []) {
    const trigger = document.getElementById(triggerId);
    const dropdown = document.getElementById(dropdownId);

    if (!trigger || !dropdown) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
      excludeIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
      });
    });

    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }
}
