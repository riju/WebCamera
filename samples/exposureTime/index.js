const constraints = {
  "video": {
    width: {
      exact: 320
    }
  }
};
var videoTag = document.getElementById('video-tag');
var imageTag = document.getElementById('image-tag');
var exposureTimeSlider = document.getElementById("exposureTime-slider");
var exposureTimeSliderValue = document.getElementById("exposureTime-slider-value");
var imageCapturer;

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

    exposureTimeSlider.value = exposureTimeSliderValue.value = videoTrack.getSettings().exposureTime;
    exposureTimeSliderValue.value = exposureTimeSlider.value;

    exposureTimeSlider.oninput = function () {
      exposureTimeSliderValue.value = exposureTimeSlider.value;
      videoTrack.applyConstraints({
        advanced: [{
          exposureMode: "manual",
          exposureTime: exposureTimeSlider.value
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