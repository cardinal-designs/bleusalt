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


