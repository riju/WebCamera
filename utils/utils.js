const resolutions = {
  'qqvga': { width: { exact: 160 }, height: { exact: 120 } },
  'qvga': { width: { exact: 320 }, height: { exact: 240 } },
  'vga': { width: { exact: 640 }, height: { exact: 480 } }
};

function Utils(errorOutputId) { // eslint-disable-line no-unused-vars
  let self = this;
  this.errorOutput = document.getElementById(errorOutputId);

  let opencvUrl = '../../build/wasm/desktop/opencv.js';
  if (isMobileDevice()) opencvUrl = '../../build/wasm/mobile/opencv.js';
  this.loadOpenCv = function (onloadCallback) {
    let script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('type', 'text/javascript');
    script.addEventListener('load', () => {
      if (cv.getBuildInformation) {
        console.log(cv.getBuildInformation());
        onloadCallback();
      }
      else {
        // WASM
        cv['onRuntimeInitialized'] = () => {
          console.log(cv.getBuildInformation());
          onloadCallback();
        }
      }
    });
    script.addEventListener('error', () => {
      self.printError('Failed to load ' + opencvUrl);
    });
    script.src = opencvUrl;
    let node = document.getElementsByTagName('script')[0];
    node.parentNode.insertBefore(script, node);
  };

  this.createFileFromUrl = function (path, url, callback) {
    let request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function (ev) {
      if (request.readyState === 4) {
        if (request.status === 200) {
          let data = new Uint8Array(request.response);
          cv.FS_createDataFile('/', path, data, true, false, false);
          callback();
        } else {
          self.printError(
            'Failed to load ' + url + ' status: ' + request.status);
        }
      }
    };
    request.send();
  };

  this.loadImageToCanvas = function (url, cavansId) {
    let canvas = document.getElementById(cavansId);
    let ctx = canvas.getContext('2d');
    let img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
    };
    img.src = url;
  };

  this.clearError = function () {
    this.errorOutput.innerHTML = '';
  };

  this.printError = function (err) {
    if (typeof err === 'undefined') {
      err = '';
    } else if (typeof err === 'number') {
      if (!isNaN(err)) {
        if (typeof cv !== 'undefined') {
          err = 'Exception: ' + cv.exceptionFromPtr(err).msg;
        }
      }
    } else if (typeof err === 'string') {
      let ptr = Number(err.split(' ')[0]);
      if (!isNaN(ptr)) {
        if (typeof cv !== 'undefined') {
          err = 'Exception: ' + cv.exceptionFromPtr(ptr).msg;
        }
      }
    } else if (err instanceof Error) {
      err = err.stack.replace(/\n/g, '<br>');
    }
    this.errorOutput.innerHTML = err;
  };

  this.addFileInputHandler = function (fileInputId, canvasId) {
    let inputElement = document.getElementById(fileInputId);
    inputElement.addEventListener('change', (e) => {
      let files = e.target.files;
      if (files.length > 0) {
        let imgUrl = URL.createObjectURL(files[0]);
        self.loadImageToCanvas(imgUrl, canvasId);
      }
    }, false);
  };

  function onVideoCanPlay() {
    if (self.onCameraStartedCallback) {
      self.onCameraStartedCallback(self.stream, self.video);
    }
  };

  this.startCamera = function (videoConstraint, videoId, callback) {
    let video = document.getElementById(videoId);
    navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: false })
      .then(function (stream) {
        video.srcObject = stream;
        video.play();
        self.video = video;
        self.stream = stream;
        self.onCameraStartedCallback = callback;
        video.addEventListener('canplay', onVideoCanPlay, false);
      })
      .catch(function (err) {
        self.printError('Camera Error: ' + err.name + ' ' + err.message);
      });
  };

  this.stopCamera = function () {
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
      this.video.removeEventListener('canplay', onVideoCanPlay);
    }
    if (this.stream) {
      this.stream.getVideoTracks()[0].stop();
    }
  };
};


function checkFeatures(info, features) {
  var wasmSupported = true, webrtcSupported = true;
  if (features.webrtc) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      webrtcSupported = false;
    }
  }
  if (features.wasm && !window.WebAssembly) {
    wasmSupported = false;
  }

  if (!webrtcSupported || !wasmSupported) {
    var text = "Your web browser doesn't support ";
    var len = text.length;
    if (!webrtcSupported) {
      text += "WebRTC";
    }
    if (!wasmSupported) {
      if (text.length > len) {
        text += " and ";
      }
      text += "WebAssembly"
    }
    text += ".";
    info.innerHTML = text;
    return false;
  }

  return true;
}

function isMobileDevice() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    .test(navigator.userAgent)) {
    return true;
  }
  return false;
};

