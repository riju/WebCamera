let controls = {};
const settingsInputIds = [
  'iso', 'exposureTime',
  'focusDistance', 'colorTemperature', 'zoom'
];
const standardSettingsIds = [
  'contrast', 'saturation', 'sharpness', 'brightness', 'exposureCompensation'
];

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);

  // Event for reset button.
  let resetButton = document.querySelector('.reset-button');
  resetButton.addEventListener('click', function () {
    settings.reset();
    resetButton.classList.add('hidden');
  });

  const settings = document.querySelector('settings-pane');
  settings.addEventListener('constraintschange', e => {
    videoTrack.applyConstraints(e.detail.constraints).catch(e => console.log(e));
    resetButton.classList.remove('hidden');
  });
  settings.addEventListener('click', () => {
    resetButton.classList.add('hidden');
    settings.hide();
  })

  // TakePhoto event by clicking takePhotoButton.
  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', () => takePhoto());

  // TODO(sasha): move to utils.js.
  let facingModeButton = document.getElementById('facingModeButton');
  // Switch to face or environment mode by clicking facingModeButton.
  facingModeButton.addEventListener('click', function () {
    if (controls.facingMode == 'user') {
      controls.facingMode = 'environment';
      videoConstraint.deviceId = { exact: controls.backCamera.deviceId };
      facingModeButton.innerText = 'camera_front';
    } else if (controls.facingMode == 'environment') {
      controls.facingMode = 'user';
      videoConstraint.deviceId = { exact: controls.frontCamera.deviceId };
      facingModeButton.innerText = 'camera_rear';
    }
    utils.clearError();
    utils.stopCamera();
    utils.startCamera(videoConstraint, 'videoInput', startCameraProcessing);
  });
}

function startCameraProcessing() {
  videoTrack = video.srcObject.getVideoTracks()[0];
  imageCapturer = new ImageCapture(videoTrack);
  // Timeout needed in Chrome, see https://crbug.com/711524.
  setTimeout(() => {
    applyInitialSettings();
  }, 500);
}