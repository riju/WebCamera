let faces = null;
let eyes = null;
let faceCascade = null;
let eyeCascade = null;

let hatDst = null;
let hatMaskDst = null;
let hatFrames = []; // last drawn hat frame for each face

let glassesDst = null;
let glassesMaskDst = null;
let glassesFrames = []; // last drawn glasses frame for each face

const faceDetectionPath = 'haarcascade_frontalface_default.xml';
const faceDetectionUrl = '../../data/classifiers/haarcascade_frontalface_default.xml';
const eyeDetectionPath = 'haarcascade_eye.xml';
const eyeDetectionUrl = '../../data/classifiers/haarcascade_eye.xml';

const JITTER_LIMIT = 3;

function initOpencvVars() {
  faces = new cv.RectVector();
  faceCascade = new cv.CascadeClassifier();
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
  hatDst.delete(); hatMaskDst.delete();
  glassesDst.delete(); glassesMaskDst.delete();
  faces.delete(); faceCascade.delete();
  eyes.delete(); eyeCascade.delete();
}

function deleteObjectsForOldFaces() {
  if (hatFrames.length > faces.size() && faces.size() > 0) {
    for (let i = faces.size(); i < hatFrames.length; ++i) {
      hatFrames[i].src.delete();
      hatFrames[i].mask.delete();
      glassesFrames[i].src.delete();
      glassesFrames[i].mask.delete();
    }
    hatFrames.length = faces.size();
    glassesFrames.length = faces.size();
  }
}

function replaceOldHatFrame(i, coords) {
  hatFrames[i].src.delete();
  hatFrames[i].mask.delete();
  hatFrames.splice(i, 1, coords);
}

function getHatCoords(face) {
  let scaledWidth = parseInt(hatsData[currentHat].scale * face.width);
  let scaledHeight = parseInt(scaledWidth *
    (hatsData[currentHat].src.rows / hatsData[currentHat].src.cols));
  let yOffset = Number(hatsData[currentHat].yOffset);
  let y2 = face.y + Math.round(yOffset * face.height);
  let y1 = y2 - scaledHeight;
  let x1 = face.x + parseInt(face.width / 2 - scaledWidth / 2);
  let x2 = x1 + scaledWidth;
  if (y1 < 0) y1 = 0;
  return {
    width: scaledWidth, height: scaledHeight,
    coords: { x1: x1, x2: x2, y1: y1, y2: y2, show: true }
  };
}

function resizeHat(scaledWidth, scaledHeight, i) {
  let size = new cv.Size(scaledWidth, scaledHeight);
  cv.resize(hatSrc, hatDst, size);
  cv.resize(hatMask, hatMaskDst, size);

  let hat = hatFrames[i];
  if (hat.y1 > 0 && hat.y2 < height && hat.x2 < width && hat.x1 >= 0) {
    // copy full image of hat
    hat.src = hatDst.clone();
    hat.mask = hatMaskDst.clone();
  } else if (hat.y1 == 0 && hat.y2 < height && hat.x2 < width && hat.x1 >= 0) {
    // copy the part of the hat that is below y=0
    hat.src =
      hatDst.roi(new cv.Rect(0, scaledHeight - hat.y2, scaledWidth, hat.y2));
    hat.mask =
      hatMaskDst.roi(
        new cv.Rect(0, scaledHeight - hat.y2, scaledWidth, hat.y2));
  } else {
    // notify not to draw hat
    hat.show = false;
    hat.src = new cv.Mat();
    hat.mask = new cv.Mat();
  }
}

function exceedJitterLimit(i, coords) {
  if (hatFrames[i].x1 > coords.x1 + JITTER_LIMIT ||
    hatFrames[i].x1 < coords.x1 - JITTER_LIMIT ||
    hatFrames[i].y1 > coords.y1 + JITTER_LIMIT ||
    hatFrames[i].y1 < coords.y1 - JITTER_LIMIT ||
    hatFrames[i].x2 > coords.x2 + JITTER_LIMIT ||
    hatFrames[i].x2 < coords.x2 - JITTER_LIMIT ||
    hatFrames[i].y2 > coords.y2 + JITTER_LIMIT ||
    hatFrames[i].y2 < coords.y2 - JITTER_LIMIT)
    return true;
  else return false;
}

function detectEyes(face) {
  let faceGray = gray.roi(face);
  eyeCascade.detectMultiScale(faceGray, eyes, 1.1, 3);
  faceGray.delete();
}

