// Elements
const dmView = document.getElementById('dm-view');
const chatView = document.getElementById('chat-view');
const dmList = document.getElementById('dm-list');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const btRefreshBtn = document.getElementById('bt-refresh');
const backToDmBtn = document.getElementById('back-to-dm');
const chatWithName = document.getElementById('chat-with-name');

const loginOverlay = document.getElementById('login-overlay');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');

const requestModal = document.getElementById('request-modal');
const acceptBtn = document.getElementById('accept-btn');
const refuseBtn = document.getElementById('refuse-btn');

const photoInput = document.getElementById('photo-input');
const attachPlusBtn = document.getElementById('attach-plus-btn');
const micBtn = document.getElementById('mic-btn');

// State
let MY_USERNAME = "";
let CURRENT_CHAT_DEVICE = null;
let DISCOVERED_DEVICES = [];
let mediaRecorder;
let audioChunks = [];

// 1. Discovery & DM List
async function startDiscovery() {
    if (!MY_USERNAME) return;

    dmList.innerHTML = '<div class="empty-state">Cihazlar taranıyor... 🔍</div>';
    DISCOVERED_DEVICES = [];

    if (window.Capacitor && window.Capacitor.Plugins.BluetoothLe) {
        const Ble = window.Capacitor.Plugins.BluetoothLe;
        try {
            await Ble.initialize();
            await Ble.requestLEScan();

            Ble.addListener('onScanResult', (res) => {
                const name = res.device.name || "Bilinmeyen Cihaz";
                if (!DISCOVERED_DEVICES.find(d => d.deviceId === res.device.deviceId)) {
                    DISCOVERED_DEVICES.push(res.device);
                    addDeviceToDmList(name, res.rssi, res.device.deviceId);
                }
            });

            setTimeout(() => Ble.stopLEScan(), 10000);
        } catch (e) {
            dmList.innerHTML = '<div class="empty-state">Bluetooth tarama hatası!</div>';
        }
    } else {
        // Browser Simulation
        setTimeout(() => {
            addDeviceToDmList("Simüle Cihaz 1", -45, "00:11:22:33:44:55");
            addDeviceToDmList("Surbit Test Cihazı", -60, "AA:BB:CC:DD:EE:FF");
        }, 2000);
    }
}

function addDeviceToDmList(name, rssi, deviceId) {
    if (dmList.querySelector('.empty-state')) dmList.innerHTML = '';

    const div = document.createElement('div');
    div.className = 'dm-item';
    div.innerHTML = `
        <div class="dm-avatar">${name[0]}</div>
        <div class="dm-info">
            <div class="dm-name">${name}</div>
            <div class="dm-status">Sinyal: ${rssi}dBm • Bağlanılabilir</div>
        </div>
    `;
    div.onclick = () => showConnectionRequest(name, deviceId);
    dmList.appendChild(div);
}

// 2. Connection Logic
function showConnectionRequest(name, deviceId) {
    const requestMsg = document.getElementById('request-msg');
    requestMsg.innerText = `${name} seninle güvenli P2P kanalı üzerinden mesajlaşmak istiyor. 🇸🇾`;
    requestModal.style.display = 'flex';

    acceptBtn.onclick = () => {
        requestModal.style.display = 'none';
        CURRENT_CHAT_DEVICE = { name, deviceId };
        openChat(name);
    };

    refuseBtn.onclick = () => {
        requestModal.style.display = 'none';
    };
}

function openChat(name) {
    chatWithName.innerText = name;
    dmView.classList.replace('view-active', 'view-hidden');
    chatView.classList.replace('view-hidden', 'view-active');
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
}

backToDmBtn.onclick = () => {
    chatView.classList.replace('view-active', 'view-hidden');
    dmView.classList.replace('view-hidden', 'view-active');
};

// 3. Messaging
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appendMessage(MY_USERNAME, text, time, true);
    messageInput.value = '';
    messageInput.focus();
}

function appendMessage(sender, content, time, isMe, type = 'chat') {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMe ? 'sent' : 'received'}`;

    let html = (type === 'image') ? `<img src="${content}" class="msg-img">` : `<div class="msg-bubble">${content}</div>`;

    msgDiv.innerHTML = `
        <div style="display: flex; gap: 8px; align-items: flex-end; ${isMe ? 'flex-direction: row-reverse;' : ''}">
            <div style="display: flex; flex-direction: column;">
                ${html}
                <div class="msg-meta" style="font-size:0.7rem; opacity:0.6; margin-top:4px; text-align:${isMe ? 'right' : 'left'}">${time}</div>
            </div>
        </div>
    `;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendBtn.onclick = sendMessage;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

// 4. Initializers
loginBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (name) {
        MY_USERNAME = name;
        localStorage.setItem('bitcep_username', name);
        loginOverlay.style.display = 'none';
        startDiscovery();
    }
};

btRefreshBtn.onclick = startDiscovery;

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('bitcep_username');
    if (saved) {
        MY_USERNAME = saved;
        loginOverlay.style.display = 'none';
        startDiscovery();
    }
});
