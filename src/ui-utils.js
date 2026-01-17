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
