
(function () {
    'use strict';
  
    // ─── selectors (stable across facets re-renders) ────────────────────────────
    var GRID_ID        = 'product-grid';
    var BUTTON_ID      = 'LoadMoreButton';
    var WRAPPER_ID     = 'LoadMoreWrapper';
    var CONTAINER_ID   = 'ProductGridContainer';
  
    // ─── state ───────────────────────────────────────────────────────────────────
    var currentPage  = 1;
    var totalPages   = 1;
    var isFetching   = false;
  
    // ─── cached DOM refs (re-resolved after every facets re-render) ─────────────
    var grid, button, wrapper;
  
    // ─── resolve refs from the live DOM ─────────────────────────────────────────
    function resolveElements() {
        grid    = document.getElementById(GRID_ID);
        button  = document.getElementById(BUTTON_ID);
        wrapper = document.getElementById(WRAPPER_ID);
    }
  
    // ─── read page state from the grid's data attributes ───────────────────────
    function readPageState() {
        if (!grid) return;
        currentPage = parseInt(grid.getAttribute('data-load-more-current-page'), 10) || 1;
        totalPages  = parseInt(grid.getAttribute('data-load-more-total-pages'),   10) || 1;
    }
  
    // ─── write the current page back so the DOM stays in sync ──────────────────
    function writeCurrentPage() {
        if (grid) grid.setAttribute('data-load-more-current-page', String(currentPage));
    }
  
    // ─── build the URL for the next page, preserving any existing query params ──
    function buildNextPageUrl() {
        var loc    = window.location;
        var params = new URLSearchParams(loc.search);
        params.set('page', String(currentPage + 1));
        return loc.pathname + '?' + params.toString();
    }
  
    // ─── set the button into loading / idle state ──────────────────────────────
    function setLoading(isLoading) {
        if (!button) return;
        isFetching = isLoading;
        button.disabled = isLoading;
        if (isLoading) {
            button.classList.add('load-more__button--loading');
        } else {
            button.classList.remove('load-more__button--loading');
        }
    }
  
    // ─── hide the button entirely (last page reached) ──────────────────────────
    function hideButton() {
      if (wrapper) wrapper.style.display = 'none';
    }
  
    // ─── core fetch + append ────────────────────────────────────────────────────
    function loadNextPage() {
      if (isFetching) return;                          // prevent double-tap
      if (currentPage >= totalPages) { hideButton(); return; }
  
      setLoading(true);
  
      var url = buildNextPageUrl();
  
      fetch(url)
        .then(function (response) {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.text();
        })
        .then(function (html) {
            // parse the full page HTML
            var parser  = new DOMParser();
            var doc     = parser.parseFromString(html, 'text/html');
            var newGrid = doc.getElementById(GRID_ID);
    
            if (!newGrid) {
                // no grid in response — nothing left to load
                hideButton();
                setLoading(false);
                return;
            }
    
            // grab every direct <li> child (products + marketing tiles)
            var newItems = Array.prototype.slice.call(newGrid.children);
    
            if (newItems.length === 0) {
                hideButton();
                setLoading(false);
                return;
            }
    
            // append with staggered animation delay
            newItems.forEach(function (item, i) {
                item.classList.add('load-more__item--new');
                item.style.animationDelay = (i * 0.04) + 's';   // 40 ms between each
                item.querySelector('.media').classList.add('loaded');
                grid.appendChild(item);
            });
    
            // advance page counter
            currentPage += 1;
            writeCurrentPage();
    
            // if that was the last page, hide the button
            if (currentPage >= totalPages) {
                hideButton();
            }
    
            setLoading(false);
        })
        .catch(function (err) {
            console.error('[load-more.js] fetch failed:', err);
            setLoading(false);
        });
    }
  
    // ─── bind the click handler (safe to call multiple times) ──────────────────
    function bindButton() {
        if (!button) return;
        // remove any previous listener via cloning (cleanest one-liner)
        var fresh = button.cloneNode(true);
        button.parentNode.replaceChild(fresh, button);
        button = fresh;
    
        button.addEventListener('click', loadNextPage);
    }
  
    // ─── full init: resolve → read state → bind ────────────────────────────────
    function init() {
        resolveElements();
        if (!grid || !button) return;   // load-more not enabled or single page
        readPageState();
        bindButton();
    
        // if already on the last page (e.g. facets returned ≤ 1 page) hide immediately
        if (currentPage >= totalPages) hideButton();
    }
  
    // ─── MutationObserver: re-init after facets.min.js replaces the container ───
    // facets.min.js replaces the innerHTML of #ProductGridContainer on every
    // filter / sort change.  The observer watches for that and re-runs init so
    // the button, state, and click handler are all fresh.
    function watchContainer() {
      var container = document.getElementById(CONTAINER_ID);
      if (!container) return;
  
        var observer = new MutationObserver(function (mutations) {
            // only care about child-list changes (innerHTML replacement)
            for (var i = 0; i < mutations.length; i++) {
                if (mutations[i].type === 'childList' && mutations[i].addedNodes.length) {
                    init();
                    break;
                }
            }
        });
  
        observer.observe(container, { childList: true });
    }
  
    // ─── bootstrap ───────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            init();
            watchContainer();
        });
    } else {
        init();
        watchContainer();
    }
  
})();