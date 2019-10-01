let utils = new Utils('errorMessage');
let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');

let videoConstraint;
let videoTrack = null;
let imageCapturer = null;
let streaming = false;

let controls = {};
let startDocProcessing = false;

function initOpencvObjects() { }

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  let outputBarWrapper = document.querySelector('.output-bar-wrapper');
  let outputBar = document.querySelector('.output');
  let mainContent = document.getElementById('mainContent');

  cameraBar.style.width = outputBarWrapper.style.width =
    mainContent.style.width = `${video.videoWidth}px`;
  outputBar.style.padding = '30px 0px';

  cameraBar.style.width = mainContent.style.width = `${video.videoWidth}px`;

  document.querySelector('.canvas-wrapper').style.height =
    `${video.videoHeight}px`;

  canvasOutput.width = video.width;
  canvasOutput.height = video.height;

  document.getElementById('takePhotoButton').disabled = false;

  mainContent.classList.remove('hidden');
}

// Main function.
function processVideo() {
  try {
    if (!streaming) {
      cleanupAndStop();
      return;
    } else if (startDocProcessing) {
      return;
    }
    canvasContext.drawImage(video, 0, 0, video.width, video.height);
    requestAnimationFrame(processVideo);
  } catch (err) {
    utils.printError(err);
  }
}

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  menuHeight += parseInt(getComputedStyle(
    document.querySelector('.output-bar-wrapper')).height);
  getVideoConstraint(menuHeight);

  let copyButton = document.getElementById('copyButton');
  copyButton.addEventListener('click', function () {
    let barcodeValue = document.getElementById('barcodeValue');
    barcodeValue.select();
    document.execCommand("copy");
    alert("Copied the barcode value: " + barcodeValue.value);
  });

  createTakePhotoListener();
}

function createTakePhotoListener() {
  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', function () {
    startDocProcessing = true;

    // Remove takePhoto button, add retry and ok button.
    let cameraBar = document.getElementById('cameraBar');
    cameraBar.removeChild(cameraBar.children[0]);
    createRetryButton();

    startProcessing();
  });
}

function createRetryButton() {
  let cameraBar = document.getElementById('cameraBar');
  addButtonToCameraBar('retryButton', 'refresh', 1);
  let retryButton = document.getElementById('retryButton');

  retryButton.addEventListener('click', function () {
    cameraBar.removeChild(cameraBar.children[0]);
    addButtonToCameraBar('takePhotoButton', 'photo_camera', 1);

    createTakePhotoListener();

    document.getElementById('barcodeValue').value = '';
    let barcodeValue = document.querySelector(`label[for=barcodeValue]`);
    barcodeValue.classList.add('hidden');
    let barcodeStatus = document.querySelector(`#barcodeStatus`);
    barcodeStatus.classList.add('hidden');

    startDocProcessing = false;

    requestAnimationFrame(processVideo);
  });
}

function startCamera() {
  if (!streaming) {
    utils.clearError();
    utils.startCamera(videoConstraint, 'videoInput', onVideoStarted);
  } else {
    cleanupAndStop();
  }
}

function cleanupAndStop() {
  utils.stopCamera(); onVideoStopped();
}


initUI();
initCameraSettingsAndStart();
