class CartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');
      cartItems.updateQuantity(this.dataset.index, 0);

    });
  }
}

customElements.define('cart-remove-button', CartRemoveButton);

class CartItems extends HTMLElement {
  constructor() {
    super();

    this.lineItemStatusElement = document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');this.currentItemCount = Array.from(this.querySelectorAll('[name="updates[]"]:not([type="hidden"]')).reduce((total, quantityInput) => total + parseInt(quantityInput.value), 0);

    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.addEventListener('change', this.debouncedOnChange.bind(this));
  }

  onChange(event) {
    this.updateQuantity(event.target.dataset.index, event.target.value, document.activeElement.getAttribute('name'));
  }

  getSectionsToRender() {
    let sections = [
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section'
      },
      {
        id: window.cartFooterSectionId,
        section: window.cartFooterSectionId,
        selector: '.js-contents',
      },
      {
        id: window.cartItemsSectionId,
        section: window.cartItemsSectionId,
        selector: '.cart__items',
      },
    ];
    
    // Add cart page sections if they exist
    const mainCartFooter = document.getElementById('main-cart-footer');
    const mainCartItems = document.getElementById('main-cart-items');
    
    if (mainCartFooter && mainCartFooter.dataset.id) {
      sections.push({
        id: 'main-cart-footer',
        section: mainCartFooter.dataset.id,
        selector: '.js-contents',
      });
    }
    
    if (mainCartItems && mainCartItems.dataset.id) {
      sections.push({
        id: 'main-cart-items',
        section: mainCartItems.dataset.id,
        selector: '.js-contents',
      });
    }
    
    // Add cart drawer section
    sections.push({
      id: 'CartDrawer',
      section: 'cart-drawer',
      selector: '.drawer__inner'
    });
    
    return sections;
  }

