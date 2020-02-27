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

// Camera parameters are not stable when the camera is just getting started.
// So we execute a loop where we capture background and use the last frame
// as a stable background.
const BACKGROUND_CAPTURE_ITERATIONS = 30;

// In OpenCV, Hue range is [0,179], Saturation range is [0,255]
// and Value range is [0,255]. We use ~0-33 range for blue color as default.
const LOWER_HUE_DEFAULT = 0;
const UPPER_HUE_DEFAULT = 33;
const LOWER_SATURATION_DEFAULT = 100;
const UPPER_SATURATION_DEFAULT = 255;
const LOWER_VALUE_DEFAULT = 7;
const UPPER_VALUE_DEFAULT = 255;

let HSVranges = {
  lowerHue: LOWER_HUE_DEFAULT,
  upperHue: UPPER_HUE_DEFAULT,
  lowerSaturation: LOWER_SATURATION_DEFAULT,
  lowerSaturation: UPPER_SATURATION_DEFAULT,
  lowerValue: LOWER_VALUE_DEFAULT,
  upperValue: UPPER_VALUE_DEFAULT,
}


function initOpencvObjects() {
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  background = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  dst = new cv.Mat();
}

function inRange(hsv, mask) {
  let lowerRange = new cv.Mat(video.height, video.width, cv.CV_8UC3,
    new cv.Scalar(HSVranges.lowerHue, HSVranges.lowerSaturation,
      HSVranges.lowerValue, 255));
  let upperRange = new cv.Mat(video.height, video.width, cv.CV_8UC3,
    new cv.Scalar(HSVranges.upperHue, HSVranges.upperSaturation,
      HSVranges.upperValue, 255));

  cv.inRange(hsv, lowerRange, upperRange, mask);

  lowerRange.delete(); upperRange.delete();
}

function deleteOpencvObjects() {
  src.delete(); background.delete(); dst.delete();
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

  let resetButton = document.querySelector('.reset-button');
  resetButton.style.left = `${video.videoWidth - resetButton.offsetWidth}px`;
  resetButton.style.bottom = `${video.videoHeight}px`;

  canvasOutput.width = video.width;
  canvasOutput.height = video.height;
}

let backgroundCaptureCounter = 0;
function runCapturingRound() {
  if (backgroundCaptureCounter < BACKGROUND_CAPTURE_ITERATIONS) {
    ++backgroundCaptureCounter;

    canvasInputCtx.drawImage(video, 0, 0, video.width, video.height);
    let imageData = canvasInputCtx.getImageData(0, 0, video.width, video.height);
    background.data.set(imageData.data);
    cv.imshow(canvasOutput, background);

    requestAnimationFrame(runCapturingRound);
    return;
  }
  backgroundCaptureCounter = 0;
  document.getElementById("demoState").innerText = "Ready for magic! You may adjust color range below.";
  requestAnimationFrame(processVideo);
}
function captureBackground() {
  document.getElementById("demoState").innerText = "Capturing background...";
  requestAnimationFrame(runCapturingRound);
}

function applyColorSegmentation(source, destination) {
  let hsv = new cv.Mat(video.height, video.width, cv.CV_8UC3);
  let mask = new cv.Mat();
  let maskInv = new cv.Mat();
  let sourceResult = new cv.Mat();
  let backgroundResult = new cv.Mat();

  // Convert source image to HSV color space.
  // HSV - Hue (color information), Saturation (intensity), Value (brightness).
  cv.cvtColor(source, hsv, cv.COLOR_BGR2HSV);

  // Apply lower and upper boundaries of HSV channels to inRange filter.
  inRange(hsv, mask);

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

    applyColorSegmentation(src, dst);

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
  document.getElementById('mainContent').classList.remove('hidden');
  completeStyling();
  initOpencvObjects();
  // Capture background first.
  requestAnimationFrame(captureBackground);
}

function cleanupAndStop() {
  deleteOpencvObjects();
  utils.stopCamera(); onVideoStopped();
}

function resetHSVsettings() {
  document.getElementById('lowerHue').value =
    document.getElementById('lowerHueOutput').value =
    HSVranges.lowerHue = LOWER_HUE_DEFAULT;
  document.getElementById('upperHue').value =
    document.getElementById('upperHueOutput').value =
    HSVranges.upperHue = UPPER_HUE_DEFAULT;
  document.getElementById('lowerSaturation').value =
    document.getElementById('lowerSaturationOutput').value =
    HSVranges.lowerSaturation = LOWER_SATURATION_DEFAULT;
  document.getElementById('upperSaturation').value =
    document.getElementById('upperSaturationOutput').value =
    HSVranges.upperSaturation = UPPER_SATURATION_DEFAULT;
  document.getElementById('lowerValue').value =
    document.getElementById('lowerValueOutput').value =
    HSVranges.lowerValue = LOWER_VALUE_DEFAULT;
  document.getElementById('upperValue').value =
    document.getElementById('upperValueOutput').value =
    HSVranges.upperValue = UPPER_VALUE_DEFAULT;
}

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);
  initStats();

  // Event for reset button.
  let resetButton = document.querySelector('.reset-button');
  resetButton.addEventListener('click', function () {
    resetHSVsettings();
  });

  // Initialize values for HSV sliders.
  resetHSVsettings();

  // Event listeners for HSV sliders.

  // Hue.
  let lowerHueSlider = document.getElementById('lowerHue');
  let lowerHueOutput = document.getElementById('lowerHueOutput');
  lowerHueSlider.addEventListener('input', function () {
    HSVranges.lowerHue = lowerHueOutput.value = parseInt(lowerHueSlider.value);
  });
  lowerHueSlider.addEventListener('change', function () {
    HSVranges.lowerHue = lowerHueOutput.value = parseInt(lowerHueSlider.value);
  });
  let upperHueSlider = document.getElementById('upperHue');
  let upperHueOutput = document.getElementById('upperHueOutput');
  upperHueSlider.addEventListener('input', function () {
    HSVranges.upperHue = upperHueOutput.value = parseInt(upperHueSlider.value);
  });
  upperHueSlider.addEventListener('change', function () {
    HSVranges.upperHue = upperHueOutput.value = parseInt(upperHueSlider.value);
  });

  // Saturation.
  let lowerSaturationSlider = document.getElementById('lowerSaturation');
  let lowerSaturationOutput = document.getElementById('lowerSaturationOutput');
  lowerSaturationSlider.addEventListener('input', function () {
    HSVranges.lowerSaturation = lowerSaturationOutput.value =
      parseInt(lowerSaturationSlider.value);
  });
  lowerSaturationSlider.addEventListener('change', function () {
    HSVranges.lowerSaturation = lowerSaturationOutput.value =
      parseInt(lowerSaturationSlider.value);
  });
  let upperSaturationSlider = document.getElementById('upperSaturation');
  let upperSaturationOutput = document.getElementById('upperSaturationOutput');
  upperSaturationSlider.addEventListener('input', function () {
    HSVranges.upperSaturation = upperSaturationOutput.value =
      parseInt(upperSaturationSlider.value);
  });
  upperSaturationSlider.addEventListener('change', function () {
    HSVranges.upperSaturation = upperSaturationOutput.value =
      parseInt(upperSaturationSlider.value);
  });

  // Value (brightness).
  let lowerValueSlider = document.getElementById('lowerValue');
  let lowerValueOutput = document.getElementById('lowerValueOutput');
  lowerValueSlider.addEventListener('input', function () {
    HSVranges.lowerValue = lowerValueOutput.value = parseInt(lowerValueSlider.value);
  });
  lowerValueSlider.addEventListener('change', function () {
    HSVranges.lowerValue = lowerValueOutput.value = parseInt(lowerValueSlider.value);
  });
  let upperValueSlider = document.getElementById('upperValue');
  let upperValueOutput = document.getElementById('upperValueOutput');
  upperValueSlider.addEventListener('input', function () {
    HSVranges.upperValue = upperValueOutput.value = parseInt(upperValueSlider.value);
  });
  upperValueSlider.addEventListener('change', function () {
    HSVranges.upperValue = upperValueOutput.value = parseInt(upperValueSlider.value);
  });

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

  enableThreads();
}

utils.loadOpenCv(() => {
  initUI();
  initCameraSettingsAndStart();
});
