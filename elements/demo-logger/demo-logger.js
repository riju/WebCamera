import { html, css, LitElement } from '../../node_modules/lit-element';

import '../../node_modules/@material/mwc-snackbar';

class DemoLogger extends LitElement {
  firstUpdated() {
    const snackbar = this.shadowRoot.querySelector('#errorSnackbar');

    let log = console.error;
    console.error = (...messages) => {
      snackbar.labelText = messages.join(" ");
      snackbar.open();
      log.call(console, ...messages);
    }
  }

  render() {
    return html`
    <mwc-snackbar id="errorSnackbar"
      labelText="Some internal error happened">
    </mwc-snackbar>
    `;
  }
}

customElements.define('demo-logger', DemoLogger);