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
    "revision": "f95a202fe0e8fa623bb12f96ccdd2178"
  },
  {
    "url": "build/wasm/desktop/opencv.js",
    "revision": "1f1ec76d2afb0a91ca267610e25d0b0f"
  },
  {
    "url": "build/wasm/mobile/opencv_js.js",
    "revision": "dde8b81808a09bef12c299d62edf2662"
  },
  {
    "url": "build/wasm/mobile/opencv.js",
    "revision": "0d450250f1648b3131eefc06e55aab50"
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
    "revision": "d25636e20299a4658f7cf0981d5b3c33"
  },
  {
    "url": "samples/camera/js/index.js",
    "revision": "ae69fa57cebbc8786294c8c59775282d"
  },
  {
    "url": "samples/camera/js/ui.js",
    "revision": "4ec635f238949ed4778c1b1a2eb0828e"
  },
  {
    "url": "samples/cardScanner/index.html",
    "revision": "58827dddfdc8ff6f48d1e4d573e5542f"
  },
  {
    "url": "samples/cardScanner/js/cardProcessing.js",
    "revision": "3ef137d875542bd97f3c526837fa44e1"
  },
  {
    "url": "samples/cardScanner/js/index.js",
    "revision": "19703183f2bff8f244eca22d9999e307"
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
    "revision": "94bfb3785de9d6cf9a518b2d123755ec"
  },
  {
    "url": "samples/css/camera-bar.css",
    "revision": "52680ca8e4993b41051efa7745480eb8"
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
    "revision": "b21bdc465df0b9e5bbce4abd0ad67b12"
  },
  {
    "url": "samples/css/settings.css",
    "revision": "190e10486aa5bb56bcbc0a0ab6211d11"
  },
  {
    "url": "samples/css/style.css",
    "revision": "3d2168dc810bb2435b0ece19389ac1f8"
  },
  {
    "url": "samples/docScanner/index.html",
    "revision": "8db980b677d4f90b539330b0afcc4714"
  },
  {
    "url": "samples/docScanner/js/docProcessing.js",
    "revision": "c004aa5ae43b8ab7f273c9ad60546055"
  },
  {
    "url": "samples/docScanner/js/index.js",
    "revision": "204e08dc253651f3a2676a30eace6288"
  },
  {
    "url": "samples/exposureTime/index.html",
    "revision": "810978699d2d986a5f4dc61b7cae9bec"
  },
  {
    "url": "samples/faceDetection/index.html",
    "revision": "5606908a9e654c9761aee78515dbe74a"
  },
  {
    "url": "samples/faceDetection/index.js",
    "revision": "96994b2981767ea5a88ce3182740dceb"
  },
  {
    "url": "samples/filters/index.html",
    "revision": "a8c7521e82c31d4eaedeeb1b4becd3c6"
  },
  {
    "url": "samples/filters/js/filters.js",
    "revision": "8d4868bd2ff0e69231f54c4b02e89f6c"
  },
  {
    "url": "samples/filters/js/index.js",
    "revision": "22d4ac0e4eddf0b65ebb37bb8964e974"
  },
  {
    "url": "samples/filters/js/ui.js",
    "revision": "8d1b3d57758d31b4605fc22322b3f651"
  },
  {
    "url": "samples/focusDistance/index.html",
    "revision": "810978699d2d986a5f4dc61b7cae9bec"
  },
  {
    "url": "samples/funnyHats/css/tabs.css",
    "revision": "0a5518f764e366770a1f1b848cb97957"
  },
  {
    "url": "samples/funnyHats/index.html",
    "revision": "814ca6774984f50c052757d75b5501b7"
  },
  {
    "url": "samples/funnyHats/js/hatsAndGlassesProcessing.js",
    "revision": "4ea01496366956be2499e17534dda220"
  },
  {
    "url": "samples/funnyHats/js/index.js",
    "revision": "a0efa3b6bb2ce1e151d9f79af2eb06ef"
  },
  {
    "url": "samples/funnyHats/js/ui.js",
    "revision": "5c00683a4b45007ed9ae927748b64e25"
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
    "revision": "e66db9713c364c0beec49701bdbd27da"
  },
  {
    "url": "samples/panTilt/index.html",
    "revision": "f8ed3e51cad82b5ecb3dc98524efa6e1"
  },
  {
    "url": "utils/menu.js",
    "revision": "9299056aa4e04020f3a366923cf58cb4"
  },
  {
    "url": "utils/statsInit.js",
    "revision": "e5e0e96d88631259ad9fb63d5b40bed8"
  },
  {
    "url": "utils/utils.js",
    "revision": "9232d3ca9cd45dae151ca7cac4de7e4e"
  },
  {
    "url": "workbox-config.js",
    "revision": "3264bc8fe7f96396d9e067d5bde4eed6"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
