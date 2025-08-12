export class DropdownManager {
  toggle(triggerId, dropdownId, excludeIds = [], iconId) {
    const trigger = document.getElementById(triggerId);
    const dropdown = document.getElementById(dropdownId);
    const icon = iconId ? document.getElementById(iconId) : null;

    if (!trigger || !dropdown) return;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
      if (icon) icon.classList.toggle('rotate-180', !dropdown.classList.contains('hidden'));
      excludeIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
      });
    });

    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
        if (icon) icon.classList.remove('rotate-180');
      }
    });
  }
}
