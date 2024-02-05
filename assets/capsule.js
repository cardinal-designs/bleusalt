class CapsulePage extends HTMLElement {
    constructor() {
        super();
        this.capsuleTotal = window.capsuleTotal;
        this.capsuleJSON = window.capsuleJSON;
        this.productTypes = window.productTypes;
        this.addEventListener('change', this.onUpdate.bind(this));
        this.submitButton = this.querySelector('.capsule-submit');
        this.submitButton.addEventListener('click',this.formSubmit.bind(this));
        this.init()
    }
    init() {
        console.log(this.capsuleJSON);
        this.extraVariants();
    }
    allOptionsSelected(el = this) {
        const optionsCount = el.querySelectorAll('.product-option').length;
        const optionsSelected = el.querySelectorAll('input:checked').length;
        return optionsCount === optionsSelected;
    }
    extraVariants() {
        this.querySelectorAll('.capsule__item').forEach(item => {
            const extraVariants = item.getAttribute('data-extra-variants');
            if(extraVariants === 'false') return;

            const regularJson = JSON.parse(item.getAttribute('data-json'));
            const extraJson = JSON.parse(extraVariants);
            const combinedJson = regularJson.concat(extraJson);
            
            item.setAttribute('data-json',JSON.stringify(combinedJson));
            console.log(combinedJson);
        });
    }
    updateImage(item,color) {
        const variants = JSON.parse(item.getAttribute('data-json'));
        variants.forEach((variant,foundOne = false) => {
            if(variant.options.indexOf(color) !== -1 && foundOne !== true) {
                updateSrcSet(item.querySelector('img'),variant.featured_image.src);
                // item.querySelector('img').src = variant.featured_image.src;
                // item.querySelector('img').removeAttribute('srcset');
                foundOne = true;
            }
        });
    }
    onUpdate(event) {
        let capsuleItem = event.target.closest('.capsule__item');
        let allChecked = capsuleItem.querySelectorAll('input:checked');
        let capsuleIndex = capsuleItem.getAttribute('data-index');
        let allValues = Array.from(allChecked, v => v.value).join(', ');
        let colorSelected = capsuleItem.querySelector('.product-option[data-option="Color"] input:checked');
        if(colorSelected) {
            this.updateImage(capsuleItem,colorSelected.value);
        }

        this.updateOptions(event.target);
        capsuleItem.querySelector('.capsule-item__selections').textContent = allValues;

        if(this.allOptionsSelected(capsuleItem)) {
            const selectedVariant = this.getSelectedVariant(capsuleItem);
            const mySelection = document.querySelector(`.selection[data-index="${capsuleIndex}"] .selection__variant`);
            if(!mySelection) return;
            mySelection.textContent = allValues;
            let variantObj = {
                id: selectedVariant.id,
                price: selectedVariant.price
            };
            mySelection.setAttribute('data-json',JSON.stringify(variantObj));
            mySelection.classList.add('selected');
        }
    }
    
    getSelectedVariant(el) {
        const allChecked = el.querySelectorAll('input:checked');
        if(!allChecked) return;
        const allValues = Array.from(allChecked, v => v.value).join(' / ');
        const json = JSON.parse(el.dataset.json);
        let selectedVariant = false;
        json.forEach(item => {
            if(item.title === allValues) {
                selectedVariant = item;
            }
        });
        return selectedVariant;
    }
    updateOptions(el) {
        const myElement = el.closest('.capsule__item');
        const myOption = el.closest('.product-option').dataset.optionIndex;
        const myValue = el.value;
        const json = JSON.parse(myElement.dataset.json);

        myElement.querySelectorAll('.product-option').forEach(option => {
            if (option.dataset.totalOptions == 1) return;
            if (option.dataset.optionIndex == myOption) {
                option.querySelectorAll('input').forEach(ipt => {
                    ipt.disabled = false;
                });
                return;
            };
            json.forEach(variant => {
                if (variant.options[myOption] === myValue) { 
                    option.querySelector(`input[value='${variant.options[option.dataset.optionIndex]}']`).disabled = !variant.available;
                }
            });
        });
        this.submitButton.disabled = this.allOptionsSelected() ? false : true;
    }
    formSubmit() {
        const allSelections = Array.from(document.querySelectorAll('.selection__variant.selected'));
        let items = [];
        const now = 'bundle_'+Math.floor(Date.now() / 1000);
        const bundleId = window.bundleId;
        const cartDrawer = document.querySelector('cart-drawer');
        
        allSelections.forEach(selection => {
            const json  = JSON.parse(selection.getAttribute('data-json'));
            const obj = {
                quantity: 1,
                id: json.id,
                properties: {
                    '_bundle': bundleId,
                    '_bundle_total': this.capsuleTotal,
                    'bundle_id': now
                }
            }
            items.push(obj);
        });
        const formData = {
            "items": items,
            "sections": "cart-drawer,cart-icon-bubble,main-cart-items,main-cart-footer",
            "sections_url": window.location.pathname
        }
        fetch('/cart/add.js', {
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
            cartDrawer.renderContents(data)
            if(!cartDrawer.classList.contains('active')) {
              cartDrawer.open();
            }
        })
        .catch((error) => {
            console.error('Error:',error);
        });
    }

}

customElements.define('capsule-page', CapsulePage);