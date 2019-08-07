let currentHat = 0;
let currentGlasses = 0;

let hatOrGlassesChanged = false;
let tabsetVisible = false; // To hide/show menu types (hats or glasses).
let tabPanelVisible = true; // To hide/show whole tab panel
let menuVisible = true;

// Hat frame is redrawn when coordinates of the object
// have moved more than 3 pixels.
let jitterLimit = 3;

// #menuSelector switches between these types of menu.
const menuTypes = { hats: '🎩', glasses: '🕶️' };

const resourcesPath = 'resources/';
const virtualObjects = ['hats', 'glasses'];
const hatsData = [
  { file: '0', name: "Pirate hat", scale: 1.3, yOffsetDown: 0.25 },
  { file: '1', name: "Crown", scale: 1.0, yOffsetDown: 0.1 },
  { file: '2', name: "Party hat", scale: 1.3, yOffsetDown: 0.0 },
  { file: '3', name: "Police hat", scale: 1.1, yOffsetDown: 0.2 },
  { file: '4', name: "Green hat", scale: 1.4, yOffsetDown: 0.3 },
  { file: '5', name: "Clown hat", scale: 1.2, yOffsetDown: 0.0 },
  { file: '6', name: "Women's red hat", scale: 1.6, yOffsetDown: 0.5 },
  { file: '7', name: "Cowboy hat", scale: 1.2, yOffsetDown: 0.3 },
  { file: '8', name: "Propeller beanie", scale: 1.5, yOffsetDown: 0.3 },
  { file: '9', name: "Women's pink hat", scale: 1.6, yOffsetDown: 0.5 },
  { file: '10', name: "Top hat", scale: 1.3, yOffsetDown: 0.0 },
  { file: '11', name: "Winter hat", scale: 0.95, yOffsetDown: 0.2 },
  { file: '12', name: "Women's white hat", scale: 1.3, yOffsetDown: 0.4 },
  { file: '13', name: "Red cap", scale: 1.1, yOffsetDown: 0.3 },
  { file: '14', name: "Blue hat", scale: 1.3, yOffsetDown: 0.3 },
  { file: '15', name: "Santa hat", scale: 1.4, yOffsetDown: 0.25 },
  { file: '16', name: "Square academic cap", scale: 1.3, yOffsetDown: 0.25 },
  { file: '17', name: "Viking helmet", scale: 1.9, yOffsetDown: 0.2 },
  { file: '18', name: "Mexican hat", scale: 1.35, yOffsetDown: 0.2 },
  { file: '19', name: "Cat ears", scale: 1.2, yOffsetDown: 0.3 },
  { file: '20', name: "Brown hat", scale: 1.6, yOffsetDown: 0.4 },
];
const glassesData = [
  { file: '0', name: "Deal with it", scale: 1.4, yOffsetUp: 0.5 },
  { file: '1', name: "Harry Potter", scale: 1.2, yOffsetUp: 0.5 },
  { file: '2', name: "Red sunglasses", scale: 1.5, yOffsetUp: 0.6 },
  { file: '3', name: "Glasses with a nose", scale: 1.2, yOffsetUp: 0.3 },
  { file: '4', name: "Round black glasses", scale: 1.1, yOffsetUp: 0.4 },
  { file: '5', name: "3d glasses", scale: 1.4, yOffsetUp: 0.6 },
  { file: '6', name: "Yellow sunglasses", scale: 1.4, yOffsetUp: 0.5 },
  { file: '7', name: "Heart glasses", scale: 1.5, yOffsetUp: 0.8 },
  { file: '8', name: "Round white glasses", scale: 1.2, yOffsetUp: 0.4 },
  { file: '9', name: "Blue sunglasses", scale: 1.4, yOffsetUp: 0.5 },
  { file: '10', name: "Pink sunglasses", scale: 1.4, yOffsetUp: 0.5 },
  { file: '11', name: "Red women's glasses", scale: 1.6, yOffsetUp: 0.8 },
];

function initUI() {
  let menuHeight = parseInt(getComputedStyle(
    document.querySelector('.camera-bar-wrapper')).height);
  getVideoConstraint(menuHeight);
  initStats();
  loadHats();
  loadGlasses();

  // Now we have images and can create menu.
  let menuScript = document.createElement('script');
  menuScript.type = 'text/javascript';
  menuScript.src = '../../utils/menu.js';
  document.body.appendChild(menuScript);

  // Define events for tabset and menu.
  let menuSelector = document.getElementById('menuSelector');
  menuSelector.addEventListener('click', function () {
    if (tabsetVisible) closeTabset();
    else openTabset();
  });
  let hatsTab = document.getElementById('hatsTab');
  hatsTab.addEventListener('click', function () {
    closeTabset();
    document.getElementById('menuSelector').innerText = menuTypes.hats;
    carouselWrappers[1].classList.add('hidden');
    carouselWrappers[0].classList.remove('hidden');
  });
  let glassesTab = document.getElementById('glassesTab');
  glassesTab.addEventListener('click', function () {
    closeTabset();
    document.getElementById('menuSelector').innerText = menuTypes.glasses;
    carouselWrappers[0].classList.add('hidden');
    carouselWrappers[1].classList.remove('hidden');
  });

  // Hide or show images elements by clicking on main canvas.
  canvasOutput.addEventListener('click', function () {
    showOrHideImageElements();
  });

  // Event listener for jitter limit
  let jitterLimitInput = document.getElementById('jitterLimit');
  let jitterLimitOutput = document.getElementById('jitterLimitOutput');
  jitterLimitInput.addEventListener('input', function () {
    jitterLimit = jitterLimitOutput.value = parseInt(jitterLimitInput.value);
  });
  jitterLimitInput.addEventListener('change', function () {
    jitterLimit = jitterLimitOutput.value = parseInt(jitterLimitInput.value);
  });

  // TakePhoto event by clicking takePhotoButton.
  let takePhotoButton = document.getElementById('takePhotoButton');
  takePhotoButton.addEventListener('click', function () {
    // Here we are not using takePhoto() per se.
    // new ImageCapture(videoTrack) gives image without applied filter.
    let dstCanvas = document.getElementById('gallery');
    drawCanvas(dstCanvas, canvasOutput);
  });

  controls = {
    frontCamera: null,
    backCamera: null,
    facingMode: '',
  };

  // TODO(sasha): move to utils.js.
  let facingModeButton = document.getElementById('facingModeButton');
  // Switch to face or environment mode by clicking facingModeButton.
  facingModeButton.addEventListener('click', function () {
    if (controls.facingMode == 'user') {
      controls.facingMode = 'environment';
      videoConstraint.deviceId = { exact: controls.backCamera.deviceId };
      facingModeButton.innerText = 'camera_front';
    } else if (controls.facingMode == 'environment') {
      controls.facingMode = 'user';
      videoConstraint.deviceId = { exact: controls.frontCamera.deviceId };
      facingModeButton.innerText = 'camera_rear';
    }
    utils.stopCamera();
    utils.startCamera(videoConstraint, 'videoInput', startVideoProcessing);
  });
}

