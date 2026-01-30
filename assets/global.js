let cartCache = null;
let resizeTimeout = null;

function bundleUpdateCart() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      let cartItems = cart?.items;
      cartCache = cart;
      updateDiscountProgress(cart);
      let groupedItems = {};
      cartItems?.forEach(item => {
        let bundle_id = item?.properties?.['bundle_id'];
        if (bundle_id) {
          if (groupedItems[bundle_id]) {
            groupedItems[bundle_id] += `, ${item.key}`;
          } else {
            groupedItems[bundle_id] = `${item.key}`;
          }
        }
      });
      
      document.querySelectorAll('[data-edit-item]').forEach(function (element) {
         let dataEditItem = element.getAttribute('data-edit-item');
          let dataKey = groupedItems[dataEditItem];
          element.setAttribute('data-bundle-items-key', dataKey)
      })
    })
    .catch(error => {
      console.error('Error fetching cart:', error);
    });
}

function updateDiscountProgress(cart) {
  const wrapper = document.querySelector('.discount-progress__wrapper');
  if (!wrapper) return;

  const blocksCount = wrapper?.querySelectorAll('.discount-progress__item').length;
  const pills = document.querySelectorAll('.discount-progress__pill');

  if (!pills || pills.length === 0 ) return;

  const cartItemElements = document.querySelectorAll('.cart-item');
  const totalQty = cart.items.reduce((sum, item) => {
    const matchingElement = Array.from(cartItemElements).find(el => el.dataset.key === item.key);

    if (!matchingElement) return sum;

    const tags = matchingElement.dataset.tags.split(',').map(tag => tag.trim());
    if (!tags.includes('excapsule')) {
      return sum + item.quantity;
    }

    return sum;
  }, 0);

  const blocksGap = blocksCount === 3 ? 30 : 15;
  const pillsCount = pills.length;
  const wrapperWidth = wrapper.clientWidth;
  const pillGap = 8;
  const totalGap = blocksGap + pillGap * (pillsCount - 1);
  const pillWidth = (wrapperWidth - totalGap) / pillsCount;

  pills.forEach((pill,index) => {
    pill.style.width = `${pillWidth}px`;
    pill.classList.toggle('active', index + 1 <= totalQty);
  });
  wrapper.style.opacity = '1';
}
function fetchAndUpdateCart() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      cartCache = cart;
      updateDiscountProgress(cart);
    })
    .catch(error => {
      console.error('Error fetching cart:', error);
    });
}

document.addEventListener('DOMContentLoaded', function() {
  bundleUpdateCart();
  const discountProgress = document.querySelector('#discount-progress');
  if (!discountProgress) return;
  if (window.innerWidth < 768) {
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (cartCache) {
          updateDiscountProgress(cartCache);
        } else {
          fetchAndUpdateCart();
        }
      }, 100);
    });
  }
});

var Shopify=Shopify||{};Shopify.money_format="${{amount}}",Shopify.formatMoney=function(a,o){"string"==typeof a&&(a=a.replace(".",""));var e="",t=/\{\{\s*(\w+)\s*\}\}/,o=o||this.money_format;function r(a,o){return void 0===a?o:a}function n(a,o,e,t){if(o=r(o,2),e=r(e,","),t=r(t,"."),isNaN(a)||null==a)return 0;a=(a=(a/100).toFixed(o)).split(".");return a[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+e)+(a[1]?t+a[1]:"")}switch(o.match(t)[1]){case"amount":e=n(a,2);break;case"amount_no_decimals":e=n(a,0);break;case"amount_with_comma_separator":e=n(a,2,".",",");break;case"amount_no_decimals_with_comma_separator":e=n(a,0,".",",")}return o.replace(t,e)};


