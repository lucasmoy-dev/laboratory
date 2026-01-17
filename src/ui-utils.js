export function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('div').innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

export function openPrompt(title, desc, isPassword = true) {
    return new Promise((resolve) => {
        const modal = document.getElementById('prompt-modal');
        const input = document.getElementById('prompt-input');
        if (!modal || !input) return resolve(null);

        document.getElementById('prompt-title').innerText = title;
        document.getElementById('prompt-desc').innerText = desc;
        input.type = isPassword ? 'password' : 'text';
        input.value = '';
        input.placeholder = isPassword ? 'Tu contraseña' : 'Escribe aquí...';

        input.classList.toggle('tracking-widest', isPassword);
        input.classList.toggle('text-center', isPassword);

        const eyeBtn = modal.querySelector('.toggle-pass');
        if (eyeBtn) eyeBtn.style.display = isPassword ? 'flex' : 'none';

        // Biometric handling
        const bioBtn = document.getElementById('prompt-biometric');
        const bioEnabled = localStorage.getItem('cn_bio_enabled') === 'true';

        if (bioBtn) {
            if (isPassword && window.PublicKeyCredential) {
                bioBtn.classList.remove('hidden');
                bioBtn.onclick = async () => {
                    try {
                        const challenge = new Uint8Array(32);
                        window.crypto.getRandomValues(challenge);

                        // Try Authentication first
                        try {
                            await navigator.credentials.get({
                                publicKey: {
                                    challenge,
                                    rpId: window.location.hostname,
                                    userVerification: "required",
                                    timeout: 60000
                                }
                            });
                        } catch (authErr) {
                            console.warn("Bio Auth failed, trying creation fallback...", authErr);
                            // Fallback to Registration (Proof of Presence via Creation)
                            await navigator.credentials.create({
                                publicKey: {
                                    challenge,
                                    rp: { name: "Private Notes", id: window.location.hostname },
                                    user: {
                                        id: new Uint8Array(16),
                                        name: "user",
                                        displayName: "User"
                                    },
                                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                                    timeout: 60000,
                                    authenticatorSelection: { authenticatorAttachment: "platform" },
                                    attestation: "none"
                                }
                            });
                        }

                        cleanup();
                        resolve({ biometric: true });
                    } catch (e) {
                        console.error("Bio Prompt Failed", e);
                        showToast('⚠️ No se pudo verificar la huella');
                    }
                };
            } else {
                bioBtn.classList.add('hidden');
            }
        }

        modal.classList.remove('hidden');
        safeCreateIcons();
        input.focus();

        const cleanup = () => {
            modal.classList.add('hidden');
            window.removeEventListener('keydown', handleKey);
        };

        const handleKey = (e) => {
            if (e.key === 'Enter') confirm();
            if (e.key === 'Escape') cancel();
        };
        window.addEventListener('keydown', handleKey);

        const confirm = () => {
            const val = input.value;
            cleanup();
            resolve(val);
        };

        const cancel = () => {
            cleanup();
            resolve(null);
        };

        document.getElementById('prompt-confirm').onclick = confirm;
        document.getElementById('prompt-cancel').onclick = cancel;
    });
}

export function isColorDark(hex) {
    if (!hex) return true;
    const color = hex.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return true;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 128;
}

export function safeCreateIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}
