// Screen navigation functions
function showSplash() {
  document.getElementById('splashScreen').style.display = 'flex';
  document.getElementById('generatorContainer').style.display = 'none';
  document.getElementById('scannerContainer').style.display = 'none';
  document.getElementById('historyContainer').style.display = 'none';
}

function showGenerator() {
  document.getElementById('splashScreen').style.display = 'none';
  document.getElementById('generatorContainer').style.display = 'block';
  document.getElementById('scannerContainer').style.display = 'none';
  document.getElementById('historyContainer').style.display = 'none';
}

function showScanner() {
  document.getElementById('splashScreen').style.display = 'none';
  document.getElementById('generatorContainer').style.display = 'none';
  document.getElementById('scannerContainer').style.display = 'block';
  document.getElementById('historyContainer').style.display = 'none';
}

function showHistory() {
  document.getElementById('splashScreen').style.display = 'none';
  document.getElementById('generatorContainer').style.display = 'none';
  document.getElementById('scannerContainer').style.display = 'none';
  document.getElementById('historyContainer').style.display = 'block';
  displayHistory();
}