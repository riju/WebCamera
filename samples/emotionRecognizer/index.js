let utils = new Utils('errorMessage');
let stats = null;
let controls = {};
let videoConstraint;
let streaming = false;
let videoTrack = null;

let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let canvasInput = null;
let canvasInputCtx = null;

let src = null;
let gray = null;
let faceVec = null;
let faceCascade = null;
let fisherFaceRecognizer = null;

const faceModelPath = 'haarcascade_frontalface_default.xml';
const faceModelUrl = '../../data/classifiers/haarcascade_frontalface_default.xml';
const emotionModelPath = 'emotion_detection_model.xml';
const emotionModelUrl = '../../data/classifiers/emotion_detection_model.xml';

// emoticons will have the same order as emotions.
let emoticons = [];
const emotions = ['neutral', 'anger', 'disgust', 'fear', 'happiness', 'sadness', 'surprise']
let nImagesLoaded = 0;
const N_IMAGES = emotions.length;


function initOpencvObjects() {
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  gray = new cv.Mat();

  faceVec = new cv.RectVector();
  faceCascade = new cv.CascadeClassifier();
  // TODO(sasha): Use Web Workers to load files.
  faceCascade.load(faceModelPath);

  emotions.forEach(emotion => {
    let emoticonImg = createImgNode(emotion + '-emoticon');

    emoticonImg.onload = function () {
      ++nImagesLoaded;
    };
    emoticonImg.src = '../../data/emoticons/' + emotion + '.png';
  });
  fisherFaceRecognizer = new cv.face_FisherFaceRecognizer();
  fisherFaceRecognizer.read(emotionModelPath);
}

function createImgNode(id) {
  let imgNode = document.createElement('img');
  imgNode.id = id;
  imgNode.classList.add('hidden');
  document.getElementsByTagName('body')[0].appendChild(imgNode);
  return imgNode;
}

function deleteOpencvObjects() {
  src.delete(); gray.delete();
  faceVec.delete(); faceCascade.delete();

  emoticons.forEach(emoticon => {
    emoticon.src.delete();
    emoticon.mask.delete();
  });
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  cameraBar.style.width = `${video.width}px`;
  document.getElementById('takePhotoButton').disabled = false;

  // Extra canvas to get source image from video element
  // (instead of cv.VideoCapture).
  canvasInput = document.createElement('canvas');
  canvasInput.width = video.width;
  canvasInput.height = video.height;
  canvasInputCtx = canvasInput.getContext('2d');

  canvasOutput.width = video.width;
  canvasOutput.height = video.height;
}

function waitForResources() {
  if (nImagesLoaded == N_IMAGES) {
    emotions.forEach(emotion => {
      let emoticonImg = document.getElementById(emotion + '-emoticon');
      let rgbaVector = new cv.MatVector();
      let emoticon = {};
      emoticon.src = cv.imread(emoticonImg);
      cv.split(emoticon.src, rgbaVector); // Create mask from alpha channel.
      emoticon.mask = rgbaVector.get(3);
      emoticon.name = emotion;
      emoticons.push(emoticon);
      rgbaVector.delete();
    });

    requestAnimationFrame(processVideo);
    return;
  }

  // Show video stream while we are waiting for resources.
  canvasInputCtx.drawImage(video, 0, 0, video.width, video.height);
  let imageData = canvasInputCtx.getImageData(0, 0, video.width, video.height);
  src.data.set(imageData.data);
  cv.imshow(canvasOutput, src);

  requestAnimationFrame(waitForResources);
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

    // Create small copy of source.
    let srcSmall = new cv.Mat();
    cv.resize(src, srcSmall, new cv.Size(parseInt(src.cols / 4), parseInt(src.rows / 4)));

    // Detect faces.
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    faceCascade.detectMultiScale(gray, faceVec);

    for (let i = 0; i < faceVec.size(); ++i) {
      // Prepare face for recognition model.
      let face = faceVec.get(i);
      let faceGray = gray.roi(face);
      cv.resize(faceGray, faceGray, new cv.Size(350, 350));
      // Recognize emotion.
      let prediction = fisherFaceRecognizer.predict_label(faceGray);
      let emoticon = emoticons[prediction];
      // Resize emoticon source and mask.
      let newEmoticonSize = new cv.Size(face.width, face.height);
      let resizedEmoticon = new cv.Mat();
      let resizedMask = new cv.Mat();
      cv.resize(emoticon.src, resizedEmoticon, newEmoticonSize);
      cv.resize(emoticon.mask, resizedMask, newEmoticonSize);
      // Copy emoticon to video stream.
      resizedEmoticon.copyTo(src.rowRange(face.y, face.y + face.height)
        .colRange(face.x, face.x + face.width), resizedMask);

      faceGray.delete();
      resizedEmoticon.delete();
      resizedMask.delete();
    }

    // Show small source image (without emoticon over a face) in the top left corner.
    srcSmall.copyTo(src.rowRange(0, srcSmall.rows).colRange(0, srcSmall.cols));
    cv.imshow(canvasOutput, src);

    srcSmall.delete();
    stats.end();
    requestAnimationFrame(processVideo);
  } catch (err) {
    utils.printError(err);
  }
};

function startCamera() {
  if (!streaming) {
    utils.clearError();
    utils.startCamera(videoConstraint, 'videoInput', onVideoStartedCustom);
  } else {
    utils.stopCamera();
    onVideoStopped();
  }
}

function onVideoStartedCustom() {
  streaming = true;
  setMainCanvasProperties(video);
  videoTrack = video.srcObject.getVideoTracks()[0];
  imageCapturer = new ImageCapture(videoTrack);
  document.getElementById('mainContent').classList.remove('hidden');
  completeStyling();
  initOpencvObjects();
  requestAnimationFrame(waitForResources);
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

  enableThreads();
}

utils.loadOpenCv(() => {
  utils.createFileFromUrl(faceModelPath, faceModelUrl, () => {
    utils.createFileFromUrl(emotionModelPath, emotionModelUrl, () => {
      initUI();
      initCameraSettingsAndStart();
    });
  });
});
