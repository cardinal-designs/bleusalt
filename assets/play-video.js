  const playVideo = document.querySelector('.image-text-video__cta');
  const iframeParent = document.querySelector('.image-text-video__iframe');
  const iframe = iframeParent.querySelector("iframe");

  playVideo.addEventListener('click', () => {
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
  });