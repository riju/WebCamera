const constraints_general = {
  "video": {
    width: {
      exact: 480
    },
    height: {
      ideal: 360
    }
  }
};

// Mobile rear camera is usually the better camera.
const constraints_mobile = {
  video: {
      facingMode: { exact: "environment" },
      width : { exact:240
      },
      height: {
        ideal: 180
      }
  }
};

let videoTag = document.getElementById('video-tag');
let imageTag = document.getElementById('image-tag');
let exposureTimeSlider = document.getElementById("exposureTime-slider");
let exposureTimeSliderValue = document.getElementById("exposureTime-slider-value");
let focusDistanceSlider = document.getElementById("focusDistance-slider");
let focusDistanceSliderValue = document.getElementById("focusDistance-slider-value");
let contrastSlider = document.getElementById("contrast-slider");
let contrastSliderValue = document.getElementById("contrast-slider-value");
let imageCapturer;

function startCamera() {
  document.querySelector('#start').style.display = 'none';
  //Right now only chrome on Android and Chrome on Linux/CrOS will work.

  if (navigator.userAgent.match(/Android/i)) {
    navigator.mediaDevices.getUserMedia(constraints_mobile)
      .then(gotMedia)
      .catch(e => {
          console.error('getUserMedia() failed: ', e);
      });
  } else {
      navigator.mediaDevices.getUserMedia(constraints_general)
      .then(gotMedia)
      .catch(e => {
          console.error('getUserMedia() failed: ', e);
      });
    }
}

function gotMedia(mediastream) {
  videoTag.srcObject = mediastream;
  document.getElementById('start').disabled = true;
  document.querySelector('#start').style.display = 'none';

  let videoTrack = mediastream.getVideoTracks()[0];
  imageCapturer = new ImageCapture(videoTrack);

  // Timeout needed in Chrome, see https://crbug.com/711524
  setTimeout(() => {
    const capabilities = videoTrack.getCapabilities()
    // Check whether exposureTime is supported or not.
    if (!capabilities.exposureTime) {
      console.error('exposureTime not supported.');
      return;
    }
    // Check whether focusDistance is supported or not.
    if (!capabilities.focusDistance) {
      console.error('focusDistance not supported.');
      return;
    }
    // Check whether contrast is supported or not.
    if (!capabilities.contrast) {
      console.error('contrast not supported.');
      return;
    }
    
    exposureTimeSlider.min = capabilities.exposureTime.min;
    exposureTimeSlider.max = capabilities.exposureTime.max;
    exposureTimeSlider.step = capabilities.exposureTime.step;

    focusDistanceSlider.min = capabilities.focusDistance.min;
    focusDistanceSlider.max = capabilities.focusDistance.max;
    focusDistanceSlider.step = capabilities.focusDistance.step;

    contrastSlider.min = capabilities.contrast.min;
    contrastSlider.max = capabilities.contrast.max;
    contrastSlider.step = capabilities.contrast.step;

    exposureTimeSlider.value = exposureTimeSliderValue.value = videoTrack.getSettings().exposureTime;
    exposureTimeSliderValue.value = exposureTimeSlider.value;

    focusDistanceSlider.value = focusDistanceSliderValue.value = videoTrack.getSettings().focusDistance;
    focusDistanceSliderValue.value = focusDistanceSlider.value;

    contrastSlider.value = contrastSliderValue.value = videoTrack.getSettings().contrast;
    contrastSliderValue.value = contrastSlider.value;


    exposureTimeSlider.oninput = function () {
      exposureTimeSliderValue.value = exposureTimeSlider.value;
      videoTrack.applyConstraints({
        advanced: [{
          exposureMode: "manual",
          exposureTime: exposureTimeSlider.value
        }]
      });
    }

    focusDistanceSlider.oninput = function () {
      focusDistanceSliderValue.value = focusDistanceSlider.value;
      videoTrack.applyConstraints({
        advanced: [{
          focusMode: "manual",
          focusDistance: focusDistanceSlider.value
        }]
      });
    }

    contrastSlider.oninput = function () {
      contrastSliderValue.value = contrastSlider.value;
      videoTrack.applyConstraints({
        advanced: [{
          contrast: contrastSlider.value
        }]
      });
    }

  }, 500);
}

function takePhoto() {
  imageCapturer.takePhoto()
    .then((blob) => {
      console.log("Photo taken: " + blob.type + ", " + blob.size + "B")
      imageTag.src = URL.createObjectURL(blob);
    })
    .catch((err) => {
      console.error("takePhoto() failed: ", e);
    });
}