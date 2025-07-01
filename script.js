// Thay bằng cấu hình Firebase của bạn
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAbaKSRMrc9vBiV8KFTwni-n4dgPJX9JoE",
    authDomain: "qrscanner-28cf3.firebaseapp.com",
    projectId: "qrscanner-28cf3",
    storageBucket: "qrscanner-28cf3.firebasestorage.app",
    messagingSenderId: "162905082716",
    appId: "1:162905082716:web:98f9a0ced6cca391a64f99"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let codeReader = new ZXing.BrowserQRCodeReader();
let videoElement = document.getElementById('video');
let imageElement = document.getElementById('qr-image');
let imageUpload = document.getElementById('image-upload');
let resultElement = document.getElementById('result');
let qrListElement = document.getElementById('qr-list');
let qrCodes = [];
let qrCodeDocs = {};

// Quét từ camera
function startCameraScan() {
    videoElement.classList.remove