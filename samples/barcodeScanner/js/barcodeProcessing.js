let barcodeScale = 1.0;

function startProcessing() {
  if (window.BarcodeDetector == undefined) {
    // TODO(sasha): Provide polyfill detection implementation.
    document.getElementById("errorMessage").innerText =
      "barcodeDetector API is not supported in this browser version.";
    return;
  }

  // TODO(sasha): We are doing detection on image.
  // Later on we are planning to implement live detection
  // and use worker for this.
  imageCapturer.grabFrame()
    .then(imageBitmap => {
      return createBarcodeDetector(imageBitmap);
    })
    .then(barcodes => {
      // If no barcodes detected.
      if (barcodes.length == 0) {
        let barcodeStatus = document.getElementById('barcodeStatus');
        barcodeStatus.classList.remove('hidden');
        barcodeStatus.innerText = 'No barcode detected';

      } else {
        // TODO(sasha): Show all barcodes but not only the first one.
        const boundingBox = barcodes[0].boundingBox;
        drawBarcodeRectangle(boundingBox);

        // Output barcode value in input tag.
        let label = document.querySelector(`label[for=barcodeValue]`);
        label.classList.remove('hidden');
        document.getElementById('barcodeValue').value =
          barcodes[0].rawValue;
      }
    }).catch((e) => {
      document.getElementById('errorMessage').innerText =
        'Error in barcode detection process: ' + e;
    })
}

function createBarcodeDetector(imageBitmap) {
  barcodeScale = canvasOutput.width / imageBitmap.width;
  canvasContext.drawImage(imageBitmap, 0, 0, imageBitmap.width,
    imageBitmap.height, 0, 0, canvasOutput.width, canvasOutput.height);

  // Optional argument: A series of barcode formats to search for.
  // By default, the detector will recognize all supported formats.
  let barcodeDetector = new BarcodeDetector(
    //  { formats: [
    //     'aztec',
    //     'code_128',
    //     'code_39',
    //     'code_93',
    //     'codabar',
    //     'data_matrix',
    //     'ean_13',
    //     'ean_8',
    //     'itf',
    //     'pdf417',
    //     'qr_code',
    //     'upc_a',
    //     'upc_e']}
  );
  return barcodeDetector.detect(imageBitmap);
}

function drawBarcodeRectangle(boundingBox) {
  // Create style for output rectangle.
  canvasContext.lineWidth = 4;
  canvasContext.strokeStyle = 'green';

  // Draw rectangle to canvas context.
  canvasContext.beginPath();
  canvasContext.rect(Math.floor(boundingBox.x * barcodeScale),
    Math.floor(boundingBox.y * barcodeScale),
    Math.floor(boundingBox.width * barcodeScale),
    Math.floor(boundingBox.height * barcodeScale));
  canvasContext.stroke();
}
