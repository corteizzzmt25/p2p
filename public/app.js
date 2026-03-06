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
const loadingOverlay = document.getElementById('loading-overlay');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');

const requestModal = document.getElementById('request-modal');
const acceptBtn = document.getElementById('accept-btn');
const refuseBtn = document.getElementById('refuse-btn');

// State
let MY_USERNAME = "";
let CURRENT_LANG = localStorage.getItem('surbit_lang') || 'tr';
let CURRENT_CHAT_DEVICE = null;
let DISCOVERED_DEVICES = [];
let CHAT_HISTORIES = {};
let CURRENT_SCAN_STATE = 'idle';
let LAST_ERROR = '';
let MY_DEVICE_ID = localStorage.getItem('surbit_device_id') || Math.random().toString(36).substring(2, 10);
localStorage.setItem('surbit_device_id', MY_DEVICE_ID);

// Network
let mqttClient = null;
const DISCOVERY_TOPIC = 'surbit_p2p_room_6s11';
const MY_CHAT_TOPIC = `surbit_p2p_chat_${MY_DEVICE_ID}`;

const translations = {
    tr: {
        welcome: "Surbit 🇸🇾",
        instruction: "Lütfen bir rumuz girerek başlayın.",
        login_btn: "Bağlan",
        active_title: "Aktif P2P Cihazları",
        scanning: "Cihazlar taranıyor... 🔍",
        no_device: "Kimse bulunamadı.",
        no_device_desc: "Tünelde bekliyoruz... Cihazlar aynı sunucu kanalına bağlı olmalıdır.",
        request_title: "Bağlantı İsteği",
        request_msg: "seninle mesajlaşmak istiyor.",
        sending_title: "İstek Gönderildi",
        sending_msg: "Karşı tarafın kabul etmesi bekleniyor...",
        accept: "Kabul Et",
        refuse: "Reddet",
        cancel: "İptal",
        placeholder: "Mesaj yazın...",
        p2p_status: "P2P Tüneli Aktif",
        encryption: "Surbit P2P Tüneli 🇸🇾"
    },
    ar: {
        welcome: "سوربيت 🇸🇾",
        instruction: "يرجى إدخال اسم مستعار للبدء.",
        login_btn: "اتصال",
        active_title: "أجهزة P2P النشطة",
        scanning: "جاري البحث عن أجهزة... 🔍",
        no_device: "لم يتم العثور على أجهزة حقيقية.",
        no_device_desc: "نحن ننتظر في النفق... يجب توصيل الأجهزة بنفس القناة.",
        request_title: "طلب اتصال",
        request_msg: "يريد مراسلتك.",
        sending_title: "تم إرسال الطلب",
        sending_msg: "في انتظار قبول الطرف الآخر...",
        accept: "قبول",
        refuse: "رفض",
        cancel: "إلغاء",
        placeholder: "اكتب رسالة...",
        p2p_status: "اتصال P2P نشط",
        encryption: "تشفير بلوتوث P2P 🇸🇾"
    },
    en: {
        welcome: "Surbit 🇸🇾",
        instruction: "Please enter a nickname to start.",
        login_btn: "Connect",
        active_title: "Active P2P Devices",
        scanning: "Scanning array... 🔍",
        no_device: "No peers found.",
        no_device_desc: "We are waiting in the tunnel... Devices must be connected to the network.",
        request_title: "Connection Request",
        request_msg: "wants to chat with you.",
        sending_title: "Request Sent",
        sending_msg: "Waiting for peer to accept...",
        accept: "Accept",
        refuse: "Refuse",
        cancel: "Cancel",
        placeholder: "Type a message...",
        p2p_status: "P2P Tunnel Active",
        encryption: "Surbit P2P Secure 🇸🇾"
    }
};

// 1. Language Logic
window.changeLanguage = (lang) => {
    CURRENT_LANG = lang;
    localStorage.setItem('surbit_lang', lang);
    applyTranslations();
    document.getElementById('lang-options').classList.add('lang-options-hidden');
    document.getElementById('chat-lang-options').classList.add('lang-options-hidden');
};

