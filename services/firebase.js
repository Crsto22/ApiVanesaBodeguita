const admin = require('firebase-admin');

let isInitialized = false;

function initializeFirebase() {
  if (isInitialized) {
    console.log('🔥 Firebase ya está inicializado');
    return;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'bodeguitavanesa';
    
    // Para producción - usar variables de entorno (Fly.io secrets)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
        databaseURL: `https://${projectId}.firebaseio.com`
      });
    }
    // Para desarrollo local - usar archivo de credenciales (si existe)
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && require('fs').existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId,
        databaseURL: `https://${projectId}.firebaseio.com`
      });
    }
    // Para Fly.io con Application Default Credentials
    else {
      admin.initializeApp({
        projectId: projectId
      });
    }

    isInitialized = true;
    
    console.log(`🔥 Firebase Admin SDK inicializado correctamente para proyecto: ${projectId}`);
  } catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
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
