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

// Standart size of hat or glasses image.
const imageWidth = 320;
const imageHeight = 240;

let nImagesLoaded = 0;
// NOTE! Update this value if you add or remove files
// from hatsData and glassesData in ui.js.
const N_IMAGES = 33;


function initOpencvObjects() {
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

  // Extra canvas to get source image from video element
  // (instead of cv.VideoCapture).
  canvasInput = document.createElement('canvas');
  canvasInput.width = video.width;
  canvasInput.height = video.height;
  canvasInputCtx = canvasInput.getContext('2d');

  document.getElementById('takePhotoButton').disabled = false;
}

function waitForResources() {
  if (nImagesLoaded == N_IMAGES) {
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

    // Detect faces.
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    for (let i = 0; i < downscaleLevel; ++i) cv.pyrDown(gray, gray);
    faceCascade.detectMultiScale(gray, faces);
    deleteObjectsForOldFaces(faces);

    let matSize = gray.size();
    let xRatio = video.width / matSize.width;
    let yRatio = video.height / matSize.height;

    // Process hat and glasses for each face.
    for (let i = 0; i < faces.size(); ++i) {
      let pyrDownFace = faces.get(i);
      let originalFace = new cv.Rect(pyrDownFace.x * xRatio,
        pyrDownFace.y * yRatio, pyrDownFace.width * xRatio,
        pyrDownFace.height * yRatio);
      let hat = getHatCoords(originalFace);

      if (!hatFrames[i]) {
        // Create new hat frame and glasses frame.
        hatFrames.splice(i, 0, hat.coords);
        resizeHat(hat.width, hat.height, i);
        processGlasses(i, pyrDownFace, originalFace, gray, xRatio, yRatio, "new");

      } else if (exceedJitterLimit(i, hat.coords) || hatOrGlassesChanged) {
        // Replace old hat frame and glasses frame.
        hatOrGlassesChanged = false;
        replaceOldHatFrame(i, hat.coords);
        resizeHat(hat.width, hat.height, i);
        if (!glassesFrames[i])
          processGlasses(i, pyrDownFace, originalFace, gray, xRatio, yRatio, "new");
        else
          processGlasses(i, pyrDownFace, originalFace, gray, xRatio, yRatio, "replace");
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