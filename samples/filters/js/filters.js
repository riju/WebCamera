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
  let bilateralFilterDiameter =
    parseInt(controls.bilateralFilterDiameter.value);
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
  let color = new cv.Scalar(0x5b, 0x74, 0xff, 0xff); // blue
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
  let backprojectionRangeHigh =
    parseInt(controls.backprojectionRangeHigh.value);
  controls.backprojectionRangeHighOutput.value = backprojectionRangeHigh;

  if (controls.lastFilter !== 'backprojection') {
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
  let opIndex =
    controls.morphologyOp.options[controls.morphologyOp.selectedIndex].value;
  let op = Number(morphologyOpValues[opIndex]);
  let borderTypeIndex = controls.morphologyBorderType.options[
    controls.morphologyBorderType.selectedIndex
  ].value;
  let borderType = morphologyBorderValues[borderTypeIndex];
  let kernelIndex = controls.morphologyShape.options[
    controls.morphologyShape.selectedIndex
  ].value;
  let kernelSize = parseInt(controls.morphologySize.value);
  if (kernelSize % 2 === 0) {
    kernelSize = kernelSize + 1;
  }
  controls.morphologySizeOutput.value = kernelSize;
  let kernel =
    cv.getStructuringElement(Number(morphologyShapeValues[kernelIndex]),
      { width: kernelSize, height: kernelSize });

  let color = new cv.Scalar();
  let image = src;
  if (op === cv.MORPH_GRADIENT || op === cv.MORPH_TOPHAT ||
    op === cv.MORPH_BLACKHAT) {
    cv.cvtColor(src, dstC3, cv.COLOR_RGBA2RGB);
    image = dstC3;
  }
  cv.morphologyEx(image, dstC4, op, kernel, { x: -1, y: -1 }, 1,
    Number(borderType), color);
  kernel.delete();
  return dstC4;
}