function getFocusableElements(container) {
  if (!container) {
    console.error('Container element is null or undefined');
    return [];  // Return an empty array if container is not found
  }

  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

let megaMenuOpen = false;
document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
  summary.setAttribute('role', 'button');
  summary.setAttribute('aria-expanded', summary.parentNode.hasAttribute('open'));

  if (summary.nextElementSibling.getAttribute('id')) {
    summary.setAttribute('aria-controls', summary.nextElementSibling.id);
  }

  summary.addEventListener('click', (event) => {
    event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
  });

  if (summary.closest('header-drawer, menu-drawer')) return;
  summary.parentElement.addEventListener('keyup', onKeyUpEscape);
});

const setHeaderHeight = () => {
  document.getElementsByTagName('html')[0].style.setProperty('--header-height', document.getElementById('shopify-section-header').offsetHeight + 'px');
};
setHeaderHeight();

const replaceAll = (string,search,replace) => {
  return string.split(search).join(replace);
};

const updateSrcSet = (img,newSrc) => {
  if(!img) return;
  const srcset = img.getAttribute('srcset');
  const src = img.getAttribute('src');
  const filename = srcset.split(',')[0].split('cdn')[1].split('?')[0];
  const newFilename = newSrc.split('cdn')[1].split('?')[0]; 
  const newSrcSet = srcset.replaceAll(filename, newFilename);
  const newSrcVal = src.replace(filename, newFilename);
  img.setAttribute('src', newSrcVal);
  img.setAttribute('srcset',newSrcSet);
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch(e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  console.log('onKeyUpEscape');
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.setAttribute('aria-expanded', false);
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(event, this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.has-submenu');
    const isOpen = detailsElement.hasAttribute('open');
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function addTrapFocus() {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));
      summaryElement.nextElementSibling.removeEventListener('transitionend', addTrapFocus);
    }

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(event, summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
        summaryElement.setAttribute('aria-expanded', true);
        parentMenuElement && parentMenuElement.classList.add('submenu-open');
        !reducedMotion || reducedMotion.matches ? addTrapFocus() : summaryElement.nextElementSibling.addEventListener('transitionend', addTrapFocus);
      }, 100);
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event === undefined) return;

    this.mainDetailsToggle.classList.remove('menu-opening');
    this.mainDetailsToggle.querySelectorAll('details').forEach(details => {
      details.removeAttribute('open');
      details.classList.remove('menu-opening');
    });
    this.mainDetailsToggle.querySelectorAll('.submenu-open').forEach(submenu => {
      submenu.classList.remove('submenu-open');
    });
    document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
    removeTrapFocus(elementToFocus);
    this.closeAnimation(this.mainDetailsToggle);
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    const parentMenuElement = detailsElement.closest('.submenu-open');
    parentMenuElement && parentMenuElement.classList.remove('submenu-open');
    detailsElement.classList.remove('menu-opening');
    detailsElement.querySelector('summary').setAttribute('aria-expanded', false);
    removeTrapFocus(detailsElement.querySelector('summary'));
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);
    this.header.classList.add('menu-open');

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus) {
    super.closeMenuDrawer(event, elementToFocus);
    this.header.classList.remove('menu-open');
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this, false)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target === this) this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    document.body.dispatchEvent(new CustomEvent('modalClosed'));
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent(focus = true) {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      const deferredElement = this.appendChild(content.querySelector('video, model-viewer, iframe'));
      if (focus) deferredElement.focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('.slider');
    if(!this.slider) return;
    this.sliderItems = this.slider.querySelectorAll('.slider__slide');
    this.enableSliderLooping = false;
    this.currentPageElement = this.querySelector('.slider-counter--current');
    this.pageTotalElement = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector(`button[name="previous"][aria-controls="${this.slider.getAttribute('id')}"]`);
    this.nextButton = this.querySelector(`button[name="next"][aria-controls="${this.slider.getAttribute('id')}"]`);

    if (!this.slider || !this.nextButton) return;

    this.initPages();
    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));

    this.toggleButtons = this.querySelectorAll('.featured-collection__toggle');
    this.toggleButtons.forEach(button => button.addEventListener('click', this.toggleCollection.bind(this)));
  }

  initPages() {
    this.sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    if (this.sliderItemsToShow.length < 2) return;
    
    // Calculate offset based on actual element width
    this.sliderItemOffset = this.sliderItemsToShow[1].offsetLeft - this.sliderItemsToShow[0].offsetLeft;
    
    // FORCE 3 ITEMS
    this.slidesPerPage = 3; 
    this.totalPages = Math.max(1, this.sliderItemsToShow.length - this.slidesPerPage + 1);
    
    this.update();
  }

  resetPages() {
    this.sliderItems = this.slider.querySelectorAll('.slider__slide');
    this.initPages();
  }

  toggleCollection(event) {
    let allSliders = this.querySelectorAll('.slider');
    let allToggles = this.querySelectorAll('.featured-collection__toggle');
    this.slider = document.getElementById(event.target.getAttribute('aria-controls'));
    this.sliderItems = this.slider.querySelectorAll('.slider__slide');
    this.prevButton = this.querySelector(`.slider-button--prev[aria-controls="${event.target.getAttribute('aria-controls')}"]`);
    this.nextButton = this.querySelector(`.slider-button--next[aria-controls="${event.target.getAttribute('aria-controls')}"]`);

    allSliders.forEach(slider => {
      slider.style.display = 'none';
    })
    this.slider.style.display = 'flex';

    allToggles.forEach(toggle => {
      toggle.setAttribute('aria-expanded',false);
    });
    event.target.setAttribute('aria-expanded',true);
    this.update();

  }

  update() {
    const previousPage = this.currentPage;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderItemOffset) + 1;

    if (this.currentPageElement && this.pageTotalElement) {
      this.currentPageElement.textContent = this.currentPage;
      this.pageTotalElement.textContent = this.totalPages;
    }

    if (this.currentPage != previousPage) {
      this.dispatchEvent(new CustomEvent('slideChanged', { detail: {
        currentPage: this.currentPage,
        currentElement: this.sliderItemsToShow[this.currentPage - 1]
      }}));
    }

    if (this.enableSliderLooping) return;

    if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
      this.prevButton.setAttribute('disabled', 'disabled');
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
      this.nextButton.setAttribute('disabled', 'disabled');
    } else {
      this.nextButton.removeAttribute('disabled');
    }
  }

  isSlideVisible(element, offset = 0) {
    const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
    return (element.offsetLeft + element.clientWidth) <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
  }

  onButtonClick(event) {
    event.preventDefault();
    const step = event.currentTarget.dataset.step || 1;
    this.slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + (step * this.sliderItemOffset) : this.slider.scrollLeft - (step * this.sliderItemOffset);
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class SlideshowComponent extends SliderComponent {
  constructor() {
    super();
    this.sliderControlWrapper = this.querySelector('.slider-buttons');
    this.enableSliderLooping = true;

    if (!this.sliderControlWrapper) return;

    this.sliderFirstItemNode = this.slider.querySelector('.slideshow__slide');
    if (this.sliderItemsToShow.length > 0) this.currentPage = 1;

    this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
    this.sliderControlLinksArray.forEach(link => link.addEventListener('click', this.linkToSlide.bind(this)));
    this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
    this.setSlideVisibility();

    if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
  }

  setAutoPlay() {
    this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
    this.autoplaySpeed = this.slider.dataset.speed * 1000;

    this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
    this.addEventListener('mouseover', this.focusInHandling.bind(this));
    this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
    this.addEventListener('focusin', this.focusInHandling.bind(this));
    this.addEventListener('focusout', this.focusOutHandling.bind(this));

    this.play();
    this.autoplayButtonIsSetToPlay = true;
  }

  onButtonClick(event) {
    super.onButtonClick(event);
    const isFirstSlide = this.currentPage === 1;
    const isLastSlide = this.currentPage === this.sliderItemsToShow.length;

    if (!isFirstSlide && !isLastSlide) return;

    if (isFirstSlide && event.currentTarget.name === 'previous') {
      this.slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * this.sliderItemsToShow.length;
    } else if (isLastSlide && event.currentTarget.name === 'next') {
      this.slideScrollPosition = 0;
    }
    this.slider.scrollTo({
      left: this.slideScrollPosition
    });
  }

  update() {
    super.update();
    this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
    this.prevButton.removeAttribute('disabled');

    if (!this.sliderControlButtons.length) return;

    this.sliderControlButtons.forEach(link => {
      link.classList.remove('slider-counter__link--active');
      link.removeAttribute('aria-current');
    });
    this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
    this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
  }

  autoPlayToggle() {
    this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
    this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
    this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
  }

  focusOutHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
    this.play();
  }

  focusInHandling(event) {
    const focusedOnAutoplayButton = event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
    if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
      this.play();
    } else if (this.autoplayButtonIsSetToPlay) {
      this.pause();
    }
  }

  play() {
    this.slider.setAttribute('aria-live', 'off');
    clearInterval(this.autoplay);
    this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
  }

  pause() {
    this.slider.setAttribute('aria-live', 'polite');
    clearInterval(this.autoplay);
  }

  togglePlayButtonState(pauseAutoplay) {
    if (pauseAutoplay) {
      this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
    } else {
      this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
      this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
    }
  }

  autoRotateSlides() {
    const slideScrollPosition = this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.slider.querySelector('.slideshow__slide').clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }

  setSlideVisibility() {
    this.sliderItemsToShow.forEach((item, index) => {
      const button = item.querySelector('a');
      if (index === this.currentPage - 1) {
        if (button) button.removeAttribute('tabindex');
        item.setAttribute('aria-hidden', 'false');
        item.removeAttribute('tabindex');
      } else {
        if (button) button.setAttribute('tabindex', '-1');
        item.setAttribute('aria-hidden', 'true');
        item.setAttribute('tabindex', '-1');
      }
    });
  }

  linkToSlide(event) {
    event.preventDefault();
    const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slideshow-component', SlideshowComponent);

const videoControls = (v) => {
  const buttons = document.querySelectorAll('.playpause');
  buttons.forEach(button => {
    const playIcon = button.querySelector('.play');
    const pauseIcon = button.querySelector('.pause');
    button.addEventListener('click',event => {
      const currentTarget = event.currentTarget;
      const targetParent = currentTarget.parentElement.parentElement;
      if (!targetParent) return;
      const myVideo = targetParent.querySelector('.banner__video');
      if(myVideo.paused) {
        myVideo.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
      } else {
        myVideo.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    });
  });
  const volumeButtons = document.querySelectorAll('.muteunmute');
  volumeButtons.forEach(button => {
    const muteIcon = button.querySelector('.mute');
    const unmuteIcon = button.querySelector('.unmute');
    button.addEventListener('click',event => {
      const currentTarget = event.currentTarget;
      const targetParent = currentTarget.parentElement.parentElement;
      if (!targetParent) return;
      const myVideo = targetParent.querySelector('.banner__video');
      if(myVideo.muted) {
        myVideo.muted = false;
        muteIcon.style.display = 'block';
        unmuteIcon.style.display = 'none';
      } else {
        myVideo.muted = true;
        muteIcon.style.display = 'none';
        unmuteIcon.style.display = 'block';
      }
    });
  })
};
videoControls();

const playPauseVideos = () => {
  let videos = document.querySelectorAll("video");
  
  videos.forEach((video) => {
    let isBanner = video.closest(".banner");
    let isProductVideo = video.closest('.product');
    video.muted = true;
    video.playsInline = true;
    if(isBanner) return true;
    if(isProductVideo) return;
    let playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then((_) => {
          let observer = new IntersectionObserver(
              (entries) => {
                  entries.forEach((entry) => {
                      if (
                          entry.intersectionRatio !== 1 &&
                          !video.paused
                      ) {
                          video.pause();
                      } else if (video.paused) {
                          video.play();
                      }
                  });
              },
              { threshold: 0.3 }
          );
          observer.observe(video);
      });
   }
  });
};

playPauseVideos();

const addToCart = async(id, qty, properties = false, callback = false) => {
  let template = '';
    if (window.ShopifyTemplate) {
    template = window.ShopifyTemplate.suffix;
  }
  let sellingPlan = '';
  if(window.trynow){
      let hasTryLink = await window.trynow.hasPassedTryLink();
      if (hasTryLink && template == 'try-before-you-buy'){
        let sellingPlanGid = await window.trynow.getSellingPlanId();
        sellingPlan = sellingPlanGid.split('/').pop();
        await window.trynow.addToCartClicked();
      }    
  }



  let formData = {
   items: [{
    id: id,
    quantity: qty,
    selling_plan: sellingPlan
    }]
  };
  const cartDrawer = document.querySelector('cart-drawer');
  if(properties) {
    formData.items[0].properties = properties;
  }
  formData.sections = 'cart-drawer,cart-icon-bubble';
  fetch(window.Shopify.routes.root + 'cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    return response.json();
  })
  .then(data => {
    updateCart();
    return;
    const cartDrawer = document.querySelector('cart-drawer');
    cartDrawer.renderContents(data);
    // cartDrawer.forceUpdateCartDrawer(); 
    
    if(callback && typeof callback === "function") {
      callback();
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
};

const updateCart = () => {
  const cartDrawer = document.querySelector('cart-drawer');
  fetch(`/cart`)
  .then((response) => {
    return response.text();
  })
  .then((html) => {
    const elementsToUpdate = [
      'cart-drawer .drawer__inner',
      '#cart-icon-bubble',
      '.wear-with__desktop'
    ]
    elementsToUpdate.forEach((selector) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const oldEl = document.querySelector(selector);
      const newEl = doc.querySelector(selector);
      if(!oldEl || !newEl) return;
      oldEl.innerHTML = newEl.innerHTML;
    });
    if(!cartDrawer.classList.contains('active')) {
      cartDrawer.open();
    }
    cartDrawer.wearWith();

    if (window.BOLD && BOLD.common && BOLD.common.eventEmitter &&
                  typeof BOLD.common.eventEmitter.emit === 'function'){
                BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded');
     }

    bundleUpdateCart();
  });
}

const lazyImages = () => {
  if ('loading' in HTMLImageElement.prototype && 'IntersectionObserver' in window) {   
    var lazyImages = document.querySelectorAll('.media img');

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              const image = entry.target;
              let loadedSuccessfully = image.complete && image.naturalWidth !== 0;
              if (loadedSuccessfully) {
                image.parentNode.classList.add('loaded');
              } else {
                setTimeout(function() {
                  image.parentNode.classList.add('loaded');
                },250);
              }
              imageObserver.unobserve(image);
          }
      });
    }, {
      threshold: 0.5
    });

    lazyImages.forEach(img => imageObserver.observe(img));
  } 
};

