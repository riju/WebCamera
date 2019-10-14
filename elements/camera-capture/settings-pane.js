import { html, css, LitElement } from '../../node_modules/lit-element';

import '../../node_modules/@material/mwc-icon-button';
import './settings-slider.js';

class SettingsPane extends LitElement {
  static styles = css`
    :host {
      width: 100%;
      height: 100%;
      display: inline-flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
    }

    mwc-icon-button {
      color: white;
      --mdc-theme-text-disabled-on-light: gray;
      //background-color: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
    }

    .pro-icons {
      width: 100%;
      padding: 20px;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: space-around;
      align-items: center;
      align-content: stretch;
      box-sizing: border-box;
    }

    .hidden {
      display: none !important;
    }

    .settings-bar {
      position: relative;
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
    }

    .settings, .settings-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;
      font-size: 16px;
      text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
      text-align: center;
    }

    #wbIcon {
      display: inline;
      font-size: 16px;
    }

    #resetButton {
      position: fixed;
      top: 0px;
      right: 0px;
      padding: 16px;
      color: white;
      text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
      font-size: 18px;
      background: none;
      border: none;
      z-index: 15;
      outline: none;
    }

    @media screen and (max-width: 960px) {
      .settings select {
        font-size: 12px;
      }
      .settings {
        font-size: 14px;
      }
    }
    @media screen and (max-width: 400px) {
      .settings select {
        font-size: 10px;
      }
      .settings {
        font-size: 12px;
      }
    }
  `;

  static get properties() {
    return {
      flash: { type: Boolean }
    };
  }

  activePane = null;

  async applyFromTrack(videoTrack) {
    // Make sure elements have been rendered before accessing them.
    await this.updateComplete;

    const capabilities = videoTrack.getCapabilities();

    // Boolean abilitites
    ['torch'].forEach(id => {
      if (!capabilities[id]) {
        const control = this.shadowRoot.querySelector(`#${id}`);
        control.disabled = true;
      }
    });

    // Range abilities
    ['iso', 'exposureTime', 'focusDistance', 'colorTemperature', 'zoom',
     'contrast', 'saturation', 'sharpness', 'brightness',
     'exposureCompensation'].forEach(id => {
      const control = this.shadowRoot.querySelector(`#${id}`);

      if (capabilities[id]) {
        const {min, max, step} = capabilities[id];
        control.step = step;
        control.max = max;
        control.min = min;
      } else {
        console.log(id, 'is not supported.');
        control.disabled = true;
      }
    });
  }

  hide() {
    const bar = this.shadowRoot.querySelector('#settings-bar');
    let panes = Array.from(bar.children);
    panes.forEach(pane => {
      pane.classList.add('hidden');
    });
  }

  _onResetClicked(e) {
    e.stopPropagation();

    this.reset();

    const resetButton = this.shadowRoot.querySelector('#resetButton');
    resetButton.classList.add('hidden');
  }

  _toggleGroup(e) {
    const id = e.target.getAttribute('for');
    if (!id) return;

    this.activePane = null;

    if (id == "torch") {
      const torch = this.shadowRoot.querySelector("#torch");
      if (!torch.disabled) {
        this.flash = !this.flash;
        const constraints = { advanced: [{ torch: this.flash}] };
        this.dispatchEvent(new CustomEvent('constraintschange', { detail: constraints }));
      }
      this.hide();
      return;
    }

    const bar = this.shadowRoot.querySelector('#settings-bar');
    const pane = this.shadowRoot.querySelector(`#${id}-group`);
    const resetButton = this.shadowRoot.querySelector('#resetButton');

    if (pane.hasAttribute("modified")) {
      resetButton.classList.remove('hidden');
    } else {
      resetButton.classList.add('hidden');
    }

    let panes = Array.from(bar.children).filter(el => el != pane);
    panes.forEach(pane => {
      pane.classList.add('hidden');
    });

    pane.classList.toggle('hidden');
    if (!pane.classList.contains('hidden')) {
      this.activePane = pane;
      Array.from(pane.children).forEach(child => {
        if ("layout" in child) child.layout();
      })
    }
  }

  _colorTemperatureChange(value) {
    // See WB ranges: https://w3c.github.io/mediacapture-image/#white-balance-mode
    let iconName = '';
    switch (true) {
      case (value >= 9000):
        break;
      case (value >= 8000): // Twilight mode.
        iconName = 'brightness_3';
        break;
      case (value >= 6500): // Cloudy-daylight mode.
        iconName = 'wb_cloudy';
        break;
      case (value >= 5500): // Daylight mode.
        iconName = 'wb_sunny';
        break;
      case (value >= 5000):
        break;
      case (value >= 4000): // Fluorescent mode.
        iconName = 'wb_iridescent';
        break;
      case (value >= 3500):
        break;
      case (value >= 2500): // Incandescent mode.
        iconName = 'wb_incandescent';
        break;
      case (value == 0): // Continuous mode.
        iconName = 'wb_auto';
        break;
    }
    this.shadowRoot.getElementById('wbIcon').innerText = iconName;
  }

