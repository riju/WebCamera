# Goal

Demonstrate emotion recognition using Fisher Faces recognition model ([how to train and use](http://www.paulvangent.com/2016/04/01/emotion-recognition-with-python-opencv-and-a-face-dataset/)) and [opencv_contrib project](https://github.com/opencv/opencv_contrib).


## Implementation

1. Load `emotion_detection_model.xml` using `createFileFromUrl()` from `utils.js`:

```javascript
utils.createFileFromUrl('emotion_detection_model.xml', emotionModelUrl, callback);
```

2. Initialize array of emotions which model is able to recognize:

```javascript
const emotions = ['neutral', 'anger', 'disgust', 'fear', 'happiness', 'sadness', 'surprise']
```

3. Load emoticons

Create `img` elements and set `src` attribute:

```javascript
emotions.forEach(emotion => {
  let emoticonImg = createImgNode(emotion + '-emoticon');

  emoticonImg.onload = function () {
    ++nImagesLoaded;
  };
  emoticonImg.src = '../../data/emoticons/' + emotion + '.png';
});
```

Extract masks from `rgbaVector` to draw transparent background and push `{'name': .., 'src': .., 'mask': ..}` structures to `emoticons` array when images are loaded:

```javascript
function waitForResources() {
  if (nImagesLoaded == N_IMAGES) {
    emotions.forEach(emotion => {
      let emoticonImg = document.getElementById(emotion + '-emoticon');
      let rgbaVector = new cv.MatVector();
      let emoticon = {};
      emoticon.src = cv.imread(emoticonImg);
      cv.split(emoticon.src, rgbaVector); // Create mask from alpha channel.
      emoticon.mask = rgbaVector.get(3);
      emoticon.name = emotion;
      emoticons.push(emoticon);
      rgbaVector.delete();
    });

    requestAnimationFrame(processVideo);
    return;
  }
  setTimeout(waitForResources, 50);
}

waitForResources();
```

3. Create FisherFaceRecognizer and read model:

```javascript
fisherFaceRecognizer = new cv.face_FisherFaceRecognizer();
fisherFaceRecognizer.read('emotion_detection_model.xml');
```

4. Detect face using Haar Cascade model (see face detection README file):

```javascript
faceCascade.detectMultiScale(gray, faceVec);
```

5. Recognize emotion from a face

Prepre face:

```javascript
let face = faceVec.get(i);
let faceGray = gray.roi(face);
cv.resize(faceGray, faceGray, new cv.Size(350, 350));
```

Predict emotion:

```javascript
let prediction = fisherFaceRecognizer.predict_label(faceGray);
let emoticon = emoticons[prediction];
```

6. Draw emoticon over a face

Resize image source and mask:

```javascript
let newEmoticonSize = new cv.Size(face.width, face.height);
let resizedEmoticon = new cv.Mat();
let resizedMask = new cv.Mat();
cv.resize(emoticon.src, resizedEmoticon, newEmoticonSize);
cv.resize(emoticon.mask, resizedMask, newEmoticonSize);
```

Copy resized emoticon to stream image using face coordinated:

```javascript
resizedEmoticon.copyTo(src.rowRange(face.y, face.y + face.height)
  .colRange(face.x, face.x + face.width), resizedMask);
```

## Build *opencv.js* with **face** module from *opencv_contrib*

1. Add the following flags to `def get_cmake_cmd(self)` of `opencv/platforms/js/build_js.py`:

```python
"-DBUILD_opencv_face=ON",
"-DOPENCV_EXTRA_MODULES_PATH='/home/path-to-opencv-contrib/opencv_contrib/modules'"
```

2. Define `face` module in `opencv/modules/js/src/embindgen.py`. Include all global functions, classes and their methods that you want to have in your wasm. For example:

```python
face = {'face_FaceRecognizer': ['train', 'update', 'predict_label', 'write', 'read', 'setLabelInfo', 'getLabelInfo', 'getLabelsByString', 'getThreshold', 'setThreshold'],
        'face_BasicFaceRecognizer': ['getNumComponents', 'setNumComponents', 'getThreshold', 'setThreshold', 'getProjections', 'getLabels', 'getEigenValues', 'getEigenVectors', 'getMean', 'read', 'write'],
        'face_FisherFaceRecognizer': ['create']}
```

3. Add the `face` module to the `makeWhiteList` in `opencv/modules/js/src/embindgen.py`:

```python
white_list = makeWhiteList([core, imgproc, objdetect, video, dnn, features2d, photo, aruco, calib3d, face])
```

4. Add the following in `opencv/modules/js/src/core_bindings.cpp`:

```cpp
using namespace face;
```

5. Append `js` in `ocv_define_module` of `opencv_contrib/modules/face/CMakeLists.txt`:

```cmake
ocv_define_module(face opencv_core
    opencv_imgproc
    opencv_objdetect
    opencv_calib3d   # estimateAffinePartial2D() (trainFacemark)
    opencv_photo     # seamlessClone() (face_swap sample)
    WRAP python java js
)
```

6. [Build OpenCV](https://docs.opencv.org/master/d7/d9f/tutorial_linux_install.html)

7. [Build opencv.js WASM](https://docs.opencv.org/master/d4/da1/tutorial_js_setup.html)


## References

1. [Train Fisher Faces recognition model and use it for Emotion Recognition in OpenCV](http://www.paulvangent.com/2016/04/01/emotion-recognition-with-python-opencv-and-a-face-dataset/)
2. [opencv_contrib project on Github](https://github.com/opencv/opencv_contrib)
3. [Tutorial to build OpenCV](https://docs.opencv.org/master/d7/d9f/tutorial_linux_install.html)
4. [Tutorial to build opencv.js](https://docs.opencv.org/master/d4/da1/tutorial_js_setup.html)
5. [facemoji project on Github](https://github.com/PiotrDabrowskey/facemoji)
6. [Emotion-Detection project on Github](https://github.com/PanKnst/Emotion-Detection)
