const admin = require('firebase-admin');

let isInitialized = false;

function initializeFirebase() {
  if (isInitialized) {
    console.log('🔥 Firebase ya está inicializado');
    return;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'bodeguitavanesa';
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log(`🔧 Inicializando Firebase para entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    
    // SIEMPRE usar variables de entorno por seguridad
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('🔑 Usando credenciales de variable de entorno (SEGURO)');
      
      // Debug: Mostrar los primeros caracteres para diagnosticar
      const keyValue = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      console.log(`🔍 DEBUG - Primeros 50 caracteres: "${keyValue.substring(0, 50)}"`);
      console.log(`🔍 DEBUG - Longitud total: ${keyValue.length}`);
      
      try {
        const serviceAccount = JSON.parse(keyValue);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: projectId,
          databaseURL: `https://${projectId}.firebaseio.com`
        });
      } catch (parseError) {
        console.error('🚨 Error parseando JSON:', parseError.message);
        console.log(`🔍 Contenido completo de la variable: "${keyValue}"`);
        throw parseError;
      }
    }
    else {
      throw new Error('🚨 FIREBASE_SERVICE_ACCOUNT_KEY no encontrada. Configura esta variable de entorno por seguridad.');
    }

    isInitialized = true;
    
    console.log(`🔥 Firebase Admin SDK inicializado correctamente para proyecto: ${projectId}`);
    console.log(`📊 Modo: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    console.log('🔒 Usando credenciales seguras desde variables de entorno');
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error.message);
    if (process.env.NODE_ENV !== 'production') {
      console.error('🔍 Stack trace:', error.stack);
    }
    throw error;
  }
}

function getFirestore() {
  if (!isInitialized) {
    throw new Error('Firebase no está inicializado. Llama a initializeFirebase() primero.');
  }
  
  // Usar la forma correcta para acceder a la base de datos nombrada
  const { getFirestore } = require('firebase-admin/firestore');
  return getFirestore('negociovanesa');
}

module.exports = {
  initializeFirebase,
  getFirestore,
  admin
};
