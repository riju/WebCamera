let stats = null;
let filterName = document.getElementById('filterName');
let controls;
let settingsOnScreen = true;

let filters = {
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

function setFilter(filter) {
  controls.lastFilter = controls.filter;
  controls.filter = filter;
  filterName.innerHTML = filters[filter];
  closeFilterOptions(controls.lastFilter);
  openFilterOptions(controls.filter);
}

function openFilterOptions(filter) {
  settingsOnScreen = true;
  switch (filter) {
    case 'threshold':
      controls.thresholdSettings.classList.remove('hidden'); break;
    case 'adaptiveThreshold':
      controls.adaptiveThresholdSettings.classList.remove('hidden'); break;
    case 'gaussianBlur':
      controls.gaussianSettings.classList.remove('hidden'); break;
    case 'bilateralFilter':
      controls.bilateralSettings.classList.remove('hidden'); break;
    case 'medianBlur':
      controls.medianSettings.classList.remove('hidden'); break;
    case 'sobel':
      controls.sobelSettings.classList.remove('hidden'); break;
    case 'laplacian':
      controls.laplacianSettings.classList.remove('hidden'); break;
    case 'morphology':
      controls.morphologySettings.classList.remove('hidden'); break;
    case 'canny':
      controls.cannySettings.classList.remove('hidden'); break;
    case 'backprojection':
      controls.backprojectionSettings.classList.remove('hidden'); break;
  }
}

function closeFilterOptions(filter) {
  settingsOnScreen = false;
  switch (filter) {
    case 'threshold':
      controls.thresholdSettings.classList.add('hidden'); break;
    case 'adaptiveThreshold':
      controls.adaptiveThresholdSettings.classList.add('hidden'); break;
    case 'gaussianBlur':
      controls.gaussianSettings.classList.add('hidden'); break;
    case 'bilateralFilter':
      controls.bilateralSettings.classList.add('hidden'); break;
    case 'medianBlur':
      controls.medianSettings.classList.add('hidden'); break;
    case 'sobel':
      controls.sobelSettings.classList.add('hidden'); break;
    case 'laplacian':
      controls.laplacianSettings.classList.add('hidden'); break;
    case 'morphology':
      controls.morphologySettings.classList.add('hidden'); break;
    case 'canny':
      controls.cannySettings.classList.add('hidden'); break;
    case 'backprojection':
      controls.backprojectionSettings.classList.add('hidden'); break;
  }
}

function showOrHideSettings() {
  if (settingsOnScreen) {
    closeFilterOptions(controls.filter);
  } else {
    openFilterOptions(controls.filter);
  }
}

function initUI() {
  initStats();

  morphologyOpValues = {
    'MORPH_ERODE': cv.MORPH_ERODE,
    'MORPH_DILATE': cv.MORPH_DILATE,
    'MORPH_OPEN': cv.MORPH_OPEN,
    'MORPH_CLOSE': cv.MORPH_CLOSE,
    'MORPH_GRADIENT': cv.MORPH_GRADIENT,
    'MORPH_TOPHAT': cv.MORPH_TOPHAT,
    'MORPH_BLACKHAT': cv.MORPH_BLACKHAT,
  };
  morphologyShapeValues = {
    'MORPH_RECT': cv.MORPH_RECT,
    'MORPH_CROSS': cv.MORPH_CROSS,
    'MORPH_ELLIPSE': cv.MORPH_ELLIPSE,
  };
  morphologyBorderValues = {
    'BORDER_CONSTANT': cv.BORDER_CONSTANT,
    'BORDER_REPLICATE': cv.BORDER_REPLICATE,
    'BORDER_REFLECT': cv.BORDER_REFLECT,
    'BORDER_REFLECT_101': cv.BORDER_REFLECT_101,
  }
  controls = {
    filter: 'passThrough',
    lastFilter: 'passThrough',
    thresholdSettings:
      document.getElementById('threshold-settings'),
    thresholdValue:
      document.getElementById("threshold-value"),
    thresholdValueOutput:
      document.getElementById("threshold-value-output"),
    adaptiveThresholdSettings:
      document.getElementById('adaptive-threshold-settings'),
    adaptiveBlockSize:
      document.getElementById("adaptive-block-size"),
    adaptiveBlockSizeOutput:
      document.getElementById("adaptive-block-size-output"),
    gaussianSettings:
      document.getElementById('gaussian-settings'),
    gaussianBlurSize:
      document.getElementById("gaussian-kernel-size"),
    gaussianBlurSizeOutput:
      document.getElementById("gaussian-kernel-size-output"),
    medianSettings:
      document.getElementById('median-settings'),
    medianBlurSize:
      document.getElementById("median-kernel-size"),
    medianBlurSizeOutput:
      document.getElementById("median-kernel-size-output"),
    bilateralSettings:
      document.getElementById('bilateral-settings'),
    bilateralFilterDiameter:
      document.getElementById("bilateral-diameter"),
    bilateralFilterDiameterOutput:
      document.getElementById("bilateral-diameter-output"),
    bilateralFilterSigma:
      document.getElementById("bilateral-sigma"),
    bilateralFilterSigmaOutput:
      document.getElementById("bilateral-sigma-output"),
    sobelSettings:
      document.getElementById('sobel-settings'),
    sobelSize:
      document.getElementById("sobel-kernel-size"),
    sobelSizeOutput:
      document.getElementById("sobel-kernel-size-output"),
    laplacianSettings:
      document.getElementById('laplacian-settings'),
    laplacianSize:
      document.getElementById("laplacian-kernel-size"),
    laplacianSizeOutput:
      document.getElementById("laplacian-kernel-size-output"),
    cannySettings:
      document.getElementById('canny-settings'),
    cannyThreshold1:
      document.getElementById("canny-threshold1"),
    cannyThreshold1Output:
      document.getElementById("canny-threshold1-output"),
    cannyThreshold2:
      document.getElementById("canny-threshold2"),
    cannyThreshold2Output:
      document.getElementById("canny-threshold2-output"),
    cannyApertureSize:
      document.getElementById("canny-aperture"),
    cannyApertureSizeOutput:
      document.getElementById("canny-aperture-output"),
    cannyL2Gradient:
      document.getElementById("canny-gradient"),
    backprojectionSettings:
      document.getElementById('backprojection-settings'),
    backprojectionRangeLow:
      document.getElementById("backprojection-low"),
    backprojectionRangeLowOutput:
      document.getElementById("backprojection-low-output"),
    backprojectionRangeHigh:
      document.getElementById("backprojection-high"),
    backprojectionRangeHighOutput:
      document.getElementById("backprojection-high-output"),
    morphologySettings:
      document.getElementById('morphology-settings'),
    morphologyOp:
      document.getElementById("morphology-operation"),
    morphologyShape:
      document.getElementById("morphology-shape"),
    morphologySize:
      document.getElementById("morphology-size"),
    morphologySizeOutput:
      document.getElementById("morphology-size-output"),
    morphologyBorderType:
      document.getElementById("morphology-border"),
  };

  // add onclick event listeners for menu canvases
  for (let filter in filters) {
    document.getElementById(filter).addEventListener("click", function () {
      setFilter(filter);
    });
  }

  document.getElementById("canvasOutput").addEventListener("click", function () {
    showOrHideSettings();
  });
}

function resizeFilterSettings() {
  let settings = document.querySelectorAll(".settings");
  let settingsPadding = parseInt(getComputedStyle(settings[0]).padding);
  for (let i = 0; i < settings.length; i++) {
    settings[i].style.width = `${width - 2 * settingsPadding}px`;
  }
}
