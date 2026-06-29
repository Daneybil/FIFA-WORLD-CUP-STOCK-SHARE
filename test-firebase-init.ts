import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

async function testInit() {
  console.log("Testing Firebase Admin SDK and Firestore initialization...");
  try {
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log("Firebase Admin SDK successfully initialized.");
  } catch (err: any) {
    console.error("Firebase Admin SDK initialization failed:", err.stack);
  }

  try {
    const databaseId = firebaseConfig.firestoreDatabaseId;
    console.log(`Firestore Database ID from config: "${databaseId}"`);
    let db;
    if (databaseId) {
      db = getFirestore(databaseId as any);
    } else {
      db = getFirestore();
    }
    console.log("Firestore client created successfully:", !!db);
    // Try to access a collection (this doesn't execute a query, just returns a collection ref)
    const ref = db.collection("payments");
    console.log("Collection reference created successfully:", !!ref);
  } catch (err: any) {
    console.error("Firestore initialization failed:", err.stack);
  }
}

testInit();
