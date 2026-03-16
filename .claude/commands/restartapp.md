Reinicia el entorno de desarrollo del kiosk Casa Ruba: mata los procesos de Electron y Vite, y los vuelve a lanzar.

Ejecuta los siguientes pasos:

1. Mata los procesos actuales:
```bash
pkill -f "electron ." 2>/dev/null; pkill -f "vite" 2>/dev/null; sleep 1; echo "Procesos terminados"
```

2. Arranca de nuevo en background:
```bash
npm run dev
```

3. Espera ~8 segundos y muestra el output para confirmar que Vite está listo en http://localhost:5374 y Electron se ha lanzado.

Informa al usuario cuando todo esté funcionando.
