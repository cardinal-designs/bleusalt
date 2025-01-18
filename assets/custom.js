document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelectorAll(".close-announcement").forEach(el => {
    el.addEventListener("click", function(e){
      e.currentTarget.parentNode.classList.add("hidden");
    })
  })
});

window.addEventListener('scroll', function () {
  const header = document.querySelector('.header-wrapper');
  const index = document.querySelector('.template--index');
  if (window.scrollY > 600) {
    header.classList.add('sticky-header-wrapper');
    index.classList.add('sticky-header-enabled');
  } else {
    header.classList.remove('sticky-header-wrapper');
    index.classList.remove('sticky-header-enabled');
  }
});