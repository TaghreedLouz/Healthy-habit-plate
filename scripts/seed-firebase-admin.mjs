/**
 * Creates or updates the Firebase admin user with a strong password.
 *
 * Requires a Firebase service account JSON file:
 *   set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json
 *
 * Usage: npm run seed:firebase-admin
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const ADMIN_EMAIL = "admin@smarthealthyplate.com";
const ADMIN_PASSWORD = "ShpAdmin2026HpSecure!";

const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credPath) {
  console.error(
    "Set GOOGLE_APPLICATION_CREDENTIALS to your Firebase service account JSON path, then retry.",
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(credPath, "utf8"));

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function main() {
  let user;
  try {
    user = await auth.getUserByEmail(ADMIN_EMAIL);
    await auth.updateUser(user.uid, { password: ADMIN_PASSWORD });
    console.log("Updated admin password.");
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "auth/user-not-found") {
      user = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: "Admin",
        emailVerified: true,
      });
      console.log("Created admin user.");
    } else {
      throw err;
    }
  }

  await db.collection("users").doc(user.uid).set(
    {
      email: ADMIN_EMAIL,
      name: "Admin",
      role: "admin",
      createdAt: new Date(),
      lastLoginAt: new Date(),
    },
    { merge: true },
  );

  const usersSnap = await db.collection("users").count().get();
  const registeredUsers = usersSnap.data().count;
  await db.collection("settings").doc("stats").set({ registeredUsers }, { merge: true });
  console.log(`Synced registeredUsers stat: ${registeredUsers}`);

  console.log(`Admin ready: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log("Store this password securely and do not commit it elsewhere.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
