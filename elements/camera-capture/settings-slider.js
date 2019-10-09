import { html, css, LitElement } from '../../node_modules/lit-element';
import { classMap } from '../../node_modules/lit-html/directives/class-map';
import '../../node_modules/@material/mwc-slider';

class SettingsSlider extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      margin: 6px;
    }

    mwc-slider {
      min-width: 140px;
      padding: 0px 12px;
    }

    .title {
      width: 120px;
    }

    .value {
      min-width: 60px;
      text-align: left;
    }

    .disabled {
      opacity: 0.5;
      color: gray;
    }
  `;

  static get properties() {
    return { 
      label: { type: String },
      value: { type: Number, reflect: true },
      min: { type: Number },
      max: { type: Number },
      step: { type: Number },
      disabled: { type: Boolean }
    };
  }

  _onchange(e) {
    this.value = e.detail.value;
    console.log(this.value);
    this.dispatchEvent(new CustomEvent('change', { detail: {value: this.value} }));
  }

  layout() {
    this.shadowRoot.querySelector('#slider').layout();
  }

  render() {
    return html`
      <div class=${classMap({ title: true, disabled: this.disabled})}>${this.label}:</div>
      <mwc-slider id="slider" discrete markers ?disabled=${this.disabled}
        value=${this.value || 0}
        min=${this.min || 0}
        max=${this.max || 10}
        step=${this.step || 1}
        @MDCSlider:change=${this._onchange}>
      </mwc-slider>
      <div class=${classMap({ value: true, disabled: this.disabled})}>
        ${this.value}
        <slot></slot>
      </div>
    `;
  }
}

customElements.define('settings-slider', SettingsSlider);