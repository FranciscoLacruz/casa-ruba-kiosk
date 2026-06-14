# CLAUDE.md — Casa Ruba Kiosk

## Contexto del proyecto

Recepción virtual para **Casa Ruba**, hotel de 2 estrellas en Biescas (Huesca, Pirineo Aragonés).
El hotel no tiene recepción física: el check-in es 100% virtual y los huéspedes a menudo llegan
sin haber completado el proceso, sin el código de acceso a su habitación.

Este kiosk se instala en el hall de entrada del hotel para que los huéspedes puedan resolver
sus dudas hablando con un asistente de IA, sin necesidad de llamar o desplazarse al Hotel Tierra
de Biescas (hotel hermano, a ~10 minutos, que tiene recepción física).

---

## Hardware de destino

- **Equipo**: Alurin N6000
- **SO**: Windows 11
- **Pantalla**: Táctil con webcam integrada
- **Audio**: Micrófono + altavoces
- **Ubicación**: Hall de entrada de Casa Ruba (Biescas)

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| App nativa | Electron |
| UI | React + Vite |
| Estilos | CSS-in-JS (style tags en componentes) + Tailwind utility classes |
| Voz (STT + LLM + TTS) | ElevenLabs Conversational AI SDK (`@11labs/client`) |
| Auto-update | electron-updater + GitHub Releases |
| Build Windows | electron-builder → `.exe` instalador |

---

## Estructura del proyecto

```
casa-ruba-kiosk/
├── electron/
│   ├── main.js           # Proceso principal: kiosk mode, auto-updater (3am), watchdog
│   └── preload.js        # Bridge seguro renderer ↔ main (contextBridge)
├── src/
│   ├── App.jsx           # Router de pantallas + idle timeout (120s)
│   ├── main.jsx          # Entry point React
│   ├── index.css         # Reset global
│   ├── assets/                   # PNGs: wallpaper, logos, banderas, botones
│   ├── screens/
│   │   ├── IdleScreen.jsx        # Wallpaper + logos + selección de idioma (FR/ES/EN)
│   │   └── ConversationScreen.jsx # Interfaz de voz: orbe animado + waveform + controles
│   ├── hooks/
│   │   └── useElevenLabs.js      # Hook: startConversation, endConversation, status
│   ├── config/
│   │   └── agents.js             # ⚠️ Agent IDs de ElevenLabs + teléfono Hotel Tierra
│   └── i18n/
│       └── ui.js                 # Textos de UI en ES / EN / FR
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Flujo de pantallas

```
[IDLE] → (selección idioma FR/ES/EN) → [CONVERSATION]
                                              ↓
                               (inactividad 120s o botón Finalizar)
                                              ↓
                                           [IDLE]
```

---

## Configuración crítica: agents.js

```js
// src/config/agents.js — estructura LANGUAGES
{ code: 'es', label: 'Español', agentId: '...' },
{ code: 'en', label: 'English', agentId: '...' },
{ code: 'fr', label: 'Français', agentId: '...' },

export const HOTEL_TIERRA_PHONE = '+34 974 48 54 83';
export const IDLE_TIMEOUT_SECONDS = 120;    // Inactividad de pantalla → vuelve a IDLE
export const MAX_CONVERSATION_SECONDS = 600; // Tope absoluto de conversación (10 min)
```

Los 3 agentes (ES, EN, FR) están configurados con IDs reales de ElevenLabs.
El hook `useElevenLabs.js` detecta si un ID es placeholder y lanza error controlado (útil si se añaden idiomas nuevos).

---

## Estados de la conversación (ConversationStatus)

```
IDLE → CONNECTING → LISTENING ↔ SPEAKING → IDLE
                        ↓
                      ERROR (muestra mensaje + botón retry)
```

---

## Modo desarrollo vs producción

```bash
# Desarrollo (sin kiosk, con DevTools)
npm run dev

