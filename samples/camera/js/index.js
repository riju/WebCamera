let utils = new Utils('errorMessage');
let video = document.getElementById('videoInput');
let videoConstraint;
let videoTrack = null;
let imageCapturer = null;
let controls = {};

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);

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

  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', () => takePhoto());

  let facingModeButton = document.getElementById('facingModeButton');
  facingModeButton.addEventListener('click', () => {
    switch(controls.facingMode) {
      case 'user':
        controls.facingMode = 'environment';
        videoConstraint.deviceId = { exact: controls.backCamera.deviceId };
        facingModeButton.innerText = 'camera_front';
        break;
      case 'environment':
        controls.facingMode = 'user';
        videoConstraint.deviceId = { exact: controls.frontCamera.deviceId };
        facingModeButton.innerText = 'camera_rear';
    }

    startCamera({ restart: true });
  });
}

function completeStyling() {
  let cameraBar = document.querySelector('.camera-bar-wrapper');
  cameraBar.style.width = `${video.videoWidth}px`;

  let mainContent = document.getElementById('mainContent');
  mainContent.style.width = `${video.videoWidth}px`;
  mainContent.classList.remove('hidden');

  document.querySelector('.canvas-wrapper').style.height =
    `${video.videoHeight}px`;

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

function startCamera(options = { restart: false }) {
  const restart = !!options.restart;
  if (restart) {
    utils.clearError();
    utils.stopCamera();
  }

  const onCameraStarted = () => {
    videoTrack = video.srcObject.getVideoTracks()[0];
    imageCapturer = new ImageCapture(videoTrack);

    if (!restart) {
      completeStyling();
    }

    // Timeout needed in Chrome, see https://crbug.com/711524.
    const settings = document.querySelector('settings-pane');
    setTimeout(async () => {
      await customElements.whenDefined('settings-pane');
      settings.applyFromTrack(videoTrack);
    }, 500);
  }

  utils.startCamera(videoConstraint, 'videoInput', onCameraStarted);
}

initUI();
initCameraSettingsAndStart();