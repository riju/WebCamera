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
  let cannyThreshold1 = controls.cannyThreshold1Output.value =
    parseInt(controls.cannyThreshold1.value);
  let cannyThreshold2 = controls.cannyThreshold2Output.value =
    parseInt(controls.cannyThreshold2.value);
  let cannyAperture = parseInt(controls.cannyAperture.value);
  if (cannyAperture % 2 === 0) cannyAperture = cannyAperture + 1;
  controls.cannyApertureOutput.value = cannyAperture;

  cv.cvtColor(src, dstC1, cv.COLOR_RGBA2GRAY);
  cv.Canny(dstC1, dstC1, cannyThreshold1, cannyThreshold2,
    cannyAperture, controls.cannyGradient.checked);
  return dstC1;
}

function threshold(src, dstC4) {
  let thresholdValue = controls.thresholdValueOutput.value =
    parseFloat(controls.thresholdValue.value);

  cv.threshold(src, dstC4, thresholdValue, 200, cv.THRESH_BINARY);
  return dstC4;
}

function adaptiveThreshold(src, dstC1) {
  let blockSizeValue = parseInt(controls.adaptiveBlockSize.value);
  if (blockSizeValue % 2 === 0) blockSizeValue = blockSizeValue + 1;
  controls.adaptiveBlockSizeOutput.value = blockSizeValue;

  let mat = new cv.Mat(dstC1.rows, dstC1.cols, cv.CV_8U);
  cv.cvtColor(src, mat, cv.COLOR_RGBA2GRAY);
  cv.adaptiveThreshold(mat, dstC1, 200, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv.THRESH_BINARY, Number(blockSizeValue), 2);
  mat.delete();
  return dstC1;
}

function gaussianBlur(src, dstC4) {
  let gaussianKernelSize = parseInt(controls.gaussianKernelSize.value);
  if (gaussianKernelSize % 2 === 0) gaussianKernelSize = gaussianKernelSize + 1;
  controls.gaussianKernelSizeOutput.value = gaussianKernelSize;

  cv.GaussianBlur(src, dstC4,
    { width: gaussianKernelSize, height: gaussianKernelSize },
    0, 0, cv.BORDER_DEFAULT);
  return dstC4;
}

function bilateralFilter(src, dstC3) {
  let bilateralDiameter = controls.bilateralDiameterOutput.value =
    parseInt(controls.bilateralDiameter.value);
  let bilateralSigma = controls.bilateralSigmaOutput.value =
    parseInt(controls.bilateralSigma.value);

  let mat = new cv.Mat(dstC3.rows, dstC3.cols, cv.CV_8UC3);
  cv.cvtColor(src, mat, cv.COLOR_RGBA2RGB);
  cv.bilateralFilter(mat, dstC3, bilateralDiameter, bilateralSigma,
    bilateralSigma, cv.BORDER_DEFAULT);
  mat.delete();
  return dstC3;
}

function medianBlur(src, dstC4) {
  let medianKernelSize = parseInt(controls.medianKernelSize.value);
  if (medianKernelSize % 2 === 0) medianKernelSize = medianKernelSize + 1;
  controls.medianKernelSizeOutput.value = medianKernelSize;

  cv.medianBlur(src, dstC4, medianKernelSize);
  return dstC4;
}

function sobel(src, dstC1) {
  let sobelKernelSize = parseInt(controls.sobelKernelSize.value);
  if (sobelKernelSize % 2 === 0) sobelKernelSize = sobelKernelSize + 1;
  controls.sobelKernelSizeOutput.value = sobelKernelSize;

  let mat = new cv.Mat(dstC1.rows, dstC1.cols, cv.CV_8UC1);
  cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY, 0);
  cv.Sobel(
    mat, dstC1, cv.CV_8U, 1, 0, sobelKernelSize, 1, 0, cv.BORDER_DEFAULT);
  mat.delete();
  return dstC1;
}

function scharr(src, dstC1) {
  let mat = new cv.Mat(dstC1.rows, dstC1.cols, cv.CV_8UC1);
  cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY, 0);
  cv.Scharr(mat, dstC1, cv.CV_8U, 1, 0, 1, 0, cv.BORDER_DEFAULT);
  mat.delete();
  return dstC1;
}

function laplacian(src, dstC1) {
  let laplacianKernelSize = parseInt(controls.laplacianKernelSize.value);
  if (laplacianKernelSize % 2 === 0)
    laplacianKernelSize = laplacianKernelSize + 1;
  controls.laplacianKernelSizeOutput.value = laplacianKernelSize;

  let mat = new cv.Mat(dstC1.cols, dstC1.cols, cv.CV_8UC1);
  cv.cvtColor(src, mat, cv.COLOR_RGB2GRAY);
  cv.Laplacian(
    mat, dstC1, cv.CV_8U, laplacianKernelSize, 1, 0, cv.BORDER_DEFAULT);
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
  // Draw histogram on src.
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
  let backprojectionLow = controls.backprojectionLowOutput.value =
    parseInt(controls.backprojectionLow.value);
  let backprojectionHigh = controls.backprojectionHighOutput.value =
    parseInt(controls.backprojectionHigh.value);

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
  if (backprojectionLow < backprojectionHigh) {
    ranges = [backprojectionLow, backprojectionHigh];
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
  let operationIndex = controls.morphologyOperation.
    options[controls.morphologyOperation.selectedIndex].value;
  let operation = Number(controls.morphologyOperationValues[operationIndex]);
  let borderTypeIndex = controls.morphologyBorder.options[
    controls.morphologyBorder.selectedIndex].value;
  let borderType = controls.morphologyBorderValues[borderTypeIndex];
  let kernelIndex = controls.morphologyShape.options[
    controls.morphologyShape.selectedIndex].value;
  let kernelSize = parseInt(controls.morphologySize.value);
  if (kernelSize % 2 === 0) kernelSize = kernelSize + 1;
  controls.morphologySizeOutput.value = kernelSize;
  let kernel = cv.getStructuringElement(
    Number(controls.morphologyShapeValues[kernelIndex]),
    { width: kernelSize, height: kernelSize });

  let image = src;
  if (operation === cv.MORPH_GRADIENT || operation === cv.MORPH_TOPHAT ||
    operation === cv.MORPH_BLACKHAT) {
    cv.cvtColor(src, dstC3, cv.COLOR_RGBA2RGB);
    image = dstC3;
  }
  cv.morphologyEx(image, dstC4, operation, kernel, { x: -1, y: -1 }, 1,
    Number(borderType), new cv.Scalar());
  kernel.delete();
  return dstC4;
}
