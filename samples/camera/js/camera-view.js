import { html, css, LitElement } from '../../../node_modules/lit-element';

import '../../../node_modules/@material/mwc-icon';
import '../../../node_modules/@material/mwc-ripple';

import './settings-pane.js';

class CameraView extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    .hidden {
      display: none !important;
    }

    #mainContent {
      margin: 0 auto;
    }

    video {
      display: inline;
    }

    video:hover {
      cursor: pointer;
    }

    #resetButton {
      position: relative;
      padding: 15px;
      color: white;
      text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
      font-size: 18px;
      background: none;
      border: none;
      z-index: 15;
      outline: none;
    }

    .canvas-wrapper {
      position: relative;
      width: 100%;
    }

    .settings-wrapper {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
    }

    #cameraBar {
      height: 100px;
      background-color: transparent;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: space-around;
      align-items: center;
    }

    #gallery {
      width: 48px;
      height: 48px;
    }

    #takePhotoButton {
      height: 72px;
      width: 72px;
    }

    #takePhotoButton mwc-icon {
      --mdc-icon-size: 48px;
    }

    .camera-bar-icon {
      height: 52px;
      width: 52px;
      display: flex;
      justify-content: center;
      outline: none;
      border: 2px solid white;
      border-radius: 52px;
      color: white;
      background-color: transparent;
    }
  `;

  facingMode = "user";

  _onResetClicked(e) {
    const settings = this.shadowRoot.querySelector('settings-pane');
    settings.reset();

    const resetButton = this.shadowRoot.querySelector('#resetButton');
    resetButton.classList.add('hidden');
  }

  async _onConstraintsChange(e) {
    try {
      await this.videoTrack.applyConstraints(e.detail.constraints);

      const settings = this.shadowRoot.querySelector('settings-pane');
      settings.applyFromTrack(this.videoTrack);
    } catch(err) {
      console.error(err);
    }

    const resetButton = this.shadowRoot.querySelector('#resetButton');
    resetButton.classList.remove('hidden');
  }

  _onSettingsBackgroundClicked(e) {
    const settings = this.shadowRoot.querySelector('settings-pane');
    settings.hide();

    const resetButton = this.shadowRoot.querySelector('#resetButton');
    resetButton.classList.add('hidden');
  }

  async _onFacingModeClicked() {
    this.selectedCamera = (this.selectedCamera + 1) % this.cameras.length;
    const camera = this.cameras[this.selectedCamera];
    this.constraints.deviceId = { exact: camera.deviceId };
    this.facingMode = this.getFacingMode(camera);
    this.requestUpdate();

    this.stopCamera();

    const videoElement = this.shadowRoot.querySelector('video');
    await this.startCamera(videoElement, this.constraints);

    // Timeout needed in Chrome, see https://crbug.com/711524.
    const settings = this.shadowRoot.querySelector('settings-pane');
    setTimeout(async () => {
      await customElements.whenDefined('settings-pane');
      settings.applyFromTrack(this.videoTrack);
    }, 500);
  }

  async takePhoto() {
    try {
      const blob = await this.imageCapturer.takePhoto();
      const img = await createImageBitmap(blob);

      const canvas = this.shadowRoot.querySelector('#gallery');
      canvas.width = getComputedStyle(canvas).width.split('px')[0];
      canvas.height = getComputedStyle(canvas).height.split('px')[0];
      let ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
      let x = (canvas.width - img.width * ratio) / 2;
      let y = (canvas.height - img.height * ratio) / 2;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
        x, y, img.width * ratio, img.height * ratio);
    } catch(err) {
      console.error("takePhoto() failed: ", err)
    }
  }

  startCamera(target, constraints) {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: constraints,
          audio: false
        });

        this.video = target;
        this.stream = stream;

        target.srcObject = stream;
        target.addEventListener('canplay', resolve, { once: true });
        target.play();
      } catch(err) {
        reject(err);
      }
    });
  }

  stopCamera() {
    if (this.video) {
      this.video.pause();
      this.video.srcObject = null;
    }
    if (this.stream) {
      this.stream.getVideoTracks()[0].stop();
    }
  }

  getFacingMode(device) {
    if (device.facingMode == "environment"
      || device.label.indexOf("facing back") >= 0) {
      return "environment";
    }
    // We assume by default that cameras are user facing
    // which is mostly the case for desktop.
    return "user";
  }

  async firstUpdated() {
    let menuHeight = parseInt(getComputedStyle(
      this.shadowRoot.querySelector('#cameraBar')).height);
    this.constraints = {};
    this.constraints.width = Math.ceil(visualViewport.width);
    this.constraints.height = Math.ceil(visualViewport.height);

    const devices = await navigator.mediaDevices.enumerateDevices();

    this.cameras = [];
    this.selectedCamera = 0;

    devices.forEach(device => {
      if (device.kind == 'videoinput') {
        if (this.getFacingMode(device) == "user") {
          this.cameras.push(device);
        } else {
          this.cameras.unshift(device);
        }
      }
    });

    // Disable facingModeButton if there is no environment or user mode.
    let facingModeButton = this.shadowRoot.getElementById('facingModeButton');
    if (this.cameras.length < 2) {
      facingModeButton.style.color = 'gray';
      facingModeButton.style.border = '2px solid gray';
    } else {
      facingModeButton.disabled = false;
    }

    this.facingMode = this.getFacingMode(this.cameras[0]);
    this.requestUpdate();
    this.constraints.deviceId = { exact: this.cameras[0].deviceId};

    const videoElement = this.shadowRoot.querySelector('video');

    await this.startCamera(videoElement, this.constraints);

    this.videoTrack = videoElement.srcObject.getVideoTracks()[0];
    this.imageCapturer = new ImageCapture(this.videoTrack);

    let cameraBar = this.shadowRoot.querySelector('#cameraBar');
    cameraBar.style.width = `${videoElement.videoWidth}px`;

    let mainContent = this.shadowRoot.getElementById('mainContent');
    mainContent.style.width = `${videoElement.videoWidth}px`;
    mainContent.classList.remove('hidden');

    this.shadowRoot.querySelector('.canvas-wrapper').style.height =
      `${videoElement.videoHeight}px`;

    let resetButton = this.shadowRoot.querySelector('#resetButton');
    resetButton.classList.remove('hidden');
    resetButton.style.left = `${videoElement.videoWidth - resetButton.offsetWidth}px`;
    resetButton.style.bottom = `${videoElement.videoHeight}px`;
    resetButton.classList.add('hidden');

    this.shadowRoot.getElementById('takePhotoButton').disabled = false;

    // Timeout needed in Chrome, see https://crbug.com/711524.
    const settings = this.shadowRoot.querySelector('settings-pane');
    setTimeout(async () => {
      await customElements.whenDefined('settings-pane');
      settings.applyFromTrack(this.videoTrack);
    }, 500);
  }

  render() {
    return html`
      <div id="mainContent" class="centered hidden">
        <div class="canvas-wrapper">
          <video id="videoInput"></video>

          <button id="resetButton" class='hidden' @click=${this._onResetClicked}>
            Reset
          </button>

          <div class="settings-wrapper">
            <settings-pane
              @click=${this._onSettingsBackgroundClicked}
              @constraintschange=${this._onConstraintsChange}>
            </settings-pane>

            <div id="cameraBar">
              <canvas id="gallery" class="camera-bar-icon"></canvas>
              <div>
              <button id="takePhotoButton" class="camera-bar-icon" disabled
                @click=${this.takePhoto}>
                <mwc-icon>photo_camera</mwc-icon>
              </button>
              <mwc-ripple unbounded></mwc-ripple>
              </div>
              <button id="facingModeButton" class="camera-bar-icon" disabled
                @click=${this._onFacingModeClicked}>
                <mwc-icon>${this.facingMode === "user" ? "camera_front" : "camera_rear"}</mwc-icon>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('camera-view', CameraView);