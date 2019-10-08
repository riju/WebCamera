const MIN_AREA = 5000;
const DEFAULT_EDGE_OFFSET = 15; // In pixels.
const TOUCH_DETECTION_RADIUS = 20; // In pixels.
const DEFAULT_THRESHOLD_BLOCKSIZE = 9;
const DEFAULT_THRESHOLD_OFFSET = 10;

let approxCoords; // Four points.
let isDragging = false;
let selectedCoords = [];
let isPointdragging = [false, false, false, false];
let showingScannedDoc = false;
let thresholdBlockSize = DEFAULT_THRESHOLD_BLOCKSIZE;
let thresholdOffset = DEFAULT_THRESHOLD_OFFSET;

function startProcessing(src) {
  // Detect edges of the document.
  dst = new cv.Mat();
  obtainImageEdges(src, dst);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  // Find the contour representing the piece of paper being scanned.
  cv.findContours(dst, contours, hierarchy,
    cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  let maxAreaResult = findMaxAreaContour(contours);
  showContour(src, contours, maxAreaResult);

  addCanvasEventListeners();

  // Remove takePhoto button, add retry and ok button.
  let cameraBar = document.getElementById('cameraBar');
  cameraBar.removeChild(cameraBar.children[0]);
  createRetryButton();
  createOkButton(src, approxCoords);

  dst.delete();
  contours.delete();
  hierarchy.delete();
}

function obtainImageEdges(src, dst) {
  cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY);
  cv.GaussianBlur(dst, dst, { width: 5, height: 5 }, 0, 0, cv.BORDER_DEFAULT);
  // 75 and 200 are values of the first and second thresholds.
  cv.Canny(dst, dst, 75, 200);
}

function setCanvasBackground() {
  // Generate image from the canvas.
  var imageDataURL = canvasOutput.toDataURL();
  // Set this image as canvas background
  // so we don't need to redraw it every time.
  canvasOutput.style.background = "url('" + imageDataURL + "')";
}

function showContour(src, contours, res) {
  let approxCnt = new cv.Mat();
  if (res.maxArea > MIN_AREA) { // Don't show small contours as documents.
    let cnt = contours.get(res.i);
    let perimeter = cv.arcLength(cnt, true);
    cv.approxPolyDP(cnt, approxCnt, 0.01 * perimeter, true);
    approxCoords = getContourCoordinates(approxCnt);
    cnt.delete();
  } else {
    // Create default edges because we didn't detect any document.
    approxCoords = [{ x: DEFAULT_EDGE_OFFSET, y: DEFAULT_EDGE_OFFSET },
    { x: src.cols - DEFAULT_EDGE_OFFSET, y: DEFAULT_EDGE_OFFSET },
    { x: src.cols - DEFAULT_EDGE_OFFSET, y: src.rows - DEFAULT_EDGE_OFFSET },
    { x: DEFAULT_EDGE_OFFSET, y: src.rows - DEFAULT_EDGE_OFFSET }];
  }
  // Show image with document as background because we don't need to redraw it.
  //setCanvasBackground();
  drawPoints();
  approxCnt.delete();
}

function createTakePhotoListener() {
  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', function () {
    selectedCoords = [];
    startDocProcessing = true;

    // Don't restart page by 'top-bottom' touch scrolling
    // (Chrome browser feature).
    document.getElementsByTagName('body')[0]
      .style.overscrollBehaviorY = 'contain';

    startProcessing(src);
  });
}

function createRetryButton() {
  let cameraBar = document.getElementById('cameraBar');
  addButtonToCameraBar('retryButton', 'refresh', 2);
  let retryButton = document.getElementById('retryButton');

  retryButton.addEventListener('click', function () {
    cameraBar.removeChild(cameraBar.children[0]);
    cameraBar.removeChild(cameraBar.children[0]);
    addButtonToCameraBar('takePhotoButton', 'photo_camera', 1);

    document.getElementsByTagName('body')[0]
      .style.overscrollBehaviorY = 'auto';
    createTakePhotoListener();
    removeCanvasEventListeners();
    canvasOutput.style.background = 'initial';

    // Hide BlockSize and Offset sliders.
    let blockSizeSettings =
      document.getElementsByClassName('threshold-block-size')[0];
    blockSizeSettings.classList.add('hidden');
    let offsetSettings =
      document.getElementsByClassName('threshold-offset')[0];
    offsetSettings.classList.add('hidden');


    thresholdBlockSize = DEFAULT_THRESHOLD_BLOCKSIZE;
    thresholdOffset = DEFAULT_THRESHOLD_OFFSET;
    isDragging = false;
    selectedCoords = [];
    showingScannedDoc = false;
    startDocProcessing = false;

    requestAnimationFrame(processVideo);
  });
}

