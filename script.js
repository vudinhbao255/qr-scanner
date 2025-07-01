let codeReader = new ZXing.BrowserQRCodeReader();
let videoElement = document.getElementById('video');
let resultElement = document.getElementById('result');
let qrListElement = document.getElementById('qr-list');
let qrCodes = JSON.parse(localStorage.getItem('qrCodes')) || [];

function startScan() {
    codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
        if (result) {
            resultElement.textContent = 'Kết quả: ' + result.text;
            if (!qrCodes.includes(result.text)) {
                qrCodes.push(result.text);
                localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
                updateQRList();
            }
        }
        if (err && !(err instanceof ZXing.NotFoundException)) {
            console.error(err);
            resultElement.textContent = 'Lỗi: ' + err;
        }
    });
}

function stopScan() {
    codeReader.reset();
    resultElement.textContent = 'Kết quả: Chưa quét';
}

function updateQRList() {
    qrListElement.innerHTML = '';
    qrCodes.forEach(code => {
        let li = document.createElement('li');
        li.textContent = code;
        qrListElement.appendChild(li);
    });
}

function copyToClipboard() {
    let textToCopy = qrCodes.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Danh sách mã QR đã được sao chép!');
    }).catch(err => {
        alert('Lỗi khi sao chép: ' + err);
    });
}

// Hiển thị danh sách mã QR khi trang tải
updateQRList();