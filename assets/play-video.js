const selectors = {
  dom: {
    videoCta: 'image-text-video__cta',
    iframeParent: 'image-text-video__iframe',
    iframe: 'iframe',
    closeIframe: 'image-text-video__close-iframe',
  }
};

const videoCta = document.querySelector(`.${selectors.dom.videoCta}`);
const iframeParent = document.querySelector(`.${selectors.dom.iframeParent}`);
const iframe = iframeParent.querySelector(selectors.dom.iframe);
const iframeSrc = iframe.getAttribute("src");

if(videoCta) {
  videoCta.addEventListener('click', () => {
    playVideo();
  });
}

// Play Video
function playVideo() {
  iframeParent.style.display = 'block';
  iframe.setAttribute("src", iframeSrc + "?autoplay=1&mute=1");
  document.querySelector('body').style.overflow = 'hidden';

  // Close iframe
  const closeIframe = document.querySelector(`.${selectors.dom.closeIframe}`);
  closeIframe.addEventListener('click', () => {
    iframeParent.style.display = 'none';
    iframe.setAttribute("src", iframeSrc);
    document.querySelector('body').style.overflow = 'initial';
  });
}

function clickOutside() {
  document.addEventListener('click', () => {
    const $isOutside = !e.target.closest('.image-text-video__iframe');

    if ($isOutside) {
      iframeParent.style.display = 'none';
      iframe.setAttribute("src", iframeSrc);
      document.querySelector('body').style.overflow = 'initial';
    }
  });
}

clickOutside();