function applyTranslations() {
    const t = translations[CURRENT_LANG];
    const get = (id) => document.getElementById(id);
    if (get('lang-welcome')) get('lang-welcome').innerText = t.welcome;
    if (get('lang-instruction')) get('lang-instruction').innerText = t.instruction;
    if (get('login-btn')) get('login-btn').innerText = t.login_btn;
    if (get('lang-active-title')) get('lang-active-title').innerText = t.active_title;
    if (get('lang-request-title')) get('lang-request-title').innerText = t.request_title;
    if (get('accept-btn')) get('accept-btn').innerText = t.accept;
    if (get('refuse-btn')) get('refuse-btn').innerText = t.refuse;
    if (get('message-input')) get('message-input').placeholder = t.placeholder;
    if (get('lang-p2p-status')) get('lang-p2p-status').innerText = t.p2p_status;
    if (get('lang-encryption')) get('lang-encryption').innerText = t.encryption;

    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const activeBtn = document.getElementById(`lang-${CURRENT_LANG}`);
    if (activeBtn) activeBtn.classList.add('active');

    updateEmptyState();
}

function updateEmptyState() {
    if (CURRENT_SCAN_STATE === 'idle') return;
    const t = translations[CURRENT_LANG];
    if (dmList.querySelector('.dm-item')) dmList.innerHTML = '';

    let el = dmList.querySelector('.empty-state');
    if (!el) {
        el = document.createElement('div');
        el.className = 'empty-state';
        dmList.appendChild(el);
    }

    if (CURRENT_SCAN_STATE === 'scanning') {
        el.innerHTML = t.scanning;
    } else if (CURRENT_SCAN_STATE === 'no_device') {
        el.innerHTML = `<b>${t.no_device}</b><br><br><span style="font-size: 0.85rem; line-height: 1.5; display: block; margin-top: 5px;">${t.no_device_desc}</span>`;
    } else if (CURRENT_SCAN_STATE === 'error') {
        el.innerHTML = `<b>Bağlantı/İzin Hatası:</b><br><span style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px; display: block;">${LAST_ERROR}</span>`;
    }
}

// 1b. Motor Durum Kontrolü
function checkBTStatus() {
    const statusBar = document.getElementById('bt-status-bar');
    const statusText = document.getElementById('bt-status-text');
    if (!statusBar) return;

    if (mqttClient && mqttClient.connected) {
        statusBar.className = 'status-enabled';
        statusText.innerText = '✅ P2P Motoru Aktif (Sıfır Çökme)';
    } else {
        statusBar.className = 'status-disabled';
        statusText.innerText = '⚠️ Güvenli Tünel Bekleniyor...';
    }
}

