const selectors = {
  dom: {
    videoCta: 'image-text-video__cta',
    iframeParent: 'image-text-video__iframe',
    iframe: 'iframe',
    closeIframe: '.image-text-video__close-iframe',
  }
};

const videoCta = document.querySelector(`.${selectors.dom.videoCta}`);
const iframeParent = document.querySelector(`.${selectors.dom.iframeParent}`);
const iframe = iframeParent.querySelector(selectors.dom.iframe);

if(videoCta) {
  videoCta.addEventListener('click', () => {
    playVideo();
  });
}

// Play Video
function playVideo() {
  document.querySelector('.image-text-video__iframe').style.display = 'block';
  var iframeSrc = iframe.getAttribute("src");
  iframe.setAttribute("src", iframeSrc + "?autoplay=1&mute=1");
  document.querySelector('body').style.overflow = 'hidden';

  const closeIframe = document.querySelector('.image-text-video__close-iframe');
  closeIframe.addEventListener('click', () => {
    document.querySelector('.image-text-video__iframe').style.display = 'none';
    iframe.setAttribute("src", iframeSrc);
    document.querySelector('body').style.overflow = 'initial';
  });
}