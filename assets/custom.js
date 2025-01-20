document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelectorAll(".close-announcement").forEach(el => {
    el.addEventListener("click", function(e){
      e.currentTarget.parentNode.classList.add("hidden");
      let body = e.currentTarget.closest("body");
      if(body){
        const targetElement = body.querySelector('.hc_cd.at_top.clickable');
        if(targetElement){
          targetElement.classList.add("hidden");
        }
      }
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


// document.addEventListener('DOMContentLoaded', function () {
//   // Function to append the button
//   const appendButton = () => {
//     const targetElement = document.querySelector('.hc_cd.at_top.clickable');
//     console.log("Target Element:", targetElement);

//     if (targetElement) {
//       // Check if the button already exists to prevent duplicates
//       if (!targetElement.querySelector('.custom-button')) {
//         // Create a button element
//         const button = document.createElement('button');
//         button.className = 'custom-button'; // Add a class for styling (optional)
      
//         // Create an SVG element (replace this with your SVG content)
//         const svg = `
//           <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" class="icon icon-close" fill="none" viewBox="0 0 18 17">
//             <path d="M.865 15.978a.5.5 0 00.707.707l7.433-7.431 7.579 7.282a.501.501 0 00.846-.37.5.5 0 00-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 10-.707-.708L8.991 7.853 1.413.573a.5.5 0 10-.693.72l7.563 7.268-7.418 7.417z" fill="currentColor" stroke="currentColor" stroke-width="0.5" />
//           </svg>

//         `;
      
//         // Set the inner HTML of the button to the SVG
//         button.innerHTML = svg;
      
//         // Append the button to the target element
//         targetElement.appendChild(button);
//       }

//       // Clear the interval since the target element is found
//       clearInterval(intervalId);
//       console.log('Interval cleared after finding the target element');
//     }
//   };

//   // Set interval to execute the function every 10 seconds
//   const intervalId = setInterval(appendButton, 1000);
// });

