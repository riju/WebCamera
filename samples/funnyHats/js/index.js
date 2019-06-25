let utils = new Utils('errorMessage');

let resolution = window.innerWidth < 700 ? 'qvga' : 'vga';
const FPS = 30;

let video = document.getElementById('videoInput');
let canvasOutput = document.getElementById('canvasOutput');
let canvasContext = canvasOutput.getContext('2d');

let width = 0;
let height = 0;

let streaming = false;
let cap = null;
let src = null;
let gray = null;

function startVideoProcessing() {
  src = new cv.Mat(height, width, cv.CV_8UC4);
  gray = new cv.Mat();
  cap = new cv.VideoCapture(video);
  initOpencvVars();
  setTimeout(processVideo, 0);
}

function processVideo() {
  try {
    if (!streaming) {
      // clean and stop
      src.delete(); gray.delete();
      deleteOpencvObjects();
      deleteHats(); deleteGlasses();
      return;
    }
    stats.begin();
    let begin = Date.now();
    cap.read(src);

    // detect faces
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    let scaleFactor = 1.1;
    let minNeighbors = 3;
    faceCascade.detectMultiScale(gray, faces, scaleFactor, minNeighbors);
    deleteObjectsForOldFaces();

    // process hat and glasses for each face
    for (let i = 0; i < faces.size(); ++i) {
      let face = faces.get(i);
      let hat = getHatCoords(face);

      if (!hatFrames[i]) {
        // create new hat frame and glasses frame
        hatFrames.splice(i, 0, hat.coords);
        resizeHat(hat.width, hat.height, i);
        processGlasses(i, face, "new");

      } else if (exceedJitterLimit(i, hat.coords) || objectChanged) {
        // replace old hat frame and glasses frame
        objectChanged = false;
        replaceOldHatFrame(i, hat.coords);
        resizeHat(hat.width, hat.height, i);
        if (!glassesFrames[i])
          processGlasses(i, face, "new");
        else
          processGlasses(i, face, "replace");
      }

      // draw hat
      if (hatFrames[i].show)
        hatFrames[i].src.copyTo(src.rowRange(hatFrames[i].y1, hatFrames[i].y2)
          .colRange(hatFrames[i].x1, hatFrames[i].x2), hatFrames[i].mask);
      // draw glasses
      if (glassesFrames[i].show)
        glassesFrames[i].src.copyTo(
          src.rowRange(glassesFrames[i].y1, glassesFrames[i].y2)
            .colRange(glassesFrames[i].x1, glassesFrames[i].x2),
          glassesFrames[i].mask);
    }
    cv.imshow('canvasOutput', src);

    if (objectChanged) objectChanged = false;

    // schedule the next processing
    let delay = 1000 / FPS - (Date.now() - begin);
    stats.end();
    setTimeout(processVideo, delay);
  } catch (err) {
    utils.printError(err);
  }
};

function setWidthAndHeight() {
  width = video.videoWidth;
  height = video.videoHeight;
  video.setAttribute('width', width);
  video.setAttribute('height', height);
  canvasOutput.style.width = `${width}px`;
  canvasOutput.style.height = `${height}px`;
  document.getElementsByClassName("canvas-wrapper")[0].style.height =
    `${height}px`;
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
  streaming = true;
  setWidthAndHeight();
  const heightDependenceCoef = 320 / 240; // depends on hat image resolution
  resizeMenu("customFormat", heightDependenceCoef);
  resizeTabSet();
  // remove "disabled" attr from the second input tab
  document.getElementById("glassesTab").removeAttribute("disabled");
  startVideoProcessing();
}

function onVideoStopped() {
  streaming = false;
  canvasContext.clearRect(0, 0, canvasOutput.width, canvasOutput.height);
}

utils.loadOpenCv(() => {
  utils.createFileFromUrl(faceDetectionPath, faceDetectionUrl, () => {
    utils.createFileFromUrl(eyeDetectionPath, eyeDetectionUrl, () => {
      initUI();
      startCamera();
    });
  });
});