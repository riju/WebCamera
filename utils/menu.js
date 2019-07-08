let carouselWrappers = document.querySelectorAll('.carousel-wrapper');
let carousels = document.querySelectorAll('.carousel');
let leftButtons = document.querySelectorAll("[data-action='slideLeft']");
let rightButtons = document.querySelectorAll("[data-action='slideRight']");
let buttonWidth = leftButtons[0].offsetWidth;

// We don't need buttons if it is mobile phone.
if (isMobileDevice()) buttonWidth = 0;

// For showing 1/4 part of previous menu window after scrolling.
const menuParts = 4;

// Array of properties for each carousel:
// {offset, cardsCounter, cardWidth}
let properties = [];

// Set up properties for each carousel.
carousels.forEach(function (carousel) {
  // Offset for each carousel will always be negative or zero.
  let offset = 0;
  let cards = carousel.querySelectorAll('.card');
  let cardsCounter = cards.length;
  let cardWidth = cards[0].offsetWidth;
  properties.push(
    {
      offset: offset, cardsCounter: cardsCounter, cardWidth: cardWidth,
    });
});

leftButtons.forEach(function (button, i) {
  button.addEventListener("click", function () {
    let carouselWidth = carousels[i].offsetWidth;
    if (properties[i].offset < 0) {
      let remainingWidth = 0 - properties[i].offset;
      if (remainingWidth <= carouselWidth) {
        properties[i].offset += remainingWidth;
      } else {
        properties[i].offset += carouselWidth - carouselWidth / menuParts;
      }
      carousels[i].style.transform = `translateX(${properties[i].offset}px)`;
    }
  });
});

rightButtons.forEach(function (button, i) {
  button.addEventListener('click', function () {
    let maxX = properties[i].cardsCounter * properties[i].cardWidth;
    let carouselWidth = carousels[i].offsetWidth;
    if (properties[i].offset > -maxX) {
      let remainingWidth = maxX + properties[i].offset - carouselWidth;
      if (remainingWidth <= carouselWidth) {
        properties[i].offset -= remainingWidth;
      } else {
        properties[i].offset -= carouselWidth - carouselWidth / menuParts;
      }
      carousels[i].style.transform = `translateX(${properties[i].offset}px)`;
    }
  });
});

// Resize width of carousel on window resizing.
window.onresize = function () {
  const VGA_WIDTH = 640;
  const QVGA_WIDTH = 320;
  let originalCarouselWidth = video.width - 2 * buttonWidth;
  let resizedCarouselWidth = window.innerWidth - 2 * buttonWidth;
  carousels.forEach(function (carousel) {
    if (window.innerWidth < VGA_WIDTH
      && video.width == VGA_WIDTH) { // vga and need to resize
      carousel.style.width = `${resizedCarouselWidth}px`;
    } else if (window.innerWidth > VGA_WIDTH
      && video.width == VGA_WIDTH) { // vga and no need to resize
      carousel.style.width = `${originalCarouselWidth}px`;
    } else if (window.innerWidth < QVGA_WIDTH
      && video.width == QVGA_WIDTH) {// gvga and need to resize
      carousel.style.width = `${resizedCarouselWidth}px`;
    } else if (window.innerWidth > QVGA_WIDTH
      && video.width == QVGA_WIDTH) {// gvga and no need to resize
      carousel.style.width = `${originalCarouselWidth}px`;
    }
  });
  // Set appropriate height for settings wrapper.
  let settings;
  try {
    settings = document.getElementById(`${controls.filter}Settings`);
    if (typeof (settings) != 'undefined' && settings != null) {
      let settingsWrapper = document.querySelector('.settings-wrapper');
      settingsWrapper.style.bottom =
        `${settings.offsetHeight + carousels[0].offsetHeight}px`;
    }
  } catch (err) { }
};

// Resize elements in menu for current canvas size.
function resizeMenu(smallWidth, smallHeight) {
  // Small canvases and cards
  let cards = document.querySelectorAll('.card');
  let cardPadding = getComputedStyle(cards[0]).padding;
  let smallCanvases = document.querySelectorAll('.small-canvas');
  for (let i = 0; i < smallCanvases.length; i++) {
    smallCanvases[i].style.height = `${smallHeight}px`;
    smallCanvases[i].style.width = cards[i].style.width = `${smallWidth}px`;
  }
  // Carousel
  if (isMobileDevice()) {
    carousels.forEach(function (carousel, i) {
      carousel.style.width = `${video.width}px`;
      carouselWrappers[i].style.overflowX = 'scroll';
      carouselWrappers[i].style.WebkitOverflowScrolling = 'touch';
      properties[i].cardWidth = smallWidth + 2 * parseInt(cardPadding);
    });
    leftButtons.forEach(function (leftButton, i) {
      leftButton.classList.add('hidden');
      rightButtons[i].classList.add('hidden');
    });
  } else {
    buttonWidth = leftButtons[0].offsetWidth;
    carousels.forEach(function (carousel, i) {
      carousel.style.width = `${video.width - 2 * buttonWidth}px`;
      properties[i].cardWidth = smallWidth + 2 * parseInt(cardPadding);
    });
    // Buttons height and top position (according to card padding)
    leftButtons.forEach(function (leftButton, i) {
      leftButton.style.top = cardPadding;
      rightButtons[i].style.top = cardPadding;
      leftButton.style.height = `${smallCanvases[0].scrollHeight}px`;
      rightButtons[i].style.height = `${smallCanvases[0].scrollHeight}px`;
    });
  }

  // Menu over the canvas
  carouselWrappers.forEach(function (wrapper) {
    wrapper.style.top = `${video.height - cards[0].offsetHeight}px`;
  });
  window.onresize();
}
