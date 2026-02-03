/**
 * GWP (Gift With Purchase) Cart Management
 * Handles automatic add/remove of free gifts based on cart thresholds
 */

// Debounce helper function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

window.isCartPage = window.location.pathname === '/cart' || window.location.pathname.includes('/cart');
if (window.isCartPage) {
  let mainCartFooter = document.getElementById('main-cart-footer');
  let mainCartItems = document.getElementById('main-cart-items');
  if(mainCartFooter){
    window.cartFooterSectionId = mainCartFooter.dataset.id;
  }
  if(mainCartItems){
    window.cartItemsSectionId = mainCartItems.dataset.id;
  }
}

class GWPCartManager {
  constructor() {
    this.gwpProducts = [];
    this.isAdding = false; // Flag to prevent multiple simultaneous add operations
    this.init();
  }

  init() {
    // Get GWP settings from the page
    this.loadGWPSettings();
    
    // Listen for cart updates
    // document.addEventListener('cart:updated', () => {
    //   setTimeout(() => this.checkGWPThresholds(), 300);
    // });

    // // Listen for cart drawer updates
    // const cartDrawer = document.querySelector('cart-drawer');
    // if (cartDrawer) {
    //   cartDrawer.addEventListener('cart:updated', () => {
    //     setTimeout(() => this.checkGWPThresholds(), 500);
    //   });
    // }
    
    // Listen for quantity changes in cart items
    // const cartDrawerItems = document.querySelector('cart-drawer-items');
    // if (cartDrawerItems) {
    //   cartDrawerItems.addEventListener('change', debounce(() => {
    //     setTimeout(() => this.checkGWPThresholds(), 500);
    //   }, 500));
    // }

    // Handle add button clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gwp-upsell__add-button') || e.target.closest('.gwp-upsell__add-button')) {
        e.preventDefault();
        e.stopPropagation();
        const button = e.target.classList.contains('gwp-upsell__add-button') ? e.target : e.target.closest('.gwp-upsell__add-button');
        
        // Check if this is a collection GWP button that needs to show variants first
        // if (button.classList.contains('collection-gwp-toggle-variants')) {
        //   const variantsContainer = button.closest('.gwp-upsell__item').querySelector('.collection-gwp-variants');
        //   if (variantsContainer) {
        //     // Check if variants are currently hidden (handle inline style, empty string, or computed style)
        //     const computedStyle = window.getComputedStyle(variantsContainer);
        //     const isHidden = variantsContainer.style.display === 'none' || 
        //                     variantsContainer.style.display === '' ||
        //                     computedStyle.display === 'none';
            
        //     if (isHidden) {
        //       // Show variant selection
        //       variantsContainer.style.display = 'block';
        //       const buttonText = button.querySelector('.gwp-upsell__button-text');
        //       if (buttonText) {
        //         buttonText.textContent = 'ADD FREE GIFT';
        //       }
        //       // Update button's variant-id based on selected variant
        //       const variantSelect = variantsContainer.querySelector('.gwp-upsell__variant-select');
        //       if (variantSelect) {
        //         button.dataset.variantId = variantSelect.value;
        //       }
        //       // Remove the toggle class so next click will add to cart
        //       button.classList.remove('collection-gwp-toggle-variants');
        //       return; // Don't add product yet, just show variants
        //     }
        //     // Variants are already visible, so proceed to add product (fall through)
        //     // Remove the class to prevent this check on future clicks
        //     button.classList.remove('collection-gwp-toggle-variants');
        //   }
        // }
        
        // Prevent multiple clicks
        if (button.disabled || this.isAdding) {
          return;
        }
        this.addGWPProduct(button);
      }

