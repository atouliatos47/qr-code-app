// QR Scanner functions
let videoStream = null;
let scanningActive = false;
let scanAnimation = null;

async function startScanner() {
  const video = document.getElementById('scanner-video');
  const canvas = document.getElementById('scanner-canvas');
  const scannerPlaceholder = document.querySelector('.scanner-placeholder');
  const scannerVideoContainer = document.querySelector('.scanner-video-container');
  const stopButton = document.getElementById('stop-scanner-btn');
  const startButton = document.getElementById('start-scanner-btn');
  
  try {
    // Request camera access
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } // Use back camera on mobile
    });
    
    videoStream = stream;
    video.srcObject = stream;
    
    // Hide placeholder, show video
    scannerPlaceholder.style.display = 'none';
    scannerVideoContainer.style.display = 'block';
    stopButton.style.display = 'inline-block';
    startButton.style.display = 'none';
    
    // Start scanning when video is ready
    video.addEventListener('loadedmetadata', () => {
      video.play();
      scanningActive = true;
      scanQRCode(video, canvas);
    });
    
    showNotification('Camera started. Point at a QR code to scan.', 'success');
    
  } catch (error) {
    console.error('Camera error:', error);
    
    if (error.name === 'NotAllowedError') {
      showNotification('Camera access denied. Please allow camera permission.', 'error');
    } else if (error.name === 'NotFoundError') {
      showNotification('No camera found on this device.', 'error');
    } else {
      showNotification('Error accessing camera: ' + error.message, 'error');
    }
  }
}

function stopScanner() {
  const video = document.getElementById('scanner-video');
  const scannerPlaceholder = document.querySelector('.scanner-placeholder');
  const scannerVideoContainer = document.querySelector('.scanner-video-container');
  const stopButton = document.getElementById('stop-scanner-btn');
  const startButton = document.getElementById('start-scanner-btn');
  
  // Stop scanning
  scanningActive = false;
  if (scanAnimation) {
    cancelAnimationFrame(scanAnimation);
  }
  
  // Stop video stream
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
  
  video.srcObject = null;
  
  // Show placeholder, hide video
  scannerPlaceholder.style.display = 'block';
  scannerVideoContainer.style.display = 'none';
  stopButton.style.display = 'none';
  startButton.style.display = 'inline-block';
  
  showNotification('Scanner stopped', 'info');
}

function scanQRCode(video, canvas) {
  if (!scanningActive) return;
  
  const ctx = canvas.getContext('2d');
  
  // Set canvas size to match video
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for QR code detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Use jsQR library to detect QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    
    if (code) {
      // QR code detected!
      handleScannedCode(code.data);
      
      // Draw detection box
      drawDetectionBox(ctx, code.location);
    }
  }
  
  // Continue scanning
  scanAnimation = requestAnimationFrame(() => scanQRCode(video, canvas));
}

function drawDetectionBox(ctx, location) {
  // Draw a box around detected QR code
  ctx.beginPath();
  ctx.moveTo(location.topLeftCorner.x, location.topLeftCorner.y);
  ctx.lineTo(location.topRightCorner.x, location.topRightCorner.y);
  ctx.lineTo(location.bottomRightCorner.x, location.bottomRightCorner.y);
  ctx.lineTo(location.bottomLeftCorner.x, location.bottomLeftCorner.y);
  ctx.lineTo(location.topLeftCorner.x, location.topLeftCorner.y);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#2ecc71';
  ctx.stroke();
}

function handleScannedCode(data) {
  // Stop scanning temporarily to show result
  scanningActive = false;
  
  // Show scanned result
  displayScannedResult(data);
  
  // Vibrate if supported
  if (navigator.vibrate) {
    navigator.vibrate(200);
  }
  
  // Play success sound (optional - could be added)
  showNotification('QR Code scanned successfully!', 'success');
}

function displayScannedResult(data) {
  const resultContainer = document.getElementById('scan-result');
  const resultText = document.getElementById('scan-result-text');
  const scannerVideoContainer = document.querySelector('.scanner-video-container');
  
  // Parse the data (split by newlines if it was created by our generator)
  const lines = data.split('\n');
  
  let formattedResult = '';
  if (lines.length > 1) {
    formattedResult = lines.map(line => `<div class="result-line">${escapeHtml(line)}</div>`).join('');
  } else {
    formattedResult = `<div class="result-line">${escapeHtml(data)}</div>`;
  }
  
  resultText.innerHTML = formattedResult;
  
  // Hide video, show result
  scannerVideoContainer.style.display = 'none';
  resultContainer.style.display = 'block';
  
  // Store the scanned data globally
  window.lastScannedData = data;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function copyScannedResult() {
  const data = window.lastScannedData;
  
  if (!data) {
    showNotification('No data to copy', 'error');
    return;
  }
  
  // Copy to clipboard
  navigator.clipboard.writeText(data).then(() => {
    showNotification('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Copy failed:', err);
    showNotification('Failed to copy', 'error');
  });
}

function shareScannedResult() {
  const data = window.lastScannedData;
  
  if (!data) {
    showNotification('No data to share', 'error');
    return;
  }
  
  // Use Web Share API if available
  if (navigator.share) {
    navigator.share({
      title: 'Scanned QR Code',
      text: data
    }).then(() => {
      showNotification('Shared successfully!', 'success');
    }).catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    });
  } else {
    // Fallback to copying
    copyScannedResult();
  }
}

function scanAgain() {
  const resultContainer = document.getElementById('scan-result');
  const scannerVideoContainer = document.querySelector('.scanner-video-container');
  
  // Hide result, show video
  resultContainer.style.display = 'none';
  scannerVideoContainer.style.display = 'block';
  
  // Resume scanning
  scanningActive = true;
  const video = document.getElementById('scanner-video');
  const canvas = document.getElementById('scanner-canvas');
  scanQRCode(video, canvas);
}

// Initialize scanner when scanner screen is shown
function initScanner() {
  const startButton = document.getElementById('start-scanner-btn');
  if (startButton) {
    startButton.style.display = 'inline-block';
  }
}
