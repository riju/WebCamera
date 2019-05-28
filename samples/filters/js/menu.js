const carousel = document.querySelector("[data-target='carousel']");
const card = carousel.querySelector("[data-target='card']");
const leftButton = document.querySelector("[data-action='slideLeft']");
const rightButton = document.querySelector("[data-action='slideRight']");
const cardCount = carousel.querySelectorAll("[data-target='card']").length;
let offset = 0; // offset will always be negative or zero

leftButton.addEventListener("click", function () {
  const carouselWidth = carousel.offsetWidth;
  if (offset < 0) {
    let remainedWidth = 0 - offset;
    if (remainedWidth <= carouselWidth) {
      offset += remainedWidth;
    } else {
      offset += carouselWidth - carouselWidth / 4;
    }
    carousel.style.transform = `translateX(${offset}px)`;
  }
})
rightButton.addEventListener("click", function () {
  const maxX = cardCount * card.offsetWidth;
  const carouselWidth = carousel.offsetWidth;
  if (offset > -maxX) {
    let remainedWidth = maxX + offset - carouselWidth;
    if (remainedWidth <= carouselWidth) {
      offset -= remainedWidth;
    } else {
      offset -= carouselWidth - carouselWidth / 4;
    }
    carousel.style.transform = `translateX(${offset}px)`;
  }
})