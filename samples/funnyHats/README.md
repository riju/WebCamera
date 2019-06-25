# Goal

Show virtual objects (hats and glasses) on a face using OpenCV.

## Hats and glasses processing

First, we detect face and scale width and height of hat source accordingly.

Then, we resize hat source and hat mask (mask is for transparent background):

```javascript
cv.resize(hatSrc, hatDst, size);
cv.resize(hatMask, hatMaskDst, size);
```

After that, we calculate absolute coordinates for hat.

Using these coordinates we copy result image to the main video source `src` and apply transparent mask:

```javascript
hatFrames[i].src.copyTo(src.rowRange(hatFrames[i].y1, hatFrames[i].y2)
                           .colRange(hatFrames[i].x1, hatFrames[i].x2),
                        hatFrames[i].mask);
```

Similar algorithm is used to resize and draw glasses.

Additionaly, we rotate glasses using `warpAffine(...)` function and rotation matrix:

```javascript
cv.warpAffine(glassesDst, glassesDst, glasses.rotMat, rSize);
cv.warpAffine(glassesMaskDst, glassesMaskDst, glasses.rotMat, rSize);
```


## References

1. [Face and eyes detection (OpenCV)](../faceDetection/README.md)
2. [Geometric Transformations of Images (OpenCV)](https://docs.opencv.org/3.4/dd/d52/tutorial_js_geometric_transformations.html)