const lazyIframes = () => {
  if ('loading' in HTMLImageElement.prototype && 'IntersectionObserver' in window) {   
    var lazyIframes = document.querySelectorAll('iframe[data-src]');

    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              const iframe = entry.target;
              iframe.src = iframe.dataset.src;
              iframe.parentNode.classList.add('loaded');
              imageObserver.unobserve(iframe);
          }
      });
    }, {
      threshold: 0.5
    });

    lazyIframes.forEach(iframe => imageObserver.observe(iframe));
  } 
};

const scrollToLinks = () => {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      console.log(event.target.href);
      document.querySelector(event.target.getAttribute('href')).scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      })
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  lazyImages();
  lazyIframes();
  scrollToLinks();
  marketingTileHeights();
  klaviyoForms();
});

document.addEventListener("shopify:section:load", () => {
  lazyImages();
  lazyIframes();
  scrollToLinks();
  marketingTileHeights();
  klaviyoForms();
});

window.addEventListener('resize', debounce(() => {
  marketingTileHeights();
}, 250));

const footerCollapseMobile = () => {
  const footerHeadings = document.querySelectorAll('.footer-block__heading');
  footerHeadings.forEach(button => {
    button.addEventListener('click',event => {
      let myEl = document.getElementById(button.getAttribute('aria-controls'));
      let isOpen = event.target.getAttribute('aria-expanded') === 'true';
      if(isOpen) {
        myEl.style.display = 'none';
        
      } else {
        myEl.style.display = 'block';
      }
      button.setAttribute('aria-expanded',!isOpen);
    });
  });
};
footerCollapseMobile();

