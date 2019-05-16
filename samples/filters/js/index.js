let utils = new Utils('errorMessage');

let width = 0;
let height = 0;

let smallWidth = 128;
let smallHeight = 96;

// whether streaming video from the camera.
let streaming = false;

let video = document.getElementById('videoInput');
let vc = null;

let lastFilter = 'passThrough';
let src = null;
let dstC1 = null;
let dstC3 = null;
let dstC4 = null;
let srcSmall = null;
let dstC1Small = null;
let dstC3Small = null;
let dstC4Small = null;

function startVideoProcessing() {
  src = new cv.Mat(height, width, cv.CV_8UC4);
  dstC1 = new cv.Mat(height, width, cv.CV_8UC1);
  dstC3 = new cv.Mat(height, width, cv.CV_8UC3);
  dstC4 = new cv.Mat(height, width, cv.CV_8UC4);
  srcSmall = new cv.Mat(smallHeight, smallWidth, cv.CV_8UC4);
  dstC1Small = new cv.Mat(smallHeight, smallWidth, cv.CV_8UC1);
  dstC3Small = new cv.Mat(smallHeight, smallWidth, cv.CV_8UC3);
  dstC4Small = new cv.Mat(smallHeight, smallWidth, cv.CV_8UC4);
  requestAnimationFrame(processVideo);
}

function passThrough(src) {
  return src;
}

function gray(src, dstC1) {
  cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
  return dstC1;
}

function hsv(src, dstC3) {
  cv.cvtColor(src, dstC3, cv.COLOR_RGBA2RGB);
  cv.cvtColor(dstC3, dstC3, cv.COLOR_RGB2HSV);
  return dstC3;
}

function canny(src, dstC1) {
  let cannyThreshold1 = parseInt(controls.cannyThreshold1.value);
  controls.cannyThreshold1Output.value = cannyThreshold1;
  let cannyThreshold2 = parseInt(controls.cannyThreshold2.value);
  controls.cannyThreshold2Output.value = cannyThreshold2;
  let cannyApertureSize = parseInt(controls.cannyApertureSize.value);
  if (cannyApertureSize % 2 === 0) {
    cannyApertureSize = cannyApertureSize + 1;
  }
  controls.cannyApertureSizeOutput.value = cannyApertureSize;

  cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
  cv.Canny(dstC1, dstC1, cannyThreshold1, cannyThreshold2,
    cannyApertureSize, controls.cannyL2Gradient.checked);
  return dstC1;
}

function threshold(src, dstC4) {
  let thresholdValue = parseFloat(controls.thresholdValue.value);
  controls.thresholdValueOutput.value = thresholdValue;

  cv.threshold(src, dstC4, thresholdValue, 200, cv.THRESH_BINARY);
  return dstC4;
}

function adaptiveThreshold(src, dstC1, height, width) {
  let blockSizeValue = parseInt(controls.adaptiveBlockSize.value);
  if (blockSizeValue % 2 === 0) {
    blockSizeValue = blockSizeValue + 1;
  }
  controls.adaptiveBlockSizeOutput.value = blockSizeValue;

  let mat = new cv.Mat(height, width, cv.CV_8U);
  cv.cvtColor(src, mat, cv.COLOR_RGBA2GRAY);
  cv.adaptiveThreshold(mat, dstC1, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY, Number(blockSizeValue), 2);
  mat.delete();
  return dstC1;
}

function gaussianBlur(src, dstC4) {
  let gaussianBlurSize = parseInt(controls.gaussianBlurSize.value);
  if (gaussianBlurSize % 2 === 0) {
    gaussianBlurSize = gaussianBlurSize + 1;
  }
  controls.gaussianBlurSizeOutput.value = gaussianBlurSize;

  cv.GaussianBlur(src, dstC4,
    { width: gaussianBlurSize, height: gaussianBlurSize },
    0, 0, cv.BORDER_DEFAULT);
  return dstC4;
}

function bilateralFilter(src, dstC3, height, width) {
  let bilateralFilterDiameter = parseInt(controls.bilateralFilterDiameter.value);
  controls.bilateralFilterDiameterOutput.value = bilateralFilterDiameter;
  let bilateralFilterSigma = parseInt(controls.bilateralFilterSigma.value);
  controls.bilateralFilterSigmaOutput.value = bilateralFilterSigma;

  let mat = new cv.Mat(height, width, cv.CV_8UC3);
  cv.cvtColor(src, mat, cv.COLOR_RGBA2RGB);
  cv.bilateralFilter(mat, dstC3, bilateralFilterDiameter, bilateralFilterSigma,
    bilateralFilterSigma, cv.BORDER_DEFAULT);
  mat.delete();
  return dstC3;
}

