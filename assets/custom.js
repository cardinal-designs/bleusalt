document.addEventListener("DOMContentLoaded", (event) => {
  console.log("DOM fully loaded and parsed");

  
  
});

window.addEventListener('scroll', function () {
  const header = document.querySelector('.header-wrapper');
  if (window.scrollY > 600) {
    header.classList.add('sticky-header-wrapper');
  } else {
    header.classList.remove('sticky-header-wrapper');
  }
});