let controls = {};
const settingsInputIds = [
  'iso', 'exposureTime',
  'focusDistance', 'colorTemperature', 'zoom'
];
const standardSettingsIds = [
  'contrast', 'saturation', 'sharpness', 'brightness', 'exposureCompensation'
];
const icons = [
  'iso', 'exposureTime',
  'focusDistance', 'colorTemperature', 'zoom',
  'standard'
];

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);

  controls = {
    lastProIcon: 'standard',
    settingsVisible: false,
  };

  settingsInputIds.unshift(...standardSettingsIds);
  let settingsInputElements =
    settingsInputIds.map(id => document.getElementById(id));

  settingsInputIds.forEach(function (id, i) {
    // Fill controls with settings elements.
    controls[id] = settingsInputElements[i];
    controls[`${id}Output`] = document.getElementById(`${id}Output`);

    // Add event to apply video constraint on input.
    controls[id].oninput = function () {
      controls[`${id}Output`].value = controls[id].value;
      let constraint = { advanced: [{}] };
      constraint.advanced[0][id] = controls[id].value;
      if (id == 'exposureTime')
        constraint.advanced[0]['exposureMode'] = 'manual';
      else if (id == 'focusDistance')
        constraint.advanced[0]['focusMode'] = 'manual';
      else if (id == 'colorTemperature') {
        constraint.advanced[0]['whiteBalanceMode'] = 'manual';
        displayColorTemperatureIcon();
      }
      videoTrack.applyConstraints(constraint).catch(e => console.log(e));
    };
  });

  // Torch settings.
  controls.torch = false;
  let torchIcon = document.querySelector(`i[for=torch]`);
  torchIcon.addEventListener('click', function () {
    if (controls.torch) torchIcon.innerText = 'flash_off';
    else torchIcon.innerText = 'flash_on';
    controls.torch = !controls.torch;
    videoTrack.applyConstraints({
      advanced: [{ torch: controls.torch }]
    }).catch(e => console.log(e));
  });

  let iconsElements = icons.map(id => document.querySelector(`i[for=${id}]`));
  icons.forEach(function (id, i) {
    // Show or hide settings by clicking on icon.
    iconsElements[i].addEventListener('click', function () {
      if (id == controls.lastProIcon) {
        if (controls.settingsVisible) hideProSettings(id);
        else showProSettings(id);
      } else {
        hideProSettings(controls.lastProIcon);
        showProSettings(id);
        controls.lastProIcon = id;
      }
      findSettingsBottomValue();
    });
  });

  // Show or hide settings by clicking on video.
  video.addEventListener('click', function () {
    if (controls.settingsVisible) hideProSettings(controls.lastProIcon);
    else showProSettings(controls.lastProIcon);
    findSettingsBottomValue();
  });

  // Event for reset button.
  let resetButton = document.querySelector('.reset-button');
  resetButton.addEventListener('click', function () {
    let constraint = { advanced: [{}] };
    if (controls.lastProIcon == 'standard') {
      standardSettingsIds.forEach(function (id, i) {
        controls[id].value =
          (controls[id].max - controls[id].min) / 2 + Number(controls[id].min);
        if (!controls[id].disabled)
          constraint.advanced[0][id] = controls[id].value;
      });
    } else if (controls.lastProIcon == 'exposureTime')
      constraint.advanced[0]['exposureMode'] = 'continuous';
    else if (controls.lastProIcon == 'focusDistance')
      constraint.advanced[0]['focusMode'] = 'continuous';
    else if (controls.lastProIcon == 'colorTemperature') {
      constraint.advanced[0]['whiteBalanceMode'] = 'continuous';
      document.getElementById('wbIcon').innerText = 'wb_auto';
    }

    videoTrack.applyConstraints(constraint).catch(e => console.log(e));
  });

  // TakePhoto event by clicking takePhotoButton.
  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', function () {
    if (imageCapturer === null) {
      document.getElementById("mainContent").classList.add("hidden");
      document.getElementById("errorMessage").innerText =
        "ImageCapture is not inilialized.";
      console.error("ImageCapture is not inilialized.");
      return;
    }
    takePhoto();
  });

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
  try {
    imageCapturer = new ImageCapture(videoTrack);
  } catch(error) {
    document.getElementById("mainContent").classList.add("hidden");
    document.getElementById("errorMessage").innerText =
      "ImageCapture API is not supported in this browser version.";
    console.error(error);
    return;
  }
  // Timeout needed in Chrome, see https://crbug.com/711524.
  setTimeout(() => {
    applyInitialSettings();
  }, 500);
}

// See WB ranges: https://w3c.github.io/mediacapture-image/#white-balance-mode.
function displayColorTemperatureIcon() {
  let id = 'colorTemperature';
  let iconName = '';
  switch (true) {
    case (controls[id].value >= 9000):
      break;
    case (controls[id].value >= 8000): // Twilight mode.
      iconName = 'brightness_3'; break;
    case (controls[id].value >= 6500): // Cloudy-daylight mode.
      iconName = 'wb_cloudy'; break;
    case (controls[id].value >= 5500): // Daylight mode.
      iconName = 'wb_sunny'; break;
    case (controls[id].value >= 5000):
      break;
    case (controls[id].value >= 4000): // Fluorescent mode.
      iconName = 'wb_iridescent'; break;
    case (controls[id].value >= 3500):
      break;
    case (controls[id].value >= 2500): // Incandescent mode.
      iconName = 'wb_incandescent'; break;
  }
  document.getElementById('wbIcon').innerText = iconName;
}

function findSettingsBottomValue() {
  let settingsWrapper = document.querySelector('.settings-wrapper');
  let resetButtonHeight = document.querySelector('.reset-button').offsetHeight;
  settingsWrapper.style.bottom =
    `${settingsWrapper.offsetHeight + resetButtonHeight}px`;
}

function showProSettings(id) {
  controls.settingsVisible = true;
  document.getElementById(`${id}Settings`).classList.remove('hidden');
  if (id == 'standard' || id == 'colorTemperature'
    || id == 'exposureTime' || id == 'focusDistance') {
    document.querySelector('.reset-button').classList.remove('hidden');
  }
}

function hideProSettings(id) {
  controls.settingsVisible = false;
  document.getElementById(`${id}Settings`).classList.add('hidden');
  if (id == 'standard' || id == 'colorTemperature'
    || id == 'exposureTime' || id == 'focusDistance') {
    document.querySelector('.reset-button').classList.add('hidden');
  }
}