function medianBlur(src, dstC4) {
  let medianBlurSize = parseInt(controls.medianBlurSize.value);
  if (medianBlurSize % 2 === 0) {
    medianBlurSize = medianBlurSize + 1;
  }
  controls.medianBlurSizeOutput.value = medianBlurSize;

  cv.medianBlur(src, dstC4, medianBlurSize);
  return dstC4;
}

function sobel(src, dstC1, height, width) {
  let sobelSize = parseInt(controls.sobelSize.value);
  if (sobelSize % 2 === 0) {
    sobelSize = sobelSize + 1;
  }
  controls.sobelSizeOutput.value = sobelSize;

  let mat = new cv.Mat(height, width, cv.CV_8UC1);
  cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY, 0);
  cv.Sobel(mat, dstC1, cv.CV_8U, 1, 0, sobelSize, 1, 0, cv.BORDER_DEFAULT);
  mat.delete();
  return dstC1;
}

function scharr(src, dstC1, height, width) {
  let mat = new cv.Mat(height, width, cv.CV_8UC1);
  cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY, 0);
  cv.Scharr(mat, dstC1, cv.CV_8U, 1, 0, 1, 0, cv.BORDER_DEFAULT);
  mat.delete();
  return dstC1;
}

function laplacian(src, dstC1, height, width) {
  let laplacianSize = parseInt(controls.laplacianSize.value);
  if (laplacianSize % 2 === 0) {
    laplacianSize = laplacianSize + 1;
  }
  controls.laplacianSizeOutput.value = laplacianSize;

  let mat = new cv.Mat(height, width, cv.CV_8UC1);
  cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY);
  cv.Laplacian(mat, dstC1, cv.CV_8U, laplacianSize, 1, 0, cv.BORDER_DEFAULT);
  mat.delete();
  return dstC1;
}

function calcHist(src, dstC1, dstC4) {
  cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
  let srcVec = new cv.MatVector();
  srcVec.push_back(dstC1);
  let scale = 2;
  let channels = [0];
  let histSize = [src.cols / scale];
  const ranges = [0, 255];
  let hist = new cv.Mat();
  let mask = new cv.Mat();
  let color = new cv.Scalar(0xfb, 0xca, 0x04, 0xff);
  cv.calcHist(srcVec, channels, mask, hist, histSize, ranges);
  let result = cv.minMaxLoc(hist, mask);
  let max = result.maxVal;
  cv.cvtColor(dstC1, dstC4, cv.COLOR_GRAY2RGBA);
  // draw histogram on src
  for (let i = 0; i < histSize[0]; i++) {
    let binVal = hist.data32F[i] * src.rows / max;
    cv.rectangle(dstC4, { x: i * scale, y: src.rows - 1 },
      { x: (i + 1) * scale - 1, y: src.rows - binVal / 3 }, color, cv.FILLED);
  }
  srcVec.delete();
  mask.delete();
  hist.delete();
  return dstC4;
}

function equalizeHist(src, dstC1) {
  cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY, 0);
  cv.equalizeHist(dstC1, dstC1);
  return dstC1;
}

let base;

function backprojection(src, dstC1, dstC3) {
  let backprojectionRangeLow = parseInt(controls.backprojectionRangeLow.value);
  controls.backprojectionRangeLowOutput.value = backprojectionRangeLow;
  let backprojectionRangeHigh = parseInt(controls.backprojectionRangeHigh.value);
  controls.backprojectionRangeHighOutput.value = backprojectionRangeHigh;

  if (lastFilter !== 'backprojection') {
    if (base instanceof cv.Mat) {
      base.delete();
    }
    base = src.clone();
    cv.cvtColor(base, base, cv.COLOR_RGB2HSV, 0);
  }
  cv.cvtColor(src, dstC3, cv.COLOR_RGB2HSV, 0);
  let baseVec = new cv.MatVector();
  let targetVec = new cv.MatVector();
  baseVec.push_back(base); targetVec.push_back(dstC3);
  let mask = new cv.Mat();
  let hist = new cv.Mat();
  let channels = [0];
  let histSize = [50];
  let ranges;
  if (backprojectionRangeLow < backprojectionRangeHigh) {
    ranges = [backprojectionRangeLow, backprojectionRangeHigh];
  } else {
    return src;
  }
  cv.calcHist(baseVec, channels, mask, hist, histSize, ranges);
  cv.normalize(hist, hist, 0, 255, cv.NORM_MINMAX);
  cv.calcBackProject(targetVec, channels, hist, dstC1, ranges, 1);
  baseVec.delete();
  targetVec.delete();
  mask.delete();
  hist.delete();
  return dstC1;
}

