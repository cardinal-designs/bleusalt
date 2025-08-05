document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelectorAll(".close-announcement").forEach(el => {
    el.addEventListener("click", function(e){
      // e.currentTarget.parentNode.classList.add("hidden");
      let body = e.currentTarget.closest("body");
      if(body){
        if(el){
          el.classList.add("hidden");
        }
        let announcementBar = body.querySelector("#shopify-section-announcement-bar");
        if(announcementBar){
          announcementBar.classList.add("hidden");
        }
        
        let targetElement = body.querySelector('.hc_cd.at_top.clickable');
        if(targetElement){
          targetElement.classList.add("hidden");
        }
      }
    })
  });

  const toggleCheckbox = document.getElementById("toggle-gift-fields");
  const giftCardForm = document.querySelector(".gift__card--wrapper");

  if(toggleCheckbox){
    toggleCheckbox.addEventListener("change", function () {
      giftCardForm.style.display = this.checked ? "block" : "none";
    });
  }

  document.querySelectorAll('.quote-press__logo[data-bg]').forEach(function(el) {
    el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
    el.removeAttribute('data-bg');
  });
  
});

window.addEventListener('scroll', function () {
  const header = document.querySelector('.header-wrapper');
  const index = document.querySelector('.template--index');
  if (window.scrollY > 600) {
    header.classList.add('sticky-header-wrapper');
    if (index) {
      index.classList.add('sticky-header-enabled');
    }
  } else {
    header.classList.remove('sticky-header-wrapper');
    if (index) {
      index.classList.remove('sticky-header-enabled');
    }
  }
});

/* Bundly App Swatch Custom Code - Start */
(function () {
  const selector = ".bundly__block";
  const fieldsetsSelector = ".bundly__block fieldset";
  let currentBlock = null;
  let innerObserver = null;

  const applyColorSwatches = () => {
    const bundlyBlock = document.querySelector(selector);
    if (!bundlyBlock) return;

    const fieldsets = Array.from(
      bundlyBlock.querySelectorAll(".bundly__variant_picker fieldset.bundly__product_option")
    ).filter(fs => {
      const legend = fs.querySelector("legend");
      return legend && legend.textContent.trim() === "Color";
    });

    fieldsets.forEach(fieldset => {
      fieldset.classList.add("color_swatch");

      fieldset.querySelectorAll("input").forEach(input => {
        const colorName = input.value.toLowerCase().trim().replace(/\s+/g, "-");
        const imgUrl = `//${window.location.host}/cdn/shop/files/${colorName}_80x.jpg`;
        const swatch = input.nextElementSibling;

        if (swatch) {
          swatch.style.backgroundImage = `url(${imgUrl})`;
          swatch.style.backgroundSize = "cover";
        }
      });
    });

    // Safely update legend title without causing observer infinite loop
    document.querySelectorAll(fieldsetsSelector).forEach(el => {
      const input = el.querySelector("input:checked");
      const legend = el.querySelector("legend");
      if (!input || !legend) return;

      // Extract base text safely from raw HTML
      const currentHTML = legend.innerHTML;
      const existingBaseText = currentHTML.split(":")[0].replace(/^Select a\s*/, "").trim();

      const newBaseText = `Select a ${existingBaseText}`;
      const newHTML = `${newBaseText}: <span>${input.value}</span>`;

      // Only update if truly different
      if (currentHTML !== newHTML) {
        legend.innerHTML = newHTML;
      }
    });

  };

  const observeInner = (block) => {
    if (innerObserver) innerObserver.disconnect();

    innerObserver = new MutationObserver(() => {
      // Debounce with requestAnimationFrame to avoid flood
      requestAnimationFrame(() => {
        applyColorSwatches();
      });
    });

    innerObserver.observe(block, {
      childList: true,
      subtree: true
    });
  };

  const setupBlockWatcher = () => {
    const newBlock = document.querySelector(selector);

    if (newBlock && newBlock !== currentBlock) {
      currentBlock = newBlock;
      applyColorSwatches();
      observeInner(currentBlock);
    }
  };

  const outerObserver = new MutationObserver(setupBlockWatcher);
  outerObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial call
  setupBlockWatcher();
})();

/* Bundly App Swatch Custom Code - End */