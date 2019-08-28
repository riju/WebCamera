let controls;

let carousels = document.querySelectorAll('.carousel-wrapper');

const filters = {
  'passThrough': 'No Filter',
  'gray': 'Gray',
  'hsv': 'HSV',
  'canny': 'Canny Edge Detection',
  'threshold': 'Thresholding',
  'adaptiveThreshold': 'Adaptive Thresholding',
  'gaussianBlur': 'Gaussian Blurring',
  'medianBlur': 'Median Blurring',
  'bilateralFilter': 'Bilateral Filtering',
  'sobel': 'Sobel Derivatives',
  'scharr': 'Scharr Derivatives',
  'laplacian': 'Laplacian Derivatives',
  'calcHist': 'Calculation',
  'equalizeHist': 'Equalization',
  'backprojection': 'Backprojection',
  'morphology': 'Morphology',
};

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);
  initStats();

  controls = {
    filter: 'passThrough',
    lastFilter: 'passThrough',

    settingsVisible: true,
    menuVisible: true,

    frontCamera: null,
    backCamera: null,
    facingMode: '',

    morphologyOperationValues: {
      'MORPH_ERODE': cv.MORPH_ERODE,
      'MORPH_DILATE': cv.MORPH_DILATE,
      'MORPH_OPEN': cv.MORPH_OPEN,
      'MORPH_CLOSE': cv.MORPH_CLOSE,
      'MORPH_GRADIENT': cv.MORPH_GRADIENT,
      'MORPH_TOPHAT': cv.MORPH_TOPHAT,
      'MORPH_BLACKHAT': cv.MORPH_BLACKHAT,
    },
    morphologyShapeValues: {
      'MORPH_RECT': cv.MORPH_RECT,
      'MORPH_CROSS': cv.MORPH_CROSS,
      'MORPH_ELLIPSE': cv.MORPH_ELLIPSE,
    },
    morphologyBorderValues: {
      'BORDER_CONSTANT': cv.BORDER_CONSTANT,
      'BORDER_REPLICATE': cv.BORDER_REPLICATE,
      'BORDER_REFLECT': cv.BORDER_REFLECT,
      'BORDER_REFLECT_101': cv.BORDER_REFLECT_101,
    }
  };

  // Fill controls with settings elements.
  let settingsIds = [
    'thresholdValue', 'thresholdValueOutput',
    'adaptiveBlockSize', 'adaptiveBlockSizeOutput',
    'gaussianKernelSize', 'gaussianKernelSizeOutput',
    'medianKernelSize', 'medianKernelSizeOutput',
    'bilateralDiameter', 'bilateralDiameterOutput',
    'bilateralSigma', 'bilateralSigmaOutput',
    'sobelKernelSize', 'sobelKernelSizeOutput',
    'laplacianKernelSize', 'laplacianKernelSizeOutput',
    'cannyThreshold1', 'cannyThreshold1Output',
    'cannyThreshold2', 'cannyThreshold2Output',
    'cannyAperture', 'cannyApertureOutput', 'cannyGradient',
    'backprojectionLow', 'backprojectionLowOutput',
    'backprojectionHigh', 'backprojectionHighOutput',
    'morphologyOperation', 'morphologyShape',
    'morphologySize', 'morphologySizeOutput', 'morphologyBorder'
  ];
  let settingsElements = settingsIds.map(id => document.getElementById(id));
  settingsIds.forEach(function (id, i) {
    controls[id] = settingsElements[i];
  });

  // Add yellow border to current filter.
  let currentFilterElem = document.getElementById(`${controls.filter}Canvas`);
  currentFilterElem.style.borderStyle = 'solid';

  // Add onclick event listeners for menu labels.
  for (let filter in filters) {
    document.getElementById(filter).addEventListener('click', function () {
      setFilter(filter);
    });
  }
  // Hide or show canvas elements by clicking on canvas or on settins wrapper.
  canvasOutput.addEventListener('click', function () {
    showOrHideCanvasElements();
  });

  // TakePhoto event by clicking takePhotoButton.
  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', function () {
    // Here we are not using takePhoto() per se.
    // new ImageCapture(videoTrack) gives image without applied filter.
    let dstCanvas = document.getElementById('gallery');
    drawCanvas(dstCanvas, canvasOutput);
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
    utils.startCamera(videoConstraint, 'videoInput', startVideoProcessing);
  });
}

function setFilter(filter) {
  controls.lastFilter = controls.filter;
  controls.filter = filter;
  // Remove old canvas border and draw new.
  let lastFilterElem = document.getElementById(`${controls.lastFilter}Canvas`);
  let currentFilterElem = document.getElementById(`${controls.filter}Canvas`);
  lastFilterElem.style.borderStyle = 'none';
  currentFilterElem.style.borderStyle = 'solid';

  hideFilterSettings(controls.lastFilter);
  showFilterSettings(controls.filter);
}

function showFilterSettings(filter) {
  controls.settingsVisible = true;
  let settings = document.getElementById(`${filter}Settings`);
  if (typeof (settings) != 'undefined' && settings != null) {
    settings.classList.remove('hidden');
    // Set appropriate position for settings wrapper.
    let settingsWrapper = document.querySelector('.settings-wrapper');
    settingsWrapper.style.bottom =
      `${settingsWrapper.offsetHeight + carousels[0].offsetWidth}px`;
  }
}

function hideFilterSettings(filter) {
  controls.settingsVisible = false;
  let settings = document.getElementById(`${filter}Settings`);
  if (typeof (settings) != 'undefined' && settings != null) {
    settings.classList.add('hidden');
  }
}

function showMenu() {
  controls.menuVisible = true;
  carousels[0].classList.remove('hidden');
  window.onresize();
}

function hideMenu() {
  controls.menuVisible = false;
  carousels[0].classList.add('hidden');
}

function showOrHideCanvasElements() {
  if (controls.menuVisible) {
    hideFilterSettings(controls.filter);
    hideMenu();
  } else {
    showFilterSettings(controls.filter);
    showMenu();
  }
}

function initMenuLabels() {
  let fontSize;
  if (video.width >= 500) fontSize = `16px`;
  else if (video.width >= 400) fontSize = `14px`;
  else if (video.width >= 300) fontSize = `10px`;
  else fontSize = `10px`;
  carousels.forEach(function (carousel) {
    carousel.style.fontSize = fontSize;
  });
  let labels = document.querySelectorAll('.card label');
  let smallCanvases = document.querySelectorAll('.small-canvas');
  labels.forEach(function (label, i) {
    label.style.width = smallCanvases[i].style.width;
    label.style.height = smallCanvases[i].style.height;
  });

}

window.onresize = function () {
  let settingsWrapper = document.querySelector('.settings-wrapper');
  settingsWrapper.style.bottom =
    `${settingsWrapper.offsetHeight + carousels[0].offsetWidth}px`;

};

function initFiltersSettings() {
  document.querySelector('.settings-bar').style.width = `${video.width}px`;
}