function morphology(src, dstC3, dstC4) {
  let opIndex = controls.morphologyOp.options[controls.morphologyOp.selectedIndex].value;
  let op = Number(morphologyOpValues[opIndex]);
  let borderTypeIndex = controls.morphologyBorderType.options[controls.morphologyBorderType.selectedIndex].value;
  let borderType = morphologyBorderValues[borderTypeIndex];
  let kernelIndex = controls.morphologyShape.options[controls.morphologyShape.selectedIndex].value;
  let kernelSize = parseInt(controls.morphologySize.value);
  if (kernelSize % 2 === 0) {
    kernelSize = kernelSize + 1;
  }
  controls.morphologySizeOutput.value = kernelSize;
  let kernel = cv.getStructuringElement(Number(morphologyShapeValues[kernelIndex]),
    { width: kernelSize, height: kernelSize });

  let color = new cv.Scalar();
  let image = src;
  if (op === cv.MORPH_GRADIENT || op === cv.MORPH_TOPHAT || op === cv.MORPH_BLACKHAT) {
    cv.cvtColor(src, dstC3, cv.COLOR_RGBA2RGB);
    image = dstC3;
  }
  cv.morphologyEx(image, dstC4, op, kernel, { x: -1, y: -1 }, 1,
    Number(borderType), color);
  kernel.delete();
  return dstC4;
}

function processVideo() {
  if (!streaming) return;
  vc.read(src);
  let result;
  switch (controls.filter) {
    case 'passThrough': result = passThrough(src); break;
    case 'gray': result = gray(src, dstC1); break;
    case 'hsv': result = hsv(src, dstC3); break;
    case 'canny': result = canny(src, dstC1); break;
    case 'threshold': result = threshold(src, dstC4); break;
    case 'adaptiveThreshold': result = adaptiveThreshold(src, dstC1, height, width); break;
    case 'gaussianBlur': result = gaussianBlur(src, dstC4); break;
    case 'bilateralFilter': result = bilateralFilter(src, dstC3, height, width); break;
    case 'medianBlur': result = medianBlur(src, dstC4); break;
    case 'sobel': result = sobel(src, dstC1, height, width); break;
    case 'scharr': result = scharr(src, dstC1, height, width); break;
    case 'laplacian': result = laplacian(src, dstC1, height, width); break;
    case 'calcHist': result = calcHist(src, dstC1, dstC4); break;
    case 'equalizeHist': result = equalizeHist(src, dstC1); break;
    case 'backprojection': result = backprojection(src, dstC1, dstC3); break;
    case 'morphology': result = morphology(src, dstC3, dstC4); break;
    default: result = passThrough(src);
  }
  cv.imshow('canvasOutput', result);
  lastFilter = controls.filter;

  srcSmall.delete();
  srcSmall = src.clone();
  let smallSize = new cv.Size(smallWidth, smallHeight);
  cv.resize(srcSmall, srcSmall, smallSize, 0, 0, cv.INTER_CUBIC);
  cv.imshow('passThrough', passThrough(srcSmall));
  cv.imshow('gray', gray(srcSmall, dstC1Small));
  cv.imshow('hsv', hsv(srcSmall, dstC3Small));
  cv.imshow('canny', canny(srcSmall, dstC1Small));
  cv.imshow('threshold', threshold(srcSmall, dstC4Small));
  cv.imshow('adaptiveThreshold', adaptiveThreshold(srcSmall, dstC1Small, smallHeight, smallWidth));
  cv.imshow('gaussianBlur', gaussianBlur(srcSmall, dstC4Small));
  cv.imshow('bilateralFilter', bilateralFilter(srcSmall, dstC3Small, smallHeight, smallWidth));
  cv.imshow('medianBlur', medianBlur(srcSmall, dstC4Small));
  cv.imshow('sobel', sobel(srcSmall, dstC1Small, smallHeight, smallWidth));
  cv.imshow('scharr', scharr(srcSmall, dstC1Small, smallHeight, smallWidth));
  cv.imshow('laplacian', laplacian(srcSmall, dstC1Small, smallHeight, smallWidth));
  cv.imshow('calcHist', calcHist(srcSmall, dstC1Small, dstC4Small));
  cv.imshow('equalizeHist', equalizeHist(srcSmall, dstC1Small));
  cv.imshow('backprojection', backprojection(srcSmall, dstC1Small, dstC3Small));
  cv.imshow('morphology', morphology(srcSmall, dstC3Small, dstC4Small));

  requestAnimationFrame(processVideo);
}

