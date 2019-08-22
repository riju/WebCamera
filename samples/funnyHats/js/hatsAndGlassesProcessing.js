let faces = null;
let eyes = null;
let faceCascade = null;
let eyeCascade = null;

let hatDst = null;
let hatMaskDst = null;
let hatFrames = []; // Last drawn hat frame for each face.

let glassesDst = null;
let glassesMaskDst = null;
let glassesFrames = []; // Last drawn glasses frame for each face.

const faceDetectionPath = 'haarcascade_frontalface_default.xml';
const faceDetectionUrl =
  '../../data/classifiers/haarcascade_frontalface_default.xml';
const eyeDetectionPath = 'haarcascade_eye.xml';
const eyeDetectionUrl = '../../data/classifiers/haarcascade_eye.xml';

function deleteObjectsForOldFaces(faces) {
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
  let yOffset = Number(hatsData[currentHat].yOffsetDown);
  let yBottom = face.y + Math.round(yOffset * face.height);
  let yUpper = yBottom - scaledHeight;
  let xUpper = face.x + parseInt(face.width / 2 - scaledWidth / 2);
  let xBottom = xUpper + scaledWidth;
  if (yUpper < 0) yUpper = 0;
  return {
    width: scaledWidth, height: scaledHeight,
    coords: {
      xUpper: xUpper, xBottom: xBottom, yUpper: yUpper, yBottom: yBottom,
      show: true
    }
  };
}

function resizeHat(scaledWidth, scaledHeight, i) {
  let size = new cv.Size(scaledWidth, scaledHeight);
  cv.resize(hatsData[currentHat].src, hatDst, size);
  cv.resize(hatsData[currentHat].mask, hatMaskDst, size);

  let hat = hatFrames[i];
  if (hat.yUpper > 0 && hat.yBottom < video.height
    && hat.xBottom < video.width && hat.xUpper >= 0) {
    // Copy full image of hat because it is inside the canvas.
    hat.src = hatDst.clone();
    hat.mask = hatMaskDst.clone();
  } else if (hat.yUpper == 0 && hat.yBottom < video.height
    && hat.xBottom < video.width && hat.xUpper >= 0) {
    // Copy the part of the hat that is below y=0
    // because the top of the hat goes beyond the canvas.
    hat.src =
      hatDst.roi(new cv.Rect(
        0, scaledHeight - hat.yBottom, scaledWidth, hat.yBottom));
    hat.mask =
      hatMaskDst.roi(
        new cv.Rect(0, scaledHeight - hat.yBottom, scaledWidth, hat.yBottom));
  } else {
    // Don't draw hat.
    hat.show = false;
    hat.src = new cv.Mat();
    hat.mask = new cv.Mat();
  }
}

function exceedJitterLimit(i, coords) {
  if (hatFrames[i].xUpper > coords.xUpper + jitterLimit
    || hatFrames[i].xUpper < coords.xUpper - jitterLimit
    || hatFrames[i].yUpper > coords.yUpper + jitterLimit
    || hatFrames[i].yUpper < coords.yUpper - jitterLimit
    || hatFrames[i].xBottom > coords.xBottom + jitterLimit
    || hatFrames[i].xBottom < coords.xBottom - jitterLimit
    || hatFrames[i].yBottom > coords.yBottom + jitterLimit
    || hatFrames[i].yBottom < coords.yBottom - jitterLimit)
    return true;
  else return false;
}

function detectEyes(face, src) {
  let faceGray = src.roi(face);
  eyeCascade.detectMultiScale(faceGray, eyes);
  faceGray.delete();
}

