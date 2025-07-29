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
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
        databaseURL: `https://${projectId}.firebaseio.com`
      });
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
