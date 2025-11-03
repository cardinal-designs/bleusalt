(() => {
  const userActivityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'keypress', 'touchmove'];

  async function onUserActivity() {
    for (const event of userActivityEvents) {
      window.removeEventListener(event, onUserActivity);
    }

    const scriptTagsForLoad = Array.from(document.querySelectorAll('script[data-lazy-src]'));

    const scriptsLoad = [];

    for (const scriptTag of scriptTagsForLoad) {
      scriptTag.src = scriptTag.dataset.lazySrc;

      const scriptLoad = new Promise((resolve) => {
        scriptTag.onload = resolve;
        scriptTag.onerror = resolve;
      });

      scriptsLoad.push(scriptLoad);
    }

    window.dispatchEvent(new CustomEvent('load-head-scripts'));

    await Promise.all(scriptsLoad);
    window.dispatchEvent(new CustomEvent('third-party-scripts-loaded'));

    document.documentElement.classList.add('third-party-scripts-loaded');
  }

  function startListenUserActivity() {
    for (const event of userActivityEvents) {
      window.addEventListener(event, onUserActivity);
    }
  }

  window.addEventListener('load', startListenUserActivity);
})();