const marketingTileHeights = () => {
  const tiles = document.querySelectorAll('.marketing-tile__inner');
  const firstGridItem = document.querySelector('#product-grid .grid__item:first-child .card__inner');
  if(!firstGridItem) return;
  const firstGridItemHeight = firstGridItem.clientHeight;
  tiles.forEach(tile => {
    tile.style.maxHeight = firstGridItemHeight + 'px';
  });
};

const klaviyoSubscribe = (form, callback) => {
  const email = form.querySelector('input[name="email"]').value;
  // const phone = form.querySelector('input[name="phone"]');
  const listId = form.querySelector('input[name="g"]').value;
  const successMessage = form.getAttribute("data-success-message");
  const messages = form.querySelector(".messages");
  const subscribeUrl = "//manage.kmail-lists.com/ajax/subscriptions/subscribe";
  // let phoneNumber = '';


  if (email === "") {
    messages.textContent = "Please enter a valid email address";
    messages.classList.remove("hidden");
    return false;
  }

  /*
  if(phone && phone.value != '') {
    const countryCode = form.querySelector('.iti__selected-flag').getAttribute('title').split(': ')[1];
    phoneNumber = `${countryCode}${phone.value}`;
  }
  */

  const bodyContent = {
    g: listId,
    email: email
    // sms_consent: true
    // $fields: '$phone_number,sms_consent',
    // $phone_number: phoneNumber,
    // $consent: ['sms']
  };
  console.log(bodyContent);

  fetch(subscribeUrl, {
    body: new URLSearchParams(bodyContent),
    method: "POST",
  })
  .then((response) => response.json())
  .then((response) => {

    if (response.success) {
      messages.textContent = successMessage;
    } else {
      messages.textContent = response.errors;
    }
    console.log('subscribe',response);
    messages.classList.remove("hidden");
    if (callback && typeof callback === 'function') {
      callback();
    }
  })
  .catch((err) => {
    console.error(err);
  });
};