# Build instalador Windows
npm run build:win
# Genera: dist/CasaRuba-Setup-X.X.X.exe
```

En desarrollo, Electron arranca con `KIOSK=false` automáticamente (detecta `!app.isPackaged`).
En producción, abre en modo kiosk fullscreen y bloquea Alt+F4, Ctrl+W, F5, Escape.

---

## Auto-update y proceso de releases

### Cómo se actualiza el kiosk en producción
- Usa `electron-updater` apuntando a **GitHub Releases**
- Comprueba updates cada noche a las **3:00 AM**
- Si hay update disponible: descarga e instala automáticamente, reinicia el proceso

### Cómo publicar una nueva versión

El proceso es automático vía GitHub Actions (`.github/workflows/release.yml`):

1. Incrementar la versión en `package.json` (campo `"version"`)
2. Hacer commit y push a `main`
3. El workflow se encarga del resto:
   - Lee la versión de `package.json`
   - Comprueba si el tag ya existe (no duplica releases)
   - Si es versión nueva: ejecuta `npm ci` + `npm run build:win` en `windows-latest`
   - Crea la GitHub Release con el `.exe` y los archivos de auto-update (`*.yml`)
   - Los artefactos se publican en `release/`
4. El kiosk en producción lo detecta en su chequeo de las 3:00 AM y se actualiza solo

**Importante**: No hace falta hacer build local ni crear la release manualmente. Solo incrementar versión, commit y push.

---

## Decisiones de diseño tomadas

- **Sin integración PMS**: el agente solo guía al huésped a encontrar su código en el email / app de Booking / Airbnb. Integración con PMS es trabajo futuro.
- **3 agentes separados en ElevenLabs** (uno por idioma) en lugar de un agente multilingüe: mejor calidad de voz y naturalidad por idioma.
- **Sin backend propio**: toda la lógica de IA está en ElevenLabs. La app es un cliente puro.
- **GitHub Releases como servidor de updates**: sin coste, sin infraestructura.
- **Watchdog en Electron**: si la ventana se cierra inesperadamente en modo kiosk, se relanza automáticamente.
- **Estética**: wallpaper de montañas como fondo, logos RUBA y LCR en esquinas, assets gráficos PNG prediseñados (botones de idioma con banderas, botón finalizar, teléfono). Paleta verde oliva (#8a8a3a) de los assets + dorada (#c8a96e) del orbe. Tipografía serif (Georgia).
- **Selección de idioma integrada en pantalla IDLE**: eliminada la pantalla intermedia LanguageScreen; los botones de idioma (FR/ES/EN) están directamente en la primera pantalla.

---

## Tareas pendientes (estado del proyecto)

### Por hacer
- [ ] Añadir icono de la app (`public/assets/icon.ico`) para el build de Windows
- [ ] Ajuste fino de la UI en pantalla táctil real (tamaños de botón, fuentes)
- [ ] Configurar Windows 11 kiosk mode en el Alurin apuntando al ejecutable
- [ ] Habilitar RDP en el Alurin para gestión remota desde Bilbao
- [ ] Testear protecciones de sesión (ver TESTING.md) cuando se upgrade el plan de ElevenLabs
- [ ] Configurar `max_duration_seconds` en los agentes de ElevenLabs (servidor)

### Mejoras futuras (no prioritarias)
- [ ] Integración con PMS para recuperar códigos de acceso directamente
- [ ] Dashboard de métricas (conversaciones/día, idiomas usados, temas frecuentes)
- [ ] Soporte alemán (DE) — turismo alemán relevante en Pirineos

---

## Contexto adicional del negocio

- **Casa Ruba**: hotel 2 estrellas, Biescas, sin recepción física
- **Hotel Tierra de Biescas**: hotel hermano 4 estrellas, ~10 min de distancia, tiene recepción física que actúa como fallback
- El kiosk está en el hall, conectado a internet, con pantalla táctil y audio
- El propietario gestiona el proyecto desde Bilbao → todo el mantenimiento debe ser remoto
- Público objetivo: turistas (español, inglés, francés principalmente), a menudo cansados o frustrados al llegar

---

## Comandos útiles

```bash
npm install          # Instalar dependencias
npm run dev          # Desarrollo local (Electron + React con hot reload)
npm run build        # Solo build React (Vite)
npm run build:win    # Build completo → instalador .exe para Windows
```
