document.querySelectorAll('.klaviyo-bis__email').forEach(el => el.setAttribute('aria-label','Email'));
document.querySelectorAll('.materials-richtext .rich-text__blocks h2.rich-text__heading.rte.h1').forEach(el => el.setAttribute('aria-level','1'));
document.querySelectorAll('.capsulewardrobes-page .rich-text__blocks h2.rich-text__heading.rte.h1').forEach(el => el.setAttribute('aria-level','1'));
document.querySelectorAll('.story-page .rich-text__blocks h2.rich-text__heading.rte.h1').forEach(el => el.setAttribute('aria-level','1'));
document.querySelectorAll("a[href='https://www.tencel.com/luxe']").forEach(el => el.setAttribute('aria-label','You will depart from bleusalt.com and go to https://www.tencel.com/luxe.'));

document.querySelectorAll(".home-learn-more a[href='/pages/materials']").forEach(el => el.setAttribute('aria-label','Learn More, Essentials sustainably made in the USA from the softest fibers on earth'));

document.querySelectorAll(".three-cate ul li .media img").forEach(el => el.setAttribute('aria-hidden','true'));
document.querySelectorAll(".three-cate ul li h2").forEach(el => el.setAttribute('aria-hidden','true'));
// $(document).ready(function () {
//     setTimeout(function () {
// // $('.swiper-wrapper .swiper-slide.swiper-slide-duplicate').removeAttr('aria-label');
// // $('.swiper-wrapper .swiper-slide.swiper-slide-duplicate').removeAttr('role');
// }, 3000);
// }, 3000);
