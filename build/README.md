# Build OpenCV and OpenCV.js

## How to build OpenCV from source using CMake

1. `cd opencv`

2. `mkdir build && cd build`

3. `cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local ..`

4. `make -j7 && sudo make install`

See [OpenCV build doc](https://docs.opencv.org/master/d7/d9f/tutorial_linux_install.html) for more details.

## How to build OpenCV WASM file

1. Install and activate Emscripten

2. `cd opencv`

3. `python ./platforms/js/build_js.py build_wasm --build_wasm --emscripten_dir="/home/user/emsdk/upstream/emscripten"`

4. Optional:

    Use `--simd` and `--threads` flags for the command above if you want to have simd and threads support in your WASM.

See [OpenCV.js build doc](https://docs.opencv.org/master/d7/d9f/tutorial_linux_install.html) for more details.

## Optional: How to build OpenCV with opencv_contrib module

Let's see how to build WASM for example with **face** module from *opencv_contrib*.

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

6. [Build OpenCV](#How-to-build-OpenCV-from-source-using-CMake).

    Don't forget to add path to *opencv_contrib* project during cmake configuratoin:

    `cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local -DOPENCV_EXTRA_MODULES_PATH=/home/user/opencv_contrib/modules ..`

7. [Build opencv.js WASM](#How-to-build-OpenCV-WASM-file)


## Emscripten options

In `opencv/modules/js/CMakeLists.txt` we can specify some Emscripten flags for building WASM.

For example, see how `-s WASM_MEM_MAX=1GB` was added to prevent browser to run out of memory if used memory size grows too much:

![](../gifs/wasm_mem_max.png)

### Debugging

The _emcc_ `-g` flag can be used to preserve debug information in the compiled output.

With `EMCC_DEBUG=1` set, we enable debug mode. _emcc_ emits debug output and generates intermediate files for the compiler’s various stages.

See more about debugging [here](https://emscripten.org/docs/porting/Debugging.html).
