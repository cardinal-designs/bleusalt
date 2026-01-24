const inchesToCentimeters = () => {
  if (window.location.href.indexOf('babybleu') > -1) return;
  const tables = document.querySelectorAll('table[data-in-to-cm]');
  tables.forEach((table) => {
    const buttonHtml = `
      <button class="btn--link size-conversion-link set-to-in active">Inches</button>
      <button class="btn--link size-conversion-link set-to-cm">Centimeters</button>
    `;
    const buttons = document.createElement('div');
    buttons.innerHTML = buttonHtml;
    buttons.classList.add('size-conversion-links');
    table.parentNode.insertBefore(buttons, table);
    const tableTds = table.querySelectorAll('tr:not(:first-child) td:not(:first-child)');
    tableTds.forEach((td) => {
      if (td.classList.contains('no-conversion')) return true;
      td.setAttribute('data-original-val', td.textContent);
      td.classList.add('swappable');
    });
  });
  const sizeConversionLinks = document.querySelectorAll('.size-conversion-link');
  sizeConversionLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const table = event.target.parentNode.nextSibling;
      const swappableElements = table.querySelectorAll('.swappable');

      document.querySelector('table[data-in-to-cm]').classList.remove("hidden");      
      sizeConversionLinks.forEach((link) => {
        link.classList.remove('active');
      });
      event.target.classList.add('active');
      if (event.target.classList.contains('set-to-cm')) {
        swappableElements.forEach((element) => {
          const originalVal = parseFloat(element.getAttribute('data-original-val'));
          element.textContent = Math.round(originalVal * 2.54);
        });
        const headings = table.querySelectorAll('td');
        headings.forEach((heading) => {
          heading.textContent = heading.textContent.replace('in', 'cm');
        });
      } else {
        swappableElements.forEach((element) => {
          const originalVal = parseFloat(element.getAttribute('data-original-val'));
          element.textContent = originalVal;
        });
        const headings = table.querySelectorAll('td');
        headings.forEach((heading) => {
          heading.textContent = heading.textContent.replace('cm', 'in');
        });
      }
    });
  });
};

window.addEventListener('load', (event) => {
  inchesToCentimeters();
});


