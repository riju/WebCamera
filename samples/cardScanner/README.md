# Goal

Demonstrate card scanning using OpenCV.js filters.

**Note**

To accurately detect card edges and numbers you should use:
* monotonic smooth surface that is different in color from the card background,
* credit card with monotonic background and good contrast between background and card numbers,
* good lighting in the room and light should not create glare on the card.
Otherwise, the card edges or digits may not be detected or digits can be recognized incorrectly.

## Steps of card scanning

**1. Detect the edges of the credit card**

* Convert image to gray:

```javascript
cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY, 0);
```

* Apply Canny filter:

```javascript
cv.Canny(dst, dst, 15, 45, 3, false);
```
15 and 45 are values of the first and second thresholds, 3 is aperture size.

* Find contours:

```javascript
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
let approxCnt = new cv.Mat();
cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
```
* Loop through every contour, find contour perimeter.

```javascript
for (let i = 0; i < contours.size(); ++i) {
  let cnt = contours.get(i);
  let perimeter = cv.arcLength(cnt, true);
  ...
  cnt.delete();
}
```

* Approximate the contour with the (0.01 * perimeter) precision:

```javascript
cv.approxPolyDP(cnt, approxCnt, 0.01 * perimeter, true);
```

* Get sorted contour coordinates if contour approximation has 4 angles:

```javascript
if (approxCnt.rows == 4) {
  let sortedCoordinates = getContourCoordinates(approxCnt);
  ...
}
```

* Start processing if contour coordinates are close to expected:

```javascript
if (isCloseToExpectedContour(sortedCoordinates)) {
  startCardProcessing(src, controls.expectedContour[0], controls.expectedContour[2]);
  return;
}
```

**2. Localize groups of digits**

We are goin to find the four groupings of four digits, pertaining to the sixteen digits on the credit card.

* Extract card area from source image:
```javascript
let cardImg = new cv.Mat();
let rect = new cv.Rect(rectPointUpperLeft.x, rectPointUpperLeft.y,
  rectPointBottomRight.x - rectPointUpperLeft.x,
  rectPointBottomRight.y - rectPointUpperLeft.y);
cardImg = src.roi(rect);
```

* Resize card and convert it to grayscale:

```javascript
resize(cardImg, width = 300);
cv.cvtColor(cardImg, grayCard, cv.COLOR_BGR2GRAY);
```

* Apply filters.

Initialize rectangular and square structuring kernels:

```javascript
let rectKernel = new cv.Mat();
let squareKernel = new cv.Mat();
rectKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 3));
squareKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
```

Apply a tophat (whitehat) morphological operator to find light regions against a dark background (i.e., the credit card numbers):

```javascript
let tophat = new cv.Mat();
cv.morphologyEx(grayCard, tophat, cv.MORPH_TOPHAT, rectKernel);
```

Compute the Sobel gradient of the tophat image. Set the order of the derivative in x direction:

```javascript
let gradX = new cv.Mat();
let kernel = 1, xOrder = 1, yOrder = 0;
cv.Sobel(tophat, gradX, cv.CV_32F, xOrder, yOrder, kernel);
cv.convertScaleAbs(gradX, gradX, 1, 0);
gradX.convertTo(gradX, cv.CV_8U);
```

Apply a closing operation using the rectangular kernel to help close gaps between credit card number regions:

```javascript
let thresh = new cv.Mat();
cv.morphologyEx(gradX, gradX, cv.MORPH_CLOSE, rectKernel);
```

Apply Otsu's thresholding method to binarize the image:

```javascript
cv.threshold(gradX, thresh, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
```

Apply a second closing operation to the binary image, again to help close gaps between credit card number regions:

```javascript
cv.morphologyEx(thresh, filteredCard, cv.MORPH_CLOSE, squareKernel);
```

* Find groups of digits in filtered image.

First, find contours and get rectangles of these contours:

```javascript
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(filteredCard, contours, hierarchy, cv.RETR_EXTERNAL,
  cv.CHAIN_APPROX_SIMPLE);
let groupRectangles = getSortedRectangles(contours);
```

Loop through each rectangle and calculate aspect ratio:

```javascript
  let digitGroups = [];
  for (let i = 0; i < groupRectangles.length; ++i) {
    let rect = groupRectangles[i];
    let ratio = rect.width / rect.height;
    ...
  }
```

Since credit cards used a fixed size fonts with 4 groups of 4 digits, we can prune potential contours based on the aspect ratio. Contours can further be pruned on min/max width and height:

```javascript
if (ratio > 2.5 && ratio < 4.0)
  if ((rect.width > 40 && rect.width < 55)
    && (rect.height > 10 && rect.height < 20))
    digitGroups.push(rect);
```

**3. Apply OCR font to recognize the digits**

In each of four groups we have to recognize four digits.

* Extract the group of 4 digits from the grayscale image, then apply thresholding to segment the digits from the background of the credit card:

```javascript
let groupSrc = new cv.Mat();
groupSrc = grayCard.roi(groupRect);
cv.threshold(groupSrc, groupSrc, 0, 255, cv.THRESH_BINARY | cv.THRESH_OTSU);
```

* Detect the contours of each individual digit in the group, then sort the digit contours from left to right:

```javascript
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();
cv.findContours(groupSrc, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
let digitRectangles = getSortedRectangles(contours);
contours.delete(); hierarchy.delete();
```

* Loop over the contours and recognize each digit:

```javascript
groupOutput = [];
for (let i = 0; i < digitRectangles.length; ++i) {
  let detectedDigit =
    detectDigit(groupSrc, digitRectangles[i], refDigits, refSize);
  groupOutput.push(detectedDigit);
}
```

* Digit recongnition.

Resize digit to have the same fixed size as the reference digits.

```javascript
let cardDigit = new cv.Mat();
cardDigit = group.roi(digitRect);
cv.resize(cardDigit, cardDigit, refSize);
```

Initialize a list of template matching scores:

```javascript
scores = [];
```

Loop over the reference digits and apply correlation-based template matching:

```javascript
let cardDigitDst = new cv.Mat();
let mask = new cv.Mat();
for (let i = 0; i < refDigits.length; ++i) {
  cv.matchTemplate(cardDigit, refDigits[i], cardDigitDst, cv.TM_CCOEFF, mask);
  let score = cv.minMaxLoc(cardDigitDst, mask).maxVal;
  scores.push(score);
}
cardDigit.delete(); cardDigitDst.delete(); mask.delete();
```

Take the largest template matching score:

```javascript
return scores.indexOf(Math.max(...scores));
```

**4. Recognize the type of credit card (i.e., Visa, MasterCard, American Express, etc.)**

```javascript
CARD_TYPE = {
  "3": "American Express",
  "4": "Visa",
  "5": "MasterCard",
  "6": "Discover Card"
}
document.getElementById('cardType').innerText = 'Card type: ' + CARD_TYPE[output[0][0]];
```

## References

1. [Credit card OCR with OpenCV and Python](https://www.pyimagesearch.com/2017/07/17/credit-card-ocr-with-opencv-and-python/) - scan card and detect digits
2. [How to Build a Kick-Ass Mobile Document Scanner in Just 5 Minutes](https://www.pyimagesearch.com/2014/09/01/build-kick-ass-mobile-document-scanner-just-5-minutes/) - detect edge of the card
