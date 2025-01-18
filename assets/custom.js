document.addEventListener("DOMContentLoaded", (event) => {
  // add all the code below
  
  
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