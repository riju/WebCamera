let utils = new Utils('errorMessage');
let stats = null;
let videoConstraint;
let streaming = false;
let videoTrack = null;

let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let smallCanvasInput = null;
let smallCanvasInputCtx = null;

let videoCapturer = null;
let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;
let srcSmall = null;
let dstC1Small = null;
let dstC3Small = null;
let dstC4Small = null;

// This object will keep size and coordinates for filtered previews.
let previews = {};

function initOpencvObjects() {
  videoCapturer = new cv.VideoCapture(video);

  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  dstC1 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  dstC3 = new cv.Mat(video.height, video.width, cv.CV_8UC3);
  dstC4 = new cv.Mat(video.height, video.width, cv.CV_8UC4);

  srcSmall = new cv.Mat(previews.finalWidth, previews.finalWidth, cv.CV_8UC4);
  dstC1Small = new cv.Mat(previews.finalWidth, previews.finalWidth, cv.CV_8UC1);
  dstC3Small = new cv.Mat(previews.finalWidth, previews.finalWidth, cv.CV_8UC3);
  dstC4Small = new cv.Mat(previews.finalWidth, previews.finalWidth, cv.CV_8UC4);
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

  // Each filter will be shown in a small square canvas,
  // so we have to find width of this square and x, y positions where
  // to start clipping from original image to make it as a square.
  let smallCanvasWidth = parseInt(video.width / 6);
  let smallCanvasHeight = parseInt(video.height / 6);
  if (smallCanvasWidth > smallCanvasHeight) {
    previews.originalWidth = video.height;
    previews.finalWidth = smallCanvasHeight;
    previews.x = (video.width - video.height) / 2;
    previews.y = 0;
  } else {
    previews.originalWidth = video.width;
    previews.finalWidth = smallCanvasWidth;
    previews.x = 0;
    previews.y = (video.height - video.width) / 2;
  }

  initMenu(previews.finalWidth, previews.finalWidth);
  initMenuLabels();
  initFiltersSettings();

  // Create extra canvas to put there resized original image
  // for processing of filtered previews.
  smallCanvasInput = document.createElement('canvas');
  smallCanvasInput.width = previews.finalWidth;
  smallCanvasInput.height = previews.finalWidth;
  smallCanvasInputCtx = smallCanvasInput.getContext('2d');

  document.getElementById('takePhotoButton').disabled = false;
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

  // Resize original image for processing of filtered previews.
  smallCanvasInputCtx.drawImage(video, previews.x, previews.y,
    previews.originalWidth, previews.originalWidth,
    0, 0, previews.finalWidth, previews.finalWidth);
  let imageData = smallCanvasInputCtx
    .getImageData(0, 0, previews.finalWidth, previews.finalWidth);
  srcSmall.data.set(imageData.data);

  // Show filtered previews.
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

utils.loadOpenCv(() => {
  initUI();
  initCameraSettingsAndStart();
});
