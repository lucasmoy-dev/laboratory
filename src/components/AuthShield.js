import { SecurityService as Security } from '../security.js';
import { state, loadLocalEncrypted } from '../state.js';
// ... imports
import { showToast, safeCreateIcons } from '../ui-utils.js';
import { t } from '../i18n.js';

export function getAuthShieldTemplate() {
    const isAuthed = !!(sessionStorage.getItem('cn_vault_key_v3') || localStorage.getItem('cn_vault_key_v3'));
    return `
    <div id="auth-shield" class="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm transition-opacity duration-300 ${isAuthed ? 'opacity-0 pointer-events-none' : ''}" style="${isAuthed ? 'display: none' : ''}">
        <div class="w-full max-w-[320px] p-6 space-y-4 bg-card border rounded-2xl shadow-2xl">
            <div class="text-center space-y-1.5">
                <div class="mx-auto w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    <i data-lucide="lock" class="w-4 h-4"></i>
                </div>
                <h1 class="text-xl font-bold tracking-tight" id="auth-title">${t('auth.title')}</h1>
                <p class="text-xs text-muted-foreground" id="auth-desc">${t('auth.desc')}</p>
            </div>
            <div class="space-y-3">
                <div class="relative group">
                    <input type="password" id="master-password" placeholder="${t('auth.pass_placeholder')}" class="h-10 w-full pl-4 pr-11 text-sm bg-muted/30 border-none ring-1 ring-border focus:ring-2 focus:ring-primary rounded-xl transition-all">
                    <button type="button" class="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground toggle-pass" data-target="master-password">
                        <i data-lucide="eye" class="w-3.5 h-3.5 icon-show"></i>
                    </button>
                </div>
                <div class="relative group hidden" id="confirm-password-wrapper">
                    <input type="password" id="confirm-password" placeholder="${t('auth.repeat_placeholder')}" class="h-10 w-full pl-4 pr-11 text-sm bg-muted/30 border-none ring-1 ring-border focus:ring-2 focus:ring-primary rounded-xl transition-all">
                    <button type="button" class="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground toggle-pass" data-target="confirm-password">
                        <i data-lucide="eye" class="w-3.5 h-3.5 icon-show"></i>
                    </button>
                </div>
                
                <div class="flex items-center gap-2 py-0.5">
                    <input type="checkbox" id="auth-remember" class="w-3.5 h-3.5 rounded border-border text-primary focus:ring-primary">
                    <label for="auth-remember" class="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70 cursor-pointer select-none">${t('auth.remember_me')}</label>
                </div>

                <button id="auth-submit" class="btn-shad btn-shad-primary w-full h-11 font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">${t('auth.unlock')}</button>
                
                <button id="auth-biometric" class="hidden btn-shad btn-shad-secondary w-full h-10 font-bold flex items-center justify-center gap-2 rounded-xl text-sm border-none bg-muted hover:bg-muted/80">
                     <i data-lucide="fingerprint" class="w-4 h-4"></i> <span id="bio-text" class="text-xs uppercase tracking-wide">${t('auth.use_bio')}</span>
                </button>

                <div id="auth-extra-actions" class="hidden pt-4 border-t border-border/50">
                    <button id="auth-force-reload" class="flex items-center justify-center gap-2 w-full p-3 text-xs text-destructive bg-destructive/5 hover:bg-destructive/10 rounded-lg border border-destructive/10 transition-all font-medium">
                        <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i> ${t('auth.problems')}
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

export async function checkAuthStatus(onSuccess) {
    const shield = document.getElementById('auth-shield');
    const isSetup = !localStorage.getItem('cn_master_hash_v3');
    const savedKeySession = sessionStorage.getItem('cn_vault_key_v3');
    const savedKeyLocal = localStorage.getItem('cn_vault_key_v3');
    const isBioEnabled = localStorage.getItem('cn_bio_enabled') === 'true';
    const isRemembered = localStorage.getItem('cn_remember_me_v3') === 'true';

    // Show bio button if supported and set up
    const bioBtn = document.getElementById('auth-biometric');
    if (window.PublicKeyCredential && bioBtn) {
        bioBtn.classList.remove('hidden');
        if (isBioEnabled) {
            document.getElementById('bio-text').innerText = t('auth.bio_unlock');
            // Auto-trigger bio check if enabled? 
            // Maybe slightly delayed to avoid conflicts on load
            // setTimeout(() => handleBiometricAuth(onSuccess), 500); 
        } else {
            document.getElementById('bio-text').innerText = t('auth.bio_setup');
        }
    }

    if (isSetup) {
        showSetupPage();
    } else if (savedKeySession) {
        // Auto-login from active session
        finishLogin(savedKeySession, onSuccess);
    } else if (savedKeyLocal) {
        if (isBioEnabled) {
            // Bio is enabled, show button and auto-trigger
            setTimeout(() => {
                handleBiometricAuth(onSuccess).catch(() => {
                    console.log('Auto-bio failed/cancelled');
                });
            }, 500);
        } else if (isRemembered) {
            // "Remember Me" was checked, auto-login without password
            finishLogin(savedKeyLocal, onSuccess);
        } else {
            // Key exists but no Bio and no Remember Me (maybe left over from previous bio session)
            showLoginPage();
        }
    } else {
        showLoginPage();
    }
}

function clearAuth() {
    sessionStorage.removeItem('cn_vault_key_v3');
    localStorage.removeItem('cn_vault_key_v3');
}

// ... existing showSetupPage and showLoginPage ...

export async function handleBiometricAuth(onSuccess) {
    const isEnabled = localStorage.getItem('cn_bio_enabled') === 'true';

    if (!isEnabled) {
        // SETUP MODE
        const pass = document.getElementById('master-password').value;
        if (!pass) return showToast('⚠️ Ingresa tu contraseña primero para configurar');

        const authHash = await Security.hash(pass);
        const existingHash = localStorage.getItem('cn_master_hash_v3');

        if (authHash !== existingHash) return showToast('❌ Contraseña incorrecta');

        // Verify WebAuthn support
        if (!window.PublicKeyCredential) return showToast('❌ Tu dispositivo no soporta biometría');

        try {
            // Create dummy credential to trigger permission
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            await navigator.credentials.create({
                publicKey: {
                    challenge,
                    rp: { name: t('app_name'), id: window.location.hostname },
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

            // Save state
            localStorage.setItem('cn_bio_enabled', 'true');
            // Ensure key is saved for auto-retrieval
            const vaultKey = await Security.deriveVaultKey(pass);
            localStorage.setItem('cn_vault_key_v3', vaultKey);

            showToast('✅ Huella activada');

            // Login
            finishLogin(vaultKey, onSuccess);
        } catch (e) {
            console.error(e);
            showToast('❌ Error al activar biometría: ' + e.message);
        }

    } else {
        // LOGIN MODE
        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            await navigator.credentials.get({
                publicKey: {
                    challenge,
                    rpId: window.location.hostname,
                    userVerification: "required",
                    timeout: 60000
                }
            });

            // If success, get key
            const vaultKey = localStorage.getItem('cn_vault_key_v3');
            if (vaultKey) {
                finishLogin(vaultKey, onSuccess);
            } else {
                showToast('❌ Error: Llave no encontrada. Ingresa contraseña.');
                localStorage.setItem('cn_bio_enabled', 'false'); // Reset
            }

        } catch (e) {
            console.error(e);
            showToast(t('auth.bio_fail'));
        }
    }
}

async function finishLogin(vaultKey, onSuccess) {
    const shield = document.getElementById('auth-shield');
    shield.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => shield.style.display = 'none', 300);
    document.getElementById('app').classList.remove('opacity-0');
    sessionStorage.setItem('cn_vault_key_v3', vaultKey);
    await loadLocalEncrypted(vaultKey);
    onSuccess();
}

export async function handleMasterAuth(onSuccess) {
    // ... (rest of handleMasterAuth mostly same, but need to check bio toggle logic)
    const pass = document.getElementById('master-password').value;
    const confirmPass = document.getElementById('confirm-password').value;
    const isSetup = !localStorage.getItem('cn_master_hash_v3');

    if (!pass) return showToast('Ingresa una contraseña');

    if (isSetup) {
        if (!confirmPass) return showToast(t('auth.confirm_pass'));
        if (pass !== confirmPass) return showToast(t('auth.password_mismatch'));
        if (pass.length < 4) return showToast(t('auth.password_short'));
    }

    const authHash = await Security.hash(pass);
    const vaultKey = await Security.deriveVaultKey(pass);
    const existingHash = localStorage.getItem('cn_master_hash_v3');

    const remember = document.getElementById('auth-remember').checked;

    // ... cleanup ...

    if (!existingHash) {
        localStorage.setItem('cn_master_hash_v3', authHash);
        if (remember) {
            localStorage.setItem('cn_vault_key_v3', vaultKey);
            localStorage.setItem('cn_remember_me_v3', 'true');
        }
        finishLogin(vaultKey, onSuccess);
        showToast(t('auth.vault_created'));
    } else if (existingHash === authHash) {
        if (remember) {
            localStorage.setItem('cn_vault_key_v3', vaultKey);
            localStorage.setItem('cn_remember_me_v3', 'true');
        } else if (!localStorage.getItem('cn_bio_enabled') === 'true') {
            // If not remembering and not using bio, clean up local key
            localStorage.removeItem('cn_vault_key_v3');
            localStorage.removeItem('cn_remember_me_v3');
        }
        finishLogin(vaultKey, onSuccess);
        showToast(t('auth.vault_opened'));
    } else {
        return showToast(t('auth.incorrect_pass'));
    }
}
