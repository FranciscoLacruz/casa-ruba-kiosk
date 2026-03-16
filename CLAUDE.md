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
│   ├── screens/
│   │   ├── IdleScreen.jsx        # Screensaver con partículas, "toca para comenzar"
│   │   ├── LanguageScreen.jsx    # Selección ES / EN / FR
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
[IDLE] → (toque) → [LANGUAGE] → (selección idioma) → [CONVERSATION]
                                                            ↓
                                         (inactividad 120s o botón Finalizar)
                                                            ↓
                                                         [IDLE]
```

---

## Configuración crítica: agents.js

```js
// src/config/agents.js
export const ELEVENLABS_AGENTS = {
  es: 'AGENT_ID_ESPAÑOL_AQUI',   // ← pendiente de los agentes en ElevenLabs
  en: 'AGENT_ID_ENGLISH_HERE',
  fr: 'AGENT_ID_FRANCAIS_ICI',
};

export const HOTEL_TIERRA_PHONE = '+34 974 XXX XXX'; // ← rellenar
export const IDLE_TIMEOUT_SECONDS = 120;
```

**Los Agent IDs están pendientes**. Los agentes los está creando otro equipo en ElevenLabs.
Mientras tanto, el hook `useElevenLabs.js` detecta si el ID es un placeholder y lanza error controlado.

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

## Auto-update

- Usa `electron-updater` apuntando a **GitHub Releases** (sin infraestructura propia)
- Comprueba updates cada noche a las **3:00 AM**
- Si hay update disponible: descarga e instala automáticamente, reinicia el proceso
- Para publicar una versión: incrementar versión en `package.json` → `npm run build:win` → crear GitHub Release con los artefactos de `dist/`
- Configurar `publish.owner` y `publish.repo` en `package.json` con los datos reales del repo

---

## Decisiones de diseño tomadas

- **Sin integración PMS**: el agente solo guía al huésped a encontrar su código en el email / app de Booking / Airbnb. Integración con PMS es trabajo futuro.
- **3 agentes separados en ElevenLabs** (uno por idioma) en lugar de un agente multilingüe: mejor calidad de voz y naturalidad por idioma.
- **Sin backend propio**: toda la lógica de IA está en ElevenLabs. La app es un cliente puro.
- **GitHub Releases como servidor de updates**: sin coste, sin infraestructura.
- **Watchdog en Electron**: si la ventana se cierra inesperadamente en modo kiosk, se relanza automáticamente.
- **Estética**: dark/luxury, paleta dorada (#c8a96e) sobre negro, tipografía serif (Georgia). Coherente con el carácter de establecimiento de montaña con calidez.

---

## Tareas pendientes (estado del proyecto)

### Bloqueado esperando Agent IDs de ElevenLabs
- [ ] Rellenar `ELEVENLABS_AGENTS` en `src/config/agents.js`
- [ ] Rellenar `HOTEL_TIERRA_PHONE` en `src/config/agents.js`

### Por implementar
- [ ] Instalar dependencias (`npm install`) y verificar que arranca en dev
- [ ] Añadir icono de la app (`public/assets/icon.ico`) para el build de Windows
- [ ] Test de integración con ElevenLabs SDK cuando lleguen los Agent IDs
- [ ] Ajuste fino de la UI en pantalla táctil real (tamaños de botón, fuentes)
- [ ] Configurar `publish.owner` y `publish.repo` en `package.json`
- [ ] Configurar Windows 11 kiosk mode en el Alurin apuntando al ejecutable
- [ ] Habilitar RDP en el Alurin para gestión remota desde Bilbao

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
