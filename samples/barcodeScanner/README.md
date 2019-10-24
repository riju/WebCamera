# Goal

Demonstrate barcode and QRcode scanning using [Shape Detection API](https://wicg.github.io/shape-detection-api/).

## Steps of barcode/QRcode scanning

**1. Grab frame using imageCapturer**

**2. Create BarcodeDetector**

**3. Detect barcodes**

**4. Show bounding box of the first barcode**

**5. Display barcode value**


### Sample code:

```javascript
videoTrack = video.srcObject.getVideoTracks()[0];
imageCapturer = new ImageCapture(videoTrack);
...
// 1. Grab frame using imageCapturer.
imageCapturer.grabFrame()
    .then(imageBitmap => {
      canvasContext.drawImage(imageBitmap, 0, 0, imageBitmap.width,
      imageBitmap.height, 0, 0, canvasOutput.width, canvasOutput.height);
      // 2. Create BarcodeDetector.
      let barcodeDetector = new BarcodeDetector();
      return barcodeDetector.detect(imageBitmap);
    })
    // 3. Detect barcodes.
    .then(barcodes => {
      // If no barcodes detected.
      if (barcodes.length == 0) {
        ...
      } else {
        // 4. Show bounding box of the first barcode.
        const boundingBox = barcodes[0].boundingBox;
        drawBarcodeRectangle(boundingBox);

        // 5. Output barcode value in input tag.
        let label = document.querySelector(`label[for=barcodeValue]`);
        label.classList.remove('hidden');
        document.getElementById('barcodeValue').value =
          barcodes[0].rawValue;
      }
    }).catch((e) => {
      ...
    })
}
```

## References

1. [Barcode Detection Demo: a pen by Miguel Casas-Sanchez](https://codepen.io/miguelao/pen/bBWOzM)
