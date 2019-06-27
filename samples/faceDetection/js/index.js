let utils = new Utils('errorMessage');
let stats = null;
let videoConstraint;
let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');

let streaming = false;
let videoCapture = null;
let src = null;
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

function getVideoConstraint() {
  if (isMobileDevice()) {
    // TODO(sasha): figure out why getUserMedia(...) in utils.js
    // swap width and height for mobile devices.
    videoConstraint = {
      facingMode: { exact: "user" },
      //width: { ideal: window.screen.width },
      //height: { ideal: window.screen.height }
      width: { ideal: window.screen.height },
      height: { ideal: window.screen.width }
    };
  } else {
    if (window.innerWidth < 960) {
      videoConstraint = resolutions['qvga'];
    } else {
      videoConstraint = resolutions['vga'];
    }
  }
}

function initOpencvObjects() {
  videoCapture = new cv.VideoCapture(video);
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  gray = new cv.Mat();
  faces = new cv.RectVector();
  eyes = new cv.RectVector();
  faceCascade = new cv.CascadeClassifier();
  // TODO(sasha): Use Web Workers to load files.
  faceCascade.load(faceDetectionPath);
  eyeCascade = new cv.CascadeClassifier();
  eyeCascade.load(eyeDetectionPath);
}

function startVideoProcessing() {
  initStats();
  initOpencvObjects();
  requestAnimationFrame(processVideo);
}

function processVideo() {
  try {
    if (!streaming) {
      cleanupAndStop();
      return;
    }
    stats.begin();
    videoCapture.read(src);

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
  src.delete(); gray.delete();
  faces.delete(); faceCascade.delete();
  eyes.delete(); eyeCascade.delete();
  utils.stopCamera(); onVideoStopped();
}

utils.loadOpenCv(() => {
  utils.createFileFromUrl(faceDetectionPath, faceDetectionUrl, () => {
    utils.createFileFromUrl(eyeDetectionPath, eyeDetectionUrl, () => {
      getVideoConstraint();
      startCamera();
    });
  });
});