function createOkButton(src, approxCoords) {
  let cameraBar = document.getElementById('cameraBar');
  addButtonToCameraBar('okButton', 'done', 2);
  let okButton = document.getElementById('okButton');

  okButton.addEventListener('click', function () {
    cameraBar.removeChild(cameraBar.children[1]);
    addButtonToCameraBar('saveButton', 'save_alt', 2);

    // Show BlockSize and Offset sliders.
    let blockSizeSettings =
      document.getElementsByClassName('threshold-block-size')[0];
    blockSizeSettings.classList.remove('hidden');
    let offsetSettings =
      document.getElementsByClassName('threshold-offset')[0];
    offsetSettings.classList.remove('hidden');

    document.getElementsByTagName('body')[0]
      .style.overscrollBehaviorY = 'auto';
    removeCanvasEventListeners();
    processDocument(src, approxCoords);
  });
}

function processDocument(src, approxCoords) {
  // Apply a perspective transform to obtain the top-down view of the document.
  let warpedImage = new cv.Mat();
  fourPointTransform(src, approxCoords, warpedImage);

  let thresholdedImage = new cv.Mat();
  // To obtain the black and white feel to the image,
  // we convert warped image to grayscale and apply adaptive thresholding.
  cv.cvtColor(warpedImage, warpedImage, cv.COLOR_BGR2GRAY);
  cv.adaptiveThreshold(warpedImage, thresholdedImage, 250,
    cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY,
    thresholdBlockSize, thresholdOffset);

  resizeDoc(thresholdedImage);

  showingScannedDoc = true;
  showScannedDoc(thresholdedImage);

  warpedImage.delete(); thresholdedImage.delete();
}

function resizeDoc(image) {
  let videoAspectRatio = video.height / video.width;
  let docAspectRatio = image.rows / image.cols;
  if (docAspectRatio > videoAspectRatio)
    resizeImage(image, undefined, height = video.height);
  else resizeImage(image, width = video.width);
}

function showScannedDoc(image) {
  // Clear canvas.
  canvasContext.clearRect(0, 0, video.width, video.height);

  // Extract image data.
  cv.cvtColor(image, image, cv.COLOR_GRAY2RGBA);
  let imgData = new ImageData(new Uint8ClampedArray(image.data),
    image.cols, image.rows);

  let startX = (video.width - image.cols) / 2;
  let startY = (video.height - image.rows) / 2;
  canvasContext.putImageData(imgData, startX, startY);
}

function fourPointTransform(image, rect, warpedImage) {
  // Compute the width of the new image, which will be the
  // maximum distance between bottom-right and bottom-left
  // x-coordiates or the top-right and top-left x-coordinates.
  let widthA = Math.sqrt(Math.pow(
    rect[2].x - rect[3].x, 2) + Math.pow(rect[2].y - rect[3].y, 2));
  let widthB = Math.sqrt(Math.pow(
    rect[1].x - rect[0].x, 2) + Math.pow(rect[1].y - rect[0].y, 2));
  let maxWidth = parseInt(Math.max(widthA, widthB));

  // Compute the height of the new image, which will be the
  // maximum distance between the top-right and bottom-right
  // y-coordinates or the top-left and bottom-left y-coordinates.
  let heightA = Math.sqrt(Math.pow(
    rect[1].x - rect[2].x, 2) + Math.pow(rect[1].y - rect[2].y, 2));
  let heightB = Math.sqrt(Math.pow(
    rect[0].x - rect[3].x, 2) + Math.pow(rect[0].y - rect[3].y, 2));
  let maxHeight = parseInt(Math.max(heightA, heightB));

  // Now that we have the dimensions of the new image, construct
  // the set of destination points to obtain a "birds eye view",
  // (i.e. top-down view) of the image, again specifying points
  // in the top-left, top-right, bottom-right, and bottom-left order.
  let dsize = new cv.Size(maxWidth, maxHeight);
  let imgTri = cv.matFromArray(4, 1, cv.CV_32FC2,
    [rect[0].x, rect[0].y, rect[1].x, rect[1].y, rect[2].x, rect[2].y, rect[3].x, rect[3].y]);
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2,
    [0, 0, maxWidth - 1, 0, maxWidth - 1, maxHeight - 1, 0, maxHeight - 1]);
  let M = cv.getPerspectiveTransform(imgTri, dstTri);
  cv.warpPerspective(image, warpedImage, M, dsize);

  M.delete(); imgTri.delete(); dstTri.delete();
}

