# TESTING.md — Tests pendientes

## Protecciones de sesion de conversacion

Estos tests verifican que la app gestiona correctamente la duracion y finalizacion
de las conversaciones con ElevenLabs. Testear cuando se upgrade el plan.

Ejecutar la app en modo desarrollo: `npm run dev`

---

### Test 1: La actividad de voz mantiene la sesion activa

Verifica que una conversacion de voz no se corta por el idle timeout de 120s
mientras el huesped esta hablando.

**Pasos:**
1. Seleccionar un idioma y entrar en la conversacion
2. Hablar con el agente sin tocar la pantalla durante mas de 2 minutos

**Esperado:** La conversacion sigue activa, no vuelve a la pantalla de inicio.

**Que se esta testeando:** `ConversationScreen.jsx` llama a `onActivity()` cada vez
que el status cambia a LISTENING o SPEAKING, lo que resetea el idle timer de `App.jsx`.

---

### Test 2: Desconexion de ElevenLabs vuelve a inicio

Verifica que cuando ElevenLabs cierra la sesion (por timeout del servidor, error,
o cualquier razon), la app vuelve automaticamente a la pantalla de inicio.

**Pasos:**
1. Seleccionar un idioma y entrar en la conversacion
2. Esperar a que la conversacion este activa (orbe dorado, estado LISTENING)
3. Abrir DevTools (se abre solo en modo dev)
4. Ir a la pestana Network > filtrar por WS
5. Click derecho en la conexion WebSocket > Close

**Esperado:** La app vuelve a la pantalla de inicio inmediatamente.

**Que se esta testeando:** El `useEffect` en `ConversationScreen.jsx` que detecta
cuando el status vuelve a IDLE tras haber estado activo (`wasActiveRef`), y llama a `onEnd()`.

---

### Test 3: Tope maximo de 10 minutos

Verifica que ninguna conversacion puede durar mas de 10 minutos,
independientemente de la actividad.

**Pasos:**
1. Cambiar temporalmente `MAX_CONVERSATION_SECONDS` en `src/config/agents.js` a `30`
2. Seleccionar un idioma y entrar en la conversacion
3. Mantener la conversacion activa hablando con el agente
4. Esperar 30 segundos

**Esperado:** La conversacion se corta automaticamente y vuelve a la pantalla de inicio.

**Despues del test:** Volver a poner `MAX_CONVERSATION_SECONDS` a `600`.

**Que se esta testeando:** El `setTimeout` absoluto en `ConversationScreen.jsx` que
llama a `endConversation()` + `onEnd()` tras alcanzar el limite.

---

## Notas

- Configurar tambien `max_duration_seconds` en cada agente de ElevenLabs (plataforma web)
  como limite del lado servidor (recomendado: 900s / 15 min) para tener doble proteccion.
- El tope del cliente (10 min) esta pensado para dispararse antes que el del servidor.