const klaviyoForms = () => {
  const subscribeForms = document.querySelectorAll(".klaviyo-subscribe");
  subscribeForms.forEach((form) => {
    const button = form.querySelector(".newsletter-form__button");
    button.addEventListener("click", function (e) {
      e.preventDefault();
	    klaviyoSubscribe(form);
    });
  });
};

/* Some ADA element search functions */

function findEmptyHeadingTags() {
  // Get all of the heading tags on the page.
  var headingTags = document.querySelectorAll("h1, h2, h3, h4, h5");

  // Loop through the heading tags and check if they are empty.
  for (var i = 0; i < headingTags.length; i++) {
    var headingTag = headingTags[i];

    // If the heading tag has no text, then it is empty.
    if (headingTag.textContent.trim() == "") {
      // Remove the empty heading tag from the page.
      console.log(headingTag);
    }
  }
}
// findEmptyHeadingTags();


function findFormControlElementsWithoutLabel() {
  // Get all of the form control elements on the page.
  var formControlElements = document.querySelectorAll("input, select, textarea");

  // Loop through the form control elements and check if they have a label tag referencing them.
  for (var i = 0; i < formControlElements.length; i++) {
    var formControlElement = formControlElements[i];

    // Get all of the label tags on the page.
    var labelTags = document.querySelectorAll("label");

    // Loop through the label tags and check if they are referencing the form control element.
    for (var j = 0; j < labelTags.length; j++) {
      var labelTag = labelTags[j];

      // If the label tag is referencing the form control element, then it is not missing a label.
      if (labelTag.htmlFor == formControlElement.id) {
        break;
      }
    }

    // If the loop has reached the end without breaking, then the form control element is missing a label.
    if (j == labelTags.length) {
      // Add the form control element to the list of form control elements without a label.
      var formControlElementsWithoutLabel = [];
      formControlElementsWithoutLabel.push(formControlElement);
    }
  }

  // Return the list of form control elements without a label.
  return formControlElementsWithoutLabel;
}

