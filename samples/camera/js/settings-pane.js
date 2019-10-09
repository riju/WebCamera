import { html, css, LitElement } from '../../node_modules/lit-element';

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

    .hidden {
      display: none !important;
    }

    .pro-icon {
      width: 14.286%;
      color: white;
      font-size: 24px;
      text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
      text-align: center;
    }
    .pro-icon input {
      width: 24px;
      pointer-events: auto;
    }

    .pro-icon:hover {
      cursor: pointer;
    }

    .settings-bar {
      position: relative;
      width: 100%;
      padding: 10px;
      box-sizing: border-box;
    }

    .pro-icons {
      position: relative;
      display: flex;
      width: 100%;
      padding: 20px;
      box-sizing: border-box;
    }

    .settings, .pro-settings {
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

  hide() {
    const bar = this.shadowRoot.querySelector('#settings-bar');
    let panes = Array.from(bar.children);
    panes.forEach(pane => {
      pane.classList.add('hidden');
    });
  }

  _toggleGroup(e) {
    const id = e.target.getAttribute('for');
    if (!id) return;

    this.activePane = null;

    if (id == "torch") {
      this.flash = !this.flash;
      const constraints = { advanced: [{ torch: this.flash}] };
      this.dispatchEvent(new CustomEvent('constraintschange', { detail: constraints }));
      this.hide();
      return;
    }

    const bar = this.shadowRoot.querySelector('#settings-bar');
    const pane = this.shadowRoot.querySelector(`#${id}Settings`);

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

  _colorTemperatureChange(e) {
    // See WB ranges: https://w3c.github.io/mediacapture-image/#white-balance-mode
    let iconName = '';
    const value = e.detail.value;
    switch (true) {
      case (value >= 9000):
        break;
      case (value >= 8000): // Twilight mode.
        iconName = 'brightness_3'; break;
      case (value >= 6500): // Cloudy-daylight mode.
        iconName = 'wb_cloudy'; break;
      case (value >= 5500): // Daylight mode.
        iconName = 'wb_sunny'; break;
      case (value >= 5000):
        break;
      case (value >= 4000): // Fluorescent mode.
        iconName = 'wb_iridescent'; break;
      case (value >= 3500):
        break;
      case (value >= 2500): // Incandescent mode.
        iconName = 'wb_incandescent'; break;
    }
    this.shadowRoot.getElementById('wbIcon').innerText = iconName;
  }

  firstUpdated() {
    const controls = this.shadowRoot.querySelectorAll('settings-slider');
    controls.forEach(control => {
      control.onchange = e => {
        const id = e.target.getAttribute('id');
        const value = e.detail.value;
        console.log(id, ":", value);
  
        let constraints = { advanced: [{}] };
        constraints.advanced[0][id] = value;
        if (id == 'exposureTime')
          constraints.advanced[0]['exposureMode'] = 'manual';
        else if (id == 'focusDistance')
          constraints.advanced[0]['focusMode'] = 'manual';
        else if (id == 'colorTemperature') {
          constraints.advanced[0]['whiteBalanceMode'] = 'manual';
        }
        this.dispatchEvent(new CustomEvent('constraintschange', { detail: { constraints } }));
      };
    });
  }

  reset() {
    const id = this.activePane.getAttribute("id");
    let constraints = { advanced: [{}] };
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
    }

    this.dispatchEvent(new CustomEvent('constraintschange', { detail: { constraints } }));
  }

  render() {
    return html`
      <link href="../css/google-icons.css" rel="stylesheet">
      <div id="settings-bar" @click=${e => e.stopPropagation()}>
        <div id="isoSettings" class="pro-settings hidden">
          <settings-slider label="ISO" id="iso" min="0" max="10" value="0" step="1"></settings-slider>
        </div>
        <div id="exposureTimeSettings" class="pro-settings hidden">
          <settings-slider label="Exposure" id="exposureTime" min="0" max="10" value="0" step="1"></settings-slider>
        </div>
        <div id="focusDistanceSettings" class="pro-settings hidden">
          <settings-slider label="Focus distance" id="focusDistance" min="0" max="10" value="0" step="1"></settings-slider>
        </div>
        <div id="standardSettings" class="pro-settings hidden">
          <settings-slider label="Contrast" id="contrast" min="0" max="10" value="0" step="1"></settings-slider>
          <settings-slider label="Saturation" id="saturation" min="0" max="10" value="0" step="1"></settings-slider>
          <settings-slider label="Sharpness" id="sharpness" min="0" max="10" value="0" step="1"></settings-slider>
          <settings-slider label="Brightness" id="brightness" min="0" max="10" value="0" step="1"></settings-slider>
          <settings-slider label="Exposure Compensation" id="exposureCompensation" min="0" max="10" value="0" step="1"></settings-slider>
        </div>
        <div id="colorTemperatureSettings" class="pro-settings hidden">
          <settings-slider label="Color Temperature" id="colorTemperature" min="0" max="9999" value="0" step="100"
            @change=${this._colorTemperatureChange}>
            <i id="wbIcon" class="material-icons">wb_auto</i>
          </settings-slider>
        </div>
        <div id="zoomSettings" class="pro-settings hidden">
          <settings-slider label="Zoom" id="zoom" min="0" max="10" value="0" step="1"></settings-slider>
        </div>
      </div>
      <div class="pro-icons" @click=${e => { this._toggleGroup(e); e.stopPropagation()}}>
        <i class="material-icons pro-icon" for="iso">iso</i>
        <i class="material-icons pro-icon" for="exposureTime">exposure</i>
        <i class="material-icons pro-icon" for="standard">tune</i>
        <i class="material-icons pro-icon" for="focusDistance">center_focus_strong</i>
        <i class="material-icons pro-icon" for="colorTemperature">ac_unit</i>
        <i class="material-icons pro-icon" for="zoom">zoom_in</i>
        <i class="material-icons pro-icon" for="torch">${this.flash ? "flash_on" : "flash_off"}</i>
      </div>
    `;
  }
}

customElements.define('settings-pane', SettingsPane);