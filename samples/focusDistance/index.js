const constraints = {
  "video": {
    width: {
      exact: 320
    }
  }
};
var videoTag = document.getElementById('video-tag');
var imageTag = document.getElementById('image-tag');
var focusDistanceSlider = document.getElementById("focusDistance-slider");
var focusDistanceSliderValue = document.getElementById("focusDistance-slider-value");
var imageCapturer;

function start() {
  navigator.mediaDevices.getUserMedia(constraints)
    .then(gotMedia)
    .catch(e => {
      console.error('getUserMedia() failed: ', e);
    });
}

function gotMedia(mediastream) {
  videoTag.src = URL.createObjectURL(mediastream);
  document.getElementById('start').disabled = true;

  var videoTrack = mediastream.getVideoTracks()[0];
  imageCapturer = new ImageCapture(videoTrack);

  // Timeout needed in Chrome, see https://crbug.com/711524
  setTimeout(() => {
    const capabilities = videoTrack.getCapabilities()
    // Check whether focusDistance is supported or not.
    if (!capabilities.focusDistance) {
      return;
    }

    focusDistanceSlider.min = capabilities.focusDistance.min;
    focusDistanceSlider.max = capabilities.focusDistance.max;
    focusDistanceSlider.step = capabilities.focusDistance.step;

    focusDistanceSlider.value = focusDistanceSliderValue.value = videoTrack.getSettings().focusDistance;
    focusDistanceSliderValue.value = focusDistanceSlider.value;

    focusDistanceSlider.oninput = function () {
      focusDistanceSliderValue.value = focusDistanceSlider.value;
      videoTrack.applyConstraints({
        advanced: [{
          focusMode: "manual",
          focusDistance: focusDistanceSlider.value
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