// var formControlElementsWithoutLabel = findFormControlElementsWithoutLabel();

// // Loop through the form control elements without a label and print them to the console.
// for (var i = 0; i < formControlElementsWithoutLabel.length; i++) {
//   var formControlElement = formControlElementsWithoutLabel[i];
//   console.log(formControlElement);
// }

function findTablesWithoutHeadings() {
  // Get all of the table elements on the page.
  var tables = document.querySelectorAll("table");

  // Loop through the table elements and check if they have any table headings.
  for (var i = 0; i < tables.length; i++) {
    var table = tables[i];

    // Get all of the table rows in the table.
    var rows = table.querySelectorAll("tr");

    // Loop through the table rows and check if any of them have a table heading.
    for (var j = 0; j < rows.length; j++) {
      var row = rows[j];

      // Get all of the table cells in the row.
      var cells = row.querySelectorAll("td");

      // Loop through the table cells and check if any of them have a table heading.
      for (var k = 0; k < cells.length; k++) {
        var cell = cells[k];

        // If any of the table cells have a table heading, then the table has table headings.
        if (cell.tagName == "TH") {
          break;
        }
      }

      // If the loop has reached the end without breaking, then the table does not have table headings.
      if (k == cells.length) {
        // Add the table to the list of tables without headings.
        var tablesWithoutHeadings = [];
        tablesWithoutHeadings.push(table);
      }
    }
  }

  // Return the list of tables without headings.
  return tablesWithoutHeadings;
}

