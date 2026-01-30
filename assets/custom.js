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
  if (window.scrollY > 200) {
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
    try {
      const bundlyBlock = document.querySelector(selector);
      if (!bundlyBlock) return;

      const fieldsets = Array.from(
        bundlyBlock.querySelectorAll(".bundly__variant_picker fieldset.bundly__product_option")
      ).filter(fs => {
        try {
          const legend = fs.querySelector("legend");
          return legend && legend.textContent.trim() === "Color";
        } catch (err) {
          // console.error("Error filtering fieldsets:", err);
          return false;
        }
      });

      fieldsets.forEach(fieldset => {
        try {
          fieldset.classList.add("color_swatch");

          fieldset.querySelectorAll("input").forEach(input => {
            try {
              const colorName = input.value.toLowerCase().trim().replace(/\s+/g, "-");
              const imgUrl = `//${window.location.host}/cdn/shop/files/${colorName}_80x.jpg`;
              const swatch = input.nextElementSibling;

              if (swatch) {
                swatch.style.backgroundImage = `url(${imgUrl})`;
                swatch.style.backgroundSize = "cover";
              }
            } catch (err) {
              // console.error("Error applying swatch image:", err);
            }
          });
        } catch (err) {
          // console.error("Error processing fieldset:", err);
        }
      });

      document.querySelectorAll(fieldsetsSelector).forEach(el => {
        try {
          const input = el.querySelector("input:checked");
          const legend = el.querySelector("legend");
          if (!input || !legend) return;

          const currentHTML = legend.innerHTML;
          const existingBaseText = currentHTML.split(":")[0].replace(/^Select a\s*/, "").trim();

          const newBaseText = `Select a ${existingBaseText}`;
          const newHTML = `${newBaseText}: <span>${input.value}</span>`;

          if (currentHTML !== newHTML) {
            legend.innerHTML = newHTML;
          }
        } catch (err) {
          // console.error("Error updating legend title:", err);
        }
      });
    } catch (err) {
      // console.error("Error in applyColorSwatches:", err);
    }
  };

  const observeInner = (block) => {
    try {
      if (innerObserver) innerObserver.disconnect();

      innerObserver = new MutationObserver(() => {
        requestAnimationFrame(() => {
          try {
            applyColorSwatches();
          } catch (err) {
            // console.error("Error in inner observer callback:", err);
          }
        });
      });

      innerObserver.observe(block, {
        childList: true,
        subtree: true
      });
    } catch (err) {
      // console.error("Error in observeInner:", err);
    }
  };

  const setupBlockWatcher = () => {
    try {
      const newBlock = document.querySelector(selector);

      if (newBlock && newBlock !== currentBlock) {
        currentBlock = newBlock;
        applyColorSwatches();
        observeInner(currentBlock);
      }
    } catch (err) {
      // console.error("Error in setupBlockWatcher:", err);
    }
  };

  try {
    const outerObserver = new MutationObserver(() => {
      try {
        setupBlockWatcher();
      } catch (err) {
        // console.error("Error in outer observer callback:", err);
      }
    });

    outerObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial call
    setupBlockWatcher();
  } catch (err) {
    // console.error("Error setting up outer observer:", err);
  }
})();
/* Bundly App Swatch Custom Code - End */

// 4. THE HIJACKER: Watch for Nosto rendering the slider
const observer = new MutationObserver((mutations) => {
    const elements = document.querySelectorAll('.nosto_element');
    elements.forEach(el => {
        const $slider = $(el).find('.nosto-slick');
        
        // If Nosto initialized it with their default settings (usually 4 items)
        if ($slider.length && $slider.hasClass('slick-initialized')) {
            try {
                const slickInstance = $slider.get(0).slick;
                if (!slickInstance) return;

                // Grab current settings
                let settings = slickInstance.options;

                // FORCE 3 ITEMS AND KILL THE SLIVER BUG
                settings.slidesToShow = 3;
                settings.slidesToScroll = 1;
                settings.infinite = false; // Critical to stop bleeding/cloning
                settings.responsive = null; // Prevent mobile settings from overriding us
                
                // Re-initialize with our "Brutal" settings
                $slider.slick('unslick');
                $slider.slick(settings);
                
                // Only need to hijack once per element
                $slider.addClass('hijack-complete');
            } catch (e) {
                console.error("Slick Hijack Error:", e);
            }
        }
    });
});

// Observe the containers for content injection
elements.forEach(el => observer.observe(el, { childList: true, subtree: true }));