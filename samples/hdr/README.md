# Goal

This demo shows how to create a HDR photo which is essentially an image
manipulation technique where a same photo is shot multiple times (at least 3
times, sometimes more) at different exposure levels (exposure bracketing) and
then combined to create a HDR photo with the desired luminance range.

Chromium (on android and soon Linux/CrOS and Windows [1,2]) now supports controlling 
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
can now create HDR using opencv.js[7].
So capturing -> processing -> display all within your favourite browser.

---

## More details:

[1] https://bugs.chromium.org/p/chromium/issues/detail?id=823316

[2] https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/ls3wQSoHOUY

[3] https://github.com/opencv/opencv

[4] https://software.intel.com/en-us/articles/what-is-opencv

[5] https://docs.opencv.org/3.2.0/d3/db7/tutorial_hdr_imaging.html

[6] http://www.pauldebevec.com/Research/HDR/debevec-siggraph97.pdf

[5] https://github.com/ucisysarch/opencvjs
