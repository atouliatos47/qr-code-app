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
  const captureButton = document.getElementById('capture-btn');
  
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
    captureButton.style.display = 'inline-block'; // Show capture button
    
    // Start scanning when video is ready
    video.addEventListener('loadedmetadata', () => {
      video.play();
      scanningActive = true;
      scanQRCode(video, canvas);
    });
    
    showNotification('Camera started. Point at QR code or use "Capture & Scan" button.', 'success');
    
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
  const captureButton = document.getElementById('capture-btn');
  
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
  captureButton.style.display = 'none'; // Hide capture button
  
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
    
    // Try multiple detection attempts with different settings for better accuracy
    let code = null;
    
    // Attempt 1: Normal detection
    code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    
    // Attempt 2: If not found, try with inverted colors
    if (!code) {
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "invertFirst",
      });
    }
    
    if (code) {
      // QR code detected!
      console.log('QR Code detected:', code.data);
      handleScannedCode(code.data);
      
      // Draw detection box
      drawDetectionBox(ctx, code.location);
      
      return; // Stop scanning to show result
    }
  }
  
  // Continue scanning at higher frequency (60fps for better detection)
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

// Manual capture function for when auto-detection doesn't work well
function captureAndScan() {
  const video = document.getElementById('scanner-video');
  const canvas = document.getElementById('scanner-canvas');
  const ctx = canvas.getContext('2d');
  
  if (video.readyState !== video.HAVE_ENOUGH_DATA) {
    showNotification('Camera not ready. Please wait...', 'warning');
    return;
  }
  
  // Set canvas size
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  // Capture current frame
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Try to detect QR code with multiple attempts
  let code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });
  
  if (code) {
    console.log('QR Code detected via manual capture:', code.data);
    handleScannedCode(code.data);
    drawDetectionBox(ctx, code.location);
    showNotification('QR Code scanned!', 'success');
  } else {
    showNotification('No QR code detected. Try moving closer or adjusting angle.', 'warning');
  }
}

// Initialize scanner when scanner screen is shown
function initScanner() {
  const startButton = document.getElementById('start-scanner-btn');
  if (startButton) {
    startButton.style.display = 'inline-block';
  }
}
