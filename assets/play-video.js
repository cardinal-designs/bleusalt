const selectors = {
  dom: {
    videoCta: 'image-text-video__cta',
    iframeParent: 'image-text-video__iframe',
    iframe: 'iframe',
    closeIframe: 'image-text-video__close-iframe',
    iframeInner: 'image-text-video__iframe-inner'
  }
};

const videoCta = document.querySelector(`.${selectors.dom.videoCta}`);
const iframeParent = document.querySelector(`.${selectors.dom.iframeParent}`);
const iframe = iframeParent.querySelector(selectors.dom.iframe);
const iframeSrc = iframe.getAttribute("src");
const closeIframe = document.querySelector(`.${selectors.dom.closeIframe}`);

if(videoCta) {
  videoCta.addEventListener('click', () => {
    playVideo();
  });
}

// Play Video
function playVideo() {
  iframeParent.style.display = 'block';
  iframe.setAttribute("src", iframeSrc + "?autoplay=1");
  document.querySelector('body').style.overflow = 'hidden';

  // close
  closeIframe.addEventListener('click', () => {
    closeIframePopUp();
  });
}

// Close iframe
function closeIframePopUp() {
  iframeParent.style.display = 'none';
  iframe.setAttribute("src", iframeSrc);
  document.querySelector('body').style.overflow = 'initial';
}

// Click outside to close iframe
function clickOutside() {
  document.addEventListener('click', (e) => {
    const isOutside = !e.target.closest(`.${selectors.dom.iframeInner}`);
    const btnIsOutside = !e.target.closest(`.${selectors.dom.videoCta}`)

    if (isOutside && btnIsOutside) {
      closeIframePopUp();
    }
  });
}

clickOutside();