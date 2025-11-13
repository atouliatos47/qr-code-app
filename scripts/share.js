// Share functions

// Universal share with image (works on mobile and modern browsers)
async function shareQRCodeWithImage() {
  try {
    const dataURL = await getQRCodeImageWithLogo();
    
    // Convert base64 to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    const file = new File([blob], 'qrcode-fdl.png', { type: 'image/png' });
    
    const shareData = {
      title: 'FDL QR Code',
      text: `QR Code Content:\n${currentQRCodeData}`,
      files: [file]
    };
    
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      closeShareModal();
      showNotification('QR code shared successfully!', 'success');
    } else {
      // If Web Share API not available, download instead
      showNotification('Share not supported. Downloading QR code instead...', 'info');
      downloadQRCode();
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Error sharing:', error);
      showNotification('Error sharing QR code', 'error');
    }
  }
}

function openShareModal() {
  const qrcodeCanvas = document.querySelector('#qrcode canvas');
  if (!qrcodeCanvas) {
    showNotification('Please generate a QR code first', 'error');
    return;
  }
  
  document.getElementById('shareModal').style.display = 'flex';
}

function closeShareModal() {
  document.getElementById('shareModal').style.display = 'none';
}

function getQRCodeImageWithLogo() {
  return new Promise((resolve, reject) => {
    const qrcodeContainer = document.getElementById('qrcode');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 240;
    canvas.height = 240;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw QR code
    const qrCanvas = qrcodeContainer.querySelector('canvas');
    ctx.drawImage(qrCanvas, 10, 10, 220, 220);
    
    // White square for logo background (bigger)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(75, 75, 90, 90);
    
    // Load and draw the actual logo
    const logoImg = new Image();
    logoImg.onload = function() {
      // Draw logo in center (bigger)
      ctx.drawImage(logoImg, 82, 82, 76, 76);
      resolve(canvas.toDataURL('image/png'));
    };
    logoImg.onerror = function() {
      console.error('Failed to load logo image');
      // Fallback to text if image fails
      ctx.fillStyle = '#2c3e50';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('FDL', 120, 110);
      ctx.font = '8px Arial';
      ctx.fillText('FRANK', 120, 125);
      ctx.fillText('DUDLEY LTD', 120, 135);
      resolve(canvas.toDataURL('image/png'));
    };
    logoImg.src = 'icons/icon-192.png';
  });
}

async function shareViaEmail() {
  try {
    // Try to use Web Share API (supports files/images)
    if (navigator.share && navigator.canShare) {
      const dataURL = await getQRCodeImageWithLogo();
      
      // Convert base64 to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      const shareData = {
        title: 'QR Code',
        text: `QR Code Content:\n\n${currentQRCodeData}\n\nScan it with your phone!`,
        files: [file]
      };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        closeShareModal();
        showNotification('QR code shared successfully', 'success');
        return;
      }
    }
    
    // Fallback: mailto (text only)
    showNotification('Email sharing doesn\'t support image attachments. Please download the QR code and attach it manually.', 'warning');
    setTimeout(() => {
      const subject = "QR Code";
      const body = `Check out this QR code I generated:\n\n${currentQRCodeData}\n\nNote: Please download the QR code image separately and attach it to your email.`;
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
      closeShareModal();
    }, 3000);
    
  } catch (error) {
    console.error('Error sharing via email:', error);
    showNotification('Error sharing QR code', 'error');
  }
}

async function shareViaWhatsApp() {
  try {
    // Try to use Web Share API (supports files/images)
    if (navigator.share && navigator.canShare) {
      const dataURL = await getQRCodeImageWithLogo();
      
      // Convert base64 to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });
      
      const shareData = {
        title: 'QR Code',
        text: `Check out this QR code I generated:\n\n${currentQRCodeData}\n\nScan it with your phone!`,
        files: [file]
      };
      
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        closeShareModal();
        showNotification('QR code shared successfully', 'success');
        return;
      }
    }
    
    // Fallback: WhatsApp URL (text only)
    const text = `Check out this QR code I generated:\n\n${currentQRCodeData}\n\nScan it with your phone!`;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappURL, '_blank');
    closeShareModal();
    showNotification('WhatsApp opened (text only). Download the QR code to send the image.', 'info');
    
  } catch (error) {
    console.error('Error sharing via WhatsApp:', error);
    showNotification('Error sharing QR code', 'error');
  }
}

function shareViaFacebook() {
  const text = `Check out this QR code I generated:\n\n${currentQRCodeData}`;
  const facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`;
  window.open(facebookURL, '_blank', 'width=600,height=400');
  closeShareModal();
}

function shareViaTwitter() {
  const text = `Check out this QR code I generated! ${currentQRCodeData.substring(0, 50)}...`;
  const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(twitterURL, '_blank', 'width=600,height=400');
  closeShareModal();
}

async function downloadQRCode() {
  const qrcodeCanvas = document.querySelector('#qrcode canvas');
  if (!qrcodeCanvas) {
    showNotification('Please generate a QR code first', 'error');
    return;
  }
  
  try {
    const dataURL = await getQRCodeImageWithLogo();
    const link = document.createElement('a');
    link.download = 'qrcode-with-logo.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('QR code downloaded successfully', 'success');
    closeShareModal();
  } catch (error) {
    console.error('Error downloading QR code:', error);
    showNotification('Error downloading QR code', 'error');
  }
}

async function printQRCode() {
  const qrcodeContainer = document.getElementById('qrcode');
  if (!qrcodeContainer.querySelector('canvas')) {
    showNotification('Please generate a QR code first', 'error');
    return;
  }
  
  try {
    const qrCodeDataURL = await getQRCodeImageWithLogo();
    const lines = currentQRCodeData.split('\n');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code</title>
          <style>
            @media print {
              body { 
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 20px;
                display: flex;
                align-items: flex-start;
                justify-content: center;
              }
              .print-container {
                display: flex;
                align-items: flex-start;
                gap: 30px;
                max-width: 100%;
              }
              .qr-code-section {
                flex-shrink: 0;
              }
              .content-section {
                flex-grow: 1;
                padding-top: 10px;
              }
              h1 { 
                color: #333; 
                margin: 0 0 20px 0;
                font-size: 24px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
              }
              .content-line {
                margin-bottom: 15px;
                font-size: 18px;
                line-height: 1.4;
              }
              .generated-date {
                margin-top: 30px;
                font-size: 16px;
                color: #666;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <div class="qr-code-section">
              <img src="${qrCodeDataURL}" alt="QR Code" style="width: 240px; height: 240px;">
            </div>
            <div class="content-section">
              <h1>QR Code</h1>
              <div class="content-data">
                ${lines.map(line => `<div class="content-line">${line}</div>`).join('')}
              </div>
              <div class="generated-date">Generated on ${new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        printWindow.close();
      }, 500);
    };
  } catch (error) {
    console.error('Error printing QR code:', error);
    showNotification('Error printing QR code', 'error');
  }
}
