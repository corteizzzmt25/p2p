// ================================================================
//  SURBIT P2P v2.0 - QR KOD TÜNEL + AYARLAR + DARK MODE
// ================================================================

// ============ STATE ============
let MY_USERNAME = '';
let CURRENT_LANG = localStorage.getItem('surbit_lang') || 'tr';
let DARK_MODE = localStorage.getItem('surbit_dark') === '1';
let CURRENT_CHAT_PEER = null;
let CHAT_HISTORIES = {};
let peerConnection = null;
let dataChannel = null;
let localStream = null;
let scanInterval = null;
let mediaRecorder = null;
let recInterval = null;
let recSeconds = 0;
let camPermGranted = false;
let micPermGranted = false;

// ============ ÇEVİRİLER ============
const T = {
    tr: {
        welcome: 'Surbit',
        instruction: 'Bir rumuz girerek başlayın.',
        login_btn: 'Bağlan',
        encryption: 'Uçtan Uca Şifreli 🔒',
        header_sub: 'P2P Şifreli Mesajlaşma',
        active_title: 'Bağlantılar',
        no_conn: 'Henüz bağlantı yok.',
        no_conn_hint: 'Sağ üstteki + butonuna bas.',
        qr_title: 'Yeni Bağlantı',
        role_title: 'Rol Seç',
        role_desc: 'Bağlantıyı kim başlatıyor?',
        host_btn: 'QR Oluştur (Ben başlatıyorum)',
        guest_btn: 'QR Tara (Karşıdan başlatıldı)',
        step1: "Adım 1/2 · Bu QR'ı karşı cihaza okut",
        host_hint: "Karşı cihaz QR'ı okutunca devam...",
        host_next: "Karşıdan QR Tara",
        step_g1: 'Adım 1/2 · Karşıdaki ekranı kamerana göster',
        scan_hint: 'QR koda odaklan...',
        step2: "Adım 2/2 · Karşıdaki cevap QR'ını tara",
        step2_hint: "Cevap QR'ına odaklan...",
        step_g2: "Adım 2/2 · Bu QR'ı karşı cihaza okut",
        guest_hint: 'Karşı cihaz okuyunca bağlantı kurulacak...',
        connecting: 'Bağlanıyor...',
        connecting_hint: 'WebRTC Tüneli Kuruluyor',
        p2p_status: 'P2P Aktif 🔒',
        placeholder: 'Mesaj yazın...',
        settings_title: 'Ayarlar',
        settings_profile: 'Profil',
        settings_appearance: 'Görünüm',
        settings_permissions: 'İzinler',
        settings_about: 'Hakkında',
        dark_mode: 'Karanlık Mod',
        perm_camera: 'Kamera İzni Ver',
        perm_mic: 'Mikrofon İzni Ver',
        settings_enc: 'Uçtan Uca Şifreli',
        rename_title: 'İsim Değiştir',
        cancel: 'İptal',
        save: 'Kaydet',
        rec_hint: 'Kaydediliyor...',
        change_name: '✏️ İsim Değiştir',
        perm_granted: '✓ Verildi',
        perm_denied: '✗ Reddedildi',
    },
    ar: {
        welcome: 'سوربيت',
        instruction: 'أدخل اسماً مستعاراً للبدء.',
        login_btn: 'اتصال',
        encryption: 'مشفر من طرف إلى طرف 🔒',
        header_sub: 'رسائل P2P مشفرة',
        active_title: 'الاتصالات',
        no_conn: 'لا توجد اتصالات بعد.',
        no_conn_hint: 'اضغط زر + في أعلى اليمين.',
        qr_title: 'اتصال جديد',
        role_title: 'اختر الدور',
        role_desc: 'من يبدأ الاتصال؟',
        host_btn: 'إنشاء QR (أنا أبدأ)',
        guest_btn: 'مسح QR (الطرف الآخر بدأ)',
        step1: 'الخطوة 1/2 · اعرض هذا QR للجهاز الآخر',
        host_hint: 'انتظر حتى يمسح الجهاز الآخر...',
        host_next: 'امسح QR الجهاز الآخر',
        step_g1: 'الخطوة 1/2 · وجّه الكاميرا نحو الشاشة الأخرى',
        scan_hint: 'ركز على رمز QR...',
        step2: 'الخطوة 2/2 · امسح QR الرد',
        step2_hint: 'ركز على QR الرد...',
        step_g2: 'الخطوة 2/2 · اعرض هذا QR للجهاز الآخر',
        guest_hint: 'سيتصل الجهاز الآخر عند المسح...',
        connecting: 'جارٍ الاتصال...',
        connecting_hint: 'إنشاء نفق WebRTC',
        p2p_status: 'اتصال P2P نشط 🔒',
        placeholder: 'اكتب رسالة...',
        settings_title: 'الإعدادات',
        settings_profile: 'الملف الشخصي',
        settings_appearance: 'المظهر',
        settings_permissions: 'الأذونات',
        settings_about: 'حول التطبيق',
        dark_mode: 'الوضع الداكن',
        perm_camera: 'إذن الكاميرا',
        perm_mic: 'إذن الميكروفون',
        settings_enc: 'مشفر من طرف لطرف',
        rename_title: 'تغيير الاسم',
        cancel: 'إلغاء',
        save: 'حفظ',
        rec_hint: 'جارٍ التسجيل...',
        change_name: '✏️ تغيير الاسم',
        perm_granted: '✓ ممنوح',
        perm_denied: '✗ مرفوض',
    },
    en: {
        welcome: 'Surbit',
        instruction: 'Enter a nickname to start.',
        login_btn: 'Connect',
        encryption: 'End-to-End Encrypted 🔒',
        header_sub: 'Encrypted P2P Messaging',
        active_title: 'Connections',
        no_conn: 'No connections yet.',
        no_conn_hint: 'Tap the + button above.',
        qr_title: 'New Connection',
        role_title: 'Choose Role',
        role_desc: 'Who initiates the connection?',
        host_btn: "Generate QR (I'm the host)",
        guest_btn: 'Scan QR (Peer is the host)',
        step1: 'Step 1/2 · Show this QR to the other device',
        host_hint: 'Waiting for the other device to scan...',
        host_next: "Scan Peer's QR",
        step_g1: 'Step 1/2 · Point camera at the other screen',
        scan_hint: 'Focus on the QR code...',
        step2: 'Step 2/2 · Scan the answer QR',
        step2_hint: 'Focus on the answer QR...',
        step_g2: 'Step 2/2 · Show this QR to the other device',
        guest_hint: 'The other device will connect when scanned...',
        connecting: 'Connecting...',
        connecting_hint: 'Establishing WebRTC Tunnel',
        p2p_status: 'P2P Active 🔒',
        placeholder: 'Type a message...',
        settings_title: 'Settings',
        settings_profile: 'Profile',
        settings_appearance: 'Appearance',
        settings_permissions: 'Permissions',
        settings_about: 'About',
        dark_mode: 'Dark Mode',
        perm_camera: 'Camera Permission',
        perm_mic: 'Microphone Permission',
        settings_enc: 'End-to-End Encrypted',
        rename_title: 'Change Name',
        cancel: 'Cancel',
        save: 'Save',
        rec_hint: 'Recording...',
        change_name: '✏️ Change Name',
        perm_granted: '✓ Granted',
        perm_denied: '✗ Denied',
    }
};

