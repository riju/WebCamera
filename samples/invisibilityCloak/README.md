# Goal

Demonstrate color detection and segmentation using OpenCV.js.


## Implementation

1. Capture background

Camera parameters are not stable when the camera is just getting started. So we execute a loop where we capture background and use the last frame as a stable background.

```javascript
const BACKGROUND_CAPTURE_ITERATIONS = 300;

for (let i = 0; i < BACKGROUND_CAPTURE_ITERATIONS; ++i) {
  ...
  background.data.set(imageData.data);
  ...
}
```

2. Create HSV ranges for blue color

In OpenCV, Hue range is [0,179], Saturation range is [0,255] and Value range is [0,255].
We use 0-33 range for blue color, 100-255 for saturation and 70-255 for brigtness.

```javascript
lowerRedRange = new cv.Mat(video.height, video.width, cv.CV_8UC3, new cv.Scalar(0, 100, 70, 255));
upperRedRange = new cv.Mat(video.height, video.width, cv.CV_8UC3, new cv.Scalar(33, 255, 255, 255));
```

3. Convert source image to HSV color space

HSV - Hue (color information), Saturation (intensity), Value (brightness).

```javascript
cv.cvtColor(source, hsv, cv.COLOR_BGR2HSV);
```

4. Apply lower and upper boundary of a blue color to inRange filter:

```javascript
cv.inRange(hsv, lowerRedRange, upperRedRange, mask);
```

5. Apply morphology transformation

Dilation increases area of filtered object.

```javascript
let kernel = cv.Mat.ones(3, 3, cv.CV_32F);
cv.morphologyEx(mask, mask, cv.MORPH_DILATE, kernel);
```

6. Apply mask to background image:

```javascript
cv.bitwise_and(background, background, sourceResult, mask);
```

7. Create an inverted mask of a filtered object and apply it to source image:

```javascript
cv.bitwise_not(mask, maskInv);
cv.bitwise_and(source, source, backgroundResult, maskInv);
```

8. Combine source and background images:

```javascript
cv.addWeighted(backgroundResult, 1, sourceResult, 1, 0, destination);
```

## References

1. [Invisibility Cloak using Color Detection and Segmentation with OpenCV](https://www.learnopencv.com/invisibility-cloak-using-color-detection-and-segmentation-with-opencv/)
