CARD_TYPE = {
  "3": "American Express",
  "4": "Visa",
  "5": "MasterCard",
  "6": "Discover Card"
}

// Sort rectangles according to x coordinate.
function compareRect(a, b) {
  if (a.x > b.x) return 1;
  if (b.x > a.x) return -1;
  return 0;
}

function getRectangles(contours) {
  let rectangles = [];
  // Extract rectangle from each contour.
  for (let i = 0; i < contours.size(); ++i) {
    rectangles.push(cv.boundingRect(contours.get(i)));
  }
  return rectangles.sort(compareRect);
}

function outputToCanvas(image) {
  let canvas = document.createElement('canvas');
  document.getElementsByTagName('body')[0].append(canvas);
  cv.imshow(canvas, image);
}

function getReferenceDigits(imgId, refSize) {
  let src = cv.imread(imgId);
  cv.cvtColor(src, src, cv.COLOR_BGR2GRAY);
  cv.threshold(src, src, 10, 255, cv.THRESH_BINARY_INV);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(src, contours, hierarchy, cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE);
  let rectangles = getRectangles(contours);
  contours.delete(); hierarchy.delete();

  let digits = [];
  for (let i = 0; i < rectangles.length; ++i) {
    let digit = new cv.Mat();
    digit = src.roi(rectangles[i]);
    cv.resize(digit, digit, refSize);
    digits[i] = digit;
    //outputToCanvas(digit);
  }
  src.delete();
  return digits;
}

function loadCardImg(src, grayCard, rectPointUpperLeft, rectPointBottomRight) {
  // Extract card area from source image.
  let cardImg = new cv.Mat();
  let rect = new cv.Rect(rectPointUpperLeft.x, rectPointUpperLeft.y,
    rectPointBottomRight.x - rectPointUpperLeft.x,
    rectPointBottomRight.y - rectPointUpperLeft.y);
  cardImg = src.roi(rect);

  // Resize card and convert it to grayscale.
  resizeImage(cardImg, width = 300);
  cv.cvtColor(cardImg, grayCard, cv.COLOR_BGR2GRAY);
  cardImg.delete();
}

function applyFiltersToCard(grayCard, filteredCard) {
  // Initialize rectangular and square structuring kernels.
  let rectKernel = new cv.Mat();
  let squareKernel = new cv.Mat();
  //TODO(sasha): Maybe adjust size of the kernels.
  rectKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 3));
  squareKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));

  // Apply a tophat (whitehat) morphological operator to find light
  // regions against a dark background (i.e., the credit card numbers).
  let tophat = new cv.Mat();
  cv.morphologyEx(grayCard, tophat, cv.MORPH_TOPHAT, rectKernel);
  //outputToCanvas(tophat);

  // Compute the Sobel gradient of the tophat image.
  // Set the order of the derivative in x direction.
  let gradX = new cv.Mat();
  let kernel = 1, xOrder = 1, yOrder = 0;
  cv.Sobel(tophat, gradX, cv.CV_32F, xOrder, yOrder, kernel);
  // Scale image back into the range [0, 255].
  // See about this matter:
  // https://docs.opencv.org/3.0-beta/doc/py_tutorials/py_imgproc/py_gradients/py_gradients.html#one-important-matter
  cv.convertScaleAbs(gradX, gradX);
  gradX.convertTo(gradX, cv.CV_8U);
  //outputToCanvas(gradX);

  // Apply a closing operation using the rectangular kernel to help
  // close gaps between credit card number regions.
  let thresh = new cv.Mat();
  cv.morphologyEx(gradX, gradX, cv.MORPH_CLOSE, rectKernel);

  // Apply Otsu's thresholding method to binarize the image.
  cv.threshold(gradX, thresh, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);

  // Apply a second closing operation to the binary image, again
  // to help close gaps between credit card number regions.
  cv.morphologyEx(thresh, filteredCard, cv.MORPH_CLOSE, squareKernel);
  //outputToCanvas(filteredCard);

  rectKernel.delete(); squareKernel.delete();
  tophat.delete(); gradX.delete(); thresh.delete();
}

function findDigitGroups(filteredCard) {
  // Find contours in the filtered card image.
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(filteredCard, contours, hierarchy, cv.RETR_EXTERNAL,
    cv.CHAIN_APPROX_SIMPLE);
  let groupRectangles = getRectangles(contours);

  let digitGroups = [];
  for (let i = 0; i < groupRectangles.length; ++i) {
    let rect = groupRectangles[i];
    let ratio = rect.width / rect.height;
    // Since credit cards used a fixed size fonts with 4 groups
    // of 4 digits, we can prune potential contours based on the
    // aspect ratio.
    // TODO(sasha): detect also longer groups (not only 4 digits in a group).
    if (ratio > 2.5 && ratio < 4.0)
      // Contours can further be pruned on min/max width and height.
      if ((rect.width > 40 && rect.width < 55)
        && (rect.height > 10 && rect.height < 20))
        digitGroups.push(rect);
  }
  contours.delete(); hierarchy.delete();
  return digitGroups;
}

