Activa el modo mock de ElevenLabs para desarrollar sin consumir créditos.

Ejecuta estos pasos:

1. Escribe `VITE_MOCK_ELEVENLABS=true` en `.env.local`:
```bash
echo "VITE_MOCK_ELEVENLABS=true" > .env.local
```

2. Reinicia la app (Vite necesita reiniciarse para leer el cambio de variable de entorno):
```bash
pkill -f "electron ." 2>/dev/null; pkill -f "vite" 2>/dev/null; sleep 1; echo "Procesos terminados"
```

3. Arranca de nuevo en background:
```bash
npm run dev
```

4. Espera ~8 segundos, muestra el output y confirma que arrancó correctamente.

Informa al usuario que el modo mock está activo: la UI simulará el ciclo CONNECTING → LISTENING → SPEAKING sin llamar a ElevenLabs.
