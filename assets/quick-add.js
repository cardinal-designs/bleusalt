if (!customElements.get('quick-add')) {
  customElements.define('quick-add', class QuickAdd extends HTMLElement {
    constructor() {
      super();
      this.querySelectorAll('button').forEach(
        (button) => button.addEventListener('click', this.onButtonClick.bind(this))
      );
      
      this.card = this.closest('.card');
      this.cardLink = this.card.querySelector('.card__heading.h4 a');
      this.productUrl = this.cardLink.getAttribute('data-product-url');
      this.json = JSON.parse(this.card.getAttribute('data-json'));
      this.variants = this.json.variants;
      this.colorButtons = this.card.querySelectorAll('.quick-add__button--color');
      this.colorButtons.forEach(
        (button) => button.addEventListener('click', this.onColorButtonClick.bind(this))
      );
      this.colorIndex = this.json.options.indexOf('Color');
      this.sizeIndex = this.json.options.indexOf('Size');
      this.selectedColor = this.card.querySelector('.quick-add__button--color[selected]');
      this.init();      
    }

    onButtonClick(event) {
      this.querySelectorAll('.quick-add__button').forEach(
        (button) => button.removeAttribute('selected')
      )
      event.target.setAttribute('selected',true);
      let allSelected = [];
      this.card.querySelectorAll('.quick-add__button[selected]').forEach((button) => {
        allSelected.push(button.value);
      });
      const selectedArray = allSelected.length > 1 ? allSelected.reverse().join(' / ') : allSelected[0];
      this.variants.forEach((variant) => {
        if(variant.title === selectedArray) {
          addToCart(variant.id,1);
          return false;
        }
      });
    }
    updateUrl() {
      let foundOne = false;
      this.json.variants.forEach((variant) => {
        if(variant.options[this.colorIndex] === this.selectedColor.value && !foundOne) {
          this.cardLink.setAttribute('href',`${this.productUrl}?variant=${variant.id}`);
          this.changeImage(variant);
          foundOne = true;
        };
      });
    }
    onColorButtonClick() {
      this.card.querySelectorAll('.quick-add__button--color').forEach(
        (button) => button.removeAttribute('selected')
      )
      event.target.setAttribute('selected',true);
      this.selectedColor = event.target;
      this.updateUrl();
      this.sizeAvailabilities();
      this.updateSelectedSize();
      this.changeImage();
    }
    init() {
      if(!this.selectedColor) return;
      this.sizeAvailabilities();
    }
    updateSelectedSize() {
      if(!this.selectedColor) return;
      const selectedColorEl = this.card.querySelector('.card__selected-color');
      if(!selectedColorEl) return;
      selectedColorEl.innerHTML = this.selectedColor.value;

    }
    sizeAvailabilities() {
      if(!this.selectedColor) return;
      this.variants.forEach((variant) => {
        if(variant.options[this.colorIndex] !== this.selectedColor.value) return true;
        let sizeButton = this.querySelector(`button[value="${variant.options[this.sizeIndex]}"]`);
        if(sizeButton) sizeButton.disabled = !variant.available;
      });
    }
    changeImage(variant) {
      const firstImage = this.card.querySelectorAll('.card__media img')[0];
      
      if(variant.featured_image) {
        firstImage.setAttribute('src',variant.featured_image.src);
        firstImage.removeAttribute('srcset');
        return;
      }
      
      let foundOne = false;
      let foundTwo = false;
      
      const secondImage = this.card.querySelectorAll('.card__media img')[1];
      this.json.media.forEach((media) => {
        let mediaAlt = media.alt.split('|')[0].trim(); 
        if(media.media_type != 'image') return true;
        if(mediaAlt !== this.selectedColor.value) return true;
        if(!foundOne && !foundTwo) {
          updateSrcSet(firstImage,media.src);
          foundOne = true;
        } else if(foundOne && !foundTwo) {
          updateSrcSet(secondImage,media.src);
          foundTwo = true;
        }
        
      });
      // this.variants.forEach((variant) => {
      //   if(variant.options[this.colorIndex] !== this.selectedColor.value) return true;
      //   if(!foundOne) {
      //     updateSrcSet(thisImage,variant.featured_image.src);
      //     foundOne = true;
      //   };
      // });
    }
  })
}