---
name: No reiniciar innecesariamente
description: El usuario no quiere que reinicie Electron/Vite salvo que sea estrictamente necesario
type: feedback
---

No reiniciar el entorno de desarrollo salvo que el usuario lo pida explícitamente o sea estrictamente necesario para aplicar un cambio.

**Why:** El usuario considera molesto que se reinicie el servicio para verificar cambios cuando Vite tiene hot reload y los cambios se aplican automáticamente.

**How to apply:** Confiar en el hot reload de Vite para cambios en React/JS. Solo reiniciar si el cambio es en `electron/main.cjs`, `electron/preload.cjs`, `vite.config.js`, o `package.json`.