      if (e.target.classList.contains('collection-gwp-toggle-variants') || e.target.closest('.collection-gwp-toggle-variants')) {
        e.preventDefault();
        e.stopPropagation();
        let button = e.target.classList.contains('collection-gwp-toggle-variants') ? e.target : e.target.closest('.collection-gwp-toggle-variants');
        let gwpUpsellDetails = e.target.closest('.gwp-upsell__details');
        button.classList.add('hidden');
        if(gwpUpsellDetails){
          let buttonAtc = gwpUpsellDetails.querySelector('.gwp-upsell__add-button');
          if(buttonAtc){
            buttonAtc.classList.remove('hidden');
          }
        }
        let variantsContainer = button.closest('.gwp-upsell__item').querySelector('.collection-gwp-variants');
        if (variantsContainer) {
          variantsContainer.style.display = 'block';
        }
      }
    });
    
    // Handle variant selection changes for collection GWP
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('gwp-upsell__variant-select') && e.target.closest('.collection-gwp-variants')) {
        const button = e.target.closest('.gwp-upsell__item').querySelector('.collection-gwp-toggle-variants');
        if (button) {
          button.dataset.variantId = e.target.value;
        }
      }
    });

    // Initial check
    setTimeout(() => this.checkGWPThresholds(), 500);
  }

  loadGWPSettings() {
    // Get GWP items from settings (we'll need to pass these via data attributes)
    const gwpBar = document.querySelector('.gwp-bar');
    if (!gwpBar) return;

    // Get thresholds from data attributes or settings
    const items = document.querySelectorAll('.gwp-bar__item');
    items.forEach((item, index) => {
      const threshold = parseFloat(item.dataset.threshold) || 0;
      if (threshold > 0) {
        this.gwpProducts.push({
          index: index + 1,
          threshold: threshold
        });
      }
    });
  }

  async getCartTotal() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      return cart.total_price / 100;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return 0;
    }
  }

  async getGWPProductIds() {
    const gwpItems = document.querySelectorAll('.gwp-upsell__item');
    const productIds = [];
    gwpItems.forEach(item => {
      const productId = item.dataset.productId;
      if (productId) {
        productIds.push(parseInt(productId));
      }
    });
    return productIds;
  }

  async checkGWPThresholds() {

    // Get current cart items
    const cartResponse = await fetch('/cart.js');
    const cart = await cartResponse.json();
    
    // Find all GWP items in cart (items with _gwp property)
    const gwpItemsInCart = cart.items.filter(item => 
      item.properties && 
      item.properties._gwp === 'true'
    );

    let cartTotalWithoutGWP = cart.original_total_price / 100;
    for (const cartItem of cart.items) {
      if (cartItem.properties && cartItem.properties._gwp === 'true') {
        cartTotalWithoutGWP -= cartItem.price / 100 * cartItem.quantity;
      }
    }
    
    // Check each GWP item in cart
    for (const cartItem of gwpItemsInCart) {
      let threshold = 0;
      
      // First, try to get threshold from item properties (stored when added)
      if (cartItem.properties._gwp_threshold) {
        threshold = parseFloat(cartItem.properties._gwp_threshold) || 0;
      }
      
      // If no threshold in properties, try to find it from DOM
      if (threshold === 0) {
        // Try to find matching upsell item
        const upsellItem = document.querySelector(`.gwp-upsell__item[data-product-id="${cartItem.product_id}"]`);
        if (upsellItem && upsellItem.dataset.threshold) {
          threshold = parseFloat(upsellItem.dataset.threshold) || 0;
        } else {
          // Try to find from GWP bar items
          const gwpBarItems = document.querySelectorAll('.gwp-bar__item[data-threshold]');
          for (const barItem of gwpBarItems) {
            const barThreshold = parseFloat(barItem.dataset.threshold) || 0;
            // Check if there's a matching upsell item for this threshold and product
            const matchingUpsell = document.querySelector(`.gwp-upsell__item[data-threshold="${barThreshold}"][data-product-id="${cartItem.product_id}"]`);
            if (matchingUpsell) {
              threshold = barThreshold;
              break;
            }
          }
        }
      }

      if (threshold > 0 && cartTotalWithoutGWP < threshold) {
        await this.removeGWPProduct(cartItem, cart);
        continue; // Skip to next item
      }

      // Check if this is a collection-based GWP item
      const isCollectionGWP = cartItem.properties._gwp_type === 'collection';
      if (isCollectionGWP) {
        // Get values from hidden inputs (they are strings, so convert to boolean)
        const keepGwpProductInput = document.querySelector('input[name="keep_gwp_product"]');
        const hasTriggerProductInput = document.querySelector('input[name="has_trigger_product"]');
        
        if (keepGwpProductInput && hasTriggerProductInput) {
          // Convert string values to booleans
          const keepGwpProduct = keepGwpProductInput.value === 'true';
          const hasTriggerProduct = hasTriggerProductInput.value === 'true';
          // If keepGwpProduct is false AND hasTriggerProduct is false, remove the GWP item
          if (!keepGwpProduct && !hasTriggerProduct) {
            const removeResult = await this.removeGWPProduct(cartItem, cart);
          }
        }
      }
    }
  }

  async addGWPProduct(button) {
    // Prevent multiple simultaneous calls
    if (this.isAdding) {
      return;
    }

    // Check if button is already disabled
    if (button.disabled) {
      return;
    }

    const productId = button.dataset.productId;
    if (!productId) {
      console.error('No product selected');
      return;
    }

      const variantSelect = button.closest('.gwp-upsell__item').querySelector('.gwp-upsell__variant-select');
      const variantId = variantSelect ? parseInt(variantSelect.value) : null;
      if (!variantId) {
        console.error('No variant selected');
        return;
      }

      // Check if this is a collection-based GWP
      const gwpUpsellContainer = button.closest('.gwp-upsell');
      const isCollectionGWP = gwpUpsellContainer && gwpUpsellContainer.classList.contains('collection-gwp-upsell');

      // Disable button immediately to prevent multiple clicks
      const buttonText = button.querySelector('.gwp-upsell__button-text') || button;
      const originalText = buttonText.innerHTML;
      button.disabled = true;
      this.isAdding = true;
      
      if (buttonText) {
        buttonText.innerHTML = 'Adding...';
      } else {
        button.textContent = 'Adding...';
      }

      try {
        const cartResponse = await fetch('/cart.js');
        const cart = await cartResponse.json();
        
        // Check if any variant of the same product with GWP properties already exists in cart
        const existingGWPItem = cart.items.find(item => 
          item.product_id === parseInt(productId) && 
          item.properties && 
          item.properties._gwp === 'true'
        );
        
        if (existingGWPItem) {
          // Product already exists with GWP properties (any variant), don't add again
          this.isAdding = false;
          button.disabled = false;
          if (buttonText) {
            buttonText.innerHTML = originalText;
          } else {
            button.textContent = 'Add Free Gift';
          }
          return false;
        }
      // Get cart drawer items to access getSectionsToRender method
      const cartDrawerItems = document.querySelector('cart-drawer-items');
      let sections = cartDrawerItems && cartDrawerItems.getSectionsToRender 
        ? cartDrawerItems.getSectionsToRender().map((section) => section.section).join(',')
        : 'cart-drawer,cart-icon-bubble,main-cart-footer,main-cart-items';
      
      // If on cart page, add cart page sections
      let isCartPage = window.location.pathname === '/cart' || window.location.pathname.includes('/cart');
      if (isCartPage) {
        // let mainCartFooter = document.getElementById('main-cart-footer');
        // let mainCartItems = document.getElementById('main-cart-items');
        // if(mainCartFooter){
        //   let sectionId = mainCartFooter.dataset.id;
        //   if(sectionId){
        //     sections += `,${sectionId}`;
        //   }
        // }
        // if(mainCartItems){
        //   let sectionId = mainCartItems.dataset.id;
        //   if(sectionId){
        //     sections += `,${sectionId}`;
        //   }
        // }
        sections += `,${window.cartFooterSectionId},${window.cartItemsSectionId}`;
      }

      // Build properties object
      const properties = {
        '_gwp': 'true'
      };
      
      if (isCollectionGWP) {
        properties['_gwp_type'] = 'collection';
        properties['_gwp_threshold'] = button.dataset.threshold || 0;
      } else {
        properties['_gwp_threshold'] = button.dataset.threshold;
      }

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: 1,
            properties: properties
          }],
          sections: sections
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Call updateCart function if available
        if (typeof updateCart === 'function') {
          updateCart();
        }
        
        // Update cart drawer using the same pattern as cart.js
        if (cartDrawerItems && cartDrawerItems.getSectionsToRender) {
          const parsedState = { sections: {} };
          
          // If response includes sections, use them
          if (data.sections) {
            Object.keys(data.sections).forEach(sectionId => {
              parsedState.sections[sectionId] = data.sections[sectionId];
            });
          }
          
          // Otherwise fetch sections
          if (!parsedState.sections || Object.keys(parsedState.sections).length === 0) {
            const sectionsResponse = await fetch(`${routes.cart_url}?sections=${sections}`);
            const sectionsText = await sectionsResponse.text();
            const sectionsData = JSON.parse(sectionsText);
            Object.keys(sectionsData).forEach(sectionId => {
              parsedState.sections[sectionId] = sectionsData[sectionId];
            });
          }
          
          // Update each section
          cartDrawerItems.getSectionsToRender().forEach((section) => {
            const elementToReplace = document.getElementById(section.id)?.querySelector(section.selector) || document.getElementById(section.id);
            if (!elementToReplace || !parsedState.sections[section.section]) return;
            
            if (cartDrawerItems.getSectionInnerHTML) {
              elementToReplace.innerHTML = cartDrawerItems.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            } else {
              const doc = new DOMParser().parseFromString(parsedState.sections[section.section], 'text/html');
              const newContent = doc.querySelector(section.selector);
              if (newContent) {
                elementToReplace.innerHTML = newContent.innerHTML;
              }
            }
          });
          
          // Handle cart drawer specific updates
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer && parsedState.sections['cart-drawer']) {
            if (cartDrawer.updateWearWith) {
              cartDrawer.updateWearWith(parsedState.sections['cart-drawer']);
            }
          }
          
          // Emit BOLD events if available
          if (typeof window.BOLD !== 'undefined' && 
              window.BOLD.common && 
              window.BOLD.common.eventEmitter && 
              typeof window.BOLD.common.eventEmitter.emit === 'function') {
            window.BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded', data);
          }
          
          // Update cart page sections if on cart page
          const isCartPage = window.location.pathname === '/cart' || window.location.pathname.includes('/cart');

          if (isCartPage && parsedState.sections) {
            // Update cart footer
            const cartFooterSection = window.cartFooterSectionId;
            if (parsedState.sections[cartFooterSection]) {
              const cartFooter = document.getElementById('main-cart-footer');
              if (cartFooter) {
                const footerContent = cartFooter.querySelector('.js-contents');
                if (footerContent) {
                  const doc = new DOMParser().parseFromString(parsedState.sections[cartFooterSection], 'text/html');
                  const newFooterContent = doc.querySelector('.js-contents');
                  if (newFooterContent) {
                    footerContent.innerHTML = newFooterContent.innerHTML;
                  }
                }
              }
            }
            
            // Update cart items
            const cartItemsSection = window.cartItemsSectionId;
            if (parsedState.sections[cartItemsSection]) {
              const cartItems = document.getElementById('main-cart-items');
              if (cartItems) {
                const itemsContent = cartItems.querySelector('.js-contents');
                if (itemsContent) {
                  const doc = new DOMParser().parseFromString(parsedState.sections[cartItemsSection], 'text/html');
                  const newItemsContent = doc.querySelector('.js-contents');
                  if (newItemsContent) {
                    itemsContent.innerHTML = newItemsContent.innerHTML;
                  }
                }
              }
            }
          }
        } else {
          // Fallback to forceUpdateCartDrawer
          if (cartDrawerItems && cartDrawerItems.forceUpdateCartDrawer) {
            cartDrawerItems.forceUpdateCartDrawer();
          } else if (typeof updateCart === 'function') {
            updateCart();
          }
          
          // Update cart page sections if on cart page (fallback using data.sections)
          const isCartPage = window.location.pathname === '/cart' || window.location.pathname.includes('/cart');
          if (isCartPage && data && data.sections) {
            // Update cart footer
            const cartFooterSection = window.cartFooterSectionId;
            if (data.sections[cartFooterSection]) {
              const cartFooter = document.getElementById('main-cart-footer');
              if (cartFooter) {
                const footerContent = cartFooter.querySelector('.js-contents');
                if (footerContent) {
                  const doc = new DOMParser().parseFromString(data.sections[cartFooterSection], 'text/html');
                  const newFooterContent = doc.querySelector('.js-contents');
                  if (newFooterContent) {
                    footerContent.innerHTML = newFooterContent.innerHTML;
                  }
                }
              }
            }
            
            // Update cart items
            const cartItemsSection = window.cartItemsSectionId;
            if (data.sections[cartItemsSection]) {
              const cartItems = document.getElementById('main-cart-items');
              if (cartItems) {
                const itemsContent = cartItems.querySelector('.js-contents');
                if (itemsContent) {
                  const doc = new DOMParser().parseFromString(data.sections[cartItemsSection], 'text/html');
                  const newItemsContent = doc.querySelector('.js-contents');
                  if (newItemsContent) {
                    itemsContent.innerHTML = newItemsContent.innerHTML;
                  }
                }
              }
            }
          }
        }
        
        // Trigger cart update event
        document.dispatchEvent(new CustomEvent('cart:updated'));
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.description || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding GWP product:', error);
      alert('Unable to add free gift. Please try again.');
    } finally {
      this.isAdding = false;
      button.disabled = false;
      if (buttonText) {
        buttonText.innerHTML = originalText;
      } else {
        button.textContent = 'Add Free Gift';
      }
    }
  }

  async removeGWPProduct(cartItem, cart) {
    // Validate cart item
    if (!cartItem || !cartItem.key) {
      console.error('Invalid cart item for removal - cartItem:', cartItem, 'key:', cartItem?.key);
      return false;
    }

    // Verify it's a GWP item
    if (!cartItem.properties || cartItem.properties._gwp !== 'true') {
      console.error('Item is not a GWP product - properties:', cartItem.properties);
      return false;
    }

    try {
      const cartDrawerItems = document.querySelector('cart-drawer-items');
      let sections = cartDrawerItems && cartDrawerItems.getSectionsToRender 
        ? cartDrawerItems.getSectionsToRender().map((section) => section.section).join(',')
        : 'cart-drawer,cart-icon-bubble,main-cart-footer,main-cart-items';
      
      // If on cart page, add cart page sections
      const isCartPage = window.location.pathname === '/cart' || window.location.pathname.includes('/cart');
      if (isCartPage) {
        sections += `,${window.cartFooterSectionId},${window.cartItemsSectionId}`;
      }

      const response = await fetch('/cart/update.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates: {
            [cartItem.key]: 0
          },
          sections: sections,
          sections_url: window.location.pathname
        })
      });

      if (response.ok) {
        const state = await response.text();
        const parsedState = JSON.parse(state);
        
        // Call updateCart function if available
        if (typeof updateCart === 'function') {
          updateCart();
        }
        
        // Update cart drawer using the same pattern as cart.js
        if (cartDrawerItems && cartDrawerItems.getSectionsToRender) {
          if (!parsedState.sections) {
            // Fallback to forceUpdateCartDrawer if no sections
            if (cartDrawerItems.forceUpdateCartDrawer) {
              cartDrawerItems.forceUpdateCartDrawer();
            }
            // Trigger cart update event even if no sections
            document.dispatchEvent(new CustomEvent('cart:updated'));
            return true;
          }

          cartDrawerItems.classList.toggle('is-empty', parsedState.item_count === 0);
          
          cartDrawerItems.getSectionsToRender().forEach((section) => {
            const elementToReplace = document.getElementById(section.id)?.querySelector(section.selector) || document.getElementById(section.id);
            if (!elementToReplace || !parsedState.sections[section.section]) return;
            
            if (cartDrawerItems.getSectionInnerHTML) {
              elementToReplace.innerHTML = cartDrawerItems.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
            } else {
              const doc = new DOMParser().parseFromString(parsedState.sections[section.section], 'text/html');
              const newContent = doc.querySelector(section.selector);
              if (newContent) {
                elementToReplace.innerHTML = newContent.innerHTML;
              }
            }
          });
          
          // Handle cart drawer specific updates
          const cartDrawer = document.querySelector('cart-drawer');
          if (cartDrawer && parsedState.sections['cart-drawer']) {
            if (cartDrawer.updateWearWith) {
              cartDrawer.updateWearWith(parsedState.sections['cart-drawer']);
            }
          }
          
          // Emit BOLD events if available
          if (typeof window.BOLD !== 'undefined' && 
              window.BOLD.common && 
              window.BOLD.common.eventEmitter && 
              typeof window.BOLD.common.eventEmitter.emit === 'function') {
            window.BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded', parsedState);
          }
        } else {
          // Fallback
          if (cartDrawerItems && cartDrawerItems.forceUpdateCartDrawer) {
            cartDrawerItems.forceUpdateCartDrawer();
          } else if (typeof updateCart === 'function') {
            updateCart();
          }
        }
        
        // Update cart page sections if on cart page
        const isCartPage = window.location.pathname === '/cart' || window.location.pathname.includes('/cart');
        if (isCartPage && parsedState.sections) {
          // Update cart footer
          const cartFooterSection = window.cartFooterSectionId;
          if (parsedState.sections[cartFooterSection]) {
            const cartFooter = document.getElementById('main-cart-footer');
            if (cartFooter) {
              const footerContent = cartFooter.querySelector('.js-contents');
              if (footerContent) {
                const doc = new DOMParser().parseFromString(parsedState.sections[cartFooterSection], 'text/html');
                const newFooterContent = doc.querySelector('.js-contents');
                if (newFooterContent) {
                  footerContent.innerHTML = newFooterContent.innerHTML;
                }
              }
            }
          }
          
          // Update cart items
          const cartItemsSection = window.cartItemsSectionId;
          if (parsedState.sections[cartItemsSection]) {
            const cartItems = document.getElementById('main-cart-items');
            if (cartItems) {
              const itemsContent = cartItems.querySelector('.js-contents');
              if (itemsContent) {
                const doc = new DOMParser().parseFromString(parsedState.sections[cartItemsSection], 'text/html');
                const newItemsContent = doc.querySelector('.js-contents');
                if (newItemsContent) {
                  itemsContent.innerHTML = newItemsContent.innerHTML;
                }
              }
            }
          }
        }
      
        // Trigger cart update event
        document.dispatchEvent(new CustomEvent('cart:updated'));
        return true;
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Failed to remove GWP product - response not ok:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('Error removing GWP product:', error);
      return false;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GWPCartManager();
  });
} else {
  new GWPCartManager();
}

// Also initialize after cart drawer updates
document.addEventListener('cart-drawer:updated', () => {
  setTimeout(() => {
    if (!window.gwpCartManager) {
      window.gwpCartManager = new GWPCartManager();
    }
  }, 500);
});

