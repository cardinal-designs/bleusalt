(() => {
  const userActivityEvents = [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'keypress',
    'touchmove',
  ];
  const SCRIPTS_LOADED_FLAG = 'third-party-scripts-loaded';

  async function onUserActivity() {
    for (const event of userActivityEvents) {
      window.removeEventListener(event, onUserActivity);
    }

    const scriptTagsForLoad = Array.from(
      document.querySelectorAll('script[data-lazy-src]'),
    );

    const scriptsLoad = [];

    for (const scriptTag of scriptTagsForLoad) {
      const scriptLoad = new Promise((resolve) => {
        const timeoutId = setTimeout(resolve, 2000);

        const complete = () => {
          clearTimeout(timeoutId);
          resolve();
        };
        scriptTag.addEventListener('load', complete, { once: true });
        scriptTag.addEventListener('error', complete, { once: true });

        scriptTag.src = scriptTag.dataset.lazySrc;
      });

      scriptsLoad.push(scriptLoad);
    }

    window.dispatchEvent(new CustomEvent('load-head-scripts'));

    await Promise.all(scriptsLoad);

    localStorage.setItem(SCRIPTS_LOADED_FLAG, 'true');

    window.dispatchEvent(new CustomEvent('third-party-scripts-loaded'));

    document.documentElement.classList.add('third-party-scripts-loaded');
  }

  function startListenUserActivity() {
    for (const event of userActivityEvents) {
      window.addEventListener(event, onUserActivity);
    }
  }

  window.addEventListener('load', () => {
    if (localStorage.getItem(SCRIPTS_LOADED_FLAG)) {
      onUserActivity();
    } else {
      startListenUserActivity();
    }
  });
})();