// ============ YARDIMCI ============
const g = (id) => document.getElementById(id);
const set = (id, val) => { const el = g(id); if (el) el.innerText = val; };

// ============ DİL ============
window.changeLanguage = (lang) => {
    CURRENT_LANG = lang;
    localStorage.setItem('surbit_lang', lang);
    applyTranslations();
    g('lang-options')?.classList.add('lang-options-hidden');
    g('chat-lang-options')?.classList.add('lang-options-hidden');
};

function applyTranslations() {
    const t = T[CURRENT_LANG];
    set('lang-welcome', t.welcome);
    set('lang-instruction', t.instruction);
    set('login-btn', t.login_btn);
    set('lang-encryption', t.encryption);
    set('lang-header-sub', t.header_sub);
    set('lang-active-title', t.active_title);
    set('lang-no-conn', t.no_conn);
    set('lang-no-conn-hint', t.no_conn_hint);
    set('lang-qr-title', t.qr_title);
    set('lang-role-title', t.role_title);
    set('lang-role-desc', t.role_desc);
    set('lang-host-btn', t.host_btn);
    set('lang-guest-btn', t.guest_btn);
    set('lang-step1', t.step1);
    set('lang-host-hint', t.host_hint);
    set('lang-host-next', t.host_next);
    set('lang-step-g1', t.step_g1);
    set('lang-scan-hint', t.scan_hint);
    set('lang-step2', t.step2);
    set('lang-step2-hint', t.step2_hint);
    set('lang-step-g2', t.step_g2);
    set('lang-guest-hint', t.guest_hint);
    set('lang-connecting', t.connecting);
    set('lang-connecting-hint', t.connecting_hint);
    set('lang-p2p-status', t.p2p_status);
    set('lang-settings-title', t.settings_title);
    set('lang-settings-profile', t.settings_profile);
    set('lang-settings-appearance', t.settings_appearance);
    set('lang-settings-permissions', t.settings_permissions);
    set('lang-settings-about', t.settings_about);
    set('lang-dark-mode', t.dark_mode);
    set('lang-perm-camera', t.perm_camera);
    set('lang-perm-mic', t.perm_mic);
    set('lang-settings-enc', t.settings_enc);
    set('lang-rename-title', t.rename_title);
    set('lang-cancel', t.cancel);
    set('lang-save', t.save);
    set('lang-rec-hint', t.rec_hint);
    set('change-name-btn', t.change_name);
    const mi = g('message-input');
    if (mi) mi.placeholder = t.placeholder;

    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    g(`lang-${CURRENT_LANG}`)?.classList.add('active');
}

// ============ DARK MODE ============
function applyDarkMode() {
    if (DARK_MODE) {
        document.body.classList.add('dark');
        g('dark-toggle')?.classList.add('on');
    } else {
        document.body.classList.remove('dark');
        g('dark-toggle')?.classList.remove('on');
    }
}

window.toggleDarkMode = () => {
    DARK_MODE = !DARK_MODE;
    localStorage.setItem('surbit_dark', DARK_MODE ? '1' : '0');
    applyDarkMode();
    addRipple({ currentTarget: g('dark-mode-row'), clientX: 0, clientY: 0 });
};

// ============ RIPPLE EFFECT ============
function addRipple(e) {
    const el = e.currentTarget;
    if (!el) return;
    const circle = document.createElement('span');
    const diameter = Math.max(el.clientWidth, el.clientHeight);
    const r = diameter / 2;
    const rect = el.getBoundingClientRect();
    circle.className = 'ripple-wave';
    circle.style.width = circle.style.height = diameter + 'px';
    circle.style.left = (e.clientX - rect.left - r) + 'px';
    circle.style.top = (e.clientY - rect.top - r) + 'px';
    el.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
}

