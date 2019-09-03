let utils = new Utils('errorMessage');
let controls = {};
let videoConstraint;
let streaming = false;
let videoTrack = null;
let imageCapturer = null;
let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
var canvasContext = canvasOutput.getContext('2d');
let videoCapturer = null;
let src = null;
let dst = null;
let startDocProcessing = false;


function initOpencvObjects() {
  videoCapturer = new cv.VideoCapture(video);
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  let mainContent = document.getElementById('mainContent');

  cameraBar.style.width = mainContent.style.width = `${video.videoWidth}px`;

  document.querySelector('.canvas-wrapper').style.height =
    `${video.videoHeight}px`;

  mainContent.classList.remove('hidden');

  document.getElementById('takePhotoButton').disabled = false;
}

function processVideo() {
  try {
    if (!streaming) {
      cleanupAndStop();
      return;
    } else if (startDocProcessing) {
      return;
    }
    videoCapturer.read(src);
    cv.imshow('canvasOutput', src);
    requestAnimationFrame(processVideo);
  } catch (err) {
    utils.printError(err);
  }
}

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);

  // TakePhoto event by clicking takePhotoButton.
  createTakePhotoListener();
}

function startCamera() {
  utils.startCamera(videoConstraint, 'videoInput', onVideoStarted);
}

function cleanupAndStop() {
  src.delete();
  utils.stopCamera();
}

utils.loadOpenCv(() => {
  initUI();
  initCameraSettingsAndStart();
});
