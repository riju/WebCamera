let utils = new Utils('errorMessage');
let stats = null;
let resolution = window.innerWidth < 700 ? 'qvga' : 'vga';
let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');
let streaming = false;
let src = null;
let cap = null;
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

const FPS = 30;
function startVideoProcessing() {
  initStats();
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  gray = new cv.Mat();
  cap = new cv.VideoCapture(video);
  faces = new cv.RectVector();
  eyes = new cv.RectVector();
  faceCascade = new cv.CascadeClassifier();
  faceCascade.load(faceDetectionPath);
  eyeCascade = new cv.CascadeClassifier();
  eyeCascade.load(eyeDetectionPath);
  // schedule the first processing
  setTimeout(processVideo, 0);
}

function processVideo() {
  try {
    if (!streaming) {
      // clean and stop
      src.delete(); gray.delete();
      faces.delete(); faceCascade.delete();
      eyes.delete(); eyeCascade.delete();
      return;
    }
    stats.begin();
    let begin = Date.now();
    // start processing
    cap.read(src);
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    // detect faces
    faceCascade.detectMultiScale(gray, faces,
      1.1, 3); // scaleFactor=1.1, minNeighbors=3
    for (let i = 0; i < faces.size(); ++i) {
      let face = faces.get(i);
      // draw face
      let point1 = new cv.Point(face.x, face.y);
      let point2 = new cv.Point(face.x + face.width, face.y + face.height);
      cv.rectangle(src, point1, point2, faceColor);
      // detect eyes in face ROI
      let faceGray = gray.roi(face);
      let faceSrc = src.roi(face);
      eyeCascade.detectMultiScale(faceGray, eyes, 1.1, 3);
      for (let j = 0; j < eyes.size(); ++j) {
        let point1 = new cv.Point(eyes.get(j).x, eyes.get(j).y);
        let point2 = new cv.Point(eyes.get(j).x + eyes.get(j).width,
          eyes.get(j).y + eyes.get(j).height);
        cv.rectangle(faceSrc, point1, point2, eyesColor);
      }
      faceGray.delete(); faceSrc.delete();
    }
    cv.imshow('canvasOutput', src);
    // schedule the next processing
    let delay = 1000 / FPS - (Date.now() - begin);
    stats.end();
    setTimeout(processVideo, delay);
  } catch (err) {
    utils.printError(err);
  }
};

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
  streaming = true;
  video.width = video.videoWidth;
  video.height = video.videoHeight;
  video.setAttribute('width', video.videoWidth);
  video.setAttribute('height', video.videoHeight);
  canvasOutput.style.width = `${video.videoWidth}px`;
  canvasOutput.style.height = `${video.videoHeight}px`;
  startVideoProcessing();
}

function onVideoStopped() {
  streaming = false;
  canvasContext.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
}

utils.loadOpenCv(() => {
  utils.createFileFromUrl(faceDetectionPath, faceDetectionUrl, () => {
    utils.createFileFromUrl(eyeDetectionPath, eyeDetectionUrl, () => {
      startCamera();
    });
  });
});