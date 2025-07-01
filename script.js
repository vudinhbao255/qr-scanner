// Thay bằng cấu hình Firebase của bạn
const firebaseConfig = {
apiKey: "AIzaSyAbaKSRMrc9vBiV8KFTwni-n4dgPJX9JoE",
  authDomain: "qrscanner-28cf3.firebaseapp.com",
  projectId: "qrscanner-28cf3",
  storageBucket: "qrscanner-28cf3.firebasestorage.app",
  messagingSenderId: "162905082716",
  appId: "1:162905082716:web:98f9a0ced6cca391a64f99"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let codeReader = new ZXing.BrowserQRCodeReader();
let videoElement = document.getElementById('video');
let imageElement = document.getElementById('qr-image');
let imageUpload = document.getElementById('image-upload');
let resultElement = document.getElementById('result');
let errorElement = document.getElementById('error');
let qrListElement = document.getElementById('qr-list');
let qrCodes = [];
let qrCodeDocs = {};

// Quét từ camera
function startCameraScan() {
    errorElement.classList.add('d-none');
    videoElement.classList.remove('d-none');
    imageElement.classList.add('d-none');
    imageUpload.classList.add('d-none');
    document.querySelector('.btn-camera').classList.add('d-none');
    document.querySelector('.btn-stop-camera').classList.remove('d-none');
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
            codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
                if (result) {
                    resultElement.textContent = 'Kết quả: ' + result.text;
                    saveQRCode(result.text);
                    stopCameraScan(); // Dừng sau khi quét thành công
                }
                if (err && !(err instanceof ZXing.NotFoundException)) {
                    console.error(err);
                    errorElement.textContent = 'Lỗi camera: ' + err.message;
                    errorElement.classList.remove('d-none');
                }
            });
        })
        .catch(err => {
            console.error(err);
            errorElement.textContent = 'Lỗi truy cập camera: ' + err.message;
            errorElement.classList.remove('d-none');
        });
}

// Dừng quét camera
function stopCameraScan() {
    codeReader.reset();
    videoElement.classList.add('d-none');
    document.querySelector('.btn-camera').classList.remove('d-none');
    document.querySelector('.btn-stop-camera').classList.add('d-none');
    resultElement.textContent = 'Kết quả: Chưa quét';
}

// Quét từ hình ảnh
imageUpload.addEventListener('change', (event) => {
    errorElement.classList.add('d-none');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imageElement.src = e.target.result;
            imageElement.classList.remove('d-none');
            videoElement.classList.add('d-none');
            codeReader.decodeFromImageUrl(e.target.result).then(result => {
                resultElement.textContent = 'Kết quả: ' + result.text;
                saveQRCode(result.text);
            }).catch(err => {
                errorElement.textContent = 'Lỗi: Không tìm thấy mã QR trong hình';
                errorElement.classList.remove('d-none');
            });
        };
        reader.readAsDataURL(file);
    }
});

// Lưu mã QR vào Firebase
function saveQRCode(code) {
    if (!qrCodes.includes(code)) {
        db.collection('qrCodes').add({
            code: code,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(docRef => {
            qrCodes.push(code);
            qrCodeDocs[code] = docRef.id;
            updateQRList();
        }).catch(err => {
            console.error(err);
            errorElement.textContent = 'Lỗi khi lưu: ' + err.message;
            errorElement.classList.remove('d-none');
        });
    }
}

// Xóa mã QR khỏi Firebase
function deleteQRCode(code) {
    const docId = qrCodeDocs[code];
    if (docId) {
        db.collection('qrCodes').doc(docId).delete().then(() => {
            qrCodes = qrCodes.filter(c => c !== code);
            delete qrCodeDocs[code];
            updateQRList();
        }).catch(err => {
            console.error(err);
            errorElement.textContent = 'Lỗi khi xóa: ' + err.message;
            errorElement.classList.remove('d-none');
        });
    }
}

// Cập nhật danh sách mã QR
function updateQRList() {
    qrListElement.innerHTML = '';
    qrCodes.forEach(code => {
        let li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `${code} <button class="btn btn-danger delete-btn" onclick="deleteQRCode('${code}')">Xóa</button>`;
        qrListElement.appendChild(li);
    });
}

// Sao chép danh sách
function copyToClipboard() {
    let textToCopy = qrCodes.join('\n');
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Danh sách mã QR đã được sao chép!');
    }).catch(err => {
        errorElement.textContent = 'Lỗi khi sao chép: ' + err.message;
        errorElement.classList.remove('d-none');
    });
}

// Tải danh sách mã QR từ Firebase khi mở trang
db.collection('qrCodes').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
    qrCodes = [];
    qrCodeDocs = {};
    snapshot.forEach(doc => {
        const code = doc.data().code;
        qrCodes.push(code);
        qrCodeDocs[code] = doc.id;
    });
    updateQRList();
}, err => {
    console.error(err);
    errorElement.textContent = 'Lỗi khi tải danh sách: ' + err.message;
    errorElement.classList.remove('d-none');
});