function getVideoConstraint(menuHeight) {
  menuHeight = menuHeight + 120; // Add 120 pixels for browser panel.

  if (isMobileDevice()) {
    // TODO(sasha): figure out why getUserMedia(...) in utils.js
    // swap width and height for mobile devices.
    videoConstraint = {
      //width: { ideal: window.screen.width },
      //height: { ideal: window.screen.height - menuHeight }
      width: { ideal: window.screen.height - menuHeight },
      height: { ideal: window.screen.width }
    };
  } else {
    if (window.innerWidth < 960) {
      videoConstraint = resolutions['qvga'];
    } else {
      videoConstraint = resolutions['vga'];
    }
  }
}

function setMainCanvasProperties(video) {
  video.width = video.videoWidth;
  video.height = video.videoHeight;
  document.getElementById('mainContent').style.width = `${video.width}px`;
  document.querySelector('.canvas-wrapper').style.height =
    `${video.height}px`;
}

function onVideoStarted() {
  streaming = true;
  setMainCanvasProperties(video);
  videoTrack = video.srcObject.getVideoTracks()[0];
  imageCapturer = new ImageCapture(videoTrack);
  document.getElementById('mainContent').classList.remove('hidden');
  completeStyling();
  initOpencvObjects();
  requestAnimationFrame(processVideo);
}

function onVideoStopped() {
  streaming = false;
  let canvasContext = canvasOutput.getContext('2d');
  canvasContext.clearRect(0, 0, video.width, video.height);
}

function startVideoProcessing() {
  videoTrack = video.srcObject.getVideoTracks()[0];
  imageCapturer = new ImageCapture(videoTrack);
  requestAnimationFrame(processVideo);
}

function initCameraSettingsAndStart() {
  // Detect back and front cameras.
  navigator.mediaDevices.enumerateDevices()
    .then(function (devices) {
      devices.forEach(device => {
        if (device.kind == 'videoinput') {

          if (device.facingMode == "environment"
            || device.label.indexOf("facing back") >= 0)
            controls.backCamera = device;

          else if (device.facingMode == "user"
            || device.label.indexOf("facing front") >= 0)
            controls.frontCamera = device;
        }
      });
      // Disable facingModeButton if there is no environment or user mode.
      let facingModeButton = document.getElementById('facingModeButton');
      if (facingModeButton) {
        if (controls.frontCamera === undefined || controls.backCamera === undefined) {
          facingModeButton.style.color = 'gray';
          facingModeButton.style.border = '2px solid gray';
        } else {
          facingModeButton.disabled = false;
        }
      }

      // Set initial facingMode value if camera is available.
      if (controls.backCamera !== undefined) {
        controls.facingMode = 'environment';
        videoConstraint.deviceId = { exact: controls.backCamera.deviceId };
      }

      startCamera();
    });
}

function drawCanvas(canvas, img) {
  canvas.width = getComputedStyle(canvas).width.split('px')[0];
  canvas.height = getComputedStyle(canvas).height.split('px')[0];
  let ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
  let x = (canvas.width - img.width * ratio) / 2;
  let y = (canvas.height - img.height * ratio) / 2;
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
    x, y, img.width * ratio, img.height * ratio);
}

function takePhoto(photoSettings = null) {
  imageCapturer.takePhoto(photoSettings)
    .then(blob => createImageBitmap(blob))
    .then(imageBitmap => {
      const canvas = document.getElementById('gallery');
      drawCanvas(canvas, imageBitmap);
    })
    .catch((err) => console.error("takePhoto() failed: ", err));
}

// Get coordinates of contour and sort them clockwise
// with upper left point as the first point.
function getContourCoordinates(contour) {
  let coordinates = [];
  let sum = [];
  for (let i = 0; i < contour.rows; i++) {
    coordinates.push({ x: contour.data32S[i * 2], y: contour.data32S[i * 2 + 1] });
    sum.push(coordinates[i].x + coordinates[i].y);
  }

  let sortedCoordinates = [0, 0, 0, 0];
  let firstIndex = sum.indexOf(Math.min(...sum));
  if (firstIndex == 0) {
    sortedCoordinates[0] = coordinates[0];
    sortedCoordinates[1] = coordinates[3];
    sortedCoordinates[2] = coordinates[2];
    sortedCoordinates[3] = coordinates[1];
  } else { // firstIndex == 1
    sortedCoordinates[0] = coordinates[1];
    sortedCoordinates[1] = coordinates[0];
    sortedCoordinates[2] = coordinates[3];
    sortedCoordinates[3] = coordinates[2];
  }
  return sortedCoordinates;
}

function resizeImage(image, width = 'undefined', height = 'undefined') {
  let dim;

  if (width === 'undefined' && height === 'undefined')
    return image;

  let ratio;
  if (width === 'undefined') {
    ratio = height / image.rows;
    dim = new cv.Size(parseInt(image.cols * ratio), height);
  } else {
    ratio = width / image.cols;
    dim = new cv.Size(width, parseInt(image.rows * ratio));
  }

  cv.resize(image, image, dim, cv.INTER_AREA);
}
