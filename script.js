let codeReader;
try {
    codeReader = new ZXing.BrowserQRCodeReader();
} catch (err) {
    showError('Lỗi khởi tạo ZXing: ' + err.message);
}

const videoElement = document.getElementById('video');
const imageElement = document.getElementById('qr-image');
const imageUpload = document.getElementById('image-upload');
const resultElement = document.getElementById('result');
const errorElement = document.getElementById('error');
const qrListElement = document.getElementById('qr-list');
let qrCodes = JSON.parse(localStorage.getItem('qrCodes')) || [];

// Hiển thị lỗi trên giao diện
function showError(message) {
    console.error(message);
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
}

// Quét từ camera
async function startCameraScan() {
    try {
        errorElement.classList.add('d-none');
        videoElement.classList.remove('d-none');
        imageElement.classList.add('d-none');
        imageUpload.classList.add('d-none');
        document.querySelector('.btn-camera').classList.add('d-none');
        document.querySelector('.btn-stop-camera').classList.remove('d-none');

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        videoElement.srcObject = stream;
        codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
            if (result) {
                resultElement.textContent = 'Kết quả: ' + result.text;
                saveQRCode(result.text);
                stopCameraScan();
            }
            if (err && !(err instanceof ZXing.NotFoundException)) {
                showError('Lỗi quét camera: ' + err.message);
            }
        });
    } catch (err) {
        showError('Lỗi truy cập camera: ' + err.message);
    }
}

// Dừng quét camera
function stopCameraScan() {
    try {
        codeReader.reset();
        if (videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
        videoElement.classList.add('d-none');
        document.querySelector('.btn-camera').classList.remove('d-none');
        document.querySelector('.btn-stop-camera').classList.add('d-none');
        resultElement.textContent = 'Kết quả: Chưa quét';
    } catch (err) {
        showError('Lỗi dừng camera: ' + err.message);
    }
}

// Quét từ hình ảnh
imageUpload.addEventListener('change', (event) => {
    try {
        errorElement.classList.add('d-none');
        const file = event.target.files[0];
        if (!file) {
            showError('Không có file được chọn');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                imageElement.src = e.target.result;
                imageElement.classList.remove('d-none');
                videoElement.classList.add('d-none');
                codeReader.decodeFromImageUrl(e.target.result).then(result => {
                    resultElement.textContent = 'Kết quả: ' + result.text;
                    saveQRCode(result.text);
                }).catch(err => {
                    showError('Lỗi: Không tìm thấy mã QR trong hình - ' + err.message);
                });
            } catch (err) {
                showError('Lỗi xử lý hình ảnh: ' + err.message);
            }
        };
        reader.readAsDataURL(file);
    } catch (err) {
        showError('Lỗi đọc file hình ảnh: ' + err.message);
    }
});

// Lưu mã QR vào LocalStorage
function saveQRCode(code) {
    try {
        if (!qrCodes.includes(code)) {
            qrCodes.push(code);
            localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
            updateQRList();
        }
    } catch (err) {
        showError('Lỗi khi lưu mã QR: ' + err.message);
    }
}

// Xóa mã QR
function deleteQRCode(code) {
    try {
        qrCodes = qrCodes.filter(c => c !== code);
        localStorage.setItem('qrCodes', JSON.stringify(qrCodes));
        updateQRList();
    } catch (err) {
        showError('Lỗi khi xóa mã QR: ' + err.message);
    }
}

// Cập nhật danh sách mã QR
function updateQRList() {
    try {
        qrListElement.innerHTML = '';
        qrCodes.forEach(code => {
            let li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `${code} <button class="btn btn-danger delete-btn" onclick="deleteQRCode('${code}')">Xóa</button>`;
            qrListElement.appendChild(li);
        });
    } catch (err) {
        showError('Lỗi cập nhật danh sách: ' + err.message);
    }
}

// Sao chép danh sách
async function copyToClipboard() {
    try {
        let textToCopy = qrCodes.join('\n');
        await navigator.clipboard.writeText(textToCopy);
        alert('Danh sách mã QR đã được sao chép!');
    } catch (err) {
        showError('Lỗi khi sao chép: ' + err.message);
    }
}

// Tải danh sách khi mở trang
updateQRList();