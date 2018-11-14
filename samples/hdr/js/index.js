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

// Assume there is a list of 5 images at various exposure time.
// TODO: check data is within range.
var arrayExposureTime = [0.1, 1, 2, 3];

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
          exposureTime: exposureTimeSlider.value
        }]
      });
    }

  }, 500);

  //TODO(riju):
  // Create HDR
  /*
  merge_debevec = cv.createMergeDebevec()
  hdr_debevec = merge_debevec.process(img_list, times=exposure_times.copy())
  merge_robertson = cv.createMergeRobertson()
  hdr_robertson = merge_robertson.process(img_list, times=exposure_times.copy())
  */
  // Tonemap HDR image
  /*
  # Tonemap HDR image
  tonemap1 = cv.createTonemapDurand(gamma=2.2)
  res_debevec = tonemap1.process(hdr_debevec.copy())
  tonemap2 = cv.createTonemapDurand(gamma=1.3)
  res_robertson = tonemap2.process(hdr_robertson.copy())
  */
  // Convert to 8-bit and save
  /*
  # Convert datatype to 8-bit and save
  res_debevec_8bit = np.clip(res_debevec*255, 0, 255).astype('uint8')
  res_robertson_8bit = np.clip(res_robertson*255, 0, 255).astype('uint8')
  res_mertens_8bit = np.clip(res_mertens*255, 0, 255).astype('uint8')
  cv.imwrite("ldr_debevec.jpg", res_debevec_8bit)
  cv.imwrite("ldr_robertson.jpg", res_robertson_8bit)
  */

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