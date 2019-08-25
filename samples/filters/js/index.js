let utils = new Utils('errorMessage');
let stats = null;
let videoConstraint;
let smallVideoConstraint;
let streaming = false;
let imageCapturer = null;
let videoTrack = null;

let video = document.getElementById('videoInputMain');
let videoSmall = document.getElementById('videoInputSmall');
let canvasOutput = document.getElementById('canvasOutput');

let videoCapturer = null;
let videoCapturerSmall = null;
let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;
let srcSmall = null;
let dstC1Small = null;
let dstC3Small = null;
let dstC4Small = null;


function initOpencvObjects() {
  videoCapturer = new cv.VideoCapture(video);
  videoCapturerSmall = new cv.VideoCapture(videoSmall);

  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  dstC1 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  dstC3 = new cv.Mat(video.height, video.width, cv.CV_8UC3);
  dstC4 = new cv.Mat(video.height, video.width, cv.CV_8UC4);

  srcSmall = new cv.Mat(videoSmall.height, videoSmall.width, cv.CV_8UC4);
  dstC1Small = new cv.Mat(videoSmall.height, videoSmall.width, cv.CV_8UC1);
  dstC3Small = new cv.Mat(videoSmall.height, videoSmall.width, cv.CV_8UC3);
  dstC4Small = new cv.Mat(videoSmall.height, videoSmall.width, cv.CV_8UC4);
}

function deleteOpencvObjects() {
  src.delete();
  dstC1.delete();
  dstC3.delete();
  dstC4.delete();

  srcSmall.delete();
  dstC1Small.delete();
  dstC3Small.delete();
  dstC4Small.delete();
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  cameraBar.style.width = `${video.width}px`;

  videoSmall.width = videoSmall.videoWidth;
  videoSmall.height = videoSmall.videoHeight;
  initMenu(videoSmall.height, videoSmall.height);

  initMenuLabels();
  initFiltersSettings();

  document.getElementById('takePhotoButton').disabled = false;
}

function applyFacingModeToSmallVideo() {
  let smallVideoTrack = videoSmall.srcObject.getVideoTracks()[0];
  let constraints = smallVideoTrack.getConstraints();
  constraints.facingMode = { exact: controls.facingMode };
  smallVideoTrack.applyConstraints(constraints).catch(e => console.log(e));
}

function applyCurrentFilter() {
  switch (controls.filter) {
    case 'passThrough': return passThrough(src);
    case 'gray': return gray(src, dstC1);
    case 'hsv': return hsv(src, dstC3);
    case 'canny': return canny(src, dstC1);
    case 'threshold': return threshold(src, dstC4);
    case 'adaptiveThreshold': return adaptiveThreshold(src, dstC1);
    case 'gaussianBlur': return gaussianBlur(src, dstC4);
    case 'bilateralFilter': return bilateralFilter(src, dstC3);
    case 'medianBlur': return medianBlur(src, dstC4);
    case 'sobel': return sobel(src, dstC1);
    case 'scharr': return scharr(src, dstC1);
    case 'laplacian': return laplacian(src, dstC1);
    case 'calcHist': return calcHist(src, dstC1, dstC4);
    case 'equalizeHist': return equalizeHist(src, dstC1);
    case 'backprojection': return backprojection(src, dstC1, dstC3);
    case 'morphology': return morphology(src, dstC3, dstC4);
    default: return passThrough(src);
  }
}

function processVideo() {
  if (!streaming) {
    cleanupAndStop()
    return;
  }
  stats.begin();
  videoCapturer.read(src);
  cv.imshow('canvasOutput', applyCurrentFilter());

  videoCapturerSmall.read(srcSmall);
  cv.imshow('passThroughCanvas', passThrough(srcSmall));
  cv.imshow('grayCanvas', gray(srcSmall, dstC1Small));
  cv.imshow('hsvCanvas', hsv(srcSmall, dstC3Small));
  cv.imshow('cannyCanvas', canny(srcSmall, dstC1Small));
  cv.imshow('thresholdCanvas', threshold(srcSmall, dstC4Small));
  cv.imshow('adaptiveThresholdCanvas',
    adaptiveThreshold(srcSmall, dstC1Small));
  cv.imshow('gaussianBlurCanvas', gaussianBlur(srcSmall, dstC4Small));
  cv.imshow('bilateralFilterCanvas',
    bilateralFilter(srcSmall, dstC3Small));
  cv.imshow('medianBlurCanvas', medianBlur(srcSmall, dstC4Small));
  cv.imshow('sobelCanvas', sobel(srcSmall, dstC1Small));
  cv.imshow('scharrCanvas', scharr(srcSmall, dstC1Small));
  cv.imshow('laplacianCanvas',
    laplacian(srcSmall, dstC1Small));
  cv.imshow('calcHistCanvas', calcHist(srcSmall, dstC1Small, dstC4Small));
  cv.imshow('equalizeHistCanvas', equalizeHist(srcSmall, dstC1Small));
  cv.imshow('backprojectionCanvas',
    backprojection(srcSmall, dstC1Small, dstC3Small));
  cv.imshow('morphologyCanvas', morphology(srcSmall, dstC3Small, dstC4Small));

  stats.end();
  requestAnimationFrame(processVideo);
}

function startCamera() {
  // Set initial facingMode for small video.
  if (controls.backCamera != null) {
    controls.facingMode = 'environment';
    smallVideoConstraint.deviceId = { exact: controls.backCamera.deviceId };
  }

  if (!streaming) {
    utils.clearError();
    utils.startCamera(videoConstraint, 'videoInputMain', () => {
      // TODO(sasha): figure out why some cameras don't work
      // if we create two streams.
      utils.startCamera(smallVideoConstraint,
        'videoInputSmall', onVideoStarted);
    });
  } else {
    stopCamera(video);
    stopCamera(videoSmall);
    onVideoStopped();
  }
}

function cleanupAndStop() {
  deleteOpencvObjects();
  stopCamera(video);
  stopCamera(videoSmall);
  onVideoStopped();
}

function stopCamera(videoElem) {
  if (videoElem) {
    videoElem.pause();
    videoElem.srcObject = null;
    videoElem.removeEventListener('canplay', utils.onVideoCanPlay);
  }
  if (videoElem.srcObject) {
    videoElem.srcObject.getVideoTracks()[0].stop();
  }
};

utils.loadOpenCv(() => {
  initUI();
  initCameraSettingsAndStart();
});
