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
    "url": "build/wasm/opencv_js.worker.js",
    "revision": "f95a202fe0e8fa623bb12f96ccdd2178"
  },
  {
    "url": "build/wasm/opencv.js",
    "revision": "1f1ec76d2afb0a91ca267610e25d0b0f"
  },
  {
    "url": "data/classifiers/haarcascade_eye.xml",
    "revision": "ece2c63a648de8978173df40f9831e00"
  },
  {
    "url": "data/classifiers/haarcascade_frontalface_default.xml",
    "revision": "663f963eabf3df6eb215c50ff06bcc22"
  },
  {
    "url": "data/google_icons_font.woff2",
    "revision": "0509ab09c1b0d2200a4135803c91d6ce"
  },
  {
    "url": "data/photo_camera_192.png",
    "revision": "89c3e03b3ad202c36c4f601ad987f97a"
  },
  {
    "url": "libs/adapter-latest.js",
    "revision": "4153182069a4df2b3d9be6c02de9fdc8"
  },
  {
    "url": "libs/dat.gui.min.js",
    "revision": "a4a57da65af836dbfe3b319ea4017984"
  },
  {
    "url": "libs/stats.min.js",
    "revision": "929122621ee5a424a212bfdb62288c7d"
  },
  {
    "url": "samples/camera/index.html",
    "revision": "ab8ddda107371ab37ef7804f0f511c54"
  },
  {
    "url": "samples/camera/js/index.js",
    "revision": "ae69fa57cebbc8786294c8c59775282d"
  },
  {
    "url": "samples/camera/js/ui.js",
    "revision": "f2ac4ba06186ac416464e2d3f499e0c5"
  },
  {
    "url": "samples/cardScanner/index.html",
    "revision": "4273f7f0fcab6b9f8fec4a7842da273c"
  },
  {
    "url": "samples/cardScanner/js/cardProcessing.js",
    "revision": "fb3048227124b3c4fd3f6bd83dbc966e"
  },
  {
    "url": "samples/cardScanner/js/index.js",
    "revision": "ffa9988a1bad3814c95ccf08a42e6855"
  },
  {
    "url": "samples/cardScanner/resources/card_1.png",
    "revision": "e95331187dd4845286fb4df611596780"
  },
  {
    "url": "samples/cardScanner/resources/card_2.png",
    "revision": "dfd6a8175cfa78cfaa78a2c113cfba62"
  },
  {
    "url": "samples/cardScanner/resources/card_3.png",
    "revision": "8b6acbf31ff1e3919abb8f9bdf356c09"
  },
  {
    "url": "samples/cardScanner/resources/card_5.png",
    "revision": "632980febaaa34839372d4d898ea96bf"
  },
  {
    "url": "samples/cardScanner/resources/ocr_digits.png",
    "revision": "3fd91c7e08e68a7615c683741fed38db"
  },
  {
    "url": "samples/css/base.css",
    "revision": "055a38f7298097b891e9f50776d573d9"
  },
  {
    "url": "samples/css/camera-bar.css",
    "revision": "6144959cf2690a16f150b6f288d6bda6"
  },
  {
    "url": "samples/css/doxygen.css",
    "revision": "97b2ca6896fb7607e51df1f10d49ed41"
  },
  {
    "url": "samples/css/google-icons.css",
    "revision": "42c7e2d1288f3ae8b124e509e830cfd5"
  },
  {
    "url": "samples/css/menu.css",
    "revision": "e77e40cdf18348565b4787e40bdbad98"
  },
  {
    "url": "samples/css/settings.css",
    "revision": "fa14d437627c6dca843de3deb0dde882"
  },
  {
    "url": "samples/css/style.css",
    "revision": "3d2168dc810bb2435b0ece19389ac1f8"
  },
  {
    "url": "samples/exposureTime/index.html",
    "revision": "810978699d2d986a5f4dc61b7cae9bec"
  },
  {
    "url": "samples/faceDetection/index.html",
    "revision": "b3167bceca6ae046167b2205e929b7a4"
  },
  {
    "url": "samples/faceDetection/index.js",
    "revision": "9e1ab4f05af3e8c1dd7db3443cec19bb"
  },
  {
    "url": "samples/filters/index.html",
    "revision": "b0ebbb9035a01fca3ee854738904dbd9"
  },
  {
    "url": "samples/filters/js/filters.js",
    "revision": "8d4868bd2ff0e69231f54c4b02e89f6c"
  },
  {
    "url": "samples/filters/js/index.js",
    "revision": "ae3e351b5863787c7efbd6bc1f29942d"
  },
  {
    "url": "samples/filters/js/ui.js",
    "revision": "c6d2ed6299034a4fdaeb16e6ba64680f"
  },
  {
    "url": "samples/focusDistance/index.html",
    "revision": "810978699d2d986a5f4dc61b7cae9bec"
  },
  {
    "url": "samples/funnyHats/css/tabs.css",
    "revision": "29b2affff178b0372a74defb27239fb7"
  },
  {
    "url": "samples/funnyHats/index.html",
    "revision": "3ebb07b02f2285a5d17f334c229562a6"
  },
  {
    "url": "samples/funnyHats/js/hatsAndGlassesProcessing.js",
    "revision": "58454faa0b63912eeaa2ce9a5d01de58"
  },
  {
    "url": "samples/funnyHats/js/index.js",
    "revision": "0d91fd146e9f6197a96b510caa0efde1"
  },
  {
    "url": "samples/funnyHats/js/ui.js",
    "revision": "676d42801ff29a2cc45074865db7554e"
  },
  {
    "url": "samples/funnyHats/resources/glasses/0.png",
    "revision": "4488e3f40fc71a184e77d5662422f0ad"
  },
  {
    "url": "samples/funnyHats/resources/glasses/1.png",
    "revision": "e663a0b248f6fa2b004573e6eec530a6"
  },
  {
    "url": "samples/funnyHats/resources/glasses/10.png",
    "revision": "bb39f9233e61acf21fcb7752a5605aeb"
  },
  {
    "url": "samples/funnyHats/resources/glasses/11.png",
    "revision": "8afe7b5b67451c853a60cac2574c591f"
  },
  {
    "url": "samples/funnyHats/resources/glasses/2.png",
    "revision": "911f8c351103e2db77174c9219bd910a"
  },
  {
    "url": "samples/funnyHats/resources/glasses/3.png",
    "revision": "585cbfa0bc573d15dcc2ad1f30ed16d5"
  },
  {
    "url": "samples/funnyHats/resources/glasses/4.png",
    "revision": "e41a9583f86f141f2f6ad98be0080577"
  },
  {
    "url": "samples/funnyHats/resources/glasses/5.png",
    "revision": "39ea3db3e476bca9f8cb054e6a5ab513"
  },
  {
    "url": "samples/funnyHats/resources/glasses/6.png",
    "revision": "c05e3dc0d703b60eceea7cad872bd0d1"
  },
  {
    "url": "samples/funnyHats/resources/glasses/7.png",
    "revision": "2c8e84f39a32057de43cc2a2791d6658"
  },
  {
    "url": "samples/funnyHats/resources/glasses/8.png",
    "revision": "7bea84f9dbafb4d7ee26019d6cb5a81d"
  },
  {
    "url": "samples/funnyHats/resources/glasses/9.png",
    "revision": "3ee0518cc1d43dab88f2de80ff9fb9f8"
  },
  {
    "url": "samples/funnyHats/resources/hats/0.png",
    "revision": "9176ac5d455027a6c3f9937da7db054e"
  },
  {
    "url": "samples/funnyHats/resources/hats/1.png",
    "revision": "e749c42d9daa8a085e18b3d0069e6c0d"
  },
  {
    "url": "samples/funnyHats/resources/hats/10.png",
    "revision": "00118e88c31a5b2ae29ca7fa4e28673e"
  },
  {
    "url": "samples/funnyHats/resources/hats/11.png",
    "revision": "b751d6e7e640b93bf566d1593a87d2df"
  },
  {
    "url": "samples/funnyHats/resources/hats/12.png",
    "revision": "972811dbb3058a1ed59c467e4fcb27cd"
  },
  {
    "url": "samples/funnyHats/resources/hats/13.png",
    "revision": "2aa433348f1fd6e0b2989a50b3cc35e6"
  },
  {
    "url": "samples/funnyHats/resources/hats/14.png",
    "revision": "3bd5eeba309a5833685912dcffdab595"
  },
  {
    "url": "samples/funnyHats/resources/hats/15.png",
    "revision": "d49238abc8b1a79285a24bb929dd136a"
  },
  {
    "url": "samples/funnyHats/resources/hats/16.png",
    "revision": "d02e8b21b3822006f9566fd53017e3fc"
  },
  {
    "url": "samples/funnyHats/resources/hats/17.png",
    "revision": "1ff6a6030ce67337f8b39dfbf697e9d2"
  },
  {
    "url": "samples/funnyHats/resources/hats/18.png",
    "revision": "f8f6a113658b15b51fb27bac275d4fa2"
  },
  {
    "url": "samples/funnyHats/resources/hats/19.png",
    "revision": "ed7bac73ff98cc34b817a9efd73125a8"
  },
  {
    "url": "samples/funnyHats/resources/hats/2.png",
    "revision": "0a9425dddacf60f8caef79416099c900"
  },
  {
    "url": "samples/funnyHats/resources/hats/20.png",
    "revision": "13bb289361cede296b9e8fdb5ab439c0"
  },
  {
    "url": "samples/funnyHats/resources/hats/3.png",
    "revision": "bbbd290c8279ccb1c4e29ee4467c2828"
  },
  {
    "url": "samples/funnyHats/resources/hats/4.png",
    "revision": "b3a75f3bb23df812c880689e12a722ea"
  },
  {
    "url": "samples/funnyHats/resources/hats/5.png",
    "revision": "667627b9dd1af3b6b22e0bed23ce9143"
  },
  {
    "url": "samples/funnyHats/resources/hats/6.png",
    "revision": "e47f0137a02cfb0e6534f7bcd8bb8000"
  },
  {
    "url": "samples/funnyHats/resources/hats/7.png",
    "revision": "56f3f391f6f6ee75c6a80987d3317839"
  },
  {
    "url": "samples/funnyHats/resources/hats/8.png",
    "revision": "10bec3051452e1d73c73347542886c5d"
  },
  {
    "url": "samples/funnyHats/resources/hats/9.png",
    "revision": "c653beff9c0c00330463f6a677b23651"
  },
  {
    "url": "samples/hdr/index-wasm.html",
    "revision": "7d49526ae1de32dc0eac32cf93ebe674"
  },
  {
    "url": "samples/hdr/index.html",
    "revision": "932bfa1e18a4a848fbf977cb9e67e7b2"
  },
  {
    "url": "samples/hdr/js/index.js",
    "revision": "fbf73df0036700b735f3b663d86bc2b2"
  },
  {
    "url": "samples/index.html",
    "revision": "54dc90dbff3698e1b25e0c251b566310"
  },
  {
    "url": "samples/panTilt/index.html",
    "revision": "f8ed3e51cad82b5ecb3dc98524efa6e1"
  },
  {
    "url": "utils/menu.js",
    "revision": "0fed4250bd7727334c130e451b38b3d8"
  },
  {
    "url": "utils/statsInit.js",
    "revision": "e5e0e96d88631259ad9fb63d5b40bed8"
  },
  {
    "url": "utils/utils.js",
    "revision": "4667efab20e6732bf46a78b637aa36e3"
  },
  {
    "url": "workbox-config.js",
    "revision": "3e7f259e9451ad3c9dc86628a1200196"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
