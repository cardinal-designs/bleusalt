/**
 * video-lazy-loader.js
 * Defers loading of all [data-video] elements until:
 *   a) first user interaction (scroll, mousemove, touchstart, keydown, click), OR
 *   b) the video enters the viewport (IntersectionObserver, rootMargin 200px)
 *
 * Usage in Liquid:
 *   Replace <video src="…"> with <video data-video preload="none">
 *   Replace <source src="…"> with <source data-src="…">
 */

(function () {
  'use strict';

  function activateVideo(video) {
    if (video.dataset.loaded) return;
    video.dataset.loaded = 'true';

    video.querySelectorAll('source[data-src]').forEach(function (source) {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
    });

    if (video.dataset.src) {
      video.src = video.dataset.src;
      video.removeAttribute('data-src');
    }

    video.load();

    var shouldAutoplay =
      video.hasAttribute('autoplay') ||
      video.hasAttribute('data-autoplay') ||
      video.dataset.autoplay === 'true';

    if (shouldAutoplay) {
      video.play().catch(function () {
      });
    }
  }

  var observer = null;

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            activateVideo(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );
  }

  function observeAll() {
    document.querySelectorAll('[data-video]').forEach(function (video) {
      if (video.dataset.loaded) return;
      if (observer) {
        observer.observe(video);
      } else {
        activateVideo(video);
      }
    });
  }

  var interactionFired = false;
  var INTERACTION_EVENTS = ['scroll', 'mousemove', 'touchstart', 'keydown', 'click'];

  function onFirstInteraction() {
    if (interactionFired) return;
    interactionFired = true;

    INTERACTION_EVENTS.forEach(function (evt) {
      window.removeEventListener(evt, onFirstInteraction, { passive: true });
    });

    document.querySelectorAll('[data-video]').forEach(function (video) {
      if (video.dataset.loaded) return;

      var rect = video.getBoundingClientRect();
      var inOrNearViewport =
        rect.top < window.innerHeight + 400 && rect.bottom > -400;

      if (inOrNearViewport) {
        activateVideo(video);
        if (observer) observer.unobserve(video);
      }
    });
  }

  INTERACTION_EVENTS.forEach(function (evt) {
    window.addEventListener(evt, onFirstInteraction, { passive: true });
  });

  function init() {
    observeAll();

    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.matches && node.matches('[data-video]') && !node.dataset.loaded) {
              if (observer) observer.observe(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('[data-video]').forEach(function (video) {
                if (!video.dataset.loaded) {
                  if (observer) observer.observe(video);
                }
              });
            }
          });
        });
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