let filters = {
  'passThrough': 'No Filter',
  'gray': 'Gray',
  'hsv': 'HSV',
  'canny': 'Canny Edge Detection',
  'threshold': 'Threshold',
  'adaptiveThreshold': 'Adaptive Threshold',
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

let filterName = document.getElementById('filterName');
let controls;

function closeLastFilterOptions(filter) {
  if (lastFilter != null && lastFilter != filter) {
    switch (lastFilter) {
      case 'threshold': controls.thresholdSettings.classList.add('hidden'); break;
      case 'adaptiveThreshold': controls.adaptiveThresholdSettings.classList.add('hidden'); break;
      case 'gaussianBlur': controls.gaussianSettings.classList.add('hidden'); break;
      case 'bilateralFilter': controls.bilateralSettings.classList.add('hidden'); break;
      case 'medianBlur': controls.medianSettings.classList.add('hidden'); break;
      case 'sobel': controls.sobelSettings.classList.add('hidden'); break;
      case 'laplacian': controls.laplacianSettings.classList.add('hidden'); break;
      case 'morphology': controls.morphologySettings.classList.add('hidden'); break;
      case 'canny': controls.cannySettings.classList.add('hidden'); break;
      case 'backprojection': controls.backprojectionSettings.classList.add('hidden'); break;
      default: ;
    }
  }
}

function initUI() {
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
    setFilter: function (filter) {
      this.filter = filter;
      filterName.innerHTML = filters[filter];
    },
    passThrough: function () {
      this.setFilter('passThrough');
      closeLastFilterOptions(this.filter);
    },
    gray: function () {
      this.setFilter('gray');
      closeLastFilterOptions(this.filter);
    },
    hsv: function () {
      this.setFilter('hsv');
      closeLastFilterOptions(this.filter);
    },
    threshold: function () {
      this.setFilter('threshold');
      closeLastFilterOptions(this.filter);
      controls.thresholdSettings.classList.remove('hidden');
    },
    thresholdSettings: document.getElementById('threshold-settings'),
    thresholdValue: document.getElementById("threshold-value"),
    thresholdValueOutput: document.getElementById("threshold-value-output"),
    adaptiveThreshold: function () {
      this.setFilter('adaptiveThreshold');
      closeLastFilterOptions(this.filter);
      this.adaptiveThresholdSettings.classList.remove('hidden');
    },
    adaptiveThresholdSettings: document.getElementById('adaptive-threshold-settings'),
    adaptiveBlockSize: document.getElementById("adaptive-block-size"),
    adaptiveBlockSizeOutput: document.getElementById("adaptive-block-size-output"),
    gaussianBlur: function () {
      this.setFilter('gaussianBlur');
      closeLastFilterOptions(this.filter);
      this.gaussianSettings.classList.remove('hidden');
    },
    gaussianSettings: document.getElementById('gaussian-settings'),
    gaussianBlurSize: document.getElementById("gaussian-kernel-size"),
    gaussianBlurSizeOutput: document.getElementById("gaussian-kernel-size-output"),
    medianBlur: function () {
      this.setFilter('medianBlur');
      closeLastFilterOptions(this.filter);
      this.medianSettings.classList.remove('hidden');
    },
    medianSettings: document.getElementById('median-settings'),
    medianBlurSize: document.getElementById("median-kernel-size"),
    medianBlurSizeOutput: document.getElementById("median-kernel-size-output"),
    bilateralFilter: function () {
      this.setFilter('bilateralFilter');
      closeLastFilterOptions(this.filter);
      this.bilateralSettings.classList.remove('hidden');
    },
    bilateralSettings: document.getElementById('bilateral-settings'),
    bilateralFilterDiameter: document.getElementById("bilateral-diameter"),
    bilateralFilterDiameterOutput: document.getElementById("bilateral-diameter-output"),
    bilateralFilterSigma: document.getElementById("bilateral-sigma"),
    bilateralFilterSigmaOutput: document.getElementById("bilateral-sigma-output"),
    sobel: function () {
      this.setFilter('sobel');
      closeLastFilterOptions(this.filter);
      this.sobelSettings.classList.remove('hidden');
    },
    sobelSettings: document.getElementById('sobel-settings'),
    sobelSize: document.getElementById("sobel-kernel-size"),
    sobelSizeOutput: document.getElementById("sobel-kernel-size-output"),
    scharr: function () {
      this.setFilter('scharr');
      closeLastFilterOptions(this.filter);
    },
    laplacian: function () {
      this.setFilter('laplacian');
      closeLastFilterOptions(this.filter);
      this.laplacianSettings.classList.remove('hidden');
    },
    laplacianSettings: document.getElementById('laplacian-settings'),
    laplacianSize: document.getElementById("laplacian-kernel-size"),
    laplacianSizeOutput: document.getElementById("laplacian-kernel-size-output"),
    canny: function () {
      this.setFilter('canny');
      closeLastFilterOptions(this.filter);
      this.cannySettings.classList.remove('hidden');
    },
    cannySettings: document.getElementById('canny-settings'),
    cannyThreshold1: document.getElementById("canny-threshold1"),
    cannyThreshold1Output: document.getElementById("canny-threshold1-output"),
    cannyThreshold2: document.getElementById("canny-threshold2"),
    cannyThreshold2Output: document.getElementById("canny-threshold2-output"),
    cannyApertureSize: document.getElementById("canny-aperture"),
    cannyApertureSizeOutput: document.getElementById("canny-aperture-output"),
    cannyL2Gradient: document.getElementById("canny-gradient"),
    calcHist: function () {
      this.setFilter('calcHist');
      closeLastFilterOptions(this.filter);
    },
    equalizeHist: function () {
      this.setFilter('equalizeHist');
      closeLastFilterOptions(this.filter);
    },
    backprojection: function () {
      this.setFilter('backprojection');
      closeLastFilterOptions(this.filter);
      this.backprojectionSettings.classList.remove('hidden');
    },
    backprojectionSettings: document.getElementById('backprojection-settings'),
    backprojectionRangeLow: document.getElementById("backprojection-low"),
    backprojectionRangeLowOutput: document.getElementById("backprojection-low-output"),
    backprojectionRangeHigh: document.getElementById("backprojection-high"),
    backprojectionRangeHighOutput: document.getElementById("backprojection-high-output"),
    morphology: function () {
      this.setFilter('morphology');
      closeLastFilterOptions(this.filter);
      this.morphologySettings.classList.remove('hidden');
    },
    morphologySettings: document.getElementById('morphology-settings'),
    morphologyOp: document.getElementById("morphology-operation"),
    morphologyShape: document.getElementById("morphology-shape"),
    morphologySize: document.getElementById("morphology-size"),
    morphologySizeOutput: document.getElementById("morphology-size-output"),
    morphologyBorderType: document.getElementById("morphology-border"),
  };
}

