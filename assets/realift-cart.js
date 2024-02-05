function addTotal(cartTotal) {
  let newCartTotal = cartTotal.replace(/\$/g, '');
  newCartTotal = parseFloat(newCartTotal);
  if(localStorage.getItem("realift:hasMeasurements") == "true") {
    if (typeof window.gtag === 'function') {
      gtag('event', 'realsize_add_total', {
        'event_category': 'RealSize',
        'event_label': 'RealSize Add Total',
        'value': newCartTotal,
        'send_to': 'G-65HJD5FYFV'
      });
      gtag('event', 'realsize_add_transaction', {
        'event_category': 'RealSize',
        'event_label': 'RealSize Add Transaction',
        'value': 1,
        'send_to': 'G-65HJD5FYFV'
      }); 
    } 
    if (typeof window.ga === 'function') {
      ga('send', {
        hitType: 'event',
        eventCategory: 'realsize_transaction',
        eventAction: 'realsize_add_transaction',
        eventLabel: 'RealSize Transaction'
      });
    }
  } 
} 

// window.onload = function() {
//   setTimeout(function() {

//     // Shopify
    
//     const shopifyPay = document.querySelector('[data-testid="ShopifyPay-button"]')  
//     shopifyPay.addEventListener("click", function() {
//       jQuery.getJSON('/cart.js', function(cart) { 
//         addTotal("$" + cart.total_price/100);
//       } );
//     });

//     // Google
    
//     const googlePay = document.querySelector('[data-testid="GooglePay-button"]')  
//     googlePay.addEventListener("click", function() {
//       jQuery.getJSON('/cart.js', function(cart) { 
//         addTotal("$" + cart.total_price/100);
//       } );
//     });

//     // Facebook/Meta

//     const facebookPay = document.querySelector('[data-testid="FacebookPay-button"]')  
//     facebookPay.addEventListener("click", function() {
//       jQuery.getJSON('/cart.js', function(cart) { 
//         addTotal("$" + cart.total_price/100);
//       } );
//     });

//     // Sezzle

//     const sezzlePay = document.querySelector('.sezzle-checkout-button')  
//     sezzlePay.addEventListener("click", function() {
//       jQuery.getJSON('/cart.js', function(cart) { 
//         addTotal("$" + cart.total_price/100);
//       } );
//     });

//     // PayPal
    
//     window.focus();

//     window.addEventListener("blur", () => {
//       setTimeout(() => {
//         if (document.activeElement.tagName === "IFRAME") {
//           jQuery.getJSON('/cart.js', function(cart) { 
//             addTotal("$" + cart.total_price/100);
//           } );
//         }
//       });
//     }, { once: true })  
//   }, 1000) 
// }

