let utils = new Utils('errorMessage');
let video = document.getElementById('videoInputMain');
let videoSmall = document.getElementById('videoInputSmall');
let canvasOutput = document.getElementById('canvasOutput');

// Whether streaming video from the camera.
let streaming = false;
let videoCaptureMain = null;
let videoCaptureSmall = null;
let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;
let srcSmall = null;
let dstC1Small = null;
let dstC3Small = null;
let dstC4Small = null;

function initOpencvMatrices() {
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  dstC1 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
  dstC3 = new cv.Mat(video.height, video.width, cv.CV_8UC3);
  dstC4 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  srcSmall = new cv.Mat(videoSmall.height, videoSmall.width, cv.CV_8UC4);
  dstC1Small = new cv.Mat(videoSmall.height, videoSmall.width, cv.CV_8UC1);
  dstC3Small = new cv.Mat(videoSmall.height, videoSmall.width, cv.CV_8UC3);
  dstC4Small = new cv.Mat(videoSmall.height, videoSmall.width, cv.CV_8UC4);
}

function deleteOpencvMatrices() {
  src.delete();
  dstC1.delete();
  dstC3.delete();
  dstC4.delete();
  srcSmall.delete();
  dstC1Small.delete();
  dstC3Small.delete();
  dstC4Small.delete();
}

function startVideoProcessing() {
  videoSmall.width = videoSmall.videoWidth;
  videoSmall.height = videoSmall.videoHeight;
  resizeMenu(videoSmall.height, videoSmall.height);
  resizeMenuLabels();
  resizeFilterSettings();

  videoCaptureMain = new cv.VideoCapture(video);
  videoCaptureSmall = new cv.VideoCapture(videoSmall);
  initOpencvMatrices();
  requestAnimationFrame(processVideo);
}

function processVideo() {
  if (!streaming) {
    cleanupAndStop()
    return;
  }
  stats.begin();
  videoCaptureMain.read(src);
  videoCaptureSmall.read(srcSmall);
  let result;
  switch (controls.filter) {
    case 'passThrough': result = passThrough(src); break;
    case 'gray': result = gray(src, dstC1); break;
    case 'hsv': result = hsv(src, dstC3); break;
    case 'canny': result = canny(src, dstC1); break;
    case 'threshold': result = threshold(src, dstC4); break;
    case 'adaptiveThreshold':
      result = adaptiveThreshold(src, dstC1); break;
    case 'gaussianBlur': result = gaussianBlur(src, dstC4); break;
    case 'bilateralFilter':
      result = bilateralFilter(src, dstC3); break;
    case 'medianBlur': result = medianBlur(src, dstC4); break;
    case 'sobel': result = sobel(src, dstC1); break;
    case 'scharr': result = scharr(src, dstC1); break;
    case 'laplacian': result = laplacian(src, dstC1); break;
    case 'calcHist': result = calcHist(src, dstC1, dstC4); break;
    case 'equalizeHist': result = equalizeHist(src, dstC1); break;
    case 'backprojection': result = backprojection(src, dstC1, dstC3); break;
    case 'morphology': result = morphology(src, dstC3, dstC4); break;
    default: result = passThrough(src);
  }
  cv.imshow('canvasOutput', result);

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
  deleteOpencvMatrices();
  stopCamera(video);
  stopCamera(videoSmall);
  onVideoStopped();
}

function stopCamera(video) {
  if (video) {
    video.pause();
    video.srcObject = null;
    video.removeEventListener('canplay', onVideoCanPlay);
  }
  if (video.srcObject) {
    video.srcObject.getVideoTracks()[0].stop();
  }
};

utils.loadOpenCv(() => {
  initUI();
  startCamera();
});