function startCamera() {
  if (!streaming) {
    utils.clearError();
    utils.startCamera('vga', onVideoStarted, 'videoInput');
  } else {
    utils.stopCamera();
    onVideoStopped();
  }
}

function onVideoStarted() {
  height = video.videoHeight;
  width = video.videoWidth;
  video.setAttribute('width', width);
  video.setAttribute('height', height);
  streaming = true;
  vc = new cv.VideoCapture(video);
  startVideoProcessing();
}

function stopVideoProcessing() {
  if (src != null && !src.isDeleted()) src.delete();
  if (dstC1 != null && !dstC1.isDeleted()) dstC1.delete();
  if (dstC3 != null && !dstC3.isDeleted()) dstC3.delete();
  if (dstC4 != null && !dstC4.isDeleted()) dstC4.delete();
  if (srcSmall != null && !srcSmall.isDeleted()) srcSmall.delete();
  if (dstC1Small != null && !dstC1Small.isDeleted()) dstC1Small.delete();
  if (dstC3Small != null && !dstC3Small.isDeleted()) dstC3Small.delete();
  if (dstC4Small != null && !dstC4Small.isDeleted()) dstC4Small.delete();
}

function onVideoStopped() {
  if (!streaming) return;
  stopVideoProcessing();
  document.getElementById('canvasOutput').getContext('2d').clearRect(0, 0, width, height);
  streaming = false;
}

utils.loadOpenCv(() => {
  initUI();
  startCamera();
});