if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));

      
      
      this.cart = document.querySelector('cart-drawer');
      this.submitButton = this.querySelector('[type="submit"]');
      if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');
    }

    onSubmitHandler(evt) {
      evt.preventDefault();

      let emailInput = document.getElementById("Recipient__email");
      let giftCheckbox = document.getElementById("toggle-gift-fields");
      if(emailInput && giftCheckbox.checked){
        let emailError = document.getElementById("emailError");
        let emailValue = emailInput.value.trim();
        let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (emailValue === "") {
            emailError.textContent = "Email is required.";
            emailInput.style.border = "1px solid red";
            return;
        } else if (!emailPattern.test(emailValue)) {
            emailError.textContent = "Please enter a valid email address.";
            emailInput.style.border = "1px solid red";
            return;
        } else { 
            emailError.textContent = "";
            emailInput.style.border = "1px solid rgb(13 28 41 / 55%)";
        } 
      }
      
      if(this.submitButton.getAttribute('data-join-list')){
        let klaviyoBisWrapper = this.querySelector('.klaviyo-bis__wrapper');
        if (klaviyoBisWrapper) {
          klaviyoBisWrapper.style.setProperty('display', 'block', 'important');
        }
        return;
      }

      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);
      if (this.cart) {
        formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
        formData.append('sections_url', window.location.pathname);
        this.cart.setActiveElement(document.activeElement);
      }
      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);
            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          this.error = false;
          const quickAddModal = this.closest('quick-add-modal');

          if (quickAddModal) {
            document.body.addEventListener('modalClosed', () => {
              setTimeout(() => { this.cart.renderContents(response) });
            }, { once: true });
            quickAddModal.hide(true);
          } else {
            this.cart.renderContents(response);
            // this.cart.forceUpdateCartDrawer();
          }
          document.querySelector('cart-drawer').open();

          if (window.BOLD && BOLD.common && BOLD.common.eventEmitter && typeof BOLD.common.eventEmitter.emit === 'function'){
            BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded');
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');

          if (window.BOLD && BOLD.common && BOLD.common.eventEmitter && typeof BOLD.common.eventEmitter.emit === 'function'){
            BOLD.common.eventEmitter.emit('BOLD_COMMON_cart_loaded');
          }
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.currentVariant = window.currentVariant;
    this.addEventListener('change', this.onVariantChange.bind(this));
    this.updateOptions();
    this.updateOtherOptions(true);
    this.backInStock();
    this.showVariantImages();
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.updateQuantityAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      // this.updateMedia();
      this.showVariantImages();
      this.updateCurrentValues();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
      this.updateShareUrl();
      this.updatePaymentPlans();
      this.updateOtherOptions();
      this.sendEvent();
      this.backInStock();
      this.updateButton();
    }
  }

  updateButton() {
    const productSubmitButtons = document.querySelectorAll('.product-form__submit');
    productSubmitButtons.forEach(button => {
      if(this.currentVariant.available) {
        button.removeAttribute('disabled')
        button.querySelector('span').textContent = window.variantStrings.addToCart;
        if (button.hasAttribute('data-join-list')) {
          button.removeAttribute('data-join-list'); // Remove the attribute
          console.log(1)
        }
      } else {
        // button.disabled = true;
        console.log(2)
        button.setAttribute('data-join-list', 'true');
        button.style.display = 'block';
        button.querySelector('span').textContent = 'Join The Waitlist';
      }
      // console.log(this.currentVariant.available);
    });
  }
  sendEvent(event) {
    document.dispatchEvent(new CustomEvent('variant:changed', { detail: this.currentVariant }));
  }

  updateOtherOptions(initial = false) {

    const optionIndex = initial ? 0 : parseFloat(event.target.closest('.product-form__input--dropdown').getAttribute('data-option-index'));

    const currentOption = this.options[optionIndex];
    this.options.forEach((option, i) => {
      if (i === optionIndex) return true;
      this.getVariantData().forEach(variant => {
        if (variant.options[optionIndex] === currentOption) {
          let input = document.querySelector(`.product-form__input--dropdown option[value="${variant.options[i]}"]`);
          if (variant.available) {
            input.classList.remove('soldout');
            input.disabled = false;
          } else {
            input.classList.add('soldout');
            input.disabled = true;
          }
        }
      });
    });
  }

  backInStock() {
    const bisEl = document.querySelector('.klaviyo-bis__wrapper');
    const productSubmitButton = document.querySelector('.product-form__submit');
    if (!bisEl) return;

    const bisInput = bisEl.querySelector('.klaviyo-bis__email');
    bisInput.style.maxHeight = productSubmitButton.offsetHeight + 'px';

    bisEl.style.display = this.currentVariant.available ? 'none' : 'block';
    productSubmitButton.style.display = this.currentVariant.available ? 'block' : '';




    const bisSubmit = bisEl.querySelector('.klaviyo-bis__submit');
    const bisMessage = bisEl.querySelector('.klaviyo-bis__response');
    const successMessage = bisEl.getAttribute('data-success-message');



    bisInput.addEventListener('keyup', debounce((event) => {
      if (bisInput.value !== '') {
        bisMessage.style.display = 'none';
        bisMessage.classList.remove('alert-success');
        bisMessage.classList.remove('alert-danger');
        bisSubmit.disabled = false;
      }
    }, 300))

    bisSubmit.addEventListener('click', (e) => {
      e.preventDefault();
      bisSubmit.disabled = true;

      var re = /^\w+([-+.'][^\s]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

      if (!re.test(bisInput.value)) {
        bisMessage.textContent = 'Please enter a valid email address';
        bisMessage.classList.add('alert-danger');
        bisMessage.style.display = 'block';
        bisSubmit.disabled = true;
        return;
      }

      fetch("https://a.klaviyo.com/onsite/components/back-in-stock/subscribe", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        "body": new URLSearchParams({
          "a": window.klaviyoCompanyId,
          "email": bisInput.value,
          "platform": "shopify",
          "variant": this.currentVariant.id,
          "product": window.productJSON.id,
        }),
        "method": "POST",
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            bisMessage.textContent = successMessage;
            bisMessage.classList.add('alert-success');
            bisMessage.style.display = 'block';
            bisSubmit.disabled = false;
          }
        })
        .catch(err => {
          console.error(err);
        });
    });

  }

  multipleColors() {
    let hasMultipleColors = false;
    window.productJSON.options_with_values.forEach(option => {
      if (option.name === 'Color' && option.values.length > 1) hasMultipleColors = true;
    });
    return hasMultipleColors;
  }

  showVariantImages() {

    if (!this.multipleColors()) return;

    const currentColorEl = document.querySelector('input[type="radio"][name="Color"]:checked');
    const currentSizeEl = document.querySelector('input[type="radio"][name="Size"]:checked');

    const currentColor = currentColorEl ? currentColorEl.value : '';
    const currentSize = currentSizeEl ? currentSizeEl.value : '';

    const mainImages = document.querySelectorAll('.product__main-image');
    const mainSwiperEl = document.querySelector('.product__media-list');
    let mainSwiper = mainSwiperEl.swiper;

    mainSwiper.on('slideChange', function (swiper) {
      // console.log('slide changed');
      let visibleSlides = [];
      mainImages.forEach(slide => {
        if(slide.offsetWidth > 0 || slide.offsetHeight > 0) {
           visibleSlides.push(slide); 
        }
      })
      const currentSlide = visibleSlides[swiper.realIndex];
      const currentVideo = currentSlide.querySelector('video');
      if(currentVideo) {
        const isVideoPlaying = currentVideo => !!(currentVideo.currentTime > 0 && !currentVideo.paused && !currentVideo.ended && currentVideo.readyState > 2);
        console.log('isVideoPlaying: ' + isVideoPlaying);
        if(!isVideoPlaying) {
          currentVideo.play();
        } else {
          currentVideo.currentTime = 0;
          currentVideo.play();
        }
        // currentVideo.play();
      }
      
    });

    // mainSwiper.destroy();

    mainImages.forEach(image => {
      const imageColor = image.getAttribute('data-filter') || '';
      const imageSize = image.getAttribute('data-size') || '';
      image.style.display = 'none';

      let colorMatch = false;
      let sizeMatch = false;

      if (imageColor === 'All' || imageColor === currentColor || imageColor === '') {
        colorMatch = true;
      }
    
      if (imageSize === 'All' || imageSize === currentSize || imageSize === '') {
        sizeMatch = true;
      }
    
      if (colorMatch && sizeMatch) {
        image.style.display = 'block';
      }
    });
    mainSwiper.update();
    mainSwiper.slideTo(0);
  }

  updateCurrentValues() {
    const currentValues = document.querySelectorAll('.current-value');
    currentValues.forEach((value, i) => {
      value.innerHTML = this.currentVariant.options[i];
    });
  }



  updatePaymentPlans() {
    const paymentPlanAmount = document.querySelector('.payment-plan__amount');
    if (!paymentPlanAmount) return;
    paymentPlanAmount.innerHTML = Shopify.formatMoney(this.currentVariant.price / 4).replace('.00', '');
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
    window.currentVariant = this.currentVariant;
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;

    const mediaGallery = document.getElementById(`MediaGallery-${this.dataset.section}`);
    mediaGallery.setActiveMedia(`${this.dataset.section}-${this.currentVariant.featured_media.id}`, true);

    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    if (!modalContent) return;
    const newMediaModal = modalContent.querySelector(`[data-media-id="${this.currentVariant.featured_media.id}"]`);
    modalContent.prepend(newMediaModal);
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateShareUrl() {
    const shareButton = document.getElementById(`Share-${this.dataset.section}`);
    if (!shareButton || !shareButton.updateUrl) return;
    shareButton.updateUrl(`${window.shopUrl}${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  updateQuantityAvailability() {
    if(this.currentVariant.inventory_quantity <= 10) {
      document.getElementById('show-low-messaging').style.display = 'block';
    } else {
      document.getElementById('show-low-messaging').style.display = 'none';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  getElementsToRender() {
    return [
      '.product .product__price-wrapper',
      '.product .payment-plan',
      '.accordion__content'
    ]
  }

  renderProductInfo() {
    // console.log(this.currentVariant);
    fetch(`${this.currentVariant.url}?variant=${this.currentVariant.id}`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        this.getElementsToRender().forEach((selector) => {
          const elements = html.querySelectorAll(selector);
          elements.forEach((element) => {
            const destination = document.querySelector(selector);
            const source = html.querySelector(selector);
            if (source && destination) destination.innerHTML = source.innerHTML;
          })
        });

        const price = document.getElementById(`price-${this.dataset.section}`);
        if (price) price.classList.remove('visibility-hidden');


      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');
    if (!addButton) return;

    if (disable) {
      // addButton.setAttribute('disabled', 'disabled');
      // if (text) addButtonText.textContent = text;
      if(addButtonText.hasAttribute('disabled')) {
        addButton.removeAttribute('disabled');
      }
      addButton.setAttribute('data-join-list', 'true');
      addButtonText.textContent = 'Join The Waitlist';	
      
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
      if(addButtonText.hasAttribute('data-join-list')) {
        addButtonText.removeAttribute('data-join-list'); // Remove the attribute
      }
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || window.productJSON.variants;
    return this.variantData;
  }
}



class VariantRadios extends VariantSelects {
  constructor() {
    super();
    // console.log('variantRadios');
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }

  updateOtherOptions(initial = false) {
    const optionIndex = initial ? 0 : parseFloat(event.target.closest('.product-form__option').getAttribute('data-option-index'));
    const currentOption = this.options[optionIndex];
    this.options.forEach((option, i) => {
      if (i === optionIndex) return true;
      this.getVariantData().forEach(variant => {
        if (variant.options[optionIndex] === currentOption) {
          let dataUrl = this.dataset.url;
          let variantUrl = variant.url;
          let input = document.querySelector(`.product-form__option input[value="${variant.options[i]}"]`);
          if(!input) return;
          if(dataUrl && (dataUrl?.includes(variantUrl) || dataUrl == variantUrl)){
            if (variant.available) {
              input.classList.remove('soldout');
            } else {
              input.classList.add('soldout');
            }
          }
        }
      });
    });
  }

}

const buildNewSwatches = (newColors) => {
  if (!newColors) return;
  newColors.forEach((color, i) => {
    const swatchInput = document.createElement('input');
    swatchInput.setAttribute('id', `extra-swatch--${i}`);
    swatchInput.type = 'radio';
    swatchInput.name = 'Color';
    swatchInput.value = color;
    swatchInput.form = document.querySelector('product-form form').getAttribute('id');

    const swatchLabel = document.createElement('label');
    swatchLabel.setAttribute('for', `extra-swatch--${i}`);
    swatchLabel.innerHTML = `<span class="visually-hidden">${color}</span>`;


    if (!colorList) return;
    colorList.append(swatchInput);
    colorList.append(swatchLabel);

  });
};

const otherColors = () => {
  if (window.productJSON === undefined) return;
  const productTitle = window.productJSON.title;
  const fetchUrl = `/search.json?q=title:${productTitle}&type=product&view=api`;
  const currentColorIndex = window.productJSON.options.indexOf('Color');
  if (currentColorIndex === -1) {
    customElements.define('variant-selects', VariantSelects);
    customElements.define('variant-radios', VariantRadios);
    return;
  }
  let currentColors = window.productJSON.options_with_values[currentColorIndex].values;
  let newColors = [];
  fetch(fetchUrl)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const responseJSON = JSON.parse(doc.querySelector('[type="application/json"]').textContent);
      const otherColors = responseJSON.filter((result) => result.title.indexOf(productTitle) > -1 && result.title !== productTitle);
      if (!otherColors || otherColors.length === 0) {
        customElements.define('variant-selects', VariantSelects);
        customElements.define('variant-radios', VariantRadios);
        return;
      }
      otherColors.forEach((product) => {
        const colorIndex = product.options.indexOf('Color');
        if (window.productJSON.handle === "the-turtleneck" || window.productJSON.handle === "the-perfect-classic-t") return;
        if(product.vendor === 'VIP' || product.vendor === 'CAPSULE') return true;
        product.variants.forEach((variant) => {
          if(variant.title.indexOf('hide') > -1) return true;
          if(variant.title.indexOf('Hide') > -1) return true;
          variant.url = `/products/${product.handle}`;
          window.productJSON.variants.push(variant);
          if (currentColors.indexOf(variant.options[colorIndex]) === -1) {
            currentColors.push(variant.options[colorIndex]);
            newColors.push(variant.options[colorIndex]);
          }
        });
        // newColors.forEach((color) => {
        //   if (window.productJSON.handle === "the-turtleneck" || window.productJSON.handle === "the-perfect-classic-t") return;
        //   const colorInput = doc.querySelector(`input[value="${color}"]`);
        //   const colorList = document.querySelector('.product-form__option[data-option="Color"] .product-form__input');
        //   const formId = document.querySelector('product-form form').getAttribute('id');
        //   colorInput.setAttribute('form', formId);
        //   if (!colorInput) return true;
        //   const colorWrapper = colorInput.parentNode;
        //   colorList.appendChild(colorWrapper);

        // });
      });
      customElements.define('variant-selects', VariantSelects);
      customElements.define('variant-radios', VariantRadios);
    })
    .catch((error) => {
      console.log(error);
    });

}

otherColors();

const foursixtyListener = () => {
  const foursixtyEl = document.querySelector('.foursixty-feed');
  const fsObserver = new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
      if (mutation.type == 'childList') {
        if(!mutation || mutation.addedNodes.length === 0 || !mutation.addedNodes[0]) return;
        if ('getAttribute' in mutation.addedNodes[0] && mutation.addedNodes[0].getAttribute('class') === 'fs-has-posts') {
          document.getElementById('foursixty').style.display = 'block';
          fsObserver.disconnect();
        }
      }

    });
  });

  fsObserver.observe(foursixtyEl, {
    attributes: false, childList: true, subtree: true
  });
};
foursixtyListener();


const okendoListener = () => {
  const okendoEl = document.querySelector('.okeReviews-widget-holder');
  const recommendsEl = document.querySelector('#product__recommends');
  const okendoWidget = document.querySelector('.okeReviews-reviewsAggregate-recommends');
  if (!okendoEl) return;
  if (!recommendsEl) return;
  let widgetFound = false;
  const okObserver = new MutationObserver((mutations, observer) => {
    mutations.forEach((mutation) => {
      if (okendoWidget && !widgetFound) {
        console.log('okendo widget found');
        recommendsEl.innerHTML = okendoWidget.innerHTML;
        // widgetFound = true;
        // okObserver.disconnect();
        }
    });
  });
  okObserver.observe(okendoEl,
    { childList: true, subtree: true }
  );

};

okendoListener();