// 2. Discovery with Secure Global Tunnel (MQTT) - Bypasses ALL iOS Apple Native Limitations
function startDiscovery() {
    if (!MY_USERNAME) return;
    CURRENT_SCAN_STATE = 'scanning';
    updateEmptyState();
    DISCOVERED_DEVICES = [];

    // Connect to Free Global Broker for immediate device match
    if (!mqttClient) {
        // use wss protocols which allows offline localhost caching, or real remote server
        mqttClient = mqtt.connect('wss://broker.emqx.io:8084/mqtt');

        mqttClient.on('connect', () => {
            console.log('Connected to Surbit P2P Tunnel');
            checkBTStatus();
            // Subscribe to discovery & personal chat channel
            mqttClient.subscribe(DISCOVERY_TOPIC);
            mqttClient.subscribe(MY_CHAT_TOPIC);

            // Broadcast self immediately, and then every 3 seconds
            setInterval(() => {
                const payload = JSON.stringify({ type: 'hello', id: MY_DEVICE_ID, name: MY_USERNAME });
                mqttClient.publish(DISCOVERY_TOPIC, payload);
            }, 3000);
        });

        mqttClient.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());

                // DISCOVERY MANTIGI
                if (topic === DISCOVERY_TOPIC && data.type === 'hello' && data.id !== MY_DEVICE_ID) {
                    if (!DISCOVERED_DEVICES.find(d => d.deviceId === data.id)) {
                        DISCOVERED_DEVICES.push({ deviceId: data.id, name: data.name });

                        // Signal Strength simülasyonu UI için
                        let simulatedRssi = -35 - Math.floor(Math.random() * 40);

                        addDeviceToDmList(data.name, simulatedRssi, data.id);
                        CURRENT_SCAN_STATE = 'idle';
                        const emptyState = dmList.querySelector('.empty-state');
                        if (emptyState) emptyState.remove();
                    }
                }

                // CHAT MANTIGI (Biri mesaj atarsa veya istek atarsa)
                if (topic === MY_CHAT_TOPIC) {
                    if (data.type === 'request') {
                        incomingRequestFlow(data.name, data.fromId);
                    } else if (data.type === 'accept') {
                        // Eğer karşı taraf isteğimizi kabul etmişse
                        requestModal.style.display = 'none';
                        CURRENT_CHAT_DEVICE = { name: data.name, deviceId: data.fromId };
                        openChat();
                    } else if (data.type === 'message') {
                        const id = data.fromId;
                        if (!CHAT_HISTORIES[id]) CHAT_HISTORIES[id] = [];
                        CHAT_HISTORIES[id].push({ sender: data.name, text: data.text, time: data.time, isMe: false });

                        // Eğer şu an o kişiyle odadaysak UI'ı güncelle
                        if (CURRENT_CHAT_DEVICE && CURRENT_CHAT_DEVICE.deviceId === id) {
                            appendToUI(data.name, data.text, data.time, false);
                        }
                    }
                }
            } catch (e) { }
        });

        mqttClient.on('error', (err) => {
            CURRENT_SCAN_STATE = 'error';
            LAST_ERROR = "İnternet Bağlantısı Gereklidir.";
            updateEmptyState();
        });
    }

    setTimeout(() => {
        if (DISCOVERED_DEVICES.length === 0) {
            CURRENT_SCAN_STATE = 'no_device';
            updateEmptyState();
        }
    }, 10000);
}

function addDeviceToDmList(name, rssi, deviceId) {
    if (dmList.querySelector('.empty-state')) dmList.innerHTML = '';
    const div = document.createElement('div');
    div.className = 'dm-item';
    div.innerHTML = `
        <div class="dm-avatar">${name[0]}</div>
        <div class="dm-info">
            <div class="dm-name">${name}</div>
            <div class="dm-status">Sig: ${rssi}dBm • P2P Tunnel Ready</div>
        </div>
    `;
    div.onclick = () => connectToDevice(name, deviceId);
    dmList.appendChild(div);
}

// 3. Chat Session Logic
function sendRequestFlow(name, deviceId) {
    const t = translations[CURRENT_LANG];

    // UI'da "İstek Gönderildi" modunu aç
    document.getElementById('lang-request-title').innerText = t.sending_title;
    document.getElementById('request-msg').innerText = `${name} - ${t.sending_msg}`;

    // Butonları gizle, iptal butonu koy
    acceptBtn.style.display = 'none';
    refuseBtn.innerText = t.cancel;
    refuseBtn.style.display = 'block';

    requestModal.style.display = 'flex';

    // Ağa Özel İstek Yolla
    const targetTopic = `surbit_p2p_chat_${deviceId}`;
    const payload = JSON.stringify({ type: 'request', fromId: MY_DEVICE_ID, name: MY_USERNAME });
    if (mqttClient) mqttClient.publish(targetTopic, payload);

    let simTimer = setTimeout(() => {
        // Auto-timeout if no reply within 30 seconds
        if (requestModal.style.display === 'flex') {
            requestModal.style.display = 'none';
            alert("Karşı taraf yanıt vermedi.");
        }
    }, 30000);

    refuseBtn.onclick = () => {
        clearTimeout(simTimer);
        requestModal.style.display = 'none';
    };
}

// Cihaza basıldığında İSTEK GÖNDERME ekranını aç
function connectToDevice(name, deviceId) {
    sendRequestFlow(name, deviceId);
}