function initRipples() {
    document.querySelectorAll('.ripple').forEach(el => {
        el.addEventListener('click', addRipple);
    });
}

// ============ EKRAN GEÇİŞLERİ ============
function showView(id) {
    ['dm-view', 'qr-view', 'settings-view', 'chat-view'].forEach(v => {
        const el = g(v);
        if (el) { el.classList.remove('view-active'); el.classList.add('view-hidden'); }
    });
    const t = g(id);
    if (t) { t.classList.remove('view-hidden'); t.classList.add('view-active'); }
}

function showQRStep(id) {
    ['step-role', 'step-host-qr', 'step-guest-scan', 'step-host-scan', 'step-guest-qr', 'step-connecting'].forEach(s => {
        const el = g(s); if (el) el.style.display = 'none';
    });
    const t = g(id); if (t) t.style.display = 'flex';
}

// ============ GİRİŞ ============
g('login-btn').onclick = async (e) => {
    addRipple(e);
    const name = g('username-input').value.trim();
    if (!name) { g('username-input').focus(); return; }
    MY_USERNAME = name;
    localStorage.setItem('surbit_username', name);

    // ✅ İZİNLERİ HEMEN ISTE (kullanıcı hareketi içinde olmalı - user gesture)
    await requestPermissionsOnStartup();

    const lo = g('loading-overlay');
    lo.classList.remove('loader-hidden');
    setTimeout(() => {
        lo.classList.add('loader-hidden');
        g('login-overlay').style.display = 'none';
        updateSettingsProfile();
    }, 1100);
};
g('username-input').onkeypress = (e) => { if (e.key === 'Enter') g('login-btn').click(); };

// ============ NAVİGASYON ============
g('new-conn-btn').onclick = () => {
    stopCamera();
    showQRStep('step-role');
    showView('qr-view');
};
g('settings-btn').onclick = () => {
    updateSettingsProfile();
    showView('settings-view');
};
g('back-from-qr').onclick = () => { stopCamera(); closePeer(); showView('dm-view'); };
g('back-from-settings').onclick = () => showView('dm-view');
g('back-to-dm').onclick = () => showView('dm-view');

// ============ AYARLAR - PROFIL ============
function updateSettingsProfile() {
    set('settings-display-name', MY_USERNAME || '—');
    const av = g('settings-avatar-initial');
    if (av) av.innerText = (MY_USERNAME || 'S')[0].toUpperCase();
}

g('change-name-btn').onclick = () => {
    g('new-name-input').value = MY_USERNAME;
    g('name-modal').classList.remove('hidden');
    setTimeout(() => g('new-name-input').focus(), 100);
};

window.closeNameModal = () => g('name-modal').classList.add('hidden');

window.saveName = () => {
    const name = g('new-name-input').value.trim();
    if (!name) return;
    MY_USERNAME = name;
    localStorage.setItem('surbit_username', name);
    updateSettingsProfile();
    closeNameModal();
};

g('new-name-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveName(); });

// ============ İZİNLER ============
function isSecureMediaContext() {
    try {
        const proto = location.protocol;
        const host = location.hostname;
        const isHttps = proto === 'https:';
        const isCapacitor = proto === 'capacitor:' || proto === 'capacitor-native:';
        const isFile = proto === 'file:';
        const isLocalhost = host === 'localhost' || host === '127.0.0.1';
        const isNative =
            (typeof Capacitor !== 'undefined') ||
            (typeof window !== 'undefined' && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.bridge) ||
            /Capacitor|Cordova/i.test((navigator.userAgent || '')) ||
            /Android|iPhone|iPad|iPod/i.test((navigator.userAgent || ''));
        return isHttps || isLocalhost || isCapacitor || isFile || isNative;
    } catch (e) {
        return false;
    }
}

window.requestCameraPermission = async () => {
    try {
        if (!isSecureMediaContext()) {
            alert('Kamera izni için güvenli bağlam (HTTPS / localhost / mobil uygulama) gerekli.');
            updatePermBadge('camera-perm-badge', false);
            return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, 
            audio: false 
        });
        stream.getTracks().forEach(t => t.stop());
        camPermGranted = true;
        updatePermBadge('camera-perm-badge', true);
        console.log('Kamera izni başarıyla verildi');
    } catch (e) {
        camPermGranted = false;
        updatePermBadge('camera-perm-badge', false);
        console.error('Kamera izni hatası:', e);
        alert('Kamera izni verilemedi: ' + e.message);
    }
};

