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


document.addEventListener('DOMContentLoaded', function () {
  // Function to append the button
  const appendButton = () => {
    const targetElement = document.querySelector('.hc_cd.at_top.clickable');
    console.log("Target Element:", targetElement);

    if (targetElement) {
      // Check if the button already exists to prevent duplicates
      if (!targetElement.querySelector('.custom-button')) {
        // Create a button element
        const button = document.createElement('button');
        button.className = 'custom-button'; // Add a class for styling (optional)
      
        // Create an SVG element (replace this with your SVG content)
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-right">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      
        // Set the inner HTML of the button to the SVG
        button.innerHTML = svg;
      
        // Append the button to the target element
        targetElement.appendChild(button);
      }

      // Clear the interval since the target element is found
      clearInterval(intervalId);
      console.log('Interval cleared after finding the target element');
    }
  };

  // Set interval to execute the function every 10 seconds
  const intervalId = setInterval(appendButton, 10000);
});

