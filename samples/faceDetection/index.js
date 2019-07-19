let utils = new Utils('errorMessage');
let stats = null;
let controls = {};
let videoConstraint;
let streaming = false;
let imageCapturer = null;
let videoTrack = null;

let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');

let videoCapturer = null;
let image = null;
let src = null;
let gray = null;
let faces = null;
let eyes = null;
let faceCascade = null;
let eyeCascade = null;

const faceDetectionPath = 'haarcascade_frontalface_default.xml';
const faceDetectionUrl = '../../data/classifiers/haarcascade_frontalface_default.xml';
const eyeDetectionPath = 'haarcascade_eye.xml';
const eyeDetectionUrl = '../../data/classifiers/haarcascade_eye.xml';

const faceColor = [0, 255, 255, 255];
const eyesColor = [0, 0, 255, 255];


function initOpencvObjects() {
  videoCapturer = new cv.VideoCapture(video);
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  gray = new cv.Mat();

  faces = new cv.RectVector();
  faceCascade = new cv.CascadeClassifier();
  // TODO(sasha): Use Web Workers to load files.
  faceCascade.load(faceDetectionPath);

  eyes = new cv.RectVector();
  eyeCascade = new cv.CascadeClassifier();
  eyeCascade.load(eyeDetectionPath);
}

function deleteOpencvObjects() {
  src.delete(); gray.delete();
  faces.delete(); faceCascade.delete();
  eyes.delete(); eyeCascade.delete();
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  cameraBar.style.width = `${video.videoWidth}px`;
  document.getElementById('takePhotoButton').disabled = false;
}

function processVideo() {
  try {
    if (!streaming) {
      cleanupAndStop();
      return;
    }
    stats.begin();
    videoCapturer.read(src);

    // Detect faces.
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    faceCascade.detectMultiScale(gray, faces,
      1.1, 3); // scaleFactor=1.1, minNeighbors=3

    for (let i = 0; i < faces.size(); ++i) {
      let face = faces.get(i);
      // Draw face.
      let facePointUpperLeft = new cv.Point(face.x, face.y);
      let facePointBottomRight =
        new cv.Point(face.x + face.width, face.y + face.height);
      cv.rectangle(src, facePointUpperLeft, facePointBottomRight, faceColor);

      // Detect eyes in face ROI.
      let faceGray = gray.roi(face);
      let faceSrc = src.roi(face);
      eyeCascade.detectMultiScale(faceGray, eyes, 1.1, 3);

      for (let j = 0; j < eyes.size(); ++j) {
        // Draw eye.
        let eyePointUpperLeft = new cv.Point(eyes.get(j).x, eyes.get(j).y);
        let eyePointBottomRight =
          new cv.Point(eyes.get(j).x + eyes.get(j).width,
            eyes.get(j).y + eyes.get(j).height);
        cv.rectangle(faceSrc, eyePointUpperLeft,
          eyePointBottomRight, eyesColor);
      }
      faceGray.delete(); faceSrc.delete();
    }
    image = src;
    cv.imshow('canvasOutput', src);

    stats.end();
    requestAnimationFrame(processVideo);
  } catch (err) {
    utils.printError(err);
  }
};

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
  getVideoConstraint();
  initStats();

  // TakePhoto event by clicking takePhotoButton.
  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', function () {
    // Here we are not using takePhoto() per se.
    // new ImageCapture(videoTrack) gives image without applied filter.
    let dstCanvas = document.getElementById('gallery');
    drawCanvas(dstCanvas, canvasOutput);
  });

  controls = {
    frontCamera: null,
    backCamera: null,
    facingMode: '',
  };

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
    utils.stopCamera();
    utils.startCamera(videoConstraint, 'videoInput', startVideoProcessing);
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