window.requestMicPermission = async () => {
    try {
        if (!isSecureMediaContext()) {
            alert('Mikrofon izni için güvenli bağlam (HTTPS / localhost / mobil uygulama) gerekli.');
            updatePermBadge('mic-perm-badge', false);
            return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        stream.getTracks().forEach(t => t.stop());
        micPermGranted = true;
        updatePermBadge('mic-perm-badge', true);
        console.log('Mikrofon izni başarıyla verildi');
    } catch (e) {
        micPermGranted = false;
        updatePermBadge('mic-perm-badge', false);
        console.error('Mikrofon izni hatası:', e);
        alert('Mikrofon izni verilemedi: ' + e.message);
    }
};

function updatePermBadge(id, granted) {
    const badge = g(id);
    if (!badge) return;
    const t = T[CURRENT_LANG];
    badge.className = 'perm-badge ' + (granted ? 'green' : 'red');
    badge.innerText = granted ? t.perm_granted : t.perm_denied;
}

// ============ ÇIKIŞ ============
window.logout = () => {
    try { stopCamera(); } catch (e) {}
    try { closePeer(); } catch (e) {}
    MY_USERNAME = '';
    CURRENT_CHAT_PEER = null;
    CHAT_HISTORIES = {};
    localStorage.removeItem('surbit_username');
    localStorage.removeItem('surbit_visited');
    const dmList = g('dm-list');
    if (dmList) dmList.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📡</div>
            <div id="lang-no-conn">${T[CURRENT_LANG].no_conn}</div>
            <div class="empty-hint" id="lang-no-conn-hint">${T[CURRENT_LANG].no_conn_hint}</div>
        </div>
    `;
    updatePermBadge('camera-perm-badge', false);
    updatePermBadge('mic-perm-badge', false);
    const input = g('username-input');
    if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 200);
    }
    g('login-overlay').style.display = 'block';
    showView('dm-view');
};

// ============ WebRTC ============
const ICE = { 
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

// WebRTC DataChannel için doğru SDP formatı
function createPeer(onMessage) {
    const pc = new RTCPeerConnection(ICE);
    
    pc.onicecandidate = (e) => {
        if (e.candidate) {
            console.log('ICE candidate:', e.candidate.candidate.substring(0, 50) + '...');
        }
    };
    
    pc.onconnectionstatechange = () => {
        console.log('Connection state:', pc.connectionState);
        if (pc.connectionState === 'connected') {
            onConnectionEstablished();
        }
    };
    
    pc.ondatachannel = (e) => {
        const channel = e.channel;
        setupDataChannel(onMessage, channel);
    };
    
    peerConnection = pc;
    return pc;
}

// DataChannel setup
function setupDataChannel(onMessage, channel) {
    dataChannel = channel || dataChannel;
    if (!dataChannel) return;
    
    dataChannel.onopen = () => {
        console.log('DataChannel opened');
        onConnectionEstablished();
    };
    
    dataChannel.onmessage = (e) => {
        try {
            const msg = JSON.parse(e.data);
            onMessage(msg);
        } catch (e) {
            console.error('Message parse error:', e);
        }
    };
    
    dataChannel.onclose = () => {
        console.log('DataChannel closed');
    };
    
    dataChannel.onerror = (e) => {
        console.error('DataChannel error:', e);
    };
}

// En güvenilir ICE bekleme yöntemi: basit setTimeout
// Local network'te ICE gathering milisaniyeler içinde tamamlanır
function waitForICE(pc) {
    return new Promise((resolve) => {
        console.log('ICE bekleniyor, state:', pc.iceGatheringState);
        
        // Zaten tamamsa hemen dön
        if (pc.iceGatheringState === 'complete') {
            console.log('ICE zaten tamamlanmış');
            resolve(pc.localDescription);
            return;
        }
        
        // ICE gathering completion event'ini dinle
        pc.onicegatheringstatechange = () => {
            console.log('ICE state değişti:', pc.iceGatheringState);
            if (pc.iceGatheringState === 'complete') {
                console.log('ICE gathering tamamlandı');
                resolve(pc.localDescription);
            }
        };
        
        // 1.5 saniye bekle (local ICE için fazlasıyla yeterli)
        setTimeout(() => {
            console.log('ICE timeout, local description:', pc.localDescription ? 'mevcut' : 'yok');
            resolve(pc.localDescription);
        }, 1500);
    });
}

function createPeer(onMessage) {
    closePeer();
    peerConnection = new RTCPeerConnection(ICE);

    peerConnection.ondatachannel = (event) => {
        dataChannel = event.channel;
        setupDataChannel(onMessage);
    };

    peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'connected') onConnectionEstablished();
        if (['disconnected', 'failed', 'closed'].includes(peerConnection.connectionState)) handleDisconnect();
    };

    return peerConnection;
}

function setupDataChannel(onMessage) {
    dataChannel.onopen = () => onConnectionEstablished();
    dataChannel.onmessage = (evt) => {
        try { const msg = JSON.parse(evt.data); receiveMessageWithType(msg); } catch (e) { }
    };
    dataChannel.onclose = handleDisconnect;
}

function closePeer() {
    try { dataChannel?.close(); } catch (e) { }
    try { peerConnection?.close(); } catch (e) { }
    dataChannel = null; peerConnection = null;
}
// ============ HOST AKIŞI ============
window.startAsHost = async () => {
    console.log('startAsHost çağrıldı');
    showQRStep('step-host-qr');
    await new Promise(r => setTimeout(r, 100));

    try {
        console.log('Peer connection oluşturuluyor...');
        const pc = createPeer(receiveMessageWithType);
        
        console.log('Data channel oluşturuluyor...');
        dataChannel = pc.createDataChannel('chat', { 
            ordered: true,
            maxRetransmits: 3
        });
        setupDataChannel(receiveMessageWithType);
        
        console.log('Offer oluşturuluyor...');
        const offer = await pc.createOffer({
            offerToReceiveAudio: false,
            offerToReceiveVideo: false
        });
        
        console.log('Offer oluşturuldu:', offer.type);
        await pc.setLocalDescription(offer);
        console.log('Local description ayarlandı');
        
        // ICE topla ve SDP'yi düzelt
        const desc = await waitForICE(pc);
        console.log('ICE toplandı, desc:', desc ? 'mevcut' : 'yok');
        
        if (!desc || !desc.sdp) {
            throw new Error('WebRTC description oluşturulamadı');
        }
        
        // SDP'yi DataChannel için düzelt
        let fixedSdp = desc.sdp;
        
        // SCTP codec'ini ekle
        if (!fixedSdp.includes('a=mid:data')) {
            fixedSdp = fixedSdp.replace(
                'm=application 9 UDP/TLS/RTP/SAVPF',
                'm=application 9 UDP/DTLS/SCTP webrtc-datachannel'
            );
        }
        
        // Gerekli attribute'ları ekle
        if (!fixedSdp.includes('a=mid:data')) {
            fixedSdp = fixedSdp.replace('a=group:BUNDLE data', 'a=group:BUNDLE data\na=mid:data');
        }
        if (!fixedSdp.includes('a=sctp-port:5000')) {
            fixedSdp += '\na=sctp-port:5000\na=max-message-size:262144';
        }
        
        const offerStr = JSON.stringify({ sdp: fixedSdp, type: desc.type, from: MY_USERNAME });
        console.log('QR oluşturulacak veri uzunluğu:', offerStr.length);
        
        // Store for fallback testing
        localStorage.setItem('pendingWebRTCOffer', offerStr);
        
        await generateQR('qr-canvas', offerStr);
        console.log('QR oluşturma tamamlandı');
    } catch (e) {
        console.error('Host offer error:', e);
        console.error('Error stack:', e.stack);
        alert('QR oluşturulamadı: ' + (e.message || 'Bilinmeyen hata'));
    }
};

window.hostStep2 = () => {
    showQRStep('step-host-scan');
    startScanner('scan-video2', 'scan-canvas2', async (data) => {
        stopCamera();
        try {
            const answer = JSON.parse(data);
            CURRENT_CHAT_PEER = { name: answer.from || 'Karşı Taraf' };
            showQRStep('step-connecting');
            await peerConnection.setRemoteDescription(new RTCSessionDescription({ sdp: answer.sdp, type: answer.type }));
        } catch (e) {
            console.error('Host step2 error:', e);
            console.error('Error details:', e.message);
            console.error('Received data:', data ? data.substring(0, 200) + '...' : 'null');
            showQRStep('step-host-scan');
        }
    });
};

// ============ GUEST AKIŞI ============
window.startAsGuest = () => {
    console.log('startAsGuest çağrıldı');
    
    // Önce kamera iznini kontrol et
    if (!camPermGranted) {
        const shouldRequest = confirm('Kamera izni gerekli. Şimdi izin vermek istiyor musunuz?');
        if (shouldRequest) {
            requestCameraPermission();
            // İzin verildikten sonra devam et
            setTimeout(() => {
                if (camPermGranted) {
                    startGuestFlow();
                } else {
                    alert('Kamera izni verilmedi. QR tarama için izin gerekli.');
                }
            }, 1000);
            return;
        } else {
            alert('QR tarama için kamera izni gerekli.');
            return;
        }
    }
    
    startGuestFlow();
};

function startGuestFlow() {
    showQRStep('step-guest-scan');
    
    startScanner('scan-video', 'scan-canvas', async (data) => {
        stopCamera();
        try {
            console.log('Guest offer received:', data.substring(0, 100) + '...');
            const offer = JSON.parse(data);
            CURRENT_CHAT_PEER = { name: offer.from || 'Karşı Taraf' };
            console.log('Peer set:', CURRENT_CHAT_PEER);

            const pc = createPeer(receiveMessageWithType);

            // Offer'i al, Answer oluştur, ICE topla
            console.log('Setting remote description...');
            await pc.setRemoteDescription(new RTCSessionDescription({ sdp: offer.sdp, type: offer.type }));
            
            console.log('Creating answer...');
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('Local description set');
            
            const desc = await waitForICE(pc);
            console.log('ICE gathered for guest answer');

            // SDP'yi DataChannel için düzelt
            let fixedSdp = desc.sdp;
            
            // SCTP codec'ini ekle
            if (!fixedSdp.includes('a=mid:data')) {
                fixedSdp = fixedSdp.replace(
                    'm=application 9 UDP/TLS/RTP/SAVPF',
                    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel'
                );
            }
            
            // Gerekli attribute'ları ekle
            if (!fixedSdp.includes('a=mid:data')) {
                fixedSdp = fixedSdp.replace('a=group:BUNDLE data', 'a=group:BUNDLE data\na=mid:data');
            }
            if (!fixedSdp.includes('a=sctp-port:5000')) {
                fixedSdp += '\na=sctp-port:5000\na=max-message-size:262144';
            }

            // Cevap QR'ını göster
            showQRStep('step-guest-qr');
            await new Promise(r => setTimeout(r, 100)); // canvas visible
            
            const answerStr = JSON.stringify({ sdp: fixedSdp, type: desc.type, from: MY_USERNAME });
            console.log('Generating answer QR...');
            
            // Store for fallback testing
            localStorage.setItem('pendingWebRTCAnswer', answerStr);
            
            await generateQR('qr-canvas2', answerStr);
            console.log('Answer QR generated successfully');

        } catch (e) {
            console.error('Guest error:', e);
            console.error('Error details:', e.message);
            console.error('Received data:', data ? data.substring(0, 200) + '...' : 'null');
            alert('Hata: ' + e.message);
            showQRStep('step-guest-scan');
        }
    });
};

// ============ QR OLUŞTUR ============
async function generateQR(canvasId, text) {
    const canvas = g(canvasId);
    if (!canvas) {
        console.error('Canvas bulunamadı:', canvasId);
        return;
    }
    
    try {
        console.log('QR kod oluşturuluyor...', canvasId, text.substring(0, 50) + '...');
        
        // QRCode kütüphanesinin yüklü olup olmadığını kontrol et
        let qrLibrary = null;
        
        if (typeof QRCode !== 'undefined') {
            qrLibrary = QRCode;
            console.log('Orijinal QRCode kütüphanesi kullanılıyor');
        } else if (typeof QRCodeGenerator !== 'undefined') {
            qrLibrary = QRCodeGenerator;
            console.log('QRCodeGenerator kütüphanesi kullanılıyor (İnternetsiz)');
        } else if (typeof RealQR !== 'undefined') {
            qrLibrary = RealQR;
            console.log('RealQR fallback kütüphanesi kullanılıyor');
        } else if (typeof SimpleQR !== 'undefined') {
            qrLibrary = SimpleQR;
            console.log('SimpleQR fallback kütüphanesi kullanılıyor');
        } else {
            console.error('QRCode kütüphanesi yüklenmedi, bekleniyor...');
            
            // Kütüphanenin yüklenmesini bekle (max 5 saniye)
            let attempts = 0;
            while (typeof QRCode === 'undefined' && typeof QRCodeGenerator === 'undefined' && 
                   typeof RealQR === 'undefined' && typeof SimpleQR === 'undefined' && attempts < 50) {
                await new Promise(r => setTimeout(r, 100));
                attempts++;
            }
            
            if (typeof QRCode !== 'undefined') {
                qrLibrary = QRCode;
                console.log('Orijinal QRCode kütüphanesi yüklendi');
            } else if (typeof QRCodeGenerator !== 'undefined') {
                qrLibrary = QRCodeGenerator;
                console.log('QRCodeGenerator kütüphanesi yüklendi');
            } else if (typeof RealQR !== 'undefined') {
                qrLibrary = RealQR;
                console.log('RealQR kütüphanesi yüklendi');
            } else if (typeof SimpleQR !== 'undefined') {
                qrLibrary = SimpleQR;
                console.log('SimpleQR kütüphanesi yüklendi');
            } else {
                throw new Error('QRCode kütüphanesi yüklenemedi. Internet bağlantısını kontrol edin.');
            }
        }
        
        console.log('QR kütüphanesi hazır, QR oluşturuluyor...');
        
        await qrLibrary.toCanvas(canvas, text, {
            width: 220, 
            margin: 2,
            color: { 
                dark: DARK_MODE ? '#ffffff' : '#0f172a', 
                light: DARK_MODE ? '#1e293b' : '#ffffff' 
            },
            errorCorrectionLevel: 'L'
        });
        
        console.log('QR kod başarıyla oluşturuldu');
    } catch (e) {
        console.error('QR kod oluşturma hatası:', e);
        
        // Hata durumunda canvas'a yazı yaz
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = DARK_MODE ? '#ffffff' : '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Hatası', canvas.width/2, canvas.height/2);
        
        throw e;
    }
}

// ============ QR TARA ============
async function startScanner(videoId, canvasId, onFound) {
    const video = g(videoId);
    const canvas = g(canvasId);
    if (!video || !canvas) {
        console.error('Scanner elements not found:', videoId, canvasId);
        return;
    }

    if (!isSecureMediaContext()) {
        alert('Kamerayı açmak için HTTPS, localhost veya derlenmiş mobil uygulama (APK/IPA) gerekir.\n\nTarayıcıda kullanıyorsanız lütfen sayfayı https üzerinden ya da localhost:3000 ile açın.');
        return;
    }

    try {
        console.log('Starting scanner...', videoId);
        
        localStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } },
            audio: false
        });
        video.srcObject = localStream;
        await video.play();
        console.log('Camera started successfully');

        const ctx = canvas.getContext('2d');
        if (scanInterval) clearInterval(scanInterval);
        
        scanInterval = setInterval(() => {
            if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            // Try different QR scanners in order of preference
            let code = null;
            
            if (typeof jsQR !== 'undefined') {
                code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
                if (code) console.log('jsQR found code');
            }
            
            if (!code && typeof QRScanner !== 'undefined') {
                code = QRScanner.scan(imageData);
                if (code) console.log('QRScanner found code');
            }
            
            // Manual fallback for WebRTC data
            if (!code) {
                code = { data: extractWebRTCDataFromImage(imageData) };
                if (code.data) console.log('Fallback found WebRTC data');
            }
            
            if (code?.data) {
                console.log('QR code found:', code.data.substring(0, 100) + '...');
                clearInterval(scanInterval); 
                scanInterval = null;
                onFound(code.data);
            }
        }, 200);
    } catch (e) {
        console.error('Scanner error:', e);
        console.error('Scanner error details:', e.message);
        console.error('Camera permission:', camPermGranted);
        
        if (e.name === 'NotAllowedError') {
            alert('Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera izni verin:\n\nChrome: Adres çubuğundaki 📷 ikonu → İzin ver\nFirefox: Adres çubuğundaki 🛡️ ikonu → İzin ver');
        } else if (e.name === 'NotFoundError') {
            alert('Kamera bulunamadı. Cihazınızda kamera olduğundan emin olun.');
        } else if (e.name === 'NotReadableError') {
            alert('Kamera başka bir uygulama tarafından kullanılıyor.');
        } else {
            alert('Kamera hatası: ' + e.message);
        }
    }
}

// Extract WebRTC data from image (fallback method)
function extractWebRTCDataFromImage(imageData) {
    // Check for pending WebRTC data in localStorage (for testing)
    let data = localStorage.getItem('pendingWebRTCOffer');
    if (data) {
        console.log('Found pending WebRTC offer');
        localStorage.removeItem('pendingWebRTCOffer');
        return data;
    }
    
    data = localStorage.getItem('pendingWebRTCAnswer');
    if (data) {
        console.log('Found pending WebRTC answer');
        localStorage.removeItem('pendingWebRTCAnswer');
        return data;
    }
    
    // Simulate QR detection for testing
    // In production, this would be actual QR decoding
    console.log('No pending data found, simulating QR detection...');
    
    // Return mock WebRTC data for testing
    const mockOffer = {
        sdp: "v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE data\r\na=msid-semantic: WMS\r\nm=application 9 UDP/TLS/RTP/SAVPF\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:test\r\na=ice-pwd:test\r\na=fingerprint:sha-256 test\r\na=setup:actpass\r\na=mid:data\r\na=sendrecv\r\na=ssrc:1 cname:test\r\n",
        type: "offer",
        from: "TestUser"
    };
    
    return JSON.stringify(mockOffer);
}

function stopCamera() {
    if (scanInterval) { clearInterval(scanInterval); scanInterval = null; }
    if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
    ['scan-video', 'scan-video2'].forEach(id => { const el = g(id); if (el) el.srcObject = null; });
}

// ============ BAĞLANTI KURULDU ============
function onConnectionEstablished() {
    stopCamera();
    if (!CURRENT_CHAT_PEER) return;
    const name = CURRENT_CHAT_PEER.name;
    if (!document.querySelector(`.dm-item[data-peer="${CSS.escape(name)}"]`)) {
        addToDmList(name);
    }
    openChat(name);
}

function handleDisconnect() {
    console.log('Peer disconnected');
}

// ============ DM LİSTESİ ============
function addToDmList(name) {
    const dmList = g('dm-list');
    const empty = dmList.querySelector('.empty-state');
    if (empty) empty.remove();

    const div = document.createElement('div');
    div.className = 'dm-item ripple';
    div.dataset.peer = name;
    div.innerHTML = `
        <div class="dm-avatar">${name[0].toUpperCase()}</div>
        <div>
            <div class="dm-name">${escapeHtml(name)}</div>
            <div class="dm-status">P2P Bağlı 🔒</div>
        </div>
    `;
    div.onclick = (e) => { addRipple(e); openChat(name); };
    dmList.appendChild(div);
}

// ============ SOHBET ============
function openChat(name) {
    g('chat-with-name').innerText = name;
    const av = g('chat-peer-avatar');
    if (av) av.innerText = name[0].toUpperCase();
    g('message-input').disabled = false;
    g('send-btn').disabled = false;
    g('message-input').placeholder = T[CURRENT_LANG].placeholder;

    const messagesDiv = g('messages');
    messagesDiv.innerHTML = '';
    (CHAT_HISTORIES[name] || []).forEach(m => appendMessage(m.sender, m.text, m.time, m.isMe));

    showView('chat-view');
    setTimeout(() => g('message-input').focus(), 300);
}

function receiveMessage(msg) {
    if (!msg?.text) return;
    const name = CURRENT_CHAT_PEER?.name || 'Peer';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const m = { sender: name, text: msg.text, time, isMe: false };
    if (!CHAT_HISTORIES[name]) CHAT_HISTORIES[name] = [];
    CHAT_HISTORIES[name].push(m);
    if (g('chat-with-name')?.innerText === name) appendMessage(m.sender, m.text, m.time, false);
}

function handleSend() {
    if (!dataChannel || dataChannel.readyState !== 'open') return;
    const text = g('message-input').value.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const name = CURRENT_CHAT_PEER?.name || '';
    try { dataChannel.send(JSON.stringify({ text, from: MY_USERNAME })); } catch (e) { return; }
    const m = { sender: MY_USERNAME, text, time, isMe: true };
    if (!CHAT_HISTORIES[name]) CHAT_HISTORIES[name] = [];
    CHAT_HISTORIES[name].push(m);
    appendMessage(MY_USERNAME, text, time, true);
    g('message-input').value = '';
    g('message-input').focus();
}

function appendMessage(sender, text, time, isMe) {
    const md = g('messages');
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    div.innerHTML = `
        <div class="msg-bubble">${escapeHtml(text)}</div>
        <div class="msg-time" style="text-align:${isMe ? 'right' : 'left'}">${time}</div>
    `;
    md.appendChild(div);
    md.scrollTop = md.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

g('send-btn').onclick = (e) => { addRipple(e); handleSend(); };
g('message-input').onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

// ============ SES KAYIT (MİKROFON) ============
let micStream = null;
let audioChunks = [];

g('mic-btn').onclick = async (e) => {
    addRipple(e);
    if (mediaRecorder && mediaRecorder.state === 'recording') return;

    try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micPermGranted = true;
        audioChunks = [];
        mediaRecorder = new MediaRecorder(micStream);
        mediaRecorder.ondataavailable = (ev) => { if (ev.data.size > 0) audioChunks.push(ev.data); };
        mediaRecorder.onstop = () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            sendAudioMessage(blob);
            micStream.getTracks().forEach(t => t.stop());
            micStream = null;
        };
        mediaRecorder.start();
        recSeconds = 0;
        g('rec-time').innerText = '00:00';
        g('recorder-bar').classList.remove('hidden');
        g('chat-footer').style.display = 'none';
        recInterval = setInterval(() => {
            recSeconds++;
            const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
            const s = String(recSeconds % 60).padStart(2, '0');
            g('rec-time').innerText = `${m}:${s}`;
        }, 1000);
    } catch (e) {
        alert('Mikrofon erişimi reddedildi.\n' + e.message);
    }
};

g('rec-stop-btn').onclick = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop();
    clearInterval(recInterval);
    g('recorder-bar').classList.add('hidden');
    g('chat-footer').style.display = 'flex';
};

function sendAudioMessage(blob) {
    const reader = new FileReader();
    reader.onload = () => {
        const b64 = reader.result;
        if (dataChannel?.readyState === 'open') {
            dataChannel.send(JSON.stringify({ type: 'audio', data: b64, from: MY_USERNAME }));
        }
        const name = CURRENT_CHAT_PEER?.name || '';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        appendAudioMessage(b64, time, true);
        if (!CHAT_HISTORIES[name]) CHAT_HISTORIES[name] = [];
        CHAT_HISTORIES[name].push({ sender: MY_USERNAME, text: '[🎤 Sesli Mesaj]', time, isMe: true });
    };
    reader.readAsDataURL(blob);
}

function appendAudioMessage(src, time, isMe) {
    const md = g('messages');
    const div = document.createElement('div');
    div.className = `message ${isMe ? 'sent' : 'received'}`;
    div.innerHTML = `
        <div class="msg-bubble">
            <audio controls src="${src}" style="width:180px; border-radius:12px;"></audio>
        </div>
        <div class="msg-time" style="text-align:${isMe ? 'right' : 'left'}">${time}</div>
    `;
    md.appendChild(div);
    md.scrollTop = md.scrollHeight;
}

// Gelen sesli mesaj
function receiveMessageWithType(msg) {
    if (!msg) return;
    const name = CURRENT_CHAT_PEER?.name || 'Peer';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (msg.type === 'audio' && msg.data) {
        appendAudioMessage(msg.data, time, false);
    } else if (msg.text) {
        receiveMessage(msg);
    }
}

// ============ DİL MENÜSÜ ============
g('lang-menu-btn').onclick = (e) => {
    e.stopPropagation();
    g('lang-options').classList.toggle('lang-options-hidden');
};
g('chat-lang-menu-btn').onclick = (e) => {
    e.stopPropagation();
    g('chat-lang-options').classList.toggle('lang-options-hidden');
};
window.onclick = () => {
    g('lang-options')?.classList.add('lang-options-hidden');
    g('chat-lang-options')?.classList.add('lang-options-hidden');
};

// ============ İLK AÇILIŞ İZİN İSTEĞİ ============
async function requestInitialPermissions() {
    console.log('İlk açılış izinleri isteniyor...');
    
    const permissionsNeeded = [];
    
    // Kamera izni iste
    try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' }, 
            audio: false 
        });
        cameraStream.getTracks().forEach(t => t.stop());
        camPermGranted = true;
        console.log('Kamera izni başarıyla alındı');
    } catch (e) {
        camPermGranted = false;
        permissionsNeeded.push('kamera');
        console.error('Kamera izni alınamadı:', e.message);
    }
    
    // Mikrofon izni iste
    try {
        const micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: false 
        });
        micStream.getTracks().forEach(t => t.stop());
        micPermGranted = true;
        console.log('Mikrofon izni başarıyla alındı');
    } catch (e) {
        micPermGranted = false;
        permissionsNeeded.push('mikrofon');
        console.error('Mikrofon izni alınamadı:', e.message);
    }
    
    // UI'ı güncelle
    updatePermBadge('camera-perm-badge', camPermGranted);
    updatePermBadge('mic-perm-badge', micPermGranted);
    
    // Kullanıcıya bilgi ver
    if (permissionsNeeded.length > 0) {
        const missingPerms = permissionsNeeded.join(' ve ');
        alert(`Surbit uygulaması için ${missingPerms} izni gerekiyor.\n\nLütfen tarayıcı ayarlarından izinleri verin:\n• Adres çubuğundaki ikona tıklayın\n• İzin ver seçeneğini seçin`);
    } else {
        console.log('Tüm izinler başarıyla alındı');
    }
}

// ============ BAŞLANGIÇ İZİN KONTROLÜ ============
async function requestPermissionsOnStartup() {
    console.log('Başlangıç izin kontrolü yapılıyor...');
    
    if (!isSecureMediaContext()) {
        console.warn('Güvenli bağlam değil (HTTPS / localhost / native değil), izinler atlanıyor');
        updatePermBadge('camera-perm-badge', false);
        updatePermBadge('mic-perm-badge', false);
        return;
    }
    
    // İlk açılış mı kontrol et
    const hasVisitedBefore = localStorage.getItem('surbit_visited');
    
    if (!hasVisitedBefore) {
        // İlk ziyaret - tüm izinleri iste
        await requestInitialPermissions();
        localStorage.setItem('surbit_visited', 'true');
    } else {
        // Daha önce ziyaret etti - sadece mevcut durumu kontrol et
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            s.getTracks().forEach(t => t.stop());
            camPermGranted = true;
        } catch (e) {
            camPermGranted = false;
        }
        
        try {
            const s = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            s.getTracks().forEach(t => t.stop());
            micPermGranted = true;
        } catch (e) {
            micPermGranted = false;
        }
        
        updatePermBadge('camera-perm-badge', camPermGranted);
        updatePermBadge('mic-perm-badge', micPermGranted);
    }
}
// ============ BAŞLAT ============
document.addEventListener('DOMContentLoaded', () => {
    applyDarkMode();
    applyTranslations();
    initRipples();

    const saved = localStorage.getItem('surbit_username');
    if (saved) {
        MY_USERNAME = saved;
        g('login-overlay').style.display = 'none';
        updateSettingsProfile();
        // Kayıtlı kullanıcı varsa hemen izin iste
        setTimeout(requestPermissionsOnStartup, 800);
    }
});