  forceUpdateCartDrawer() {
    let sections = this.getSectionsToRender().map(section => section.section).join(',');
    if(window.isCartPage) {
      sections += `,${window.cartFooterSectionId},${window.cartItemsSectionId}`;
    }

    fetch(`${routes.cart_url}?sections=${sections}`)
    .then((response) => {
      return response.text();
    })
    .then((state) => {
      const parsedState = JSON.parse(state);
      let sectionsToRender = this.getSectionsToRender();
      if(window.isCartPage) {
        sectionsToRender = sectionsToRender.concat([{
          id: window.cartFooterSectionId,
          section: window.cartFooterSectionId,
          selector: '.js-contents',
        }, {
          id: window.cartItemsSectionId,
          section: window.cartItemsSectionId,
          selector: '.cart__contents',
        }]);
      }
      sectionsToRender.forEach((section) => {
        if(section.section === 'cart-drawer') {
          document.querySelector('cart-drawer').updateWearWith(parsedState['cart-drawer']);
        }
        const elementToReplace = document.getElementById(section.id)?.querySelector(section.selector) || document.getElementById(section.id) || document.querySelector("[data-id='" + section.section + "']");
        if(!elementToReplace) return; // Skip only this iteration, continue with next
        elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState[section.section], section.selector);
      });
    });
  }

  updateQuantity(line, quantity, name) {
    this.enableLoading(line);

    let sections = this.getSectionsToRender().map((section) => section.section).join(',');
    if(window.isCartPage) {
      sections += `,${window.cartFooterSectionId},${window.cartItemsSectionId}`;
    }

    const body = JSON.stringify({
      line,
      quantity,
      sections: sections,
      sections_url: window.location.pathname
    });
    if(line){
      fetch(`${routes.cart_change_url}`, {...fetchConfig(), ...{ body }})
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          updateCart();
          // return;
          const parsedState = JSON.parse(state);

          if(location.pathname.includes('/cart')) {
            this.forceUpdateCartDrawer();
            return;
          }
          if (!parsedState.sections) {
            this.forceUpdateCartDrawer();
            return;
          }

          this.classList.toggle('is-empty', parsedState.item_count === 0);
          const cartDrawerWrapper = document.querySelector('cart-drawer');
          const cartFooter = document.getElementById('main-cart-footer');
  
          // if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
          // if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);
  
          let sectionsToRender = this.getSectionsToRender();
          if(window.isCartPage) {
            sectionsToRender = sectionsToRender.concat([{
              id: window.cartFooterSectionId,
              section: window.cartFooterSectionId,
              selector: '.js-contents',
            }, {
              id: window.cartItemsSectionId,
              section: window.cartItemsSectionId,
              selector: '.cart__contents',
            }]);
          }
          sectionsToRender.forEach((section => {
            const elementToReplace = document.getElementById(section?.id).querySelector(section.selector) || document.getElementById(section.id);
            if(!elementToReplace) return true;
            elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          }));
  
          BOLD.common.themeCartCallback = function(){
            let sections = (this.getSectionsToRender().map((section) => section.section)).join();
            fetch(`/?sections=${sections}`, {
              method: 'GET',
            })
            .then((response) => {
              return response.text();
            })
            .then((state) => {
              const pState = JSON.parse(state);
              this.getSectionsToRender().forEach((section => {
                const elementToReplace =
                document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
                elementToReplace.innerHTML =
                this.getSectionInnerHTML(pState[section.section], section.selector);
              }));
            })
          }.bind(this);
          
          BOLD.common.eventEmitter.emit("BOLD_COMMON_cart_loaded", parsedState);parsedState.items.forEach(function(item){
            if(item.product_type && item.product_type.includes("HIDDEN_PRODUCT"))
            parsedState.item_count = parsedState.item_count - item.quantity;
          });
          
          this.updateLiveRegions(line, parsedState.item_count);
          const lineItem =  document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
          if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
            cartDrawerWrapper ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`)) : lineItem.querySelector(`[name="${name}"]`).focus();
          } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'))
          } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
            trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'))
          }
  
          if(this.localName === 'cart-drawer-items') {
            const drawerDoc = new DOMParser().parseFromString(parsedState.sections['cart-drawer'], 'text/html');
            const newWearWith = drawerDoc.querySelector('.wear-with__desktop');
            const oldWearWith = document.querySelector('.wear-with__desktop');
            if(newWearWith && oldWearWith) {
              oldWearWith.innerHTML = newWearWith.innerHTML;
              document.querySelector('cart-drawer').wearWith();
            }
          }
  
          this.disableLoading();
          (typeof window.BOLD !== 'undefined' && typeof window.BOLD.common !== 'undefined' && typeof window.BOLD.common.eventEmitter !== 'undefined' && typeof window.BOLD.common.eventEmitter.emit !== 'undefined' && (BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded')));
          
        }).catch((error) => {
          console.log(error);
          this.querySelectorAll('.loading-overlay').forEach((overlay) => overlay.classList.add('hidden'));
          const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
          errors.textContent = window.cartStrings.error;
          this.disableLoading();
        }).finally(() => {
          // Check GWP thresholds after cart update is complete
          if (typeof GWPCartManager !== 'undefined') {
            if (!window.gwpCartManager) {
              window.gwpCartManager = new GWPCartManager();
            }
            if (window.gwpCartManager && typeof window.gwpCartManager.checkGWPThresholds === 'function') {
              // Use setTimeout to ensure DOM updates are complete
              setTimeout(() => {
                window.gwpCartManager.checkGWPThresholds();
              }, 100);
            }
          }
        });
    }else{
      this.disableLoading();
    }
  }

  updateLiveRegions(line, itemCount) {
    if (this.currentItemCount === itemCount) {
      const lineItemError = document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
      const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);

      lineItemError
        .querySelector('.cart-item__error-text')
        .innerHTML = window.cartStrings.quantityError.replace(
          '[quantity]',
          quantityElement.value
        );
    }

    this.currentItemCount = itemCount;
    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus = document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
      (typeof window.BOLD !== 'undefined' && typeof window.BOLD.common !== 'undefined' && typeof window.BOLD.common.eventEmitter !== 'undefined' && typeof window.BOLD.common.eventEmitter.emit !== 'undefined' && (BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded')));
}, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading-overlay`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading-overlay`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading() {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');
  }
}
customElements.define('cart-items', CartItems);



if (!customElements.get('cart-note')) {
  customElements.define('cart-note', class CartNote extends HTMLElement {
    constructor() {
      super();

      this.addEventListener('change', debounce((event) => {
        const body = JSON.stringify({ note: event.target.value });
        fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }});
      }, 300))
    }
  });
};

if (!customElements.get('canvas-bag')) {
  customElements.define('canvas-bag', class CanvasBag extends HTMLElement {
    constructor() {
      super();

      this.variantId = this.getAttribute("variant-id");

      console.log("canvas-bag this.variantId", this.variantId);

      this.cartItems = document.querySelector("cart-drawer-items");
      this.cartDrawer = document.querySelector('cart-drawer');

      this.addEventListener('change', debounce((event) => {
        const quantity = parseFloat(this.querySelector('.quantity__input').value);

        let updates = {};

        updates[this.variantId] = quantity;

        const body = JSON.stringify({
          updates: updates,
          sections: this.cartItems.getSectionsToRender().map((section) => section.section),
          sections_url: window.location.pathname
        });

        fetch(`${routes.cart_update_url}`, {...fetchConfig(), ...{ body }})
          .then(response => response.json())
          .then(data => {
            this.cartDrawer.renderContents(data)
          })
          .catch(error => console.log(error));
      }, 300));
    }
  });
};