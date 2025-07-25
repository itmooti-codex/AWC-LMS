export class UserNameRenderer {
  render(targetElement, displayName, firstName, lastName) {
    if (!targetElement) return;
    const name = displayName.trim() || `${firstName.trim()} ${lastName.trim()}`.trim() || "Anonymous";
    targetElement.textContent = name;
  }
}
