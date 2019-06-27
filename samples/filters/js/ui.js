let stats = null;
let controls;
let settingsVisible = true;
let menuVisible = true;

let videoConstraint;
let smallVideoConstraint;

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
  initStats();
  getVideoConstraint();

  controls = {
    filter: 'passThrough',
    lastFilter: 'passThrough',
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
}

function getVideoConstraint() {
  if (isMobileDevice()) {
    // TODO(sasha): figure out why getUserMedia(...) in utils.js
    // swap width and height for mobile devices.
    videoConstraint = {
      facingMode: { exact: "user" },
      //width: { ideal: window.screen.width },
      //height: { ideal: window.screen.height }
      width: { ideal: window.screen.height },
      height: { ideal: window.screen.width }
    };
    smallVideoConstraint = {
      facingMode: { exact: "user" },
      width: { ideal: parseInt(window.screen.width / 5) },
      height: { ideal: parseInt(window.screen.width / 5) }
    };
  } else {
    if (window.innerWidth < 960) {
      videoConstraint = resolutions['qvga'];
    } else {
      videoConstraint = resolutions['vga'];
    }
    // Create 5 times lower square resolution
    smallVideoConstraint = {
      width: { ideal: parseInt(videoConstraint.height.exact / 5) },
      height: { ideal: parseInt(videoConstraint.height.exact / 5) }
    };
  }
}

function setFilter(filter) {
  controls.lastFilter = controls.filter;
  controls.filter = filter;
  // Remove old canvas border and draw new.
  let lastFilterElem = document.getElementById(`${controls.lastFilter}Canvas`);
  let currentFilterElem = document.getElementById(`${controls.filter}Canvas`);
  lastFilterElem.style.borderStyle = 'none';
  currentFilterElem.style.borderStyle = 'solid';

  closeFilterOptions(controls.lastFilter);
  openFilterOptions(controls.filter);
}

function openFilterOptions(filter) {
  settingsVisible = true;
  let settings = document.getElementById(`${filter}Settings`);
  if (typeof (settings) != 'undefined' && settings != null) {
    settings.classList.remove('hidden');
    // Set appropriate height for settings wrapper.
    let settingsWrapper = document.querySelector('.settings-wrapper');
    settingsWrapper.style.bottom = `${settings.offsetHeight + carousels[0].offsetHeight}px`;
  }
}

function closeFilterOptions(filter) {
  settingsVisible = false;
  let settings = document.getElementById(`${filter}Settings`);
  if (typeof (settings) != 'undefined' && settings != null) {
    settings.classList.add('hidden');
  }
}

function showMenu() {
  menuVisible = true;
  carouselWrappers[0].classList.remove('hidden');
  window.onresize();
}

function hideMenu() {
  menuVisible = false;
  carouselWrappers[0].classList.add('hidden');
}

function showOrHideCanvasElements() {
  if (menuVisible) {
    closeFilterOptions(controls.filter);
    hideMenu();
  } else {
    openFilterOptions(controls.filter);
    showMenu();
  }
}

function resizeFilterSettings() {
  let allSettings = document.querySelectorAll('.settings');
  let settingsPadding = parseInt(getComputedStyle(allSettings[0]).padding);
  allSettings.forEach(function (settings) {
    settings.classList.remove('hidden');
    settings.style.width = `${video.width - 2 * settingsPadding}px`;
    settings.classList.add('hidden');
  });
}

function resizeMenuLabels() {
  let fontSize;
  if (video.width >= 500) fontSize = `16px`;
  else if (video.width >= 400) fontSize = `14px`;
  else if (video.width >= 300) fontSize = `12px`;
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
