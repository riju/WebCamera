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
let background = null;
let dst = null;
let lowerRedRange = null;
let upperRedRange = null;

// Camera parameters are not stable when the camera is just getting started.
// So we execute a loop where we capture background and use the last frame
// as a stable background.
const BACKGROUND_CAPTURE_ITERATIONS = 300;


function initOpencvObjects() {
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  background = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  dst = new cv.Mat();

  // In OpenCV, Hue range is [0,179], Saturation range is [0,255]
  // and Value range is [0,255]. We use 0-33 range for blue color,
  // 100-255 for saturation and 70-255 for brigtness.
  lowerRedRange = new cv.Mat(video.height, video.width, cv.CV_8UC3,
    new cv.Scalar(0, 100, 70, 255));
  upperRedRange = new cv.Mat(video.height, video.width, cv.CV_8UC3,
    new cv.Scalar(33, 255, 255, 255));
}

function deleteOpencvObjects() {
  src.delete(); background.delete(); dst.delete();
  lowerRedRange.delete(); upperRedRange.delete();
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  cameraBar.style.width = `${video.width}px`;
  document.getElementById('takePhotoButton').disabled = false;

  // Extra canvas to get source image from video element
  // (instead of cv.VideoCapture).
  canvasInput = document.createElement('canvas');
  canvasInput.width = video.width;
  canvasInput.height = video.height;
  canvasInputCtx = canvasInput.getContext('2d');

  canvasOutput.width = video.width;
  canvasOutput.height = video.height;
}

function captureBackground() {
  for (let i = 0; i < BACKGROUND_CAPTURE_ITERATIONS; ++i) {
    canvasInputCtx.drawImage(video, 0, 0, video.width, video.height);
    let imageData = canvasInputCtx.getImageData(0, 0, video.width, video.height);
    background.data.set(imageData.data);
    cv.imshow(canvasOutput, background);
  }
  document.getElementById("demoState").innerText = "Ready for magic! Put on your blue cloak!"
  requestAnimationFrame(processVideo);
}

function removeBlueColor(source, destination) {
  let hsv = new cv.Mat();
  let mask = new cv.Mat();
  let maskInv = new cv.Mat();
  let sourceResult = new cv.Mat();
  let backgroundResult = new cv.Mat();

  // Convert source image to HSV color space.
  // HSV - Hue (color information), Saturation (intensity), Value (brightness).
  cv.cvtColor(source, hsv, cv.COLOR_BGR2HSV);

  // Apply lower and upper boundary of a blue color to inRange filter.
  cv.inRange(hsv, lowerRedRange, upperRedRange, mask);

  // Dilation increases area of filtered object.
  let kernel = cv.Mat.ones(3, 3, cv.CV_32F);
  cv.morphologyEx(mask, mask, cv.MORPH_DILATE, kernel);

  // Apply mask to background image.
  cv.bitwise_and(background, background, sourceResult, mask);

  // Create an inverted mask of a filtered object and apply it to source image.
  cv.bitwise_not(mask, maskInv);
  cv.bitwise_and(source, source, backgroundResult, maskInv);

  // Combine source and background images.
  cv.addWeighted(backgroundResult, 1, sourceResult, 1, 0, destination);

  hsv.delete();
  mask.delete(); maskInv.delete();
  sourceResult.delete(); backgroundResult.delete();
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

    removeBlueColor(src, dst);

    cv.imshow(canvasOutput, dst);

    stats.end();
    requestAnimationFrame(processVideo);
  } catch (err) {
    utils.printError(err);
  }
};

function startCamera() {
  if (!streaming) {
    utils.clearError();
    utils.startCamera(videoConstraint, 'videoInput', onVideoStartedCustom);
  } else {
    utils.stopCamera();
    onVideoStopped();
  }
}

function onVideoStartedCustom() {
  streaming = true;
  setMainCanvasProperties(video);
  videoTrack = video.srcObject.getVideoTracks()[0];
  imageCapturer = new ImageCapture(videoTrack);
  document.getElementById('mainContent').classList.remove('hidden');
  completeStyling();
  initOpencvObjects();
  captureBackground();
}

function cleanupAndStop() {
  deleteOpencvObjects();
  utils.stopCamera(); onVideoStopped();
}

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);
  initStats();

  // TakePhoto event by clicking takePhotoButton.
  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', function () {
    // Here we are not using takePhoto() per se.
    // new ImageCapture(videoTrack) gives image without applied filter.
    let dstCanvas = document.getElementById('gallery');
    drawCanvas(dstCanvas, canvasOutput);
  });

  // TODO(sasha): move to utils.js.
  let facingModeButton = document.getElementById('facingModeButton');
  // Switch to face or environment mode by clicking facingModeButton.
  facingModeButton.addEventListener('click', function () {
    if (controls.facingMode == 'user') {
      controls.facingMode = 'environment';
      videoConstraint.deviceId = { exact: controls.backCamera.deviceId };
      facingModeButton.innerText = 'camera_front';
    } else if (controls.facingMode == 'environment') {
      controls.facingMode = 'user';
      videoConstraint.deviceId = { exact: controls.frontCamera.deviceId };
      facingModeButton.innerText = 'camera_rear';
    }
    utils.clearError();
    utils.stopCamera();
    utils.startCamera(videoConstraint, 'videoInput', startVideoProcessing);
  });

  if (!isMobileDevice()) {
    // Init threads number.
    let threadsControl = document.getElementsByClassName('threads-control')[0];
    threadsControl.classList.remove('hidden');
    let threadsNumLabel = document.getElementById('threadsNumLabel');
    let threadsNum = document.getElementById('threadsNum');
    threadsNum.max = navigator.hardwareConcurrency;
    threadsNumLabel.innerHTML = `Number of threads (1 - ${threadsNum.max}):&nbsp;`;
    if (3 <= threadsNum.max) threadsNum.value = 3;
    else threadsNum.value = 1;
    cv.parallel_pthreads_set_threads_num(parseInt(threadsNum.value));
    threadsNum.addEventListener('change', () => {
      cv.parallel_pthreads_set_threads_num(parseInt(threadsNum.value));
    });
  }
}

utils.loadOpenCv(() => {
  initUI();
  initCameraSettingsAndStart();
});