function detectDigit(group, digitRect, refDigits, refSize) {
  let cardDigit = new cv.Mat();
  cardDigit = group.roi(digitRect);
  // Resize digit to have the same fixed size as the reference digits.
  cv.resize(cardDigit, cardDigit, refSize);
  //outputToCanvas(cardDigit);

  scores = []; // Initialize a list of template matching scores.
  let cardDigitDst = new cv.Mat();
  let mask = new cv.Mat();
  // Loop over the reference digits.
  for (let i = 0; i < refDigits.length; ++i) {
    // Apply correlation-based template matching and take the score.
    cv.matchTemplate(cardDigit, refDigits[i], cardDigitDst, cv.TM_CCOEFF, mask);
    let score = cv.minMaxLoc(cardDigitDst, mask).maxVal;
    scores.push(score);
  }
  cardDigit.delete(); cardDigitDst.delete(); mask.delete();
  // Take the *largest* template matching score.
  return scores.indexOf(Math.max(...scores));
}

function detectDigitsInGroup(groupRect, grayCard, refDigits, refSize) {
  // Extract the group of 4 digits from the grayscale image, then apply
  // thresholding to segment the digits from the background of the credit card.
  let groupSrc = new cv.Mat();
  groupSrc = grayCard.roi(groupRect);
  // TODO(sasha): Try another filter
  // because this thresholding sometimes loses digit contours.
  cv.threshold(groupSrc, groupSrc, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
  //outputToCanvas(groupSrc);

  // Detect the contour of each individual digit in the group,
  // then sort the digit contours from left to right.
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(groupSrc, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
  let digitRectangles = getRectangles(contours);
  contours.delete(); hierarchy.delete();

  // Initialize the list of group digits.
  groupOutput = [];
  // Loop over the digit contours
  for (let i = 0; i < digitRectangles.length; ++i) {
    let detectedDigit =
      detectDigit(groupSrc, digitRectangles[i], refDigits, refSize);
    groupOutput.push(detectedDigit);
  }
  groupSrc.delete();
  return groupOutput;
}

function showOutput(output) {
  let label = document.querySelector(`label[for=cardNumber]`);
  label.classList.remove('hidden');
  document.getElementById('cardType').innerText =
  'Card type: ' + CARD_TYPE[output[0][0]];
  document.getElementById('cardNumber').value = output.join(' ');
}

function showCard(grayCard, rectPointUpperLeft, rectPointBottomRight) {
  let outputSize = new cv.Size(rectPointBottomRight.x - rectPointUpperLeft.x,
    rectPointBottomRight.y - rectPointUpperLeft.y);
  // Prepare gray card for output and copy to src.
  cv.resize(grayCard, grayCard, outputSize, cv.INTER_AREA);
  cv.cvtColor(grayCard, grayCard, cv.COLOR_GRAY2BGRA);
  grayCard.copyTo(src
    .rowRange(rectPointUpperLeft.y, rectPointBottomRight.y)
    .colRange(rectPointUpperLeft.x, rectPointBottomRight.x));

  // Change color of the rectangle to green.
  const color = [0, 255, 0, 255]; // Green
  cv.rectangle(src, rectPointUpperLeft, rectPointBottomRight, color, 2);

  cv.imshow('canvasOutput', src);
}

function deleteMatObjects(refDigits, grayCard, filteredCard) {
  for (let i = 0; i < refDigits.length; ++i) {
    refDigits[i].delete();
  }
  grayCard.delete(); filteredCard.delete();
}

function startCardProcessing(src, rectPointUpperLeft, rectPointBottomRight) {
  let refSize = new cv.Size(57, 88);
  let refDigits = getReferenceDigits('ocrFont', refSize);

  let grayCard = new cv.Mat();
  loadCardImg(src, grayCard, rectPointUpperLeft, rectPointBottomRight);

  let filteredCard = new cv.Mat();
  applyFiltersToCard(grayCard, filteredCard);

  let groupRectangles = findDigitGroups(filteredCard);

  output = [];
  // Loop over the 4 groupings of 4 digits.
  for (let i = 0; i < groupRectangles.length; ++i) {
    let groupOutput =
      detectDigitsInGroup(groupRectangles[i], grayCard, refDigits, refSize);
    output.push(groupOutput.join('')); // Update the output digits list.
  }

  if (output[0]) {
    showOutput(output);
  } else {
    document.getElementById('cardType').innerText =
      'Please take a more accurate photo.';
  }
  showCard(grayCard, rectPointUpperLeft, rectPointBottomRight);

  deleteMatObjects(refDigits, grayCard, filteredCard);
}

function isCloseToExpectedContour(coordinates) {
  if (coordinates[0].x <= controls.expectedContour[0].x + controls.edgeError
    && coordinates[0].x >= controls.expectedContour[0].x - controls.edgeError
    && coordinates[0].y <= controls.expectedContour[0].y + controls.edgeError
    && coordinates[0].y >= controls.expectedContour[0].y - controls.edgeError
    && coordinates[1].x <= controls.expectedContour[1].x + controls.edgeError
    && coordinates[1].x >= controls.expectedContour[1].x - controls.edgeError
    && coordinates[1].y <= controls.expectedContour[1].y + controls.edgeError
    && coordinates[1].y >= controls.expectedContour[1].y - controls.edgeError
    && coordinates[2].x <= controls.expectedContour[2].x + controls.edgeError
    && coordinates[2].x >= controls.expectedContour[2].x - controls.edgeError
    && coordinates[2].y <= controls.expectedContour[2].y + controls.edgeError
    && coordinates[2].y >= controls.expectedContour[2].y - controls.edgeError
    && coordinates[3].x <= controls.expectedContour[3].x + controls.edgeError
    && coordinates[3].x >= controls.expectedContour[3].x - controls.edgeError
    && coordinates[3].y <= controls.expectedContour[3].y + controls.edgeError
    && coordinates[3].y >= controls.expectedContour[3].y - controls.edgeError)
    return true;
  else return false;
}
