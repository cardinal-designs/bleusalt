class CompleteTheLook extends HTMLElement {
    constructor() {
        super();  
        this.items = this.querySelectorAll('.complete-the-look__item');
        this.selectedColor = document.querySelector('.product .product-form__option input[name="Color"]:checked').value;
        this.items.forEach(item => {
            item.addEventListener('change', this.onItemChange.bind(this));
            this.updateOptions(item);
        });
        document.addEventListener('variant:changed', this.onVariantChanged.bind(this));
        this.swiperSetup();
        
        this.updateImages()
    }
    swiperSetup() {
        const ctsSwiper = this.querySelector('.complete-the-look__swiper');
        const ctsListener = () => {
            ctsSwiper.swiper.on('activeIndexChange',function() {
                const activeIndex = ctsSwiper.swiper.activeIndex;
                this.querySelector('.complete-the-look__current-look-value').innerHTML = activeIndex + 1;
            });
        };
        
        const checkSwiper = setInterval(() => {
            if(ctsSwiper.swiper) {
                ctsListener();
                clearInterval(checkSwiper);
            }
        }, 1000);
    }
    updateImages() {
        
        const items = this.querySelectorAll('.complete-the-look__left .complete-the-look__item');
        items.forEach(item => {
            const json = JSON.parse(item.dataset.json);
            let foundOne = false;
            json.variants.forEach(variant => {
                if(variant.options.indexOf(this.selectedColor) !== -1 && !foundOne) {
                    updateSrcSet(item.querySelector('img'),variant.featured_image.src);
                    foundOne = true;
                }
            });
        });
    }
    onVariantChanged(event) {
        this.selectedColor = document.querySelector('.product .product-form__option input[name="Color"]:checked').value;
        console.log('onVariantChanged');
        const variant = event.detail;
        const mainElement = this.querySelector('.complete-the-look__main-item'); 
        const mainImage = mainElement.querySelector('.complete-the-look__image img');
        updateSrcSet(mainImage,variant.featured_image.src)
        const lookColors = this.querySelectorAll(`input[value="${this.selectedColor}"]`);
        lookColors.forEach(color => {
            const json = JSON.parse(color.closest('.complete-the-look__item').dataset.json);
            if(json.options.length > 1) {
                color.checked = true;
            }
        });
        
        this.updateImages();
    }
    updateOptions(item) {
        const itemJson = JSON.parse(item.getAttribute('data-json'));
        const optionIndex =  0;
        const currentOption = itemJson.options[optionIndex];
        itemJson.options.forEach((option,i) => {
            if(i === optionIndex) return true;
            itemJson.variants.forEach(variant => {
                if(variant.options[optionIndex] === currentOption) {
                    console.log(variant.options[i]);
                    let input = item.querySelector(`input[value="${variant.options[i]}"]`);
                    console.log(input);
                    if(variant.available) {
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

    onItemChange(event) {
        const json = JSON.parse(event.target.closest('.complete-the-look__item').dataset.json);
        console.log(json);
        const totalInputs = event.target.closest('.complete-the-look__item').querySelectorAll('.complete-the-look__option');
        const selected = event.target.closest('.complete-the-look__item').querySelectorAll('input:checked');
        const selectedValues = Array.from(selected).map(input => input.value);
        if(event.target.parentNode.getAttribute('data-option') === 'Color') {
          const myColor = event.target.value;
          let foundOne = false;
          json.variants.forEach(variant => {
              if(variant.options.indexOf(myColor) !== -1 && !foundOne) {
                const image = event.target.closest('.complete-the-look__item').querySelector('img');
                updateSrcSet(image,variant.featured_image.src);
                foundOne = true;
              }
            if(variant.options.indexOf(myColor) > -1 && json.options.indexOf('Size') > -1) {
              let available = variant.available;
              let myInput = event.target.closest('.complete-the-look__item').querySelector(`.complete-the-look__option--size[value="${variant.options[1]}"]`);
              console.log(myInput);
              if(!myInput) return;
              myInput.disabled = !available;
              
            }
          });
        }
        if(selectedValues.length !== totalInputs.length) return;
        const selectedTitle = selectedValues.join(' / ');
        const selectedId = json.variants.filter(item => {
            if(item.title === selectedTitle) return item.id;
        })[0].id;
        addToCart(selectedId,1);
    }
}
customElements.define('complete-the-look', CompleteTheLook);
