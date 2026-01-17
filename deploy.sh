#!/bin/bash

# 1. Incrementar versión (Patch: 3.6.0 -> 3.6.1)
echo "🚀 Incrementando versión..."
npm version patch --no-git-tag-version

# 2. Sincronizar versión con constants.js
echo "🔄 Sincronizando constants.js..."
node update-version.js

# Obtener la nueva versión para el mensaje de commit
VERSION=$(node -p "require('./package.json').version")

# 3. Git Add & Commit
echo "💾 Guardando cambios en Git..."
git add .
git commit -m "Release v$VERSION"

# 4. Push a repositorio
echo "📤 Subiendo a GitHub..."
git push

# 5. Build & Deploy a GitHub Pages
echo "🌐 Desplegando en GitHub Pages..."
npm run deploy

echo "✅ ¡Listo! Versión v$VERSION publicada y desplegada."
