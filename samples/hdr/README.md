# Goal

This demo is pretty much a work in progress, but it intends to show how to create a HDR photo, which is essentially an image manipulation technique where a same photo is shot multiple times (at least 3
times, sometimes more) at different exposure levels (exposure bracketing) and
then combined to create a HDR photo with the desired luminance range.

Chromium (on android , Linux/CrOS and  hopefully soon on Windows [1,2]) now supports controlling 
the exposure time in manual mode.

```javascript
 track.applyConstraints({advanced : [{exposureMode: "manual", exposureTime: 10}]});
  }
```

Photographers use software like Lightroom or Photoshop to create their HDR photos.
OpenCV [3,4] a powerful computer vision library can also be used to create HDR
photos[5] using the debevec algorithm[6].

```cpp
    Mat hdr;
    Ptr<MergeDebevec> merge_debevec = createMergeDebevec();
    merge_debevec->process(images, hdr, times, response);

```

We had to supply OpenCV with an array of images at different exposures and 
wooo ... magic happened !!
With capturing different exposure levels now possible on the Web(chromium), we 
can now create HDR using opencv.js, we need to compile opencvJS with the "photo" module as described in this PR[7].

So capturing -> processing -> display all within your favourite browser.



## HDR images on the Web.

1. Capture multiple images with various exposure levels.
Preferably capture an underexposed (darker), a properly exposed (normal) and one over exposed(brighter) image.

```javascript
// Capture multiple images with various exposure levels.
let src1 = cv.imread(takePhotoCanvas1);
..
let srcArray = new cv.MatVector();
srcArray.push_back(src1);
..
``` 

2. Align Images.
OpenCV’s AlignMTB algorithm converts all images to median threshold bitmaps, which helps to compensate for various motion distortions.

```javascript
// Align images. 
let alignMTB = new cv.AlignMTB();
alignMTB.process(srcArray, srcArray);
``` 

3. Estimate the camera Response Function (CRF)
Camera response is non-linear to scene brightness and before merging the images we have to estimate the camera’s response function.

```javascript
// Estimate Camera Response Function (CRF).
let calibration = new cv.CalibrateDebevec();
calibration.process(srcArray, response, times);
``` 


4. Merge Images
Actually merge the images using Debevec algorithm to create a HDR image.

```javascript
// Merge exposures to HDR image using Debevec algorithm.
let merge_debevec = new cv.MergeDebevec();
merge_debevec.process(srcArray, hdr_debevec, times, response);
``` 

5. Tone-mapping
In real world, HDR images have color depth of 10 bits or more, but most displays still have 8 bit color depth. Tone mapping addresses the problem of strong contrast reduction from the scene radiance to the displayable range while preserving the image details and color appearance important to appreciate the original scene content.

```javascript
// Optional: Tonemap HDR image for display on a regular screen.
tonemap_reinhard = new cv.TonemapReinhard(gamma = 2.2);
res_debevec = tonemap_reinhard.process(hdr_debevec, ldr);
``` 

6. Display

```javascript
// Display in canvas (save to file functionality not yet present in OpenCV.js).
// Ideally we should have done: cv.imwrite('hdr.png', hdr * 255);
cv.cvtColor(hdr_debevec, dst, cv.COLOR_BGRA2RGBA, 0);
cv.imshow('outputCanvasHDR', dst);
``` 


--- 
## Future Work

Hopefully there is a wider adoption of image formats like JPEG_HDR and HEVC in a consistent fashion among the various browser vendors. 


---

## More details:

[1] https://bugs.chromium.org/p/chromium/issues/detail?id=823316

[2] https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ls3wQSoHOUY

[3] https://github.com/opencv/opencv

[4] https://software.intel.com/en-us/articles/what-is-opencv

[5] https://docs.opencv.org/3.2.0/d3/db7/tutorial_hdr_imaging.html

[6] http://www.pauldebevec.com/Research/HDR/debevec-siggraph97.pdf

[7] https://github.com/opencv/opencv/commit/e70786e05e605074b33e4c00842009847c32f17a
