let utils = new Utils('errorMessage');
let width = 0;
let height = 0;
let smallWidth = 0;
let smallHeight = 0;
// whether streaming video from the camera.
let streaming = false;
let resolution = window.innerWidth < 700 ? 'qvga' : 'vga';
let video = document.getElementById('videoInput');
let vc = null;
let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;
let srcSmall = null;
let dstC1Small = null;
let dstC3Small = null;
let dstC4Small = null;

function startVideoProcessing() {
  src = new cv.Mat(height, width, cv.CV_8UC4);
  dstC1 = new cv.Mat(height, width, cv.CV_8UC1);
  dstC3 = new cv.Mat(height, width, cv.CV_8UC3);
  dstC4 = new cv.Mat(height, width, cv.CV_8UC4);
  srcSmall = new cv.Mat(smallHeight, smallWidth, cv.CV_8UC4);
  dstC1Small = new cv.Mat(smallHeight, smallWidth, cv.CV_8UC1);
  dstC3Small = new cv.Mat(smallHeight, smallWidth, cv.CV_8UC3);
  dstC4Small = new cv.Mat(smallHeight, smallWidth, cv.CV_8UC4);
  requestAnimationFrame(processVideo);
}

function processVideo() {
  if (!streaming) return;
  stats.begin();
  vc.read(src);
  let result;
  switch (controls.filter) {
    case 'passThrough': result = passThrough(src); break;
    case 'gray': result = gray(src, dstC1); break;
    case 'hsv': result = hsv(src, dstC3); break;
    case 'canny': result = canny(src, dstC1); break;
    case 'threshold': result = threshold(src, dstC4); break;
    case 'adaptiveThreshold':
      result = adaptiveThreshold(src, dstC1, height, width); break;
    case 'gaussianBlur': result = gaussianBlur(src, dstC4); break;
    case 'bilateralFilter':
      result = bilateralFilter(src, dstC3, height, width); break;
    case 'medianBlur': result = medianBlur(src, dstC4); break;
    case 'sobel': result = sobel(src, dstC1, height, width); break;
    case 'scharr': result = scharr(src, dstC1, height, width); break;
    case 'laplacian': result = laplacian(src, dstC1, height, width); break;
    case 'calcHist': result = calcHist(src, dstC1, dstC4); break;
    case 'equalizeHist': result = equalizeHist(src, dstC1); break;
    case 'backprojection': result = backprojection(src, dstC1, dstC3); break;
    case 'morphology': result = morphology(src, dstC3, dstC4); break;
    default: result = passThrough(src);
  }
  cv.imshow('canvasOutput', result);

  srcSmall.delete();
  srcSmall = src.clone();
  let smallSize = new cv.Size(smallWidth, smallHeight);
  cv.resize(srcSmall, srcSmall, smallSize, 0, 0, cv.INTER_CUBIC);
  cv.imshow('passThrough', passThrough(srcSmall));
  cv.imshow('gray', gray(srcSmall, dstC1Small));
  cv.imshow('hsv', hsv(srcSmall, dstC3Small));
  cv.imshow('canny', canny(srcSmall, dstC1Small));
  cv.imshow('threshold', threshold(srcSmall, dstC4Small));
  cv.imshow('adaptiveThreshold',
    adaptiveThreshold(srcSmall, dstC1Small, smallHeight, smallWidth));
  cv.imshow('gaussianBlur', gaussianBlur(srcSmall, dstC4Small));
  cv.imshow('bilateralFilter',
    bilateralFilter(srcSmall, dstC3Small, smallHeight, smallWidth));
  cv.imshow('medianBlur', medianBlur(srcSmall, dstC4Small));
  cv.imshow('sobel', sobel(srcSmall, dstC1Small, smallHeight, smallWidth));
  cv.imshow('scharr', scharr(srcSmall, dstC1Small, smallHeight, smallWidth));
  cv.imshow('laplacian',
    laplacian(srcSmall, dstC1Small, smallHeight, smallWidth));
  cv.imshow('calcHist', calcHist(srcSmall, dstC1Small, dstC4Small));
  cv.imshow('equalizeHist', equalizeHist(srcSmall, dstC1Small));
  cv.imshow('backprojection',
    backprojection(srcSmall, dstC1Small, dstC3Small));
  cv.imshow('morphology', morphology(srcSmall, dstC3Small, dstC4Small));

  stats.end();
  requestAnimationFrame(processVideo);
}

function startCamera() {
  if (!streaming) {
    utils.clearError();
    utils.startCamera(resolution, onVideoStarted, 'videoInput');
  } else {
    utils.stopCamera();
    onVideoStopped();
  }
}

function onVideoStarted() {
  height = video.videoHeight;
  width = video.videoWidth;
  smallHeight = parseInt(video.videoHeight / 5);
  smallWidth = parseInt(video.videoWidth / 5);
  video.setAttribute('width', width);
  video.setAttribute('height', height);
  streaming = true;
  vc = new cv.VideoCapture(video);
  resizeElements();
  startVideoProcessing();
}

function stopVideoProcessing() {
  if (src != null && !src.isDeleted()) src.delete();
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
  if (srcSmall != null && !srcSmall.isDeleted()) srcSmall.delete();
  if (dstC1Small != null && !dstC1Small.isDeleted()) dstC1Small.delete();
  if (dstC3Small != null && !dstC3Small.isDeleted()) dstC3Small.delete();
  if (dstC4Small != null && !dstC4Small.isDeleted()) dstC4Small.delete();
}

function onVideoStopped() {
  if (!streaming) return;
  stopVideoProcessing();
  document.getElementById('canvasOutput').getContext('2d')
    .clearRect(0, 0, width, height);
  streaming = false;
}

utils.loadOpenCv(() => {
  initUI();
  startCamera();
});