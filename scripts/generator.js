// QR Generator functions - OPTION 1: ROUNDED DOTS
// Optimized version with modern rounded dot style

function addTextField() {
  textFieldCount += 2; // Adding 2 fields at once
  const container = document.getElementById('text-fields-container');
  
  // Create row container for 2 fields
  const rowDiv = document.createElement('div');
  rowDiv.className = 'text-field-row';
  
  // Create first field in the row
  const field1 = document.createElement('input');
  field1.type = 'text';
  field1.className = 'text-field text-field-half';
  field1.placeholder = 'Enter text';
  
  // Create second field in the row
  const field2 = document.createElement('input');
  field2.type = 'text';
  field2.className = 'text-field text-field-half';
  field2.placeholder = 'Enter text';
  
  // Create remove button for the row
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-field';
  removeBtn.innerHTML = '&times;';
  removeBtn.setAttribute('aria-label', 'Remove row');
  removeBtn.onclick = () => removeTextFieldRow(removeBtn);
  
  rowDiv.appendChild(field1);
  rowDiv.appendChild(field2);
  rowDiv.appendChild(removeBtn);
  
  container.appendChild(rowDiv);
  
  // Focus on first field
  field1.focus();
}

function removeTextFieldRow(button) {
  if (textFieldCount > 1) {
    button.parentElement.remove();
    textFieldCount -= 2; // Remove 2 fields count
    if (textFieldCount < 0) textFieldCount = 0;
  }
}

function removeTextField(button) {
  if (textFieldCount > 1) {
    button.parentElement.remove();
    textFieldCount--;
  } else {
    // If it's the only field, just clear it
    const input = button.previousElementSibling;
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function clearAllTextFields() {
  const container = document.getElementById('text-fields-container');
  container.innerHTML = '';
  textFieldCount = 0;
  addTextField();
  lastGeneratedData = '';
  
  // Clear the QR code display
  const qrcodeContainer = document.getElementById("qrcode");
  qrcodeContainer.innerHTML = "QR Code will appear here after generation";
  qrcodeContainer.classList.add("empty-state");
}

function generateQR() {
  const textFields = document.querySelectorAll('.text-field');
  const textData = [];
  
  // Collect non-empty field values
  textFields.forEach(field => {
    const value = field.value.trim();
    if (value) {
      textData.push(value);
    }
  });
  
  // Validate input
  if (textData.length === 0) {
    showNotification('Please enter at least one field with text for the QR code', 'error');
    return;
  }
  
  currentQRCodeData = textData.join('\n');
  
  // Check if same QR code already generated
  if (currentQRCodeData === lastGeneratedData) {
    console.log('Same QR code data, not generating again');
    return;
  }
  
  // Generate QR code
  try {
    generateQRFromData(currentQRCodeData);
    
    // Save to history
    const isNewQR = saveQRCodeToHistory(currentQRCodeData);
    if (isNewQR) {
      showNotification('QR code generated and saved to history', 'success');
    } else {
      showNotification('QR code generated (already in history)', 'info');
    }
    
    lastGeneratedData = currentQRCodeData;
  } catch (error) {
    console.error('Error generating QR code:', error);
    showNotification('Error generating QR code. Please try again.', 'error');
  }
}

function generateQRFromData(data) {
  console.log('🚀 Generating QR code with rounded dots style...');
  const qrcodeContainer = document.getElementById("qrcode");
  
  // Clear previous QR code
  qrcodeContainer.innerHTML = "";
  qrcodeContainer.classList.remove("empty-state");
  
  // Generate new QR code
  new QRCode(qrcodeContainer, {
    text: data,
    width: 220,
    height: 220,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  
  // Apply rounded dots style after QR code renders
  setTimeout(() => {
    applyRoundedDotsStyle();
    addLogoToQRCode();
  }, 200);
}

function applyRoundedDotsStyle() {
  console.log('🔄 Starting rounded dots transformation...');
  const qrcodeContainer = document.getElementById("qrcode");
  const canvas = qrcodeContainer.querySelector('canvas');
  
  if (!canvas) {
    console.error('❌ No canvas found!');
    return;
  }
  
  console.log('✅ Canvas found, size:', canvas.width);
  
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  
  // Get the original image data
  const originalImageData = ctx.getImageData(0, 0, size, size);
  const data = originalImageData.data;
  
  console.log('✅ Got image data');
  
  // Clear canvas with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  // Detect module size by finding first black pixel
  let moduleSize = 0;
  for (let i = 0; i < size; i++) {
    const pixelIndex = i * 4;
    if (data[pixelIndex] === 0) { // Found first black pixel
      // Count consecutive black pixels to determine module size
      let count = 0;
      for (let j = i; j < size; j++) {
        const pix = j * 4;
        if (data[pix] === 0) count++;
        else break;
      }
      moduleSize = count;
      break;
    }
  }
  
  if (moduleSize === 0) moduleSize = Math.floor(size / 33); // Fallback
  
  console.log('✅ Module size detected:', moduleSize);
  
  const dotRadius = moduleSize * 0.42; // 42% of module size for nice round dots
  
  console.log('🎨 Drawing rounded dots with radius:', dotRadius);
  
  // Redraw with rounded dots
  ctx.fillStyle = '#000000';
  let dotsDrawn = 0;
  
  for (let y = 0; y < size; y += moduleSize) {
    for (let x = 0; x < size; x += moduleSize) {
      // Sample the center of each module
      const sampleX = Math.min(x + Math.floor(moduleSize / 2), size - 1);
      const sampleY = Math.min(y + Math.floor(moduleSize / 2), size - 1);
      const pixelIndex = (sampleY * size + sampleX) * 4;
      
      // If pixel is dark (black module), draw a circle
      if (data[pixelIndex] < 128) {
        ctx.beginPath();
        ctx.arc(
          x + moduleSize / 2, 
          y + moduleSize / 2, 
          dotRadius, 
          0, 
          Math.PI * 2
        );
        ctx.fill();
        dotsDrawn++;
      }
    }
  }
  
  console.log('✅ Finished! Drew', dotsDrawn, 'rounded dots');
}

function addLogoToQRCode() {
  const qrcodeContainer = document.getElementById("qrcode");
  
  // Remove existing logo if present
  const existingLogo = qrcodeContainer.querySelector('.logo-overlay');
  if (existingLogo) {
    existingLogo.remove();
  }
  
  // Create logo overlay with actual image
  const logoOverlay = document.createElement('div');
  logoOverlay.className = 'logo-overlay';
  
  const logoImg = document.createElement('img');
  logoImg.src = 'icons/icon-192.png';
  logoImg.alt = 'FDL Logo';
  logoImg.className = 'logo-overlay-image';
  
  logoOverlay.appendChild(logoImg);
  qrcodeContainer.appendChild(logoOverlay);
}

// Simple notification system
function showNotification(message, type = 'info') {
  // Check if notification already exists
  let notification = document.getElementById('notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;
    document.body.appendChild(notification);
  }
  
  // Set background color based on type
  const colors = {
    success: '#2ecc71',
    error: '#e74c3c',
    info: '#3498db',
    warning: '#f39c12'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  notification.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
  }, 3000);
}
