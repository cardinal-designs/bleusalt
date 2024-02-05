class FitQuiz extends HTMLElement {
    constructor() {
        super();
        this.submit = this.querySelector('#fit-quiz__submit');
        this.submit.addEventListener('click', this.generateSize.bind(this));
        this.selects = this.querySelectorAll('.select__select');
        this.selects.forEach(select => {
            select.addEventListener('change', this.updateSelect.bind(this));
        });
    }
    allSelected() {
        let totalSelected = 0;
        let unselected = [];
        const totalSelects = this.querySelectorAll('select');
        totalSelects.forEach(select => {
            if(select.value !== '') {
                totalSelected++;
            } else {
                unselected.push(select)
            }
        });
        
        const allSelected = totalSelected == totalSelects.length;
        if(!allSelected) {
            unselected.forEach(select => {
                select.classList.add('fit-quiz__select--error');
            });
        }
        return allSelected;
    }
    updateSelect(event) {
        if(event.target.value !== '') {
            event.target.classList.remove('fit-quiz__select--error');
        }
    }
    selectVariant() {
        let sizeRadio = this.querySelector(`input[value="${size}"]`);
        if(!sizeRadio) return;
        sizeRadio.checked = true;
        document.querySelector('variant-radios').dispatchEvent(new Event('change'));
    }
    generateSize() {
        if(!this.allSelected()) return;
        const fit = this.querySelector('#fit-select').value;
        const selectedSize = this.querySelector('#size-select').value;
        const size = fit === 'fitted' ? this.querySelector('#size-select').value : this.querySelector(`option[value="${selectedSize}"]`).dataset.looseValue;
        const results = this.querySelector('.fit-quiz__results');
        results.innerHTML = size;
        results.style.display = 'block';

        this.selectVariant(size);   
    }
}

customElements.define('fit-quiz', FitQuiz);