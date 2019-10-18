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
let faceNet = null;

const faceDetectionWeightsPath = 'res10_300x300_ssd_iter_140000_fp16.caffemodel';
const faceDetectionWeightsUrl = '../../data/classifiers/res10_300x300_ssd_iter_140000_fp16.caffemodel';
const faceDetectionProtoPath = 'deploy_lowres.prototxt.txt';
const faceDetectionProtoUrl = '../../data/classifiers/deploy_lowres.prototxt.txt';

const faceColor = [0, 255, 255, 255];

// In face detection, downscaleLevel parameter is used
// to downscale resolution of input stream and insrease speed of detection.
let downscaleLevel = 1;

function initOpencvObjects() {
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  gray = new cv.Mat();
  faceNet = cv.readNetFromCaffe(faceDetectionProtoPath, faceDetectionWeightsPath);
}

function deleteOpencvObjects() {
  src.delete(); gray.delete();
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  cameraBar.style.width = `${video.width}px`;
  document.getElementById('takePhotoButton').disabled = false;

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
    canvasInputCtx.drawImage(video, 0, 0, video.width, video.height);
    let imageData = canvasInputCtx.getImageData(0, 0, video.width, video.height);
    src.data.set(imageData.data);
    cv.cvtColor(src, gray, cv.COLOR_RGBA2BGR);

    var blob = cv.blobFromImage(gray, 1, { width: 192, height: 144 }, [104, 117, 123, 0], false, false);
    faceNet.setInput(blob);
    var out = faceNet.forward();

    let faces = [];
    for (var i = 0, n = out.data32F.length; i < n; i += 7) {
      var confidence = out.data32F[i + 2];
      var left = out.data32F[i + 3] * gray.cols;
      var top = out.data32F[i + 4] * gray.rows;
      var right = out.data32F[i + 5] * gray.cols;
      var bottom = out.data32F[i + 6] * gray.rows;
      left = Math.min(Math.max(0, left), gray.cols - 1);
      right = Math.min(Math.max(0, right), gray.cols - 1);
      bottom = Math.min(Math.max(0, bottom), gray.rows - 1);
      top = Math.min(Math.max(0, top), gray.rows - 1);

      if (confidence > 0.5 && left < right && top < bottom) {
        faces.push({ x: left, y: top, width: right - left, height: bottom - top })
      }
    }
    blob.delete();
    out.delete();

    canvasOutputCtx.drawImage(canvasInput, 0, 0, video.width, video.height);
    let matSize = gray.size();
    drawResults(canvasOutputCtx, faces, '#FFFF00', matSize); // Yellow color.

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
  utils.createFileFromUrl(faceDetectionWeightsPath, faceDetectionWeightsUrl, () => {
    utils.createFileFromUrl(faceDetectionProtoPath, faceDetectionProtoUrl, () => {
      initUI();
      initCameraSettingsAndStart();
    });
  });
});
