// History functions
function displayHistory() {
  const historyList = document.getElementById('historyList');
  
  if (qrHistory.length === 0) {
    historyList.innerHTML = '<div class="no-history">No QR codes generated yet</div>';
    return;
  }
  
  historyList.innerHTML = qrHistory.map(item => `
    <div class="history-item">
      <div class="history-content">
        <div class="history-text">${item.data.split('\n')[0]}</div>
        <div class="history-date">${item.date} at ${item.time}</div>
      </div>
      <div class="history-actions">
        <button class="history-btn-small view-btn" onclick="viewHistoryItem('${item.id}')" title="View QR Code">
          <i class="fas fa-eye"></i>
        </button>
        <button class="history-btn-small delete-btn" onclick="deleteHistoryItem('${item.id}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function viewHistoryItem(id) {
  const item = qrHistory.find(qr => qr.id == id);
  if (item) {
    const lines = item.data.split('\n');
    clearAllTextFields();
    
    lines.forEach((line, index) => {
      if (index > 0) addTextField();
      const fields = document.querySelectorAll('.text-field');
      if (fields[index]) {
        fields[index].value = line;
      }
    });
    
    currentQRCodeData = item.data;
    lastGeneratedData = item.data;
    generateQRFromData(item.data);
    showGenerator();
  }
}

function deleteHistoryItem(id) {
  if (confirm('Are you sure you want to delete this QR code from history?')) {
    qrHistory = qrHistory.filter(qr => qr.id != id);
    saveHistory();
    displayHistory();
  }
}

function clearHistory() {
  if (confirm('Are you sure you want to clear all QR code history? This action cannot be undone.')) {
    qrHistory = [];
    saveHistory();
    displayHistory();
  }
}