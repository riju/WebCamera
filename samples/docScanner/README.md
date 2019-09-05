# Goal

Demonstrate card scanning using OpenCV.js filters.

**Note**

To accurately detect document edges you should use:
* monotonic smooth surface that is different in color from the document,
* good lighting in the room and light should not create glare on the document surface.

To manipulate threshold parameters like Block Size and Offset, you can use sliders at the bottom of the demo.
* *Block size* is size of a pixel neighborhood that is used to calculate a threshold value for the pixel: 3, 5, 7, and so on. The smaller the value of BlockSize, the thinner the drawn lines.
* *Offset* is constant subtracted from the mean or weighted mean. Normally, it is positive but may be zero or negative as well. The Offset parameter visually determines the level of image detail. When the value is negative then the colors of the image are inverted.


## Steps of document scanning

**1. Detect edges**

We convert the image from RGB to grayscale, perform Gaussian blurring to remove high frequency noise (aiding in contour detection in Step 2), and perform Canny edge detection:

```javascript
cv.cvtColor(src, dst, cv.COLOR_RGB2GRAY);
cv.GaussianBlur(dst, dst, { width: 5, height: 5 }, 0, 0, cv.BORDER_DEFAULT);
cv.Canny(dst, dst, 75, 200);
```

**2. Finding Contours**

Here, we find contours and look for 4 angles of the contour. So in cases of the document with rounded corners, document edges detection may not work.

* Find all contours:

```javascript
let contours = new cv.MatVector();
let hierarchy = new cv.Mat();

cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

contours.delete(); hierarchy.delete();
```

* Approximates a polygonal curve(s) with the specified precision, check that contour has 4 angles and choose contour with the maximum area:

```javascript
let cnt = contours.get(i);
let perimeter = cv.arcLength(cnt, true);
cv.approxPolyDP(cnt, approxCnt, 0.01 * perimeter, true);
let area = cv.contourArea(cnt);

// Check that contour has 4 angles.
if (approxCnt.rows == 4 && area > maxArea) {
  maxArea = area;
  index = i;
}
cnt.delete();
```

* Get contour coordinates and assign them to `approxCoords` global variable:

```javascript
  let cnt = contours.get(res.i);
  let perimeter = cv.arcLength(cnt, true);
  cv.approxPolyDP(cnt, approxCnt, 0.01 * perimeter, true);
  approxCoords = getContourCoordinates(approxCnt);
  cnt.delete();
```

**3. Apply a Perspective Transform & Threshold**

* Apply the four point transform to obtain a top-down view of the original image:

```javascript
let dsize = new cv.Size(maxWidth, maxHeight);
let imgTri = cv.matFromArray(4, 1, cv.CV_32FC2, [rect[0].x, rect[0].y, rect[1].x, rect[1].y, rect[2].x, rect[2].y, rect[3].x, rect[3].y]);
let dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, maxWidth - 1, 0, maxWidth - 1, maxHeight - 1, 0, maxHeight - 1]);

let M = cv.getPerspectiveTransform(imgTri, dstTri);
cv.warpPerspective(image, warpedImage, M, dsize);
```

* Convert the warped image to grayscale, then threshold it to give it that 'black and white' paper effect:

```javascript
let thresholdedImage = new cv.Mat();
cv.cvtColor(warpedImage, warpedImage, cv.COLOR_BGR2GRAY);
cv.adaptiveThreshold(warpedImage, thresholdedImage, 250, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, thresholdBlockSize, thresholdOffset);
```


## References

1. [How to Build a Kick-Ass Mobile Document Scanner in Just 5 Minutes](https://www.pyimagesearch.com/2014/09/01/build-kick-ass-mobile-document-scanner-just-5-minutes/)
2. [4 Point OpenCV getPerspective Transform Example](https://www.pyimagesearch.com/2014/08/25/4-point-opencv-getperspective-transform-example/)
3. [Crop image by dragging lines](https://codepen.io/enxaneta/pen/EKxMYo)
4. [Crop image by drawing points](https://jsfiddle.net/vvzcnb2g/)
5. [Take control of your scroll: customizing pull-to-refresh and overflow effects](https://developers.google.com/web/updates/2017/11/overscroll-behavior)
6. [CSS Overscroll Behavior Module Level 1](https://www.w3.org/TR/css-overscroll-1/)