// var tablesWithoutHeadings = findTablesWithoutHeadings();

// // Loop through the tables without headings and print them to the console.
// for (var i = 0; i < tablesWithoutHeadings.length; i++) {
//   var table = tablesWithoutHeadings[i];
//   console.log(table);
// }

const findImagesWithoutAltText = () => {
  // Get all of the image elements on the page.
  var images = document.querySelectorAll("img");

  // Loop through the image elements and check if they have alt text.
  for (var i = 0; i < images.length; i++) {
    var image = images[i];

    // If the image element does not have alt text, then it is missing alt text.
    if (image.alt.trim() == "") {
      // Add the image to the list of images without alt text.
      var imagesWithoutAltText = [];
      imagesWithoutAltText.push(image);
    }
  }

  // Return the list of images without alt text.
  return imagesWithoutAltText;
}

// findImagesWithoutAltText();

const findEmptyLabelTags = () => {
  // Get all of the label tags on the page.
  var labelTags = document.querySelectorAll("label");

  // Loop through the label tags and check if they are empty.
  for (var i = 0; i < labelTags.length; i++) {
    var labelTag = labelTags[i];

    // If the label tag has no text, then it is empty.
    if (labelTag.textContent.trim() == "") {
      // Remove the empty label tag from the page.
      console.log(labelTag);
    }
  }
}

// findEmptyLabelTags();

const findEmptyButtons = () => {
  const buttons = document.getElementsByTagName('button');
  const emptyButtons = [];

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const buttonText = button.textContent.trim();
    const ariaLabel = button.getAttribute('aria-label');
    const ariaLabelledBy = button.getAttribute('aria-labelledby');

    if (buttonText === '' && !ariaLabel && !ariaLabelledBy) {
      emptyButtons.push(button);
    }
  }

  return emptyButtons;
}
findEmptyButtons();

document.addEventListener('call_widget_closed', (e) => {
  updateCart();
});