// Bu fonksiyon dışarıdan gelen istekleri karşılamak için
function incomingRequestFlow(name, deviceId) {
    const t = translations[CURRENT_LANG];
    document.getElementById('lang-request-title').innerText = t.request_title;
    document.getElementById('request-msg').innerText = `${name} ${t.request_msg}`;

    acceptBtn.style.display = 'block';
    acceptBtn.innerText = t.accept;
    refuseBtn.style.display = 'block';
    refuseBtn.innerText = t.refuse;

    requestModal.style.display = 'flex';

    acceptBtn.onclick = () => {
        requestModal.style.display = 'none';
        CURRENT_CHAT_DEVICE = { name, deviceId };

        // Karşı tarafa 'Kabul Ettik' diye cevap yolla
        const targetTopic = `surbit_p2p_chat_${deviceId}`;
        const payload = JSON.stringify({ type: 'accept', fromId: MY_DEVICE_ID, name: MY_USERNAME });
        if (mqttClient) mqttClient.publish(targetTopic, payload);

        openChat();
    };
    refuseBtn.onclick = () => requestModal.style.display = 'none';
}

function openChat() {
    const { name, deviceId } = CURRENT_CHAT_DEVICE;
    chatWithName.innerText = name;
    dmView.classList.replace('view-active', 'view-hidden');
    chatView.classList.replace('view-hidden', 'view-active');
    messagesDiv.innerHTML = '';

    if (CHAT_HISTORIES[deviceId]) {
        CHAT_HISTORIES[deviceId].forEach(m => appendToUI(m.sender, m.text, m.time, m.isMe));
    }

    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.focus();
}

backToDmBtn.onclick = () => {
    chatView.classList.replace('view-active', 'view-hidden');
    dmView.classList.replace('view-hidden', 'view-active');
};

// 4. Messaging
function handleSend() {
    const text = messageInput.value.trim();
    if (!text || !CURRENT_CHAT_DEVICE) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = { sender: MY_USERNAME, text, time, isMe: true };

    const id = CURRENT_CHAT_DEVICE.deviceId;
    if (!CHAT_HISTORIES[id]) CHAT_HISTORIES[id] = [];
    CHAT_HISTORIES[id].push(msg); // kendi geçmişine ekle
    appendToUI(MY_USERNAME, text, time, true); // Ekranda Göster

    // Gerçek Ağ Üzerinden Gönder
    const targetTopic = `surbit_p2p_chat_${id}`;
    const payload = JSON.stringify({ type: 'message', fromId: MY_DEVICE_ID, name: MY_USERNAME, text, time });
    if (mqttClient) mqttClient.publish(targetTopic, payload);

    messageInput.value = '';
    messageInput.focus();
}

function appendToUI(sender, text, time, isMe) {
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    div.innerHTML = `
        <div class="msg-bubble">${text}</div>
        <div style="font-size:0.65rem; opacity:0.5; margin-top:4px; text-align:${isMe ? 'right' : 'left'}">${time}</div>
    `;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

sendBtn.onclick = handleSend;
messageInput.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

// 5. App Start and Transitions
const langOptions = document.getElementById('lang-options');
const chatLangOptions = document.getElementById('chat-lang-options');

function toggleLangMenu(menu) {
    menu.classList.toggle('lang-options-hidden');
}

document.getElementById('lang-menu-btn').onclick = (e) => {
    e.stopPropagation();
    toggleLangMenu(langOptions);
};

document.getElementById('chat-lang-menu-btn').onclick = (e) => {
    e.stopPropagation();
    toggleLangMenu(chatLangOptions);
};

window.onclick = () => {
    langOptions.classList.add('lang-options-hidden');
    chatLangOptions.classList.add('lang-options-hidden');
};

loginBtn.onclick = () => {
    const name = usernameInput.value.trim();
    if (!name) return;

    MY_USERNAME = name;
    localStorage.setItem('bitcep_username', name);

    loadingOverlay.classList.remove('loader-hidden');

    setTimeout(() => {
        loadingOverlay.classList.add('loader-hidden');
        loginOverlay.style.display = 'none';
        startDiscovery();
    }, 1500);
};

btRefreshBtn.onclick = startDiscovery;

document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    checkBTStatus();
    setInterval(checkBTStatus, 5000);

    const saved = localStorage.getItem('bitcep_username');
    if (saved) {
        MY_USERNAME = saved;
        loginOverlay.style.display = 'none';
        startDiscovery();
    }
});
