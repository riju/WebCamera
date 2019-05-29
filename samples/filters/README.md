# Goal

Present kinds of Instagram filters in web browser using OpenCV.

## Filters

**1. Changing Colorspaces**
* Gray
```javascript
cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
```

* HSV (hue, saturation, value)
```javascript
cv.cvtColor(src, dstC3, cv.COLOR_RGBA2RGB);
cv.cvtColor(dstC3, dstC3, cv.COLOR_RGB2HSV);
```

**2. Image Thresholding**
* Simple Thresholding

If pixel value is greater than a threshold value, it is assigned one value (may be white), else it is assigned another value (may be black).
```javascript
cv.threshold(src, dstC4, thresholdValue, 200, cv.THRESH_BINARY);
```

* Adaptive Thresholding

In Adaptive Thresholding, the algorithm calculate the threshold for a small regions of the image. So we get different thresholds for different regions of the same image and it gives us better results for images with varying illumination.
```javascript
cv.cvtColor(src, mat, cv.COLOR_RGBA2GRAY);
cv.adaptiveThreshold(mat, dstC1, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY, Number(blockSizeValue), 2);
```

**3. Smoothing Images**

Image blurring is achieved by convolving the image with a low-pass filter kernel. It actually removes high frequency content (eg: noise, edges) from the image.

We considered three types of blurring techniques in OpenCV.
* Gaussian Blurring
```javascript
cv.GaussianBlur(src, dstC4,
    { width: gaussianBlurSize, height: gaussianBlurSize },
    0, 0, cv.BORDER_DEFAULT);
```

* Median Blurring
```javascript
cv.medianBlur(src, dstC4, medianBlurSize);
```

* Bilateral Filtering
```javascript
cv.cvtColor(src, mat, cv.COLOR_RGBA2RGB);
cv.bilateralFilter(mat, dstC3, bilateralFilterDiameter, bilateralFilterSigma,
    bilateralFilterSigma, cv.BORDER_DEFAULT);
```


**4. Morphological Transformations**

Morphological transformations are some simple operations based on the image shape. It is normally performed on binary images. It needs two inputs, one is our original image, second one is called structuring element or kernel which decides the nature of operation.
Morphological transformations inlude Erosion, Dilation, Opening, Closing, Morphological Gradient, Top Hat and Black Hat.
```javascript
cv.morphologyEx(image, dstC4, op, kernel, { x: -1, y: -1 }, 1,
    Number(borderType), color);
```

**5. Image Gradients**

An image gradient is a directional change in the intensity or color in an image.

OpenCV provides three types of gradient filters. These are Sobel, Scharr and Laplacian.
* Sobel Derivatives
```javascript
cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY, 0);
cv.Sobel(mat, dstC1, cv.CV_8U, 1, 0, sobelSize, 1, 0, cv.BORDER_DEFAULT);
```
* Scharr Derivatives
```javascript
cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY, 0);
cv.Scharr(mat, dstC1, cv.CV_8U, 1, 0, 1, 0, cv.BORDER_DEFAULT);
```
* Laplacian Derivatives
```javascript
cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY);
cv.Laplacian(mat, dstC1, cv.CV_8U, laplacianSize, 1, 0, cv.BORDER_DEFAULT);
```

**6. Canny Edge Detection**

Canny Edge Detection is a popular edge detection algorithm containing such stages as Noise Reduction, Finding Intensity Gradient of the Image, Non-maximum Suppression and Hysteresis Thresholding.
```javascript
cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
cv.Canny(dstC1, dstC1, cannyThreshold1, cannyThreshold2,
    cannyApertureSize, controls.cannyL2Gradient.checked);
```

**7. Histogram**
* Calculation

From a simple histogram, you can see amount of midtones on the image.
```javascript
cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
cv.calcHist(srcVec, channels, mask, hist, histSize, ranges);
cv.cvtColor(dstC1, dstC4, cv.COLOR_GRAY2RGBA);
```
* Equalization

Equalization histogram normally improves the contrast of the image.
```javascript
cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY, 0);
cv.equalizeHist(dstC1, dstC1);
```
* Backprojection

It is used for image segmentation or finding objects of interest in an image.
```javascript
cv.calcHist(baseVec, channels, mask, hist, histSize, ranges);
cv.normalize(hist, hist, 0, 255, cv.NORM_MINMAX);
cv.calcBackProject(targetVec, channels, hist, dstC1, ranges, 1);
```


## References

1. [List of filters (OpenCV)](https://docs.opencv.org/3.4/d2/df0/tutorial_js_table_of_contents_imgproc.html)
2. [OpenCV.js Tutorial for Image Processing](https://docs.opencv.org/3.4/d8/d54/tutorial_js_imgproc_camera.html)
