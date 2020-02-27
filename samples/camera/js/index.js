let utils = new Utils('errorMessage');
let video = document.getElementById('videoInput');
let videoConstraint;
let imageCapturer = null;
let videoTrack = null;

function applyInitialSettings() {
  const videoSettings = videoTrack.getSettings();
  const capabilities = videoTrack.getCapabilities()

  function roundValue(value) {
    let result = value.toFixed(2);
    if (result == 0) result = value.toPrecision(1);
    return Number(result);
  }

  settingsInputIds.forEach(function (id, i) {
    // Check whether capability is supported or not.
    if (capabilities[id]) {
      controls[id].min = roundValue(capabilities[id].min);
      controls[id].max = roundValue(capabilities[id].max);
      controls[id].step = roundValue(capabilities[id].step);
      controls[id].value = controls[`${id}Output`].value =
        roundValue(videoSettings[id]);
    } else {
      console.log(id, 'not supported.');
      if (!(i in standardSettingsIds)) {
        let icon = document.querySelector(`i[for=${id}]`);
        icon.style.pointerEvents = 'none';
        icon.style.color = 'gray';
      } else document.querySelector(`label[for=${id}]`).style.opacity = 0.6;
      controls[id].disabled = true;
    }
  });

  // Check torch.
  if (!capabilities.torch) {
    let icon = document.querySelector(`i[for=torch]`);
    icon.style.pointerEvents = 'none';
    icon.style.color = 'gray';
  }
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  cameraBar.style.width = `${video.videoWidth}px`;

  let mainContent = document.getElementById('mainContent');
  mainContent.style.width = `${video.videoWidth}px`;
  mainContent.classList.remove('hidden');

  document.querySelector('.canvas-wrapper').style.height =
    `${video.videoHeight}px`;

  findSettingsBottomValue();
  let settingsContent = document.querySelector('.settings-content');
  settingsContent.style.width = `${video.videoWidth}px`;

  let resetButton = document.querySelector('.reset-button');
  resetButton.classList.remove('hidden');
  resetButton.style.left = `${video.videoWidth - resetButton.offsetWidth}px`;
  resetButton.style.bottom = `${video.videoHeight}px`;
  resetButton.classList.add('hidden');

  // Make settings smaller to fit on the screen.
  if (video.videoHeight < 350) {
    let labels = document.querySelectorAll('.pro-settings label');
    let inputs = document.querySelectorAll('.pro-settings input[type=range]');
    labels.forEach(function (label, i) {
      label.style.padding = '5px';
      inputs[i].style.width = '90px';
    });
  }

  document.getElementById('takePhotoButton').disabled = false;
}

function startCamera() {
  utils.startCamera(videoConstraint, 'videoInput', onCameraStarted);
}

function onCameraStarted() {
  videoTrack = video.srcObject.getVideoTracks()[0];
  try {
    imageCapturer = new ImageCapture(videoTrack);
  } catch(error) {
    document.getElementById("mainContent").classList.add("hidden");
    document.getElementById("errorMessage").innerText =
      "ImageCapture API is not supported in this browser version.";
    console.error(error);
    return;
  }
  completeStyling();
  // Timeout needed in Chrome, see https://crbug.com/711524.
  setTimeout(() => {
    applyInitialSettings();
  }, 500);
}

initUI();
initCameraSettingsAndStart();
