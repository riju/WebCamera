let stats = null;

let hatsData = [];
let hatSrc = null;
let hatMask = null;
let currentHat = 0;
let hatsNum = document.getElementsByClassName('hat-image').length;

let glassesData = [];
let glassesSrc = null;
let glassesMask = null;
let currentGlasses = 0;
let glassesNum = document.getElementsByClassName('glasses-image').length;

let objectChanged = false;

function initUI() {
  initStats();
  loadHats();
  loadGlasses();
  // choose initial hat and glasses
  hatSrc = hatsData[currentHat].src.clone();
  hatMask = hatsData[currentHat].mask.clone();
  glassesSrc = glassesData[currentGlasses].src.clone();
  glassesMask = glassesData[currentGlasses].mask.clone();
  // now we have canvases and can create menu
  let menuScript = document.createElement('script');
  menuScript.type = 'text/javascript';
  menuScript.src = '../../utils/menu.js';
  document.body.appendChild(menuScript);
}

function loadHats() {
  let rgbaVector = new cv.MatVector();
  for (let i = 0; i < hatsNum; i++) {
    let img = document.getElementById(`hat${i}`);
    hatSrc = cv.imread(img);
    let scale = Number(img.dataset.scaleFactor);
    let yOffset = Number(img.dataset.yOffset);
    let name = img.dataset.name;
    let hatNode = createNode(name, 'hatsCarousel');
    // add event listener to menu canvas
    hatNode.addEventListener('click', function () {
      hatSrc.delete(); hatMask.delete();
      currentHat = i;
      hatSrc = hatsData[currentHat].src.clone();
      hatMask = hatsData[currentHat].mask.clone();
      objectChanged = true;
    });
    // create mask from alpha channel
    cv.split(hatSrc, rgbaVector);
    // push hat to array of hats
    hatsData.push({
      name: name, src: hatSrc.clone(),
      mask: rgbaVector.get(3).clone(), scale: scale, yOffset: yOffset
    });
    cv.imshow(hatNode, hatSrc);
  }
  rgbaVector.delete();
}

function loadGlasses() {
  let rgbaVector = new cv.MatVector();
  for (let i = 0; i < glassesNum; i++) {
    let img = document.getElementById(`glasses${i}`);
    glassesSrc = cv.imread(img);
    let scale = Number(img.dataset.scaleFactor);
    let yOffset = Number(img.dataset.yOffset);
    let name = img.dataset.name;
    let glassesNode = createNode(name, 'glassesCarousel');
    // add event listener to menu canvas
    glassesNode.addEventListener('click', function () {
      glassesSrc.delete(); glassesMask.delete();
      currentGlasses = i;
      glassesSrc = glassesData[currentGlasses].src.clone();
      glassesMask = glassesData[currentGlasses].mask.clone();
      objectChanged = true;
    });
    // create mask from alpha channel
    cv.split(glassesSrc, rgbaVector);
    // push glasses to array of glasses
    glassesData.push({
      name: name, src: glassesSrc.clone(),
      mask: rgbaVector.get(3).clone(), scale: scale, yOffset: yOffset
    });
    cv.imshow(glassesNode, glassesSrc);
  }
  rgbaVector.delete();
}

function createNode(name, carouselName) {
  let liNode = document.createElement('li');
  liNode.classList.add('card');
  liNode.setAttribute('data-target', 'card');
  let divNode = document.createElement('div');
  let canvasNode = document.createElement('canvas');
  canvasNode.classList.add('small-canvas');
  divNode.appendChild(canvasNode);
  liNode.appendChild(divNode);
  let liText = document.createTextNode(name);
  liNode.appendChild(liText);
  document.getElementById(carouselName).appendChild(liNode);
  return canvasNode;
}

function deleteHats() {
  for (let i = 0; i < hatsData.length; i++) {
    hatsData[i].src.delete();
    hatsData[i].mask.delete();
  }
}

function deleteGlasses() {
  for (let i = 0; i < glassesData.length; i++) {
    glassesData[i].src.delete();
    glassesData[i].mask.delete();
  }
}

function resizeTabSet() {
  document.getElementsByClassName("tabset")[0].style.width = `${width}px`;
}
