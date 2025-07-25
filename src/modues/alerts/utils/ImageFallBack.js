export class ImageFallback {
    apply(imgElement, fallbackUrl) {
      if (!imgElement) return;
      const src = imgElement.getAttribute("src")?.trim();
      if (!src || src === "" || src.includes("abc.jpg")) {
        imgElement.src = fallbackUrl;
      }
    }
  }
  