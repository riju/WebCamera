let utils = new Utils('errorMessage');
let stats = null;
let controls = {};
let videoConstraint;
let streaming = false;
let videoTrack = null;
let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let canvasInput = null;
let canvasInputCtx = null;
let src = null;
let dst = null;


function initOpencvObjects() {
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  dst = new cv.Mat();
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  let outputBar = document.querySelector('.output-bar-wrapper');
  let mainContent = document.getElementById('mainContent');

  cameraBar.style.width = outputBar.style.width =
    mainContent.style.width = `${video.videoWidth}px`;

  document.querySelector('.canvas-wrapper').style.height =
    `${video.videoHeight}px`;

  calculateRectCoordinates();

  // Extra canvas to get source image from video element
  // (instead of cv.VideoCapture).
  canvasInput = document.createElement('canvas');
  canvasInput.width = video.width;
  canvasInput.height = video.height;
  canvasInputCtx = canvasInput.getContext('2d');

  mainContent.classList.remove('hidden');
}

function processVideo() {
  try {
    if (!streaming) {
      cleanupAndStop();
      return;
    }
    stats.begin();
    canvasInputCtx.drawImage(video, 0, 0, video.width, video.height);
    let imageData = canvasInputCtx.getImageData(0, 0, video.width, video.height);
    src.data.set(imageData.data);

    // Detect edges of the card before start card processing.

    // Convert image to gray and apply canny filter.
    cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY, 0);
    //cv.GaussianBlur(dst, dst, { width: 5, height: 5 }, 0, 0, cv.BORDER_DEFAULT);
    // 15 and 45 are values of the first and second thresholds.
    cv.Canny(dst, dst, 15, 45);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    let approxCnt = new cv.Mat();
    cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); ++i) {
      let cnt = contours.get(i);
      let perimeter = cv.arcLength(cnt, true);
      // Approximate the contour with the (0.01 * perimeter) precision.
      cv.approxPolyDP(cnt, approxCnt, 0.01 * perimeter, true);

      if (approxCnt.rows == 4) { // If contour approximation has 4 angles.
        // Get coordinates of contour and sort them clockwise
        // with upper left point as the first point.
        let sortedCoordinates = getContourCoordinates(approxCnt);

        if (isCloseToExpectedContour(sortedCoordinates)) {
          document.getElementById('retryButton').disabled = false;
          startCardProcessing(src, controls.expectedContour[0], controls.expectedContour[2]);
          return;
        }
      }
      cnt.delete();
    }
    // Draw white rectangle to position card inside.
    cv.rectangle(src, controls.expectedContour[0], controls.expectedContour[2], controls.rectColor, 2);
    cv.imshow('canvasOutput', src);

    contours.delete(); hierarchy.delete(); approxCnt.delete();
    stats.end();
    requestAnimationFrame(processVideo);

  } catch (err) {
    utils.printError(err);
  }
}

function calculateRectCoordinates() {
  const rectRatio = 1.586;
  let xLeft = parseInt(video.width * 0.1);
  let xRight = parseInt(video.width * 0.9);
  let width = xRight - xLeft;
  let height = width / rectRatio;
  let yUpper = parseInt(video.height / 2 - height / 2);
  let yBottom = parseInt(yUpper + height);

  controls.expectedContour.push({ x: xLeft, y: yUpper });
  controls.expectedContour.push({ x: xRight, y: yUpper });
  controls.expectedContour.push({ x: xRight, y: yBottom });
  controls.expectedContour.push({ x: xLeft, y: yBottom });
}

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  menuHeight += parseInt(getComputedStyle(
    document.querySelector('.output-bar-wrapper')).height);
  getVideoConstraint(menuHeight);
  initStats();

  controls = {
    // We draw rectangle on video stream to position card inside it
    // so expected contour includes vertices of this rectangle.
    expectedContour: [],
    rectColor: [255, 255, 255, 255], // White color.
    // edgeError is used to detect edges of the card.
    edgeError: parseInt(document.getElementById('edgeError').value),
  };

  let copyButton = document.getElementById('copyButton');
  copyButton.addEventListener('click', function () {
    let cardNumber = document.getElementById('cardNumber');
    cardNumber.select();
    document.execCommand("copy");
    alert("Copied the card number: " + cardNumber.value);
  });

  let retryButton = document.getElementById('retryButton');
  retryButton.addEventListener('click', function () {
    document.getElementById('retryButton').disabled = true;
    document.getElementById('cardType').innerText = '';
    document.getElementById('cardNumber').value = '';
    let label = document.querySelector(`label[for=cardNumber]`);
    label.classList.add('hidden');

    startVideoProcessing();
  });

  let edgeErrorElem = document.getElementById('edgeError');
  edgeErrorElem.oninput = function () {
    document.getElementById('edgeErrorOutput').value =
      controls.edgeError = parseInt(edgeError.value);
  }
}

function startCamera() {
  utils.startCamera(videoConstraint, 'videoInput', onVideoStarted);
}

function cleanupAndStop() {
  src.delete(); dst.delete();
  utils.stopCamera(); onVideoStopped();
}

utils.loadOpenCv(() => {
  initUI();
  initCameraSettingsAndStart();
});