function closeTabset() {
  tabsetVisible = false;
  document.getElementById('hatsTab').classList.add("hidden");
  document.getElementById('hatsTabLabel').classList.add("hidden");
  document.getElementById('glassesTab').classList.add("hidden");
  document.getElementById('glassesTabLabel').classList.add("hidden");
}

function openTabset() {
  tabsetVisible = true;
  document.getElementById('hatsTab').classList.remove("hidden");
  document.getElementById('hatsTabLabel').classList.remove("hidden");
  document.getElementById('glassesTab').classList.remove("hidden");
  document.getElementById('glassesTabLabel').classList.remove("hidden");
}

function showMenu() {
  menuVisible = true;
  if (document.getElementById('menuSelector').innerText == menuTypes.hats)
    carouselWrappers[0].classList.remove('hidden');
  else carouselWrappers[1].classList.remove('hidden');
  window.onresize();
}

function hideMenu() {
  menuVisible = false;
  if (document.getElementById('menuSelector').innerText == menuTypes.hats)
    carouselWrappers[0].classList.add('hidden');
  else carouselWrappers[1].classList.add('hidden');
}

function showOrHideImageElements() {
  if (tabPanelVisible) {
    document.getElementsByClassName('tabset')[0].classList.add("hidden");
    hideMenu();
  } else {
    document.getElementsByClassName('tabset')[0].classList.remove("hidden");
    showMenu();
  }
  tabPanelVisible = !tabPanelVisible;
}

// TODO(sasha): 1. Check image licences;
// 2. Optimize images(size,resolution,etc) and loading
function loadHats() {
  let hatSrc = null;
  hatsData.forEach(function (object, i) {
    let hatImage = createImgNode(`hat${object.file}`, 'hatsCarousel');

    hatImage.addEventListener('click', function () {
      // Remove old image border.
      document.getElementById(`hat${currentHat}`).style.borderStyle = 'none';
      hatImage.style.borderStyle = 'solid'; // Draw new image border.

      currentHat = i;
      hatOrGlassesChanged = true;
    });

    hatImage.onload = function () {
      let rgbaVector = new cv.MatVector();
      hatSrc = cv.imread(hatImage);
      cv.split(hatSrc, rgbaVector); // Create mask from alpha channel.
      object.src = hatSrc;
      object.mask = rgbaVector.get(3);
      rgbaVector.delete();
    };
    hatImage.src =
      resourcesPath + virtualObjects[0] + '/' + object.file + '.png';
  });
}

function loadGlasses() {
  let glassesSrc = null;
  glassesData.forEach(function (object, i) {
    let glassesImage =
      createImgNode(`glasses${object.file}`, 'glassesCarousel');

    glassesImage.addEventListener('click', function () {
      document.getElementById(`glasses${currentGlasses}`).style.borderStyle
        = 'none'; // Remove old image border.
      glassesImage.style.borderStyle = 'solid'; // Draw new image border.

      currentGlasses = i;
      hatOrGlassesChanged = true;
    });

    glassesImage.onload = function () {
      let rgbaVector = new cv.MatVector();
      glassesSrc = cv.imread(glassesImage);
      cv.split(glassesSrc, rgbaVector); // Create mask from alpha channel.
      object.src = glassesSrc;
      object.mask = rgbaVector.get(3);
      rgbaVector.delete();
    };
    glassesImage.src =
      resourcesPath + virtualObjects[1] + '/' + object.file + '.png';
  });
}

function createImgNode(id, carouselName) {
  let liNode = document.createElement('li');
  liNode.classList.add('card');
  let imgNode = document.createElement('img');
  imgNode.id = id;
  imgNode.classList.add('small-canvas');
  liNode.appendChild(imgNode);
  document.getElementById(carouselName).appendChild(liNode);
  return imgNode;
}

function deleteHats() {
  hatsData.forEach(function (object) {
    object.src.delete(); object.mask.delete();
  });
}

function deleteGlasses() {
  glassesData.forEach(function (object) {
    object.src.delete(); object.mask.delete();
  });
}

function initTabSet() {
  let tabset = document.getElementsByClassName('tabset')[0];
  tabset.style.top =
    `${video.height - tabset.offsetHeight - carousels[0].offsetHeight}px`;
  tabset.style.width = `${video.width}px`;
}

// Resize width of carousel on window resizing.
window.onresize = function () {
  resizeMenu();
};
