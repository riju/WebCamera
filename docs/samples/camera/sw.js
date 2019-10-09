/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "samples/camera/base-element-1a1143a0.js",
    "revision": "c76d2cf96b052aa7ee27f0a7cb2e0720"
  },
  {
    "url": "samples/camera/camera-view.js",
    "revision": "63dc9f16d450792230fce9d27cc86d43"
  },
  {
    "url": "samples/camera/index.html",
    "revision": "1cbaf72c176bbbf57936da88d1dc25fe"
  },
  {
    "url": "samples/camera/inline-entry.0.js",
    "revision": "d4ac8907ffb933632295070c38353239"
  },
  {
    "url": "samples/camera/js/camera-view.js",
    "revision": "68b4a142f28f7fb3c045825dec0e7df9"
  },
  {
    "url": "samples/camera/js/settings-pane.js",
    "revision": "92fbb953dba36be0fb040bd9e9f7209e"
  },
  {
    "url": "samples/camera/js/settings-slider.js",
    "revision": "4b86c9186d0c99e39e1c8c6e183fdfd7"
  },
  {
    "url": "samples/camera/polyfills/custom-elements-es5-adapter.84b300ee818dce8b351c7cc7c100bcf7.js",
    "revision": "cff507bc95ad1d6bf1a415cc9c8852b0"
  },
  {
    "url": "samples/camera/polyfills/dynamic-import.b745cfc9384367cc18b42bbef2bbdcd9.js",
    "revision": "ed55766050be285197b8f511eacedb62"
  },
  {
    "url": "samples/camera/polyfills/webcomponents.cc3976af76b5e726e2a7e86686c930f1.js",
    "revision": "6d41a7c92156aec243e9ce5680bdf517"
  },
  {
    "url": "samples/css/camera-bar.css",
    "revision": "55631ebbac3f43a94929e127d5574294"
  },
  {
    "url": "samples/css/doxygen.css",
    "revision": "1968fd946d1d63d06b7ca1d97c714063"
  },
  {
    "url": "samples/css/google-icons.css",
    "revision": "a46f730e8b5715865cdf1276d391707b"
  },
  {
    "url": "samples/css/menu.css",
    "revision": "98164df05d5ba07f6488232239423044"
  },
  {
    "url": "samples/index.html",
    "revision": "b4893b9efd6889147963747111bde373"
  },
  {
    "url": "utils/utils.js",
    "revision": "08271556a5cb42b6c9d65c5835bcd745"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
