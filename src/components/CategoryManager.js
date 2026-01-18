import { state, saveLocal } from '../state.js';
import { CAT_ICONS } from '../constants.js';
import { safeCreateIcons, showToast, openPrompt } from '../ui-utils.js';
import { SecurityService as Security } from '../security.js';
import { t } from '../i18n.js';

export function getCategoryManagerTemplate() {
    return `
    <div id="categories-modal" class="fixed inset-0 z-[70] hidden">
        <div class="dialog-overlay close-categories"></div>
        <div class="dialog-content w-full h-full md:max-w-3xl md:h-[650px] md:rounded-3xl rounded-none flex flex-col shadow-2xl p-0 overflow-hidden">
            <div class="p-6 md:p-10 flex justify-between items-center border-b bg-background/50 backdrop-blur-md sticky top-0 z-10">
                <div>
                    <h2 class="text-2xl md:text-4xl font-bold text-foreground">${t('categories.title')}</h2>
                    <p class="text-xs md:text-base text-muted-foreground">${t('categories.name_placeholder')}</p>
                </div>
                <button class="close-categories p-3 hover:bg-accent rounded-full transition-colors"><i data-lucide="x" class="w-8 h-8"></i></button>
            </div>

            <div class="p-4 md:p-10 bg-muted/20 border-b">
                <div class="flex items-center gap-4 max-w-3xl mx-auto w-full">
                    <div class="relative flex-1">
                        <i data-lucide="tag" class="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50"></i>
                        <input type="text" id="new-cat-name" placeholder="${t('categories.add_new')}..." 
                               class="pl-14 h-14 md:h-16 w-full bg-background border-none ring-1 ring-border focus:ring-2 focus:ring-violet-500 rounded-2xl transition-all text-lg" autocomplete="off">
                    </div>
                    <button id="add-cat-btn" class="w-14 h-14 md:w-16 md:h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 active:scale-95 transition-all">
                        <i data-lucide="plus" class="w-8 h-8"></i>
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 max-w-3xl mx-auto w-full" id="cat-manager-list">
                <!-- Items injected here -->
            </div>
            
            <div class="p-6 border-t bg-background/50 backdrop-blur-md sticky bottom-0">
                <button class="close-categories w-full md:max-w-xs mx-auto block h-14 bg-secondary text-secondary-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-all text-lg underline">Cerrar</button>
            </div>
        </div>
        <div id="cat-icon-picker" class="fixed z-[80] hidden popover-content p-4 w-72 max-h-80 overflow-y-auto bg-popover border shadow-2xl rounded-3xl backdrop-blur-3xl">
            <div class="grid grid-cols-5 gap-3 p-1" id="cat-icons-grid"></div>
        </div>
    </div>`;
}

export function renderCategoryManager(onRefreshSidebar, categories = null) {
    const list = document.getElementById('cat-manager-list');
    if (!list) return;
    list.innerHTML = '';

    // SYNC STATE: If categories passed from main.js, update local state reference
    if (categories) state.categories = categories;

    // Sort categories by creation (Date.now) is implied by array order if we push
    state.categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'flex items-center gap-3 p-2 rounded-lg border bg-card/50 hover:bg-accent/30 transition-all group';

        item.innerHTML = `
            <div class="w-12 h-12 rounded-xl cursor-pointer hover:bg-accent border bg-background flex items-center justify-center shrink-0 transition-all active:scale-95" 
                 id="icon-trigger-${cat.id}" title="Cambiar icono">
                 <i data-lucide="${cat.icon || 'tag'}" class="w-5 h-5 text-foreground/80"></i>
            </div>
            
            <div class="flex flex-col flex-1 min-w-0">
                <input type="text" value="${cat.name}" 
                       class="bg-transparent border-none outline-none font-bold text-base w-full focus:ring-0 transition-colors h-7 px-0 rounded"
                       id="cn-${cat.id}" autocomplete="off">
                <span class="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">${cat.passwordHash ? 'Restringida' : 'Pública'}</span>
            </div>
            
            <div class="flex items-center gap-2">
                <button class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-violet-500/10 transition-all ${cat.passwordHash ? 'text-violet-500 bg-violet-500/5 border border-violet-500/20' : 'text-muted-foreground border border-transparent'}"
                        id="lock-${cat.id}" title="${cat.passwordHash ? 'Restringido' : 'Restricción'}">
                    <i data-lucide="${cat.passwordHash ? 'lock' : 'unlock'}" class="w-4 h-4"></i>
                </button>
                <button class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground border border-transparent transition-all"
                        id="del-${cat.id}" title="Eliminar">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        `;

        list.appendChild(item);

        // Bind events
        document.getElementById(`icon-trigger-${cat.id}`).onclick = (e) => {
            e.stopPropagation();
            changeIcon(cat.id, onRefreshSidebar, e.currentTarget);
        };

        const nameInput = document.getElementById(`cn-${cat.id}`);
        // Real-time update in state, but save on blur/change
        nameInput.oninput = (e) => {
            cat.name = e.target.value;
            // Immediate reflection in sidebar without saving yet (for performance)
            onRefreshSidebar();
        };

        nameInput.onchange = async () => {
            await saveLocal();
            onRefreshSidebar();
            if (window.triggerAutoSync) window.triggerAutoSync();
        };

        document.getElementById(`lock-${cat.id}`).onclick = () => toggleLock(cat.id, onRefreshSidebar);
        document.getElementById(`del-${cat.id}`).onclick = () => deleteCat(cat.id, onRefreshSidebar);
    });

    safeCreateIcons();
}

async function changeIcon(id, onRefresh, triggerEl) {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;

    const picker = document.getElementById('cat-icon-picker');
    const grid = document.getElementById('cat-icons-grid');
    grid.innerHTML = '';

    CAT_ICONS.forEach(iconName => {
        const btn = document.createElement('button');
        btn.className = 'w-9 h-9 flex items-center justify-center rounded-md hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground';
        btn.innerHTML = `<i data-lucide="${iconName}" class="w-5 h-5"></i>`;
        btn.onclick = async () => {
            cat.icon = iconName;
            await saveLocal();
            renderCategoryManager(onRefresh);
            onRefresh();
            picker.classList.add('hidden');
            if (window.triggerAutoSync) window.triggerAutoSync();
        };
        grid.appendChild(btn);
    });

    safeCreateIcons();

    const rect = triggerEl.getBoundingClientRect();
    picker.style.top = `${rect.bottom + 8}px`;
    picker.style.left = `${rect.left}px`;
    picker.classList.remove('hidden');

    const clickOutside = (e) => {
        if (!picker.contains(e.target) && !triggerEl.contains(e.target)) {
            picker.classList.add('hidden');
            document.removeEventListener('click', clickOutside);
        }
    };
    setTimeout(() => document.addEventListener('click', clickOutside), 10);
}

async function updateName(id, newName, onRefresh) {
    const cat = state.categories.find(c => c.id === id);
    if (!cat || !newName.trim()) return renderCategoryManager(onRefresh);

    cat.name = newName;
    await saveLocal();
    onRefresh();
}

async function deleteCat(id, onRefresh) {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;

    if (cat.passwordHash) {
        const pass = await openPrompt('Seguridad', 'Etiqueta restringida. Ingresa contraseña para eliminar:', true);
        if (!pass) return;
        const hash = await Security.hash(pass);
        if (hash !== cat.passwordHash) return showToast('❌ Error: Contraseña incorrecta');
    }

    if (confirm(`¿Eliminar la etiqueta "${cat.name}"? Las notas no se borrarán.`)) {
        state.categories = state.categories.filter(c => c.id !== id);
        state.notes.forEach(n => { if (n.categoryId === id) n.categoryId = null; });
        if (state.currentView === id) state.currentView = 'all';
        await saveLocal();
        renderCategoryManager(onRefresh);
        onRefresh();
        if (window.triggerAutoSync) window.triggerAutoSync();
    }
}

async function toggleLock(id, onRefresh) {
    const cat = state.categories.find(c => c.id === id);
    if (!cat) return;

    if (cat.passwordHash) {
        const pass = await openPrompt('Seguridad', 'Ingresa la contraseña para quitar la restricción:', true);
        if (!pass) return;
        const hash = await Security.hash(pass);
        if (hash !== cat.passwordHash) return showToast('❌ Error: Contraseña incorrecta');
        cat.passwordHash = null;
        showToast('🔓 Restricción quitada');
    } else {
        const pass = await openPrompt('Seguridad', 'Define una contraseña para restringir esta etiqueta:', true);
        if (pass) {
            cat.passwordHash = await Security.hash(pass);
            showToast('🔒 Etiqueta restringida');
        }
    }

    await saveLocal();
    renderCategoryManager(onRefresh);
    onRefresh();
    if (window.triggerAutoSync) window.triggerAutoSync();
}
