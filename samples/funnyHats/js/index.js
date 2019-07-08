let utils = new Utils('errorMessage');
let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');

let streaming = false;
let videoCapture = null;
let src = null;
let gray = null;

// Standart size of hat or glasses image.
const imageWidth = 320;
const imageHeight = 240;

function startVideoProcessing() {
  // Draw border for the first hat and glasses.
  document.getElementById(`hat${currentHat}`).style.borderStyle = 'solid';
  document.getElementById(`glasses${currentGlasses}`).style.borderStyle
    = 'solid';

  let smallWidth = (video.width / 5);
  let smallHeight = smallWidth * (imageHeight / imageWidth);
  resizeMenu(smallWidth, smallHeight);

  resizeTabSet();
  // Remove "disabled" attr from the second input tab.
  document.getElementById("glassesTab").removeAttribute("disabled");

  videoCapture = new cv.VideoCapture(video);
  src = new cv.Mat(video.height, video.width, cv.CV_8UC4);
  gray = new cv.Mat();
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
  src.delete(); gray.delete();
  deleteOpencvObjects();
  deleteHats(); deleteGlasses();
  utils.stopCamera(); onVideoStopped();
}

utils.loadOpenCv(() => {
  utils.createFileFromUrl(faceDetectionPath, faceDetectionUrl, () => {
    utils.createFileFromUrl(eyeDetectionPath, eyeDetectionUrl, () => {
      initUI();
      startCamera();
    });
  });
});