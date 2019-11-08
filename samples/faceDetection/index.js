let utils = new Utils('errorMessage');
let stats = null;
let controls = {};
let videoConstraint;
let streaming = false;
let videoTrack = null;

let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let canvasOutputCtx = null;
let canvasInput = null;
let canvasInputCtx = null;

let src = null;
let gray = null;
let eyeVec = null;
let faceVec = null;
let faceCascade = null;
let eyeCascade = null;

const faceDetectionPath = 'haarcascade_frontalface_default.xml';
const faceDetectionUrl = '../../data/classifiers/haarcascade_frontalface_default.xml';
const eyeDetectionPath = 'haarcascade_eye.xml';
const eyeDetectionUrl = '../../data/classifiers/haarcascade_eye.xml';

const faceColor = [0, 255, 255, 255];
const eyesColor = [0, 0, 255, 255];

// In face and eyes detection, downscaleLevel parameter is used
// to downscale resolution of input stream and insrease speed of detection.
let downscaleLevel = 1;

function initOpencvObjects() {
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  gray = new cv.Mat();

  faceVec = new cv.RectVector();
  faceCascade = new cv.CascadeClassifier();
  // TODO(sasha): Use Web Workers to load files.
  faceCascade.load(faceDetectionPath);

  eyeVec = new cv.RectVector();
  eyeCascade = new cv.CascadeClassifier();
  eyeCascade.load(eyeDetectionPath);
}

function deleteOpencvObjects() {
  src.delete(); gray.delete();
  faceVec.delete(); faceCascade.delete();
  eyeVec.delete(); eyeCascade.delete();
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
  canvasOutputCtx = canvasOutput.getContext('2d');
}

function processVideo() {
  try {
    if (!streaming) {
      cleanupAndStop();
      return;
    }
    stats.begin();
    let faces = [];
    let eyes = [];
    canvasInputCtx.drawImage(video, 0, 0, video.width, video.height);
    let imageData = canvasInputCtx.getImageData(0, 0, video.width, video.height);
    src.data.set(imageData.data);

    // Detect faces.
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    for (let i = 0; i < downscaleLevel; ++i) cv.pyrDown(gray, gray);
    let matSize = gray.size();
    faceCascade.detectMultiScale(gray, faceVec);

    for (let i = 0; i < faceVec.size(); ++i) {
      let face = faceVec.get(i);
      // Draw face.
      faces.push(face);

      // Detect eyes in face ROI.
      let faceGray = gray.roi(face);
      eyeCascade.detectMultiScale(faceGray, eyeVec);

      for (let j = 0; j < eyeVec.size() && j < 2; ++j) {
        // Draw eye.
        let eye = eyeVec.get(j);
        eyes.push(new cv.Rect(face.x + eye.x, face.y + eye.y, eye.width, eye.height));
      }
      faceGray.delete();
    }
    canvasOutputCtx.drawImage(canvasInput, 0, 0, video.width, video.height);
    drawResults(canvasOutputCtx, faces, '#FFFF00', matSize); // Yellow color.
    drawResults(canvasOutputCtx, eyes, '#00FFFF', matSize); // Turquoise color.

    stats.end();
    requestAnimationFrame(processVideo);
  } catch (err) {
    utils.printError(err);
  }
};

function drawResults(ctx, results, color, size) {
  for (let i = 0; i < results.length; ++i) {
    let rect = results[i];
    let xRatio = video.width / size.width;
    let yRatio = video.height / size.height;
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.strokeRect(rect.x * xRatio, rect.y * yRatio, rect.width * xRatio, rect.height * yRatio);
  }
}

function startCamera() {
  if (!streaming) {
    utils.clearError();
    utils.startCamera(videoConstraint, 'videoInput', onVideoStarted);
  } else {
    utils.stopCamera();
    onVideoStopped();
  }
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

  enableThreads();

  // Event listener for dowscale parameter.
  let downscaleLevelInput = document.getElementById('downscaleLevel');
  let downscaleLevelOutput = document.getElementById('downscaleLevelOutput');
  downscaleLevelInput.addEventListener('input', function () {
    downscaleLevel = downscaleLevelOutput.value = parseInt(downscaleLevelInput.value);
  });
  downscaleLevelInput.addEventListener('change', function () {
    downscaleLevel = downscaleLevelOutput.value = parseInt(downscaleLevelInput.value);
  });
}

utils.loadOpenCv(() => {
  utils.createFileFromUrl(faceDetectionPath, faceDetectionUrl, () => {
    utils.createFileFromUrl(eyeDetectionPath, eyeDetectionUrl, () => {
      initUI();
      initCameraSettingsAndStart();
    });
  });
});
