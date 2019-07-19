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
let src = null;
let gray = null;

// Standart size of hat or glasses image.
const imageWidth = 320;
const imageHeight = 240;


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

  hatDst = new cv.Mat();
  hatMaskDst = new cv.Mat();
  glassesDst = new cv.Mat();
  glassesMaskDst = new cv.Mat();
}

function deleteOpencvObjects() {
  src.delete(); gray.delete();
  faces.delete(); faceCascade.delete();
  eyes.delete(); eyeCascade.delete();
  hatDst.delete(); hatMaskDst.delete();
  glassesDst.delete(); glassesMaskDst.delete();
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  cameraBar.style.width = `${video.videoWidth}px`;

  // Draw border for the first hat and glasses.
  document.getElementById(`hat${currentHat}`).style.borderStyle = 'solid';
  document.getElementById(`glasses${currentGlasses}`).style.borderStyle
    = 'solid';

  let smallWidth = (video.width / 5);
  let smallHeight = smallWidth * (imageHeight / imageWidth);
  initMenu(smallWidth, smallHeight);

  initTabSet();
  // Remove "disabled" attr from the second input tab.
  document.getElementById("glassesTab").removeAttribute("disabled");

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
    let scaleFactor = 1.1;
    let minNeighbors = 3;
    faceCascade.detectMultiScale(gray, faces, scaleFactor, minNeighbors);
    deleteObjectsForOldFaces();

    // Process hat and glasses for each face.
    for (let i = 0; i < faces.size(); ++i) {
      let face = faces.get(i);
      let hat = getHatCoords(face);

      if (!hatFrames[i]) {
        // Create new hat frame and glasses frame.
        hatFrames.splice(i, 0, hat.coords);
        resizeHat(hat.width, hat.height, i);
        processGlasses(i, face, "new");

      } else if (exceedJitterLimit(i, hat.coords) || hatOrGlassesChanged) {
        // Replace old hat frame and glasses frame.
        hatOrGlassesChanged = false;
        replaceOldHatFrame(i, hat.coords);
        resizeHat(hat.width, hat.height, i);
        if (!glassesFrames[i])
          processGlasses(i, face, "new");
        else
          processGlasses(i, face, "replace");
      }

      // Draw hat.
      if (hatFrames[i].show)
        hatFrames[i].src.copyTo(src
          .rowRange(hatFrames[i].yUpper, hatFrames[i].yBottom)
          .colRange(hatFrames[i].xUpper, hatFrames[i].xBottom),
          hatFrames[i].mask);
      // Draw glasses.
      if (glassesFrames[i].show)
        glassesFrames[i].src.copyTo(
          src.rowRange(glassesFrames[i].yUpper, glassesFrames[i].yBottom)
            .colRange(glassesFrames[i].xUpper, glassesFrames[i].xBottom),
          glassesFrames[i].mask);
    }
    cv.imshow('canvasOutput', src);

    if (hatOrGlassesChanged) hatOrGlassesChanged = false;

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
  deleteHats(); deleteGlasses();
  utils.stopCamera(); onVideoStopped();
}

utils.loadOpenCv(() => {
  utils.createFileFromUrl(faceDetectionPath, faceDetectionUrl, () => {
    utils.createFileFromUrl(eyeDetectionPath, eyeDetectionUrl, () => {
      initUI();
      initCameraSettingsAndStart();
    });
  });
});