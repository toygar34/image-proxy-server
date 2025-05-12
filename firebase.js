const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "roddle-c68bb.firebasestorage.app"
});

const bucket = admin.storage().bucket();
module.exports = bucket;
