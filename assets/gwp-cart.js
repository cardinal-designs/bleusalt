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

class GWPCartManager {
  constructor() {
    this.gwpProducts = [];
    this.init();
  }

  init() {
    // Get GWP settings from the page
    this.loadGWPSettings();
    
    // Listen for cart updates
    document.addEventListener('cart:updated', () => {
      setTimeout(() => this.checkGWPThresholds(), 300);
    });

    // Listen for cart drawer updates
    const cartDrawer = document.querySelector('cart-drawer');
    if (cartDrawer) {
      cartDrawer.addEventListener('cart:updated', () => {
        setTimeout(() => this.checkGWPThresholds(), 500);
      });
    }
    
    // Listen for quantity changes in cart items
    const cartDrawerItems = document.querySelector('cart-drawer-items');
    if (cartDrawerItems) {
      cartDrawerItems.addEventListener('change', debounce(() => {
        setTimeout(() => this.checkGWPThresholds(), 500);
      }, 500));
    }

    // Handle add button clicks
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('gwp-upsell__add-button') || e.target.closest('.gwp-upsell__add-button')) {
        e.preventDefault();
        const button = e.target.classList.contains('gwp-upsell__add-button') ? e.target : e.target.closest('.gwp-upsell__add-button');
        this.addGWPProduct(button);
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
    const cartTotal = await this.getCartTotal();
    
    // Get current cart items
    const cartResponse = await fetch('/cart.js');
    const cart = await cartResponse.json();
    
    // Find all GWP items in cart (items with _gwp property)
    const gwpItemsInCart = cart.items.filter(item => 
      item.properties && 
      item.properties._gwp === 'true'
    );
    
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
      
      // If cart total is below threshold and threshold is valid, remove the GWP product
      if (threshold > 0 && cartTotal < threshold) {
        await this.removeGWPProduct(cartItem.product_id, cart);
        // Return after removing to avoid multiple removals in one cycle
        // The cart update will trigger another check
        return;
      }
    }
  }

  async addGWPProduct(button) {
    const productId = button.dataset.productId;
    const variantSelect = button.closest('.gwp-upsell__item').querySelector('.gwp-upsell__variant-select');
    const variantId = variantSelect ? parseInt(variantSelect.value) : null;

    if (!variantId) {
      console.error('No variant selected');
      return;
    }

    const buttonText = button.querySelector('.gwp-upsell__button-text') || button;
    const originalText = buttonText.innerHTML;
    
    button.disabled = true;
    if (buttonText) {
      buttonText.innerHTML = 'Adding...';
    } else {
      button.textContent = 'Adding...';
    }

    try {
      // Get cart drawer items to access getSectionsToRender method
      const cartDrawerItems = document.querySelector('cart-drawer-items');
      const sections = cartDrawerItems && cartDrawerItems.getSectionsToRender 
        ? cartDrawerItems.getSectionsToRender().map((section) => section.section).join(',')
        : 'cart-drawer,cart-icon-bubble';

      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: 1,
            properties: {
              '_gwp': 'true',
              '_gwp_threshold': button.dataset.threshold
            }
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
        } else {
          // Fallback to forceUpdateCartDrawer
          if (cartDrawerItems && cartDrawerItems.forceUpdateCartDrawer) {
            cartDrawerItems.forceUpdateCartDrawer();
          } else if (typeof updateCart === 'function') {
            updateCart();
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
      button.disabled = false;
      if (buttonText) {
        buttonText.innerHTML = originalText;
      } else {
        button.textContent = 'Add Free Gift';
      }
    }
  }

  async removeGWPProduct(productId, cart) {
    // Find the line item for this GWP product
    const gwpItem = cart.items.find(item => 
      item.product_id === productId && 
      item.properties && 
      item.properties._gwp === 'true'
    );

    if (!gwpItem) return;

    try {
      const cartDrawerItems = document.querySelector('cart-drawer-items');
      const sections = cartDrawerItems && cartDrawerItems.getSectionsToRender 
        ? cartDrawerItems.getSectionsToRender().map((section) => section.section).join(',')
        : 'cart-drawer,cart-icon-bubble';

      const response = await fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          line: gwpItem.key,
          quantity: 0,
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
            return;
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
        
        // Trigger cart update event
        document.dispatchEvent(new CustomEvent('cart:updated'));
      }
    } catch (error) {
      console.error('Error removing GWP product:', error);
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

