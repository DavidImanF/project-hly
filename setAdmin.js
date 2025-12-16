// setAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const uid = "gtY0VMf3KrSWQD0jriaxamcQHjn1"; // ganti dengan UID user admin

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("✅ Admin claim berhasil di-set untuk user", uid);
    process.exit();
  })
  .catch(console.error);
