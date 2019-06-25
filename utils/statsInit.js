function initStats () {
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.domElement);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.right = '0px';
  stats.domElement.style.top = '0px';
  stats.domElement.classList.add("hidden");

  let statsCheckbox = document.getElementById('hideStats');
  statsCheckbox.addEventListener('change', function () {
    if (statsCheckbox.checked) {
      stats.domElement.classList.add('hidden');
    } else {
      stats.domElement.classList.remove('hidden');
    }
  });
  statsCheckbox.classList.remove('hidden');
  document.getElementById('hideStatsLabel').classList.remove('hidden');
}