  firstUpdated() {
    const groups = this.shadowRoot.querySelectorAll('.settings-group');
    for (let group of groups) {
      for (let slider of group.children) {
        slider.onchange = e => {
          const id = e.target.getAttribute('id');
          const value = e.detail.value;
          console.log(id, ":", value);

          let constraints = { advanced: [{}] };
          constraints.advanced[0][id] = value;
          if (id == 'exposureTime') {
            constraints.advanced[0]['exposureMode'] = 'manual';
          } else if (id == 'focusDistance') {
            constraints.advanced[0]['focusMode'] = 'manual';
          } else if (id == 'colorTemperature') {
            this._colorTemperatureChange(value);
            constraints.advanced[0]['whiteBalanceMode'] = 'manual';
          }

          group.setAttribute("modified", "");

          const resetButton = this.shadowRoot.querySelector('#resetButton');
          resetButton.classList.remove('hidden');

          this.dispatchEvent(new CustomEvent('constraintschange', { detail: { constraints } }));
        };
      }
    }
  }

  reset() {
    const id = this.activePane.getAttribute("id");
    let constraints = { advanced: [{}] };

    this.activePane.removeAttribute("modified");

    if (id == 'standardSettings') {
      Array.from(this.activePane.children).forEach(child => {
        child.value = (child.max - child.min) / 2 + Number(child.min);
        if (!child.disabled) {
          constraints.advanced[0][id] = child.value;
        }
      });
    } else if (id == 'exposureTimeSettings') {
      constraints.advanced[0]['exposureMode'] = 'continuous';
      this.activePane.children[0].value = 0;
    } else if (id == 'focusDistanceSettings') {
      constraints.advanced[0]['focusMode'] = 'continuous';
      this.activePane.children[0].value = 0;
    } else if (id == 'colorTemperatureSettings') {
      constraints.advanced[0]['whiteBalanceMode'] = 'continuous';
      this.activePane.children[0].value = 0;
      this._colorTemperatureChange(0);
    } else if (id == 'zoomSettings') {
      constraints.advanced[0]['zoom'] = 1;
      this.activePane.children[0].value = 1;
    }

    // The handler of 'constrainstchange' should call applyFromTrack after applying
    // reset settings.
    this.dispatchEvent(new CustomEvent('constraintschange', { detail: { constraints } }));
  }

  render() {
    return html`
      <link href="../css/google-icons.css" rel="stylesheet">
      <button id="resetButton" class='hidden' @click=${this._onResetClicked}>
        Reset
      </button>
      <div id="settings-bar" @click=${e => e.stopPropagation()}>
        <div id="iso-group" class="settings-group hidden">
          <settings-slider label="ISO" id="iso"></settings-slider>
        </div>
        <div id="exposureTime-group" class="settings-group hidden">
          <settings-slider metering label="Exposure" id="exposureTime"></settings-slider>
        </div>
        <div id="focusDistance-group" class="settings-group hidden">
          <settings-slider metering label="Focus distance" id="focusDistance"></settings-slider>
        </div>
        <div id="standard-group" class="settings-group hidden">
          <settings-slider label="Contrast" id="contrast"></settings-slider>
          <settings-slider label="Saturation" id="saturation"></settings-slider>
          <settings-slider label="Sharpness" id="sharpness"></settings-slider>
          <settings-slider label="Brightness" id="brightness"></settings-slider>
          <settings-slider label="Exposure Compensation" id="exposureCompensation"></settings-slider>
        </div>
        <div id="colorTemperature-group" class="settings-group hidden">
          <settings-slider metering label="Color Temperature" id="colorTemperature">
            <i id="wbIcon" class="material-icons">wb_auto</i>
          </settings-slider>
        </div>
        <div id="zoom-group" class="settings-group hidden">
          <settings-slider label="Zoom" id="zoom"></settings-slider>
        </div>
      </div>
      <div class="pro-icons" @click=${e => { this._toggleGroup(e); e.stopPropagation()}}>
        <mwc-icon-button icon="iso" for="iso"></mwc-icon-button>
        <mwc-icon-button icon="exposure" for="exposureTime"></mwc-icon-button>
        <mwc-icon-button icon="tune" for="standard"></mwc-icon-button>
        <mwc-icon-button icon="center_focus_strong" for="focusDistance"></mwc-icon-button>
        <mwc-icon-button icon="ac_unit" for="colorTemperature"></mwc-icon-button>
        <mwc-icon-button icon="zoom_in" for="zoom"></mwc-icon-button>
        <mwc-icon-button icon=${this.flash ? "flash_on" : "flash_off"} id="torch" for="torch"></mwc-icon-button>
      </div>
    `;
  }
}

customElements.define('settings-pane', SettingsPane);