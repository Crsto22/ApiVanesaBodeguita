# Configuración de Credenciales de Firebase

Este archivo contiene las instrucciones para configurar las credenciales de Firebase tanto en desarrollo como en producción.

## 🔑 Para Desarrollo Local

1. Descarga el archivo de credenciales de Firebase Console
2. Colócalo en la raíz del proyecto con el nombre: `bodeguitavanesa-firebase-adminsdk-fbsvc-db0b5b1742.json`
3. Actualiza tu archivo `.env` con la ruta:
   ```
   FIREBASE_SERVICE_ACCOUNT_PATH=./bodeguitavanesa-firebase-adminsdk-fbsvc-db0b5b1742.json
   ```

## 🚀 Para Producción (Fly.io)

Usa variables de entorno para las credenciales:

```bash
# Configurar el JSON completo como variable de entorno
fly secrets set FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"bodeguitavanesa",...}'

# O configurar proyecto ID
fly secrets set FIREBASE_PROJECT_ID="bodeguitavanesa"
```

## ⚠️ Importante

- **NUNCA** subas el archivo `.json` al repositorio
- Las credenciales están excluidas en `.gitignore`
- En producción usa variables de entorno por seguridad
