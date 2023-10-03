import admin from "firebase-admin";

const app = admin.apps.at(0) ?? admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(atob(import.meta.env.FIREBASE_CREDENTIAL_JSON)),
  ),
});

export const firestore = admin.firestore(app);