function drawPoints() {
  cv.imshow('canvasOutput', src);

  canvasContext.strokeStyle = '#57CC65';
  for (let i = 0; i < approxCoords.length; i++) {
    canvasContext.beginPath();
    canvasContext.arc(approxCoords[i].x, approxCoords[i].y, 5, 0, 2 * Math.PI, false);
    canvasContext.lineWidth = 10;
    canvasContext.stroke();
  }
  canvasContext.beginPath();
  canvasContext.moveTo(approxCoords[0].x, approxCoords[0].y);
  canvasContext.lineTo(approxCoords[1].x, approxCoords[1].y);
  canvasContext.lineTo(approxCoords[2].x, approxCoords[2].y);
  canvasContext.lineTo(approxCoords[3].x, approxCoords[3].y);
  canvasContext.lineTo(approxCoords[0].x, approxCoords[0].y);
  canvasContext.lineWidth = 3;
  canvasContext.stroke();
}

function addCanvasEventListeners() {
  canvasOutput.addEventListener('touchstart', startDragging);
  canvasOutput.addEventListener('touchmove', drag);
  canvasOutput.addEventListener('touchend', endDragging);
  canvasOutput.addEventListener('touchcancel', cancelDragging);
  if (!isMobileDevice()) {
    canvasOutput.addEventListener('mousedown', startDragging);
    canvasOutput.addEventListener('mousemove', drag);
    canvasOutput.addEventListener('mouseup', endDragging);
    canvasOutput.addEventListener('mouseout', cancelDragging);
  }
}

function removeCanvasEventListeners() {
  canvasOutput.removeEventListener('touchstart', startDragging);
  canvasOutput.removeEventListener('touchmove', drag);
  canvasOutput.removeEventListener('touchend', endDragging);
  canvasOutput.removeEventListener('touchcancel', cancelDragging);
  if (!isMobileDevice()) {
    canvasOutput.removeEventListener("mousedown", startDragging);
    canvasOutput.removeEventListener("mousemove", drag);
    canvasOutput.removeEventListener("mouseup", endDragging);
    canvasOutput.removeEventListener("mouseout", cancelDragging);
  }
}

function startDragging(e) {
  isDragging = true;
  let position = (e.touches != undefined) ? getTouchPos(e) : getMousePos(e);

  for (let i = 0; i < approxCoords.length; ++i) {
    canvasContext.beginPath();
    canvasContext.rect(approxCoords[i].x - TOUCH_DETECTION_RADIUS,
      approxCoords[i].y - TOUCH_DETECTION_RADIUS,
      TOUCH_DETECTION_RADIUS * 2, TOUCH_DETECTION_RADIUS * 2);

    if (canvasContext.isPointInPath(position.x, position.y)) {
      isPointdragging[i] = true;
      approxCoords[i] = position;
      break;

    } else {
      isPointdragging[i] = false;
    }
  }
}

function drag(e) {
  let position = (e.touches != undefined) ? getTouchPos(e) : getMousePos(e);
  changeCursorStyle(position);

  if (isDragging) {
    canvasContext.clearRect(0, 0, video.width, video.height);

    for (let i = 0; i < approxCoords.length; ++i) {
      if (isPointdragging[i]) {
        approxCoords[i] = position;
        break;
      }
    }

    drawPoints();
  }
}

function endDragging() {
  isDragging = false;
  for (let i = 0; i < approxCoords.length; ++i) {
    isPointdragging[i] = false;
  }
}

function cancelDragging() {
  isDragging = false;
  for (let i = 0; i < approxCoords.length; ++i) {
    isPointdragging[i] = false;
  }
}

function getMousePos(e) {
  let mouseX = Math.round(e.pageX - canvasOutput.offsetLeft);
  let mouseY = Math.round(e.pageY - canvasOutput.offsetTop);
  return { x: mouseX, y: mouseY };
}

function getTouchPos(e) {
  let touchX = Math.round(e.touches[0].pageX - canvasOutput.offsetLeft);
  let touchY = Math.round(e.touches[0].pageY - canvasOutput.offsetTop);
  return { x: touchX, y: touchY };
}

function changeCursorStyle(position) {
  canvasOutput.style.cursor = 'default';
  for (let i = 0; i < approxCoords.length; ++i) {
    canvasContext.beginPath();
    canvasContext.rect(approxCoords[i].x - TOUCH_DETECTION_RADIUS,
      approxCoords[i].y - TOUCH_DETECTION_RADIUS,
      TOUCH_DETECTION_RADIUS * 2, TOUCH_DETECTION_RADIUS * 2);

    if (canvasContext.isPointInPath(position.x, position.y)) {
      canvasOutput.style.cursor = 'grab';
      break;
    }
  }
}
