const carousels = document.querySelectorAll("[data-target='carousel']");
const leftButtons = document.querySelectorAll("[data-action='slideLeft']");
const rightButtons = document.querySelectorAll("[data-action='slideRight']");

let offset = [];
carousels.forEach(function (carousel) {
  // offset for each caousel will always be negative or zero
  offset.push(0);
});

// for showing 1/4 part of previous menu window after scrolling
const menuParts = 4;

leftButtons.forEach(function (button, i) {
  button.addEventListener("click", function () {
    const carouselWidth = carousels[i].offsetWidth;
    if (offset[i] < 0) {
      let remainedWidth = 0 - offset[i];
      if (remainedWidth <= carouselWidth) {
        offset[i] += remainedWidth;
      } else {
        offset[i] += carouselWidth - carouselWidth / menuParts;
      }
      carousels[i].style.transform = `translateX(${offset[i]}px)`;
    }
  });
});

rightButtons.forEach(function (button, i) {
  button.addEventListener("click", function () {
    const cardCount = carousels[i].querySelectorAll("[data-target='card']").length;
    const card = carousels[i].querySelector("[data-target='card']");
    const maxX = cardCount * card.offsetWidth;
    const carouselWidth = carousels[i].offsetWidth;
    if (offset[i] > -maxX) {
      let remainedWidth = maxX + offset[i] - carouselWidth;
      if (remainedWidth <= carouselWidth) {
        offset[i] -= remainedWidth;
      } else {
        offset[i] -= carouselWidth - carouselWidth / menuParts;
      }
      carousels[i].style.transform = `translateX(${offset[i]}px)`;
    }
  });
});

// resize carousel on window resizing
window.onresize = function () {
  const VGA_WIDTH = 640;
  const GVGA_WIDTH = 320;
  let buttonWidth = leftButtons[0].offsetWidth;
  let windowConstraintVGA = VGA_WIDTH + 2 * buttonWidth;
  let windowConstraintGVGA = GVGA_WIDTH + 2 * buttonWidth;
  carousels.forEach(function (carousel) {
    if (window.innerWidth < windowConstraintVGA && width == VGA_WIDTH) { // vga
      carousel.style.width =
        `${window.innerWidth - 3 * buttonWidth}px`;
    } else if (window.innerWidth > windowConstraintVGA &&
      width == VGA_WIDTH) { // vga
      carousel.style.width =
        `${width - 2 * buttonWidth}px`;
    } else if (window.innerWidth < windowConstraintGVGA &&
      width == GVGA_WIDTH) {// gvga
      carousel.style.width =
        `${window.innerWidth - 3 * buttonWidth}px`;
    } else if (window.innerWidth > windowConstraintGVGA &&
      width == GVGA_WIDTH) {// gvga
      carousel.style.width =
        `${width - 2 * buttonWidth}px`;
    }
  });
};

// resize menu for current canvas size
function resizeMenu(smallCanvasFormat = "deviceFormat",
                    heightDependenceCoef = 0, scale = 0.2) {

  const VGA_WIDTH = 640;
  // carousel
  let buttonWidth = leftButtons[0].offsetWidth;
  carousels.forEach(function (carousel) {
    carousel.style.width = `${width - 2 * buttonWidth}px`;
  });
  // small canvases and cards
  let smallCanvases = document.getElementsByClassName("small-canvas");
  let scProperties = document.querySelector(".small-canvas");
  let scPadding = parseInt(getComputedStyle(scProperties).padding);
  let cards = document.getElementsByClassName("card");
  let smallH = scale * height;
  let smallW = 0;
  if (smallCanvasFormat == "customFormat") {
    smallW = smallH * heightDependenceCoef;
  } else if (smallCanvasFormat == "deviceFormat") {
    smallW = scale * width;
  }
  for (let i = 0; i < smallCanvases.length; i++) {
    smallCanvases[i].style.height = `${parseInt(smallH)}px`;
    smallCanvases[i].style.width = `${parseInt(smallW)}px`;
    cards[i].style.width = `${parseInt(smallW + 2 * scPadding)}px`;
    if (width < VGA_WIDTH) {
      cards[i].style.fontSize = `16px`;
    }
  }
  // buttons
  rightButtons.forEach(function (button) {
    button.style.height = `${scProperties.scrollHeight}px`;
  });
  leftButtons.forEach(function (button) {
    button.style.height = `${scProperties.scrollHeight}px`;
  });
}