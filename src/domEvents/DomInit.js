import { DropdownManager } from '../utils/DropdDownManager.js';
import { ImageFallback } from '../utils/ImageFallBack.js';
import { UserNameRenderer } from '../utils/UserNameRenderer.js';

export function initDOMInteractions() {
    const dropdown = new DropdownManager();
    const fallback = new ImageFallback();
    const nameRenderer = new UserNameRenderer();

    const fallbackImage = 'https://files.ontraport.com/media/b0456fe87439430680b173369cc54cea.php03bzcx?...';

    // Dropdown setup
    dropdown.toggle("toggle-courses", "courses-dropdown", ["notifications-dropdown", "profile-dropdown"]);
    dropdown.toggle("toggle-notifications", "notifications-dropdown", ["courses-dropdown", "profile-dropdown"]);
    dropdown.toggle("profile-toggle", "profile-dropdown", ["courses-dropdown", "notifications-dropdown"]);

    // Fallback images
    fallback.apply(document.getElementById("profile-avatar"), fallbackImage);
    fallback.apply(document.getElementById("dropdown-avatar"), fallbackImage);

    // Username fallback
    nameRenderer.render(
        document.getElementById("profile-name"),
        '[Visitor//Display Name]',
        '[Visitor//First Name]',
        '[Visitor//Last Name]'
    );
}
