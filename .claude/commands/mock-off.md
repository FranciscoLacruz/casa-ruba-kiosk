Desactiva el modo mock de ElevenLabs para usar la API real.

Ejecuta estos pasos:

1. Escribe `VITE_MOCK_ELEVENLABS=false` en `.env.local`:
```bash
echo "VITE_MOCK_ELEVENLABS=false" > .env.local
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

Informa al usuario que el modo mock está desactivado: la app usará ElevenLabs real.