function getGlassesCoords(leftEye, rightEye, face) {
  const eyesDistance =
    eyes.get(rightEye).x + eyes.get(rightEye).width - eyes.get(leftEye).x;
  const scaledWidth =
    parseInt(glassesData[currentGlasses].scale * eyesDistance);
  const scaledHeight = parseInt(scaledWidth *
    (glassesData[currentGlasses].src.rows
      / glassesData[currentGlasses].src.cols));
  const yOffset = Number(glassesData[currentGlasses].yOffset);
  const centeredY = (eyes.get(leftEye).y + eyes.get(rightEye).y) / 2;
  const centeredHeight =
    (eyes.get(leftEye).height + eyes.get(rightEye).height) / 2;

  // coordinates after resizing
  let x1 = face.x + eyes.get(leftEye).x +
    parseInt(eyesDistance / 2 - scaledWidth / 2);
  let x2 = x1 + scaledWidth;
  let y1 = face.y + centeredY - Math.round(yOffset * centeredHeight);
  let y2 = y1 + scaledHeight;

  // find angle
  const deltaX = eyes.get(rightEye).x + eyes.get(rightEye).width / 2
    - eyes.get(leftEye).x - eyes.get(leftEye).width / 2;
  const deltaY = eyes.get(rightEye).y + eyes.get(rightEye).height / 2
    - eyes.get(leftEye).y - eyes.get(leftEye).height / 2;
  const angleRad = -Math.atan2(deltaY, deltaX);
  const angleDeg = parseInt(angleRad * (180 / Math.PI));

  let M = null;
  let rotatedWidth = 0;
  let rotatedHeight = 0;
  // prepare rotation matrix if the angle is not zero
  if (angleDeg != 0) {
    const center = new cv.Point(scaledWidth / 2, scaledHeight / 2);
    M = cv.getRotationMatrix2D(center, angleDeg, 1);
    const cos = Math.abs(M.doubleAt(0, 0));
    const sin = Math.abs(M.doubleAt(0, 1));
    rotatedWidth = parseInt((scaledHeight * sin) + (scaledWidth * cos));
    rotatedHeight = parseInt((scaledHeight * cos) + (scaledWidth * sin));
    // adjust the rotation matrix to take into account translation
    M.data64F[2] += (rotatedWidth / 2) - center.x;
    M.data64F[5] += (rotatedHeight / 2) - center.y;

    // absolute x,y values of glasses center
    const centerX = x1 + center.x;
    const centerY = y1 + center.y;

    //coordinates of rotated rectangle (x1r,x2r,x3r,x4r clockwise)
    const x1r = parseInt(centerX + (x1 - centerX) * cos + (y1 - centerY) * sin);
    const y1r = parseInt(centerY - (x1 - centerX) * sin + (y1 - centerY) * cos);
    const y2r = parseInt(centerY - (x2 - centerX) * sin + (y1 - centerY) * cos);
    const x4r = parseInt(centerX + (x1 - centerX) * cos + (y2 - centerY) * sin);
    // choose the smallest
    if (x1r < x4r) x1 = x1r;
    else x1 = x4r;
    if (y1r < y2r) y1 = y1r;
    else y1 = y2r;

    x2 = x1 + rotatedWidth;
    y2 = y1 + rotatedHeight;
  }

  return {
    sw: scaledWidth, sh: scaledHeight, rw: rotatedWidth, rh: rotatedHeight,
    rotMat: M, coords: { x1: x1, x2: x2, y1: y1, y2: y2, show: true }
  };
}

function resizeGlasses(glasses, i) {
  let sSize = new cv.Size(glasses.sw, glasses.sh);
  cv.resize(glassesSrc, glassesDst, sSize);
  cv.resize(glassesMask, glassesMaskDst, sSize);

  if (glasses.rotMat != null) {
    let rSize = new cv.Size(glasses.rw, glasses.rh);
    cv.warpAffine(glassesDst, glassesDst, glasses.rotMat, rSize);
    cv.warpAffine(glassesMaskDst, glassesMaskDst, glasses.rotMat, rSize);
    glasses.rotMat.delete();
  }

  glassesFrames[i].src = glassesDst.clone();
  glassesFrames[i].mask = glassesMaskDst.clone();
}

function processGlasses(i, face, option) {
  detectEyes(face);
  let show = true;
  if (eyes.size() < 2)
    show = false;
  else {
    let leftEye = 0;
    let rightEye = 1;
    let glasses;
    if (eyes.get(leftEye).x > eyes.get(rightEye).x)
      glasses = getGlassesCoords(rightEye, leftEye, face);
    else
      glasses = getGlassesCoords(leftEye, rightEye, face);
    // check that glasses coords are in the canvas window
    if (glasses.coords.y1 > 0 && glasses.coords.y2 < height &&
      glasses.coords.x2 < width && glasses.coords.x1 >= 0) {
      if (option == "new")
        glassesFrames.splice(i, 0, glasses.coords);
      else { // replace if not new
        glassesFrames[i].src.delete();
        glassesFrames[i].mask.delete();
        glassesFrames.splice(i, 1, glasses.coords);
      }
      resizeGlasses(glasses, i);
    } else
      show = false;
  }
  if (!show) {
    if (option == "new")
      glassesFrames.splice(i, 0, { show: show });
    else { // replace if not new
      glassesFrames[i].src.delete();
      glassesFrames[i].mask.delete();
      glassesFrames.splice(i, 1, { show: show });
    }
    glassesFrames[i].src = new cv.Mat();
    glassesFrames[i].mask = new cv.Mat();
  }
}
