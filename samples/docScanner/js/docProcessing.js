const MIN_AREA = 5000;

function startProcessing(src) {
  // 1. Detect edges of the document.
  // Convert image to gray, gaussian blur and canny filter.
  dst = new cv.Mat();
  cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY);
  cv.GaussianBlur(dst, dst, { width: 5, height: 5 }, 0, 0, cv.BORDER_DEFAULT);
  // 75 and 200 are values of the first and second thresholds.
  cv.Canny(dst, dst, 75, 200);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  let approxCnt = new cv.Mat();
  cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  //let maxPerimeter = 0;
  let maxArea = 0;
  let index;
  for (let i = 0; i < contours.size(); ++i) {
    let cnt = contours.get(i);
    let perimeter = cv.arcLength(cnt, true);
    // Approximate the contour with the (0.01 * perimeter) precision.
    cv.approxPolyDP(cnt, approxCnt, 0.01 * perimeter, true);
    let area = cv.contourArea(cnt);

    // If contour approximation has 4 angles and
    // perimeter of this contour is the biggest.
    if (approxCnt.rows == 4 && area > maxArea) {
      maxArea = area;
      //maxPerimeter = perimeter;
      index = i;
    }
    cnt.delete();
  }

  let srcClone = src.clone();
  let color = [0, 255, 0, 255];
  let rect;
  if (maxArea > MIN_AREA) { // Don't show small contours as documents.
    let approxContours = new cv.MatVector();
    let cnt = contours.get(index);
    let perimeter = cv.arcLength(cnt, true);
    cv.approxPolyDP(cnt, approxCnt, 0.01 * perimeter, true);
    approxContours.push_back(approxCnt);
    // Add edge of the document to the image source and show.
    rect = getContourCoordinates(approxCnt);
    cv.drawContours(srcClone, approxContours, 0, color, 2);
    cv.imshow('canvasOutput', srcClone);
    approxContours.delete();
  } else {
    // Output borders of the entire image as we didn't detect any doc.
    rect = [{ x: 5, y: 5 }, { x: srcClone.cols - 5, y: 5 },
      { x: srcClone.cols - 5, y: srcClone.rows - 5 },
      { x: 5, y: srcClone.rows - 5 }];
    cv.rectangle(srcClone, rect[0], rect[2], color, 2);
    cv.imshow('canvasOutput', srcClone);
  }

  let cameraBar = document.getElementById('cameraBar');
  cameraBar.removeChild(cameraBar.children[0]);
  addButtonToCameraBar('retryButton', 'refresh', 2);
  addButtonToCameraBar('okButton', 'done', 2);

  let retryButton = document.getElementById('retryButton');
  retryButton.addEventListener('click', function () {
    cameraBar.removeChild(cameraBar.children[0]);
    cameraBar.removeChild(cameraBar.children[0]);
    addButtonToCameraBar('takePhotoButton', 'photo_camera', 1);
    startDocProcessing = false;
    requestAnimationFrame(processVideo);
    if (approxCnt != 'undefined' && !approxCnt.isDeleted()) approxCnt.delete();
    let takePhotoButton = document.getElementById('takePhotoButton');
    takePhotoButton.addEventListener('click', function () {
      startDocProcessing = true;
      startProcessing(src);
    });
  });
  let okButton = document.getElementById('okButton');
  okButton.addEventListener('click', function () {
    cameraBar.removeChild(cameraBar.children[1]);
    addButtonToCameraBar('saveButton', 'save_alt', 2);
    // Obtain a consistent order of contour points.
    let warpedImage = new cv.Mat();
    fourPointTransform(src, rect, warpedImage);
    cv.cvtColor(warpedImage, warpedImage, cv.COLOR_BGR2GRAY);
    cv.adaptiveThreshold(warpedImage, warpedImage, 250,
      cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY,
      11, 10); // block size is 11, offset is 10.

    let videoAspectRatio = video.height / video.width;
    let docAspectRatio = warpedImage.rows / warpedImage.cols;
    if (docAspectRatio > videoAspectRatio)
      resizeImage(warpedImage, undefined, height = video.height);
    else resizeImage(warpedImage, width = video.width);

    cv.imshow('canvasOutput', warpedImage);
    warpedImage.delete();
    approxCnt.delete();
  });

  dst.delete(); srcClone.delete();
  contours.delete();
  hierarchy.delete();
}

function addButtonToCameraBar(id, text, maxItems) {
  let cameraBar = document.getElementById('cameraBar');
  let liElement = document.createElement('li');
  liElement.classList.add('camera-bar-item');
  if (maxItems == 3) {
    liElement.classList.add('bar-with-three-items');
  } else if (maxItems == 2) {
    liElement.classList.add('bar-with-two-items');
  } else { // 1 item
    liElement.classList.add('bar-with-one-item');
  }
  let divElement = document.createElement('div');
  divElement.classList.add('take-photo-wrapper');
  let button = document.createElement('button');
  button.setAttribute('id', id);
  button.classList.add('camera-bar-icon');
  button.classList.add('material-icons');
  button.innerText = text;
  divElement.appendChild(button);
  liElement.appendChild(divElement);
  cameraBar.appendChild(liElement);
}

function fourPointTransform(image, rect, warpedImage) {
  // Compute the width of the new image, which will be the
  // maximum distance between bottom-right and bottom-left
  // x-coordiates or the top-right and top-left x-coordinates.
  let widthA = Math.sqrt(Math.pow(
    rect[2].x - rect[3].x, 2) + Math.pow(rect[2].y - rect[3].y, 2));
  let widthB = Math.sqrt(Math.pow(
    rect[1].x - rect[0].x, 2) + Math.pow(rect[1].y - rect[0].y, 2));
  let maxWidth = parseInt(Math.max(widthA, widthB));

  // Compute the height of the new image, which will be the
  // maximum distance between the top-right and bottom-right
  // y-coordinates or the top-left and bottom-left y-coordinates.
  let heightA = Math.sqrt(Math.pow(
    rect[1].x - rect[2].x, 2) + Math.pow(rect[1].y - rect[2].y, 2));
  let heightB = Math.sqrt(Math.pow(
    rect[0].x - rect[3].x, 2) + Math.pow(rect[0].y - rect[3].y, 2));
  let maxHeight = parseInt(Math.max(heightA, heightB));

  // Now that we have the dimensions of the new image, construct
  // the set of destination points to obtain a "birds eye view",
  // (i.e. top-down view) of the image, again specifying points
  // in the top-left, top-right, bottom-right, and bottom-left order.
  let dsize = new cv.Size(maxWidth, maxHeight);
  let imgTri = cv.matFromArray(4, 1, cv.CV_32FC2,
    [rect[0].x, rect[0].y, rect[1].x, rect[1].y, rect[2].x, rect[2].y, rect[3].x, rect[3].y]);
  let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2,
    [0, 0, maxWidth - 1, 0, maxWidth - 1, maxHeight - 1, 0, maxHeight - 1]);
  let M = cv.getPerspectiveTransform(imgTri, dstTri);
  cv.warpPerspective(image, warpedImage, M, dsize);

  M.delete(); imgTri.delete(); dstTri.delete();
}
