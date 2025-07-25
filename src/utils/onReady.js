import { initDOMInteractions } from '../domEvents/DomInit.js';

export function onReady(cb) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cb);
  } else {
    cb();
  }
}

onReady(() => {
  initDOMInteractions();
});
