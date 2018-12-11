const constraints = {
  "video": {
      width: {
          exact: 240
      }
  }
};
var videoTag = document.getElementById('video-tag');

var takePhotoCanvas1 = document.getElementById('takePhotoCanvas1');
var takePhotoCanvas2 = document.getElementById('takePhotoCanvas2');
var takePhotoCanvas3 = document.getElementById('takePhotoCanvas3');
var takePhotoCanvasArray = new Array(takePhotoCanvas1, takePhotoCanvas2,
  takePhotoCanvas3);
var images_list = new Array(3);
var imageHDR = document.getElementById('imageHDR');

var exposureTimeSlider = document.getElementById("exposureTime-slider");
var exposureTimeSliderValue = document.getElementById(
  "exposureTime-slider-value");
var takePhotoButton = document.getElementById('takePhotoButton');
var imageCapturer;
var counter = 0;
var exposureTimeArray = new Float32Array(3);

// Assume there is a list of 3 images at various exposure time.

function startCamera() {
  navigator.mediaDevices.getUserMedia(constraints)
      .then(gotMedia)
      .catch(e => {
          console.error('getUserMedia() failed: ', e);
      });
}

function gotMedia(mediastream) {
  videoTag.srcObject = mediastream;
  document.getElementById('start').disabled = true;

  var videoTrack = mediastream.getVideoTracks()[0];
  imageCapturer = new ImageCapture(videoTrack);

  // Timeout needed in Chrome, see https://crbug.com/711524
  setTimeout(() => {
      const capabilities = videoTrack.getCapabilities()
      // Check whether exposureTime is supported or not.
      if (!capabilities.exposureTime) {
          return;
      }

      exposureTimeSlider.min = capabilities.exposureTime.min;
      exposureTimeSlider.max = capabilities.exposureTime.max;
      exposureTimeSlider.step = capabilities.exposureTime.step;

      exposureTimeSlider.value = exposureTimeSliderValue.value =
          videoTrack.getSettings().exposureTime;
      exposureTimeSliderValue.value = exposureTimeSlider.value;

      exposureTimeSlider.oninput = function() {
          exposureTimeSliderValue.value = exposureTimeSlider.value;
          videoTrack.applyConstraints({
              advanced: [{
                  exposureTime: exposureTimeSlider.value
              }]
          });
      }

  }, 500);
}

// process HDR
function createHDR() {
  if (counter < 3) {
      console.log("3 pictures are needed");
      return;
  }

  console.log("createHDR is called !");

  let src1 = cv.imread(takePhotoCanvas1);
  let src2 = cv.imread(takePhotoCanvas2);
  let src3 = cv.imread(takePhotoCanvas3);
  console.log('image width: ' + src1.cols + '\n' +
      'image height: ' + src1.rows + '\n' +
      'image size: ' + src1.size().width + '*' + src1.size().height +
      '\n' +
      'image depth: ' + src1.depth() + '\n' +
      'image channels ' + src1.channels() + '\n' +
      'image type: ' + src1.type() + '\n');

  let srcArray = new cv.MatVector();
  srcArray.push_back(src1);
  srcArray.push_back(src2);
  srcArray.push_back(src3);

  let dest = new cv.Mat();



  let response = new cv.Mat();
  let calibration = new cv.CalibrateDebevec();
  // process (InputArrayOfArrays src, OutputArray dst, InputArray times)
  console.log("call calibration.process");
  // let times = exposureTimeArray.slice();
  let times = new cv.matFromArray(exposureTimeArray.length, 1, cv.CV_32F,
      exposureTimeArray);
  exposureTimeArray.forEach(function(element) {
      console.log(element);
  });
  calibration.process(srcArray, response, times);

  // Merge exposures to HDR image.
  console.log("MergeDebevec is called");
  let hdr_debevec = new cv.Mat();
  let merge_debevec = new cv.MergeDebevec();
  merge_debevec.process(srcArray, hdr_debevec, times, response);
  console.log("HDR done !! woooo ");

  // Tonemap HDR image if you don't have HDR screen to display.
  console.log("TonemapReinhard is called");
  let ldr = new cv.Mat();
  tonemap1 = new cv.TonemapReinhard(gamma = 2.2);
  res_debevec = tonemap1.process(hdr_debevec, ldr);
  console.log("Tonemapping done !! woooo ");
  // Convert to 8-bit and save.
  /*
  # Convert datatype to 8-bit and save
  res_debevec_8bit = np.clip(res_debevec*255, 0, 255).astype('uint8')
  res_robertson_8bit = np.clip(res_robertson*255, 0, 255).astype('uint8')

  cv.imwrite("ldr_debevec.jpg", res_debevec_8bit)
  cv.imwrite("ldr_robertson.jpg", res_robertson_8bit)
  */

  // Cleanup.
  src1.delete();
  src2.delete();
  src3.delete();
  srcArray.delete();
  dest.delete();
  hdr_debevec.delete();
  merge_debevec.delete();
  ldr.delete();
  tonemap1.delete();
}

function checkCounter() {
  if (counter > 3) {
      takePhotoButton.text('3 pictures taken!');
      takePhotoButton.disabled = true;
      document.getElementById('createHDRButton').disabled = false;
      return false;
  }

  counter++;
  return true;
}

function takePhoto() {
  imageCapturer.takePhoto()
      // https://developers.google.com/web/updates/2016/03/createimagebitmap-in-chrome-50
      .then(blob => createImageBitmap(blob))
      .then((imageBitmap) => {
          if (checkCounter()) {
              drawCanvas(takePhotoCanvasArray[counter - 1], imageBitmap);
              exposureTimeArray[counter - 1] = (1 / exposureTimeSlider.value);
              console.log("exposure Time = ", exposureTimeSlider.value);
          }
      })
      .catch((err) => {
          console.error("takePhoto() failed: ", err);
      });
}

function initUI() {
  stats = new Stats();
  stats.showPanel(0);
}

function opencvIsReady() {
  console.log('OpenCV.js is ready');
  if (!featuresReady) {
      console.log('Requred features are not ready.');
      return;
  }
  initUI();
  startCamera();
}

/* Utils */

function drawCanvas(canvas, img) {
  canvas.width = getComputedStyle(canvas).width.split('px')[0];
  canvas.height = getComputedStyle(canvas).height.split('px')[0];
  let ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
      x, y, img.width * ratio, img.height * ratio);
}