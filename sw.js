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
    "url": "build/wasm/desktop/opencv_js.worker.js",
    "revision": "e4275d159d55a14cebb567bf27557533"
  },
  {
    "url": "build/wasm/desktop/opencv.js",
    "revision": "2d92b97e42c79b3253924bf55ade66ce"
  },
  {
    "url": "build/wasm/mobile/opencv_js.js",
    "revision": "1b73209d47ad04f258486f749c41e601"
  },
  {
    "url": "build/wasm/mobile/opencv.js",
    "revision": "72bbdda4ac0c91b04018cb524f55f543"
  },
  {
    "url": "data/classifiers/haarcascade_eye.xml",
    "revision": "2d6fac0caaec1f9558872755ff34818d"
  },
  {
    "url": "data/classifiers/haarcascade_frontalface_default.xml",
    "revision": "a03f92a797e309e76e6a034ab9e02616"
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
    "revision": "3c04f87e5422cc851fca358dc2eb30ee"
  },
  {
    "url": "libs/dat.gui.min.js",
    "revision": "71ce89f002ba241ca5d36d6b04d496d1"
  },
  {
    "url": "libs/stats.min.js",
    "revision": "7ca0e502ddf12b4130a98c9b8fa1bfca"
  },
  {
    "url": "samples/camera/index.html",
    "revision": "43a62969dbdcb8b5ab53649eca021bc9"
  },
  {
    "url": "samples/camera/js/index.js",
    "revision": "9d9363474e6b4baf2b6551350c49b7b3"
  },
  {
    "url": "samples/camera/js/ui.js",
    "revision": "0f741139df7d30342be336ab1b0153d6"
  },
  {
    "url": "samples/cardScanner/index.html",
    "revision": "495797f60cc8c7f2fbff4e666ccec990"
  },
  {
    "url": "samples/cardScanner/js/cardProcessing.js",
    "revision": "ede284ab222b962b6f631d2046bf1fc5"
  },
  {
    "url": "samples/cardScanner/js/index.js",
    "revision": "b33a18d9cefd20868bdc9a80ef25f17a"
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
    "revision": "05b00e682f0c6da0a6d54584482934ad"
  },
  {
    "url": "samples/css/camera-bar.css",
    "revision": "42266c555fac5339f5cd26d94bb4a156"
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
    "revision": "9720fcdabde003569ad4669d7ddb215f"
  },
  {
    "url": "samples/css/settings.css",
    "revision": "6aec958c6df0013a01002e53f1d95e41"
  },
  {
    "url": "samples/css/style.css",
    "revision": "45176e45131938c24a353adfbb7e9c9c"
  },
  {
    "url": "samples/exposureTime/index.html",
    "revision": "b0fb53c53564f0e867fa2c8175b8c84c"
  },
  {
    "url": "samples/faceDetection/index.html",
    "revision": "194f26b57a9f0b5aa35bca20e79c6610"
  },
  {
    "url": "samples/faceDetection/index.js",
    "revision": "b2df3cc680ddebb1bf8463d5791fa831"
  },
  {
    "url": "samples/filters/index.html",
    "revision": "7378ae751651260e840b46f7a8a23377"
  },
  {
    "url": "samples/filters/js/filters.js",
    "revision": "44a74768a62cd6b41a771b4cfcfee803"
  },
  {
    "url": "samples/filters/js/index.js",
    "revision": "ac5deb09a4c30577b6dc10b1d1ea216f"
  },
  {
    "url": "samples/filters/js/ui.js",
    "revision": "47e74deabc2860ff72bf089e8117b55d"
  },
  {
    "url": "samples/focusDistance/index.html",
    "revision": "b0fb53c53564f0e867fa2c8175b8c84c"
  },
  {
    "url": "samples/funnyHats/css/tabs.css",
    "revision": "4cf5b05c26baa6ac32459a00c4688310"
  },
  {
    "url": "samples/funnyHats/index.html",
    "revision": "f25962e3156ab85fc60f6596898cad1b"
  },
  {
    "url": "samples/funnyHats/js/hatsAndGlassesProcessing.js",
    "revision": "751c5923b1916f28727816bb1b466f55"
  },
  {
    "url": "samples/funnyHats/js/index.js",
    "revision": "d9b0360e2af15732a669f2c94905a30e"
  },
  {
    "url": "samples/funnyHats/js/ui.js",
    "revision": "af160f42d4d4c1117e0cc88e62e7f6d7"
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
    "revision": "c5d48a88e411f2e99266888404d9a3f6"
  },
  {
    "url": "samples/hdr/index.html",
    "revision": "32c3c818a8cf669513f21a5999c670c6"
  },
  {
    "url": "samples/hdr/js/index.js",
    "revision": "a746941d8649ecb620f06b3321d3b8b3"
  },
  {
    "url": "samples/index.html",
    "revision": "4ffde3417540b435efa8cb6f115a74ac"
  },
  {
    "url": "samples/panTilt/index.html",
    "revision": "0c4f20a1f585b273476e29db2d7e94ee"
  },
  {
    "url": "utils/menu.js",
    "revision": "c54b9dc4832340a0f3eddc6c34f235da"
  },
  {
    "url": "utils/statsInit.js",
    "revision": "eb7250e9a01017fe1502f03b80ccafdf"
  },
  {
    "url": "utils/utils.js",
    "revision": "281110b7dfd300e191d1ef9f4678d677"
  },
  {
    "url": "workbox-config.js",
    "revision": "8cdce8194c7e870938ce82fbd85d1ae5"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
