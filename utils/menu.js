// Resize menu elements for current canvas size.
function initMenu(smallWidth, smallHeight) {
  // Small canvases and cards
  let carousels = document.querySelectorAll('.carousel-wrapper');
  let smallCanvases = document.querySelectorAll('.small-canvas');
  let cards = document.querySelectorAll('.card');
  let cardPadding = getComputedStyle(cards[0]).padding;

  let carouselShift =
    (video.width - smallHeight - 2 * parseInt(cardPadding)) / 2;
  carousels.forEach(function (carousel, i) {
    carousel.style.top =
      `${video.height - smallHeight - 2 * parseInt(cardPadding)}px`;
    carousel.style.height = `${video.width}px`;
    carousel.style.width = `${smallHeight + 2 * parseInt(cardPadding)}px`;
    carousel.style.transform = 'rotate(-90deg)'
      + `translateY(${carouselShift}px) translateX(${carouselShift}px)`;

  });

  let cardShift = (smallWidth - smallHeight) / 2;
  for (let i = 0; i < smallCanvases.length; i++) {
    smallCanvases[i].style.height = `${smallHeight}px`;
    smallCanvases[i].style.width = `${smallWidth}px`;
    // Width and height will be swaped after rotation.
    cards[i].style.width = `${smallHeight}px`
    cards[i].style.height = `${smallWidth}px`
    cards[i].style.transform = 'rotate(90deg)'
      + `translateX(-${cardShift}px) translateY(${cardShift}px)`;
  }
  if (isMobileDevice()) {
    carousels.forEach(function (carousel, i) {
      carousel.style.overflowX = 'scroll';
      carousel.style.WebkitOverflowScrolling = 'touch';
    });
  }
}
