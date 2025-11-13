// Global variables
let textFieldCount = 1;
let currentQRCodeData = '';
let qrHistory = [];
let lastGeneratedData = '';

// Initialize the app
function initApp() {
  loadHistory();
  addTextField(); // Initialize with one text field
}

// Load QR code history from localStorage
function loadHistory() {
  const savedHistory = localStorage.getItem('qrCodeHistory');
  if (savedHistory) {
    qrHistory = JSON.parse(savedHistory);
  }
}

// Save QR code history to localStorage
function saveHistory() {
  localStorage.setItem('qrCodeHistory', JSON.stringify(qrHistory));
}

// Check if QR code data already exists in history
function qrCodeExists(data) {
  return qrHistory.some(item => item.data === data);
}

// Save a new QR code to history only if it doesn't exist
function saveQRCodeToHistory(data) {
  if (qrCodeExists(data)) {
    console.log('QR code already exists in history, not saving duplicate');
    return false;
  }
  
  const newQR = {
    id: Date.now(),
    data: data,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  };
  
  qrHistory.unshift(newQR);
  
  // Keep only the last 50 QR codes
  if (qrHistory.length > 50) {
    qrHistory = qrHistory.slice(0, 50);
  }
  
  saveHistory();
  return true;
}

// Initialize when page loads
window.addEventListener('load', initApp);