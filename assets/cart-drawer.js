class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
    this.wearWithElements = document.querySelectorAll('wear-with');
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink)
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {this.classList.add('animate', 'active')});

    this.addEventListener('transitionend', () => {
      const containerToTrapFocusOn = document.getElementById('CartDrawer');
      const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
      trapFocus(containerToTrapFocusOn, focusElement);
    }, { once: true });

    this.wearWith();
    document.body.classList.add('overflow-hidden');
    if(typeof BOLD === 'object' && BOLD.common && BOLD.common.eventEmitter && typeof BOLD.common.eventEmitter.emit === 'function') {
  BOLD.common.eventEmitter.emit("BOLD_COMMON_cart_loaded");
}
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if(cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  forceUpdateCartDrawer() {
    console.log('forceUpdateCartDrawer');
    fetch(`/cart`)
    // fetch(`${routes.cart_url}?sections=${this.getSectionsToRender().map(section => section.section).join(',')}`)
    .then((response) => {
      return response.text();
    })
    .then((html) => {
      const elementsToUpdate = [
        'cart-drawer .drawer__inner',
        '#cart-icon-bubble'
      ]
      elementsToUpdate.forEach((selector) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const oldEl = document.querySelector(selector);
        const newEl = doc.querySelector(selector);
        if(!oldEl || !newEl) return;
        oldEl.innerHTML = newEl.innerHTML;
      });
      if(!this.classList.contains('active')) {
        this.open();
      }
      if(typeof BOLD === 'object' && BOLD.common && BOLD.common.eventEmitter && typeof BOLD.common.eventEmitter.emit === 'function') {
  BOLD.common.eventEmitter.emit("BOLD_COMMON_cart_loaded");
}
    });
  }
  updateWearWith(doc) {
    const drawerDoc = new DOMParser().parseFromString(doc, 'text/html');
    const newWearWith = drawerDoc.querySelector('.wear-with__desktop');
    const oldWearWith = document.querySelector('.wear-with__desktop');
    if(newWearWith && oldWearWith) {
      oldWearWith.innerHTML = newWearWith.innerHTML;
      this.wearWith();
    }
  }

  renderContents(parsedState) {
    updateCart();
    return;
    console.log({'cart-drawer.js renderContents':parsedState});
    this.productId = parsedState.id;
    this.getSectionsToRender().forEach((section => {
      console.log(section);
      const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
      if(sectionElement) {
        console.log(sectionElement);
        sectionElement.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
      } else {
        console.log('no element to replace');
      }
      
      if(section.section === 'cart-drawer') {
        this.updateWearWith(parsedState.sections['cart-drawer']);
      }
    }));


    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();

      if (window.BOLD && BOLD.common && BOLD.common.eventEmitter &&
                  typeof BOLD.common.eventEmitter.emit === 'function'){
                BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded');
 }


    });
  }

  wearWith(force = false) {
    console.log('wearWith');
    const myWearWith = window.innerWidth > 749 ? this.querySelector('.wear-with__desktop wear-with') : this.querySelector('.wear-with__mobile wear-with');
    if(!myWearWith) return;
    const buttonClass = window.innerWidth > 749 ? '.wear-with__desktop' : '.wear-with__mobile';
    const swiperEl = myWearWith.querySelector('.wear-with__swiper.swiper-initialized'); 
    if(swiperEl) {
      console.log('swiper already initialized, destroy it bitch');
      swiperEl.swiper.destroy();
    }
    let searchUrl = myWearWith.getAttribute('data-url');
    const wearWithColor = myWearWith.getAttribute('data-color');
    const productId = myWearWith.getAttribute('data-product-id');
    const swiperWrapper = myWearWith.querySelector('.swiper-wrapper');

    if(!swiperWrapper) return;
    swiperWrapper.innerHTML == '';
    let itemsFound = 0;
    const max = 6;
    
    if(force) searchUrl = `/collections/all?sort_by=best-selling&view=wear-with`;
    fetch(searchUrl)
    .then(response => response.text())
    .then((html) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const items = doc.querySelectorAll('.card-product');
      if(force && items.length === 0) return;
      items.forEach(item => {
        if(item.getAttribute('data-id') === productId) return;
        if(item.getAttribute('data-title') === 'The Canvas Bag') return;
        if(item.getAttribute('data-title') === 'Gift wrapping') return;
        if(itemsFound >= max) return;
        item.classList.add('swiper-slide');
        swiperWrapper.appendChild(item);
        if(wearWithColor) {
          const color = item.querySelector(`.quick-add__button--color[value="${wearWithColor}"]`);
          if(color) {
            color.click();
            color.closest('.quick-add__colors').style.display = 'none';
          }
        }
        lazyImages();
        itemsFound++;
      });
      
      if(itemsFound === 0) {
        this.wearWith(true);
      }

      const perView = window.innerWidth > 749 ? 3 : 2;
      if(window.innerWidth > 749) {
        const swiper = new Swiper('.wear-with__swiper', {
          slidesPerView: perView,
          spaceBetween: 20,
          allowTouchMove: false,
          preventClicks: true,
          preventClicksPropagation: true,
          watchSlidesProgress: true,
          loop: false, 
          navigation: {
            nextEl: `${buttonClass} .swiper-next`,
            prevEl: `${buttonClass} .swiper-prev`
          }
        });
      }
      
      
    })
    .catch(error => console.log(error));
    
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer'
      },
      {
        id: 'cart-icon-bubble'
      }
    ];
  }


  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner'
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      }
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);


class BundleRemove extends HTMLElement {
  constructor() {
    super();  
    this.querySelector('button').addEventListener('click',this.onClick.bind(this));
    this.cartDrawer = document.querySelector('cart-drawer');
  }
  onClick() {
    const updates = this.getAttribute('data-bundle-items').split(',');
    let updatesObj = {
      updates: {},
      sections: 'cart-drawer,cart-icon-bubble,main-cart-items,main-cart-footer',
      sections_url: window.location.pathname
    }

    updates.forEach(update => { 
      updatesObj.updates[update] = 0;
    });
    
    fetch('/cart/update.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatesObj),
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
        this.cartDrawer.renderContents(data)
        if(!this.cartDrawer.classList.contains('active')) {
          this.cartDrawer.open();
        }
    })
    .catch((error) => {
        console.error('Error:',error);
    });
  }
}

customElements.define('bundle-remove', BundleRemove);