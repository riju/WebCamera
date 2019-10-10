import { html, css, LitElement } from '../../../node_modules/lit-element';

import '../../../node_modules/@material/mwc-icon';
import '../../../node_modules/@material/mwc-ripple';

import './settings-pane.js';

let utils = new Utils('errorMessage');

class CameraView extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
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
      justify-content: center;
      align-items: flex-end;
    }

    #cameraBar {
      height: 100px;
      background-color: black;
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

  _onResetClicked(e) {
    const settings = this.shadowRoot.querySelector('settings-pane');
    settings.reset();

    const resetButton = this.shadowRoot.querySelector('#resetButton');
    resetButton.classList.add('hidden');
  }

  _onConstraintsChange(e) {
    this.videoTrack.applyConstraints(e.detail.constraints).catch(e => console.log(e));

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
    switch(this.facingMode) {
      case 'user':
        this.facingMode = 'environment';
        this.constraints.deviceId = { exact: this.backCamera.deviceId };
        facingModeButton.innerText = 'camera_front';
        break;
      case 'environment':
        this.facingMode = 'user';
        this.constraints.deviceId = { exact: this.frontCamera.deviceId };
        facingModeButton.innerText = 'camera_rear';
    }

    utils.clearError();
    utils.stopCamera();

    const videoElement = this.shadowRoot.querySelector('video');

    await new Promise(resolve => {
      utils.startCamera(this.constraints, videoElement, resolve);
    });

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

  async firstUpdated() {
    let menuHeight = parseInt(getComputedStyle(
      this.shadowRoot.querySelector('#cameraBar')).height);
    this.constraints = getVideoConstraint(menuHeight);

    const devices = await navigator.mediaDevices.enumerateDevices();

    devices.forEach(device => {
      if (device.kind == 'videoinput') {
        if (device.facingMode == "environment"
            || device.label.indexOf("facing back") >= 0) {
          this.backCamera = device;
        } else if (device.facingMode == "user"
          || device.label.indexOf("facing front") >= 0) {
          this.frontCamera = device;
        }
      }
    });
  
    // Disable facingModeButton if there is no environment or user mode.
    let facingModeButton = this.shadowRoot.getElementById('facingModeButton');
    if (facingModeButton) {
      if (!this.frontCamera || !this.backCamera) {
        facingModeButton.style.color = 'gray';
        facingModeButton.style.border = '2px solid gray';
      } else {
        facingModeButton.disabled = false;
      }
    }
  
    if (this.backCamera) {
      this.facingMode = 'environment';
      this.constraints.deviceId = { exact: this.backCamera.deviceId };
    }
  
    const videoElement = this.shadowRoot.querySelector('video');

    await new Promise(resolve => {
      utils.startCamera(this.constraints, videoElement, resolve);
    });

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
          </div>
        </div>
    
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
            <mwc-icon>camera_front</mwc-icon>
          </button>
        </div>
      </div>
    `;
  }
}

customElements.define('camera-view', CameraView);