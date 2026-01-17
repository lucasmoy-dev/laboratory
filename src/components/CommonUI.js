export function getCommonUITemplate() {
    return `
    <!-- Prompt Modal -->
    <div id="prompt-modal" class="fixed inset-0 z-[200] hidden">
        <div class="absolute inset-0 bg-background/90 backdrop-blur-xl"></div>
        <div class="dialog-content max-w-sm">
            <h2 id="prompt-title" class="text-lg font-bold mb-2">Seguridad</h2>
            <p id="prompt-desc" class="text-sm text-muted-foreground mb-6">Ingresa la contraseña para continuar</p>
            <div class="space-y-4">
                <div class="relative">
                    <input type="password" id="prompt-input" placeholder="Tu contraseña"
                        class="text-center tracking-widest outline-none pr-10">
                    <button type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground toggle-pass"
                        data-target="prompt-input">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                </div>
                <div class="flex gap-2">
                    <button id="prompt-cancel" class="btn-shad btn-shad-outline flex-1">Cancelar</button>
                    <button id="prompt-confirm" class="btn-shad btn-shad-primary flex-1">Confirmar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div id="toast">
        <div class="border">
            ¡Acción completada!
        </div>
    </div>`;
}