function getGlassesCoords(leftEye, rightEye, face) {
  const eyesDistance = rightEye.x + rightEye.width - leftEye.x;
  const scaledWidth = parseInt(glassesData[currentGlasses].scale * eyesDistance);
  const scaledHeight = parseInt(scaledWidth *
    (glassesData[currentGlasses].src.rows / glassesData[currentGlasses].src.cols));
  const yOffset = Number(glassesData[currentGlasses].yOffsetUp);
  const centeredY = (leftEye.y + rightEye.y) / 2;
  const centeredHeight = (leftEye.height + rightEye.height) / 2;

  // Coordinates after resizing.
  let xUpper = face.x + leftEye.x + parseInt(eyesDistance / 2 - scaledWidth / 2);
  let xBottom = xUpper + scaledWidth;
  let yUpper = face.y + centeredY - Math.round(yOffset * centeredHeight);
  let yBottom = yUpper + scaledHeight;

  // Find angle.
  const deltaX = rightEye.x + rightEye.width / 2 - leftEye.x - leftEye.width / 2;
  const deltaY = rightEye.y + rightEye.height / 2 - leftEye.y - leftEye.height / 2;
  const angleRad = -Math.atan2(deltaY, deltaX);
  const angleDeg = parseInt(angleRad * (180 / Math.PI));

  let rotationMatrix = null;
  let rotatedWidth = 0;
  let rotatedHeight = 0;
  // Fill rotation matrix if the angle is not zero.
  if (angleDeg != 0) {
    const center = new cv.Point(scaledWidth / 2, scaledHeight / 2);
    rotationMatrix = cv.getRotationMatrix2D(center, angleDeg, 1);
    const cos = Math.abs(rotationMatrix.doubleAt(0, 0));
    const sin = Math.abs(rotationMatrix.doubleAt(0, 1));
    rotatedWidth = parseInt((scaledHeight * sin) + (scaledWidth * cos));
    rotatedHeight = parseInt((scaledHeight * cos) + (scaledWidth * sin));
    // Adjust the rotation matrix to take into account translation.
    rotationMatrix.data64F[2] += (rotatedWidth / 2) - center.x;
    rotationMatrix.data64F[5] += (rotatedHeight / 2) - center.y;

    // Absolute x,y values of glasses center.
    const centerX = xUpper + center.x;
    const centerY = yUpper + center.y;

    // Coordinates of rotated rectangle
    const xUpperLeftRotated =
      parseInt(centerX + (xUpper - centerX) * cos + (yUpper - centerY) * sin);
    const yUpperLeftRotated =
      parseInt(centerY - (xUpper - centerX) * sin + (yUpper - centerY) * cos);
    const yUpperRightRotated =
      parseInt(centerY - (xBottom - centerX) * sin + (yUpper - centerY) * cos);
    const xBottomLeftRotated =
      parseInt(centerX + (xUpper - centerX) * cos + (yBottom - centerY) * sin);
    // Choose the leftmost highest point.
    xUpper = xUpperLeftRotated < xBottomLeftRotated
      ? xUpperLeftRotated : xBottomLeftRotated;
    yUpper = yUpperLeftRotated < yUpperRightRotated
      ? yUpperLeftRotated : yUpperRightRotated;

    xBottom = xUpper + rotatedWidth;
    yBottom = yUpper + rotatedHeight;
  }

  return {
    sw: scaledWidth, sh: scaledHeight, rw: rotatedWidth,
    rh: rotatedHeight, rotMat: rotationMatrix, coords:
    {
      xUpper: xUpper, xBottom: xBottom,
      yUpper: yUpper, yBottom: yBottom, show: true
    }
  };
}

function resizeGlasses(glasses, i) {
  let sSize = new cv.Size(glasses.sw, glasses.sh);
  cv.resize(glassesData[currentGlasses].src, glassesDst, sSize);
  cv.resize(glassesData[currentGlasses].mask, glassesMaskDst, sSize);

  if (glasses.rotMat != null) {
    let rSize = new cv.Size(glasses.rw, glasses.rh);
    cv.warpAffine(glassesDst, glassesDst, glasses.rotMat, rSize);
    cv.warpAffine(glassesMaskDst, glassesMaskDst, glasses.rotMat, rSize);
    glasses.rotMat.delete();
  }

  glassesFrames[i].src = glassesDst.clone();
  glassesFrames[i].mask = glassesMaskDst.clone();
}

function processGlasses(i, pyrDownFace, originalFace, src, xRatio, yRatio, option) {
  function createEmptyFrame() {
    if (option == "new") glassesFrames.splice(i, 0, { show: false });
    else { // (option == "replace") Replace if not new.
      glassesFrames[i].src.delete();
      glassesFrames[i].mask.delete();
      glassesFrames.splice(i, 1, { show: false });
    }
    glassesFrames[i].src = new cv.Mat();
    glassesFrames[i].mask = new cv.Mat();
  }

  detectEyes(pyrDownFace, src);
  // Don't draw glasses because only one eye was detected.
  if (eyes.size() < 2) createEmptyFrame();
  else {
    let glasses;
    let firstEye = eyes.get(0);
    let secondEye = eyes.get(1);
    let leftEye; let rightEye;

    // Find left and right eyes.
    if (firstEye.x > secondEye.x) {
      leftEye = secondEye; rightEye = firstEye;
    } else {
      leftEye = firstEye; rightEye = secondEye;
    }

    // Convert eyes to original coordinates.
    leftEye = new cv.Rect(leftEye.x * xRatio, leftEye.y * yRatio,
      leftEye.width * xRatio, leftEye.height * yRatio);
    rightEye = new cv.Rect(rightEye.x * xRatio, rightEye.y * yRatio,
      rightEye.width * xRatio, rightEye.height * yRatio);

    glasses = getGlassesCoords(leftEye, rightEye, originalFace);

    // Check that glasses coords are inside the canvas.
    if (glasses.coords.yUpper > 0 && glasses.coords.yBottom < video.height &&
      glasses.coords.xBottom < video.width && glasses.coords.xUpper >= 0) {
      // Glasses fit into the canvas.
      if (option == "new")
        glassesFrames.splice(i, 0, glasses.coords);
      else { // Replace if not new.
        glassesFrames[i].src.delete();
        glassesFrames[i].mask.delete();
        glassesFrames.splice(i, 1, glasses.coords);
      }
      resizeGlasses(glasses, i);

    } else createEmptyFrame(); // Glasses don't fit into the canvas.
  }
}
