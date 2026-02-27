import admin from 'firebase-admin';

// Tu dois télécharger ton fichier JSON de clé privée depuis la console Firebase
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();