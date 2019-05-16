
let leftPaddle = document.getElementsByClassName('left-paddle');
let rightPaddle = document.getElementsByClassName('right-paddle');
let itemElement = document.getElementsByClassName('item');
let menuElement = document.getElementsByClassName('menu');
let menuWrapperElement = document.getElementsByClassName('menu-wrapper');

let itemSize = itemElement[0].offsetWidth;
let scrollDuration = 100;
let currentPosition = 0;
let menuWrapperSize = menuWrapperElement[0].offsetWidth;
let menuSize = itemElement.length * itemSize;

let paddleMargin = 20;
let menuVisibleSize = menuWrapperSize;
let menuInvisibleSize = menuSize - menuWrapperSize;

window.addEventListener('resize', function () {
	menuWrapperSize = menuWrapperElement[0].offsetWidth;
});

menuElement[0].addEventListener('scroll', function () {
	menuInvisibleSize = menuSize - menuWrapperSize;
	let menuPosition = currentPosition;
	let menuEndOffset = menuInvisibleSize - paddleMargin;
	if (menuPosition <= paddleMargin) {
		leftPaddle[0].classList.add('hidden');
		rightPaddle[0].classList.remove('hidden');
	} else if (menuPosition < menuEndOffset) {
		leftPaddle[0].classList.remove('hidden');
		rightPaddle[0].classList.remove('hidden');
	} else if (menuPosition >= menuEndOffset) {
		leftPaddle[0].classList.remove('hidden');
		rightPaddle[0].classList.add('hidden');
	}
});

rightPaddle[0].addEventListener('click', function () {
	currentPosition += menuWrapperSize - menuWrapperSize / 3;
	$('.menu').animate({ scrollLeft: currentPosition }, scrollDuration);
});
leftPaddle[0].addEventListener('click', function () {
	currentPosition -= menuWrapperSize - menuWrapperSize / 3;
	$('.menu').animate({ scrollLeft: currentPosition }, scrollDuration);
});

let overlay = document.getElementsByClassName('overlay');
let videoElement = document.getElementById('canvasOutput');
videoElement.addEventListener('progress', function () {
	let show = videoElement.currentTime >= 5 && videoElement.currentTime < 10;
	overlay[0].style.visibility = show ? 'visible' : 'visible';
}, false);