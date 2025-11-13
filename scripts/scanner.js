// Simple QR Scanner
let videoStream = null;

async function scanQRCode() {
  const video = document.getElementById('scanner-video');
  const canvas = document.getElementById('scanner-canvas');
  const scanButton = document.getElementById('scan-btn');
  const resultContainer = document.getElementById('scan-result');
  const resultText = document.getElementById('scan-result-text');
  const videoContainer = document.querySelector('.scanner-video-container');
  
  try {
    // Start camera
    if (!videoStream) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      videoStream = stream;
      video.srcObject = stream;
      await video.play();
      
      // Wait for camera to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Show video and hide button temporarily
    videoContainer.style.display = 'block';
    scanButton.textContent = 'Scanning...';
    scanButton.disabled = true;
    
    // Capture frame
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Try to detect QR code
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    
    if (code) {
      // Found QR code!
      displayResult(code.data);
      stopCamera();
    } else {
      // Not found - try again
      showNotification('No QR code found. Try again with better lighting.', 'warning');
      scanButton.textContent = 'Scan QR Code';
      scanButton.disabled = false;
    }
    
  } catch (error) {
    console.error('Scanner error:', error);
    showNotification('Camera error. Please allow camera access.', 'error');
    scanButton.textContent = 'Scan QR Code';
    scanButton.disabled = false;
  }
}

function displayResult(data) {
  const resultContainer = document.getElementById('scan-result');
  const resultText = document.getElementById('scan-result-text');
  const scanButton = document.getElementById('scan-btn');
  const videoContainer = document.querySelector('.scanner-video-container');
  
  // Hide video, show result
  videoContainer.style.display = 'none';
  resultContainer.style.display = 'block';
  
  // Format the data
  const lines = data.split('\n');
  let formattedResult = '';
  
  if (lines.length > 1) {
    formattedResult = lines.map(line => `<div class="result-line">${escapeHtml(line)}</div>`).join('');
  } else {
    formattedResult = `<div class="result-line">${escapeHtml(data)}</div>`;
  }
  
  resultText.innerHTML = formattedResult;
  
  // Store data globally
  window.lastScannedData = data;
  
  // Reset button
  scanButton.textContent = 'Scan Another QR Code';
  scanButton.disabled = false;
  
  showNotification('QR code scanned successfully!', 'success');
}

function stopCamera() {
  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
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
  
  navigator.clipboard.writeText(data).then(() => {
    showNotification('Copied to clipboard!', 'success');
  }).catch(err => {
    showNotification('Failed to copy', 'error');
  });
}

function shareScannedResult() {
  const data = window.lastScannedData;
  
  if (!data) {
    showNotification('No data to share', 'error');
    return;
  }
  
  if (navigator.share) {
    navigator.share({
      title: 'Scanned QR Code',
      text: data
    }).catch(err => {
      if (err.name !== 'AbortError') {
        copyScannedResult();
      }
    });
  } else {
    copyScannedResult();
  }
}

function scanAgain() {
  const resultContainer = document.getElementById('scan-result');
  resultContainer.style.display = 'none';
  stopCamera();
}

// Clean up camera when leaving scanner
function cleanupScanner() {
  stopCamera();
  const resultContainer = document.getElementById('scan-result');
  const videoContainer = document.querySelector('.scanner-video-container');
  resultContainer.style.display = 'none';
  videoContainer.style.display = 'none';
}
