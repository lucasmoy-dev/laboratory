import { safeCreateIcons } from '../ui-utils.js';
import { t, currentLang, setLanguage } from '../i18n.js';

export function getSettingsTemplate() {
    return `
    <div id="settings-modal" class="fixed inset-0 z-[80] hidden">
        <div class="dialog-overlay"></div>
        <div class="dialog-content w-full h-full md:w-auto md:max-w-4xl p-0 overflow-hidden flex flex-col md:flex-row rounded-none md:rounded-xl">
            <!-- Sidebar Settings -->
            <div id="settings-sidebar" class="w-full md:w-64 bg-muted/50 border-b md:border-b-0 md:border-r p-4 flex flex-col gap-2 overflow-y-auto">
                <div class="flex items-center justify-between mb-2 md:hidden">
                    <h3 class="font-bold text-xl">${t('settings.title')}</h3>
                    <button class="close-settings p-2 hover:bg-accent rounded-full">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <button class="settings-tab py-3 md:py-2.5 px-4 text-base md:text-sm flex items-center gap-3 md:gap-2 active-highlight" data-tab="appearance">
                    <i data-lucide="palette" class="w-5 h-5"></i> ${t('settings.general')}
                </button>
                <button class="settings-tab py-3 md:py-2.5 px-4 text-base md:text-sm flex items-center gap-3 md:gap-2" data-tab="sync">
                    <i data-lucide="refresh-cw" class="w-5 h-5"></i> ${t('settings.sync')}
                </button>
                <button class="settings-tab py-3 md:py-2.5 px-4 text-base md:text-sm flex items-center gap-3 md:gap-2" data-tab="security">
                    <i data-lucide="shield" class="w-5 h-5"></i> ${t('settings.security')}
                </button>
                <button class="settings-tab text-destructive mt-auto py-3 md:py-2.5 px-4 text-base md:text-sm flex items-center gap-3 md:gap-2" data-tab="danger">
                    <i data-lucide="alert-triangle" class="w-5 h-5"></i> ${t('settings.danger')}
                </button>
            </div>

            <!-- Content Area -->
            <div class="flex-1 flex flex-col min-w-0" id="settings-content-area">
                <div class="p-4 md:p-3 border-b flex items-center gap-2">
                    <button class="md:hidden p-2 hover:bg-accent rounded-xl group" id="settings-back-btn">
                        <i data-lucide="arrow-left" class="w-5 h-5 text-muted-foreground group-hover:text-foreground"></i>
                    </button>
                    <h2 id="settings-tab-title" class="font-bold text-lg md:text-sm flex-1">${t('settings.title')}</h2>
                    <button class="close-settings p-2 hover:bg-accent rounded-xl group">
                        <i data-lucide="x" class="w-5 h-5 text-muted-foreground group-hover:text-foreground"></i>
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto p-6" id="settings-panels">
                    <!-- Panel: Apariencia -->
                    <div id="panel-appearance" class="settings-panel space-y-6">
                        <section class="space-y-4">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">${t('settings.lang')}</h3>
                            <div class="space-y-2">
                                <div id="language-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="en">
                                        <span class="text-lg">🇺🇸</span> <span class="text-xs font-medium">English</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="es">
                                        <span class="text-lg">🇪🇸</span> <span class="text-xs font-medium">Español</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="fr">
                                        <span class="text-lg">🇫🇷</span> <span class="text-xs font-medium">Français</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="de">
                                        <span class="text-lg">🇩🇪</span> <span class="text-xs font-medium">Deutsch</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="it">
                                        <span class="text-lg">🇮🇹</span> <span class="text-xs font-medium">Italiano</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="pt">
                                        <span class="text-lg">🇵🇹</span> <span class="text-xs font-medium">Português</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="ru">
                                        <span class="text-lg">🇷🇺</span> <span class="text-xs font-medium">Русский</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="zh">
                                        <span class="text-lg">🇨🇳</span> <span class="text-xs font-medium">中文</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="ja">
                                        <span class="text-lg">🇯🇵</span> <span class="text-xs font-medium">日本語</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="ko">
                                        <span class="text-lg">🇰🇷</span> <span class="text-xs font-medium">한국어</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="ar">
                                        <span class="text-lg">🇸🇦</span> <span class="text-xs font-medium">العربية</span>
                                    </button>
                                    <button class="lang-btn p-2 rounded-lg border bg-card flex items-center gap-2 hover:bg-accent transition-all" data-value="hi">
                                        <span class="text-lg">🇮🇳</span> <span class="text-xs font-medium">हिन्दी</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section class="space-y-4 pt-4 border-t">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">${t('settings.theme')}</h3>
                            <div class="grid grid-cols-2 gap-4">
                                <button id="theme-light" class="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:bg-accent transition-all group">
                                    <div class="w-full aspect-video bg-zinc-100 rounded-lg border flex items-center justify-center">
                                         <div class="w-1/2 h-1.5 bg-zinc-300 rounded"></div>
                                    </div>
                                    <span class="text-xs font-medium">${t('settings.light')}</span>
                                </button>
                                <button id="theme-dark" class="flex flex-col items-center gap-2 p-4 rounded-xl border bg-zinc-950 hover:bg-zinc-900 transition-all group ring-primary">
                                    <div class="w-full aspect-video bg-zinc-800 rounded-lg border border-zinc-700 flex items-center justify-center">
                                         <div class="w-1/2 h-1.5 bg-zinc-600 rounded"></div>
                                    </div>
                                    <span class="text-xs font-medium text-white">${t('settings.dark')}</span>
                                </button>
                            </div>
                        </section>

                        <section class="space-y-4 pt-4 border-t">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">${t('settings.maintenance')}</h3>
                            <div class="p-4 rounded-xl border bg-primary/5 space-y-3">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs font-medium">${t('settings.installed_version')}</span>
                                    <span class="text-xs font-bold font-mono text-primary" id="settings-version-display">v3.6.0</span>
                                </div>
                                <button id="force-reload-btn-settings" class="btn-shad btn-shad-outline w-full h-10 flex items-center justify-center gap-2 group text-sm rounded-lg">
                                    <i data-lucide="refresh-cw" class="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"></i>
                                    ${t('sidebar.force_reload')}
                                </button>
                            </div>
                        </section>
                    </div>

                    <!-- Panel: Sincronización -->
                    <div id="panel-sync" class="settings-panel hidden space-y-6">
                        <section class="space-y-4">
                            <div class="flex items-center justify-between">
                                <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Google Drive</h3>
                                <div id="drive-status" class="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase">${t('settings.sync_status.disconnected')}</div>
                            </div>
                            
                            <button id="connect-drive-btn" class="btn-shad btn-shad-outline w-full h-12 flex items-center justify-center gap-2 text-base rounded-xl">
                                <i data-lucide="link" class="w-5 h-5"></i> ${t('settings.connect_drive')}
                            </button>

                            <div class="space-y-3 pt-4 border-t border-dashed">
                                <label class="text-sm font-medium">${t('settings.drive_folder')}</label>
                                <input type="text" id="config-drive-path" class="h-12 px-5 w-full rounded-xl" placeholder="p.ej. CloudNotesV3" autocomplete="off">
                                <p class="text-xs text-muted-foreground">${t('settings.drive_folder_hint')}</p>
                            </div>
                            <div class="space-y-3">
                                <label class="text-sm font-medium">${t('settings.notes_per_chunk')}</label>
                                <div class="flex items-center gap-3">
                                    <input type="number" id="config-notes-per-chunk" class="h-12 px-5 w-full rounded-xl" placeholder="50" min="10" max="500">
                                    <span class="text-xs text-muted-foreground shrink-0 font-bold uppercase">Notas</span>
                                </div>
                            </div>
                            <button id="save-sync-config" class="btn-shad btn-shad-primary w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95">${t('settings.save_changes')}</button>
                        </section>
                    </div>

                    <!-- Panel: Seguridad -->
                    <div id="panel-security" class="settings-panel hidden space-y-6">
                        <section class="space-y-4">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">${t('biometrics.title')}</h3>
                            <div class="p-6 rounded-2xl border space-y-4" id="bio-settings-container">
                                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div class="flex-1">
                                        <p class="text-lg font-bold md:text-base">${t('biometrics.title')}</p>
                                        <p class="text-sm text-muted-foreground mt-1">${t('biometrics.desc')}</p>
                                        <div class="mt-3 flex items-center gap-2">
                                            <div id="bio-status-badge" class="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground font-bold uppercase tracking-wider">
                                                ${t('biometrics.disabled')}
                                            </div>
                                        </div>
                                    </div>
                                    <button id="toggle-biometric-btn" class="btn-shad btn-shad-primary w-full md:w-auto h-14 md:h-11 px-8 flex items-center justify-center gap-3 shrink-0 rounded-2xl md:rounded-xl text-lg md:text-sm font-bold shadow-lg shadow-primary/20 active:scale-95">
                                        <i data-lucide="fingerprint" class="w-6 h-6 md:w-5 md:h-5"></i>
                                        <span id="bio-toggle-text">${t('biometrics.enable_btn')}</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                        
                        <section class="space-y-4 pt-4 border-t">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">${t('settings.session_security')}</h3>
                            <div class="p-6 rounded-2xl border bg-muted/20 space-y-4">
                                <p class="text-sm text-muted-foreground">${t('settings.logout_hint')}</p>
                                <button id="logout-btn" class="btn-shad bg-destructive/10 text-destructive hover:bg-destructive hover:text-white w-full h-14 md:h-12 flex items-center justify-center gap-3 transition-all rounded-2xl text-lg font-bold">
                                    <i data-lucide="log-out" class="w-6 h-6 md:w-5 md:h-5"></i> ${t('settings.logout')}
                                </button>
                            </div>
                        </section>
                        
                        <section class="space-y-4 pt-4 border-t">
                            <h3 class="text-sm font-semibold uppercase tracking-wider text-muted-foreground">${t('settings.encryption')}</h3>
                            <div class="space-y-3">
                                <label class="text-sm font-medium">${t('settings.algo')}</label>
                                <select id="config-algo" class="h-12 md:h-10 w-full px-4 rounded-xl">
                                    <option value="aes-256-gcm">AES-256-GCM (Recommended)</option>
                                    <option value="kyber">CRYSTALS-Kyber (Experimental)</option>
                                </select>
                            </div>
                             <button id="save-security-config" class="btn-shad btn-shad-primary w-full h-14 font-bold rounded-2xl text-lg shadow-lg shadow-primary/20 transition-all active:scale-95">${t('settings.update_algo')}</button>
                        </section>
                    </div>

                    <!-- Panel: Danger Zone -->
                    <div id="panel-danger" class="settings-panel hidden space-y-6">
                        <section class="p-4 rounded-lg border border-destructive/20 bg-destructive/5 space-y-4">
                            <h3 class="text-sm font-semibold text-destructive uppercase tracking-wider">${t('settings.reset_app')}</h3>
                            <p class="text-xs text-muted-foreground underline">${t('settings.reset_warning')}</p>
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase font-bold text-destructive/70">${t('settings.reset_confirm_label')}</label>
                                <input type="text" id="factory-reset-confirm" class="h-10 px-4 mt-1 w-full border rounded-md" placeholder="${t('settings.reset_keyword')}" autocomplete="off">
                            </div>
                            <button id="factory-reset" class="btn-shad bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full h-10 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i data-lucide="trash-2" class="w-4 h-4 mr-2"></i> ${t('settings.reset_btn')}
                            </button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

export function initSettings() {
    const panels = document.querySelectorAll('.settings-panel');
    const tabs = document.querySelectorAll('.settings-tab');
    const title = document.getElementById('settings-tab-title');

    const sidebar = document.getElementById('settings-sidebar');
    const content = sidebar.nextElementSibling;
    const backBtn = document.getElementById('settings-back-btn');

    const updateView = (target) => {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
        panels.forEach(p => p.classList.toggle('hidden', p.id !== `panel-${target}`));

        const titles = {
            appearance: t('settings.general'),
            sync: t('settings.sync'),
            security: t('settings.security'),
            danger: t('settings.danger')
        };
        title.innerText = titles[target] || t('settings.title');

        if (window.innerWidth < 768) {
            sidebar.classList.add('hidden');
            content.classList.remove('hidden');
            backBtn.classList.remove('hidden');
        }
        safeCreateIcons();
    };

    tabs.forEach(tab => {
        tab.onclick = () => updateView(tab.dataset.tab);
    });

    backBtn.onclick = () => {
        sidebar.classList.remove('hidden');
        content.classList.add('hidden');
        backBtn.classList.add('hidden');
        title.innerText = 'Configuración';
    };

    // Initialize state
    if (window.innerWidth < 768) {
        content.classList.add('hidden');
        backBtn.classList.add('hidden');
        // Ensure no tab is active on mobile init
        tabs.forEach(t => t.classList.remove('active'));
    } else {
        updateView('appearance');
    }

    // Force Reload Logic
    const reloadBtn = document.getElementById('force-reload-btn'); // Global one
    const reloadBtnSettings = document.getElementById('force-reload-btn-settings');
    if (reloadBtn) reloadBtn.onclick = handleForceReload;
    if (reloadBtnSettings) reloadBtnSettings.onclick = handleForceReload;

    // Language Switcher Logic (Grid)
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        if (btn.dataset.value === currentLang) {
            btn.classList.add('ring-2', 'ring-primary', 'bg-primary/5');
        }
        btn.onclick = () => setLanguage(btn.dataset.value);
    });

    // Biometric Toggle Logic
    const toggleBioBtn = document.getElementById('toggle-biometric-btn');
    const bioStatusBadge = document.getElementById('bio-status-badge');
    const bioToggleText = document.getElementById('bio-toggle-text');
    const bioContainer = document.getElementById('bio-settings-container');

    if (toggleBioBtn) {
        const updateBioUI = () => {
            const isEnabled = localStorage.getItem('cn_bio_enabled') === 'true';
            if (isEnabled) {
                bioStatusBadge.textContent = t('biometrics.enabled');
                bioStatusBadge.classList.remove('bg-muted', 'text-muted-foreground');
                bioStatusBadge.classList.add('bg-primary/20', 'text-primary');
                bioToggleText.textContent = t('biometrics.disable_btn');
                toggleBioBtn.classList.remove('btn-shad-primary');
                toggleBioBtn.classList.add('btn-shad-outline');
                bioContainer.classList.add('bg-primary/5');
            } else {
                bioStatusBadge.textContent = t('biometrics.disabled');
                bioStatusBadge.classList.remove('bg-primary/20', 'text-primary');
                bioStatusBadge.classList.add('bg-muted', 'text-muted-foreground');
                bioToggleText.textContent = t('biometrics.enable_btn');
                toggleBioBtn.classList.remove('btn-shad-outline');
                toggleBioBtn.classList.add('btn-shad-primary');
                bioContainer.classList.remove('bg-primary/5');
            }
            safeCreateIcons();
        };

        updateBioUI();

        toggleBioBtn.onclick = async () => {
            const isEnabled = localStorage.getItem('cn_bio_enabled') === 'true';

            if (isEnabled) {
                localStorage.setItem('cn_bio_enabled', 'false');
                // IMPORTANT: When disabling bio, we should also remove the saved key from localStorage 
                // IF we want to strictly require password.
                // localStorage.removeItem('cn_vault_key_v3'); 

                updateBioUI();
                const { showToast } = await import('../ui-utils.js');
                showToast(t('biometrics.success_disable'));
            } else {
                const { showToast, openPrompt } = await import('../ui-utils.js');

                if (!window.PublicKeyCredential) {
                    return showToast(t('biometrics.not_supported'));
                }

                try {
                    const pass = await openPrompt(t('biometrics.setup_prompt'), true);
                    if (!pass || pass.biometric) return;

                    const { SecurityService } = await import('../security.js');
                    const authHash = await SecurityService.hash(pass);
                    const existingHash = localStorage.getItem('cn_master_hash_v3');

                    if (authHash !== existingHash) {
                        return showToast(t('biometrics.incorrect_pass'));
                    }

                    // Create credential
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

                    const vaultKey = await SecurityService.deriveVaultKey(pass);
                    localStorage.setItem('cn_vault_key_v3', vaultKey);
                    localStorage.setItem('cn_bio_enabled', 'true');

                    updateBioUI();
                    showToast(t('biometrics.success_enable'));
                } catch (e) {
                    console.error(e);
                    showToast(t('biometrics.fail_enable') + ': ' + e.message);
                }
            }
        };
    }
}

export async function handleForceReload() {
    if (!confirm('Esto reiniciará la aplicación, limpiará la caché y eliminará el Service Worker para forzar la última versión. ¿Continuar?')) return;

    try {
        // 1. Unregister Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }

        // 2. Clear Caches
        if ('caches' in window) {
            const keys = await caches.keys();
            for (const key of keys) {
                await caches.delete(key);
            }
        }

        // 3. Clear session storage
        sessionStorage.clear();

        // 4. Hard reload with cache buster
        const url = new URL(window.location.href);
        url.searchParams.set('t', Date.now());
        window.location.href = url.toString();
    } catch (e) {
        console.error("Error clearing cache:", e);
        window.location.reload();
    }
}
