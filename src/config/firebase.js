const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Configuración de Firebase para el proyecto bodeguitavanesa
const firebaseConfig = {
  apiKey: 'AIzaSyCx8JzJ_eVrArMUDi-GkZ9FpgKM6mnZEV8', // Considera usar variables de entorno para esto también
  authDomain: 'bodeguitavanesa.firebaseapp.com',
  projectId: 'bodeguitavanesa',
  storageBucket: 'bodeguitavanesa.appspot.com', // Corregido: suele ser .appspot.com
  messagingSenderId: '734082784317',
  appId: '1:734082784317:web:c196d30c1d8538a14ede54',
  measurementId: 'G-169FNDEJ8N',
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp); // No necesitas el segundo argumento 'negociovanesa' aquí

module.exports = { db };
