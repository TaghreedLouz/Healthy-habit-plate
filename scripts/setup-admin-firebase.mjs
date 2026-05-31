/**
 * Creates or updates the admin user via Firebase Auth REST API (no service account needed).
 * Usage: npm run setup:admin
 */
const API_KEY = "AIzaSyCPzphqG1qQGIhyY6m-SyhU5FWlHRTDCJc";
const ADMIN_EMAIL = "admin@smarthealthyplate.com";
const ADMIN_PASSWORD = "ShpAdmin2026HpSecure!";
const LEGACY_PASSWORD = "00000000";

async function api(path, body) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${path}?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error?.message ?? "Request failed");
    err.code = data.error?.message;
    throw err;
  }
  return data;
}

async function main() {
  try {
    await api("accounts:signUp", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      returnSecureToken: true,
    });
    console.log("Created admin account.");
  } catch (err) {
    if (err.code !== "EMAIL_EXISTS") throw err;

    let idToken;
    try {
      const signedIn = await api("accounts:signInWithPassword", {
        email: ADMIN_EMAIL,
        password: LEGACY_PASSWORD,
        returnSecureToken: true,
      });
      idToken = signedIn.idToken;
      console.log("Signed in with legacy password, updating…");
    } catch {
      try {
        const signedIn = await api("accounts:signInWithPassword", {
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          returnSecureToken: true,
        });
        idToken = signedIn.idToken;
        console.log("Admin already uses the current password.");
      } catch {
        console.error(
          "Admin exists but password is unknown. In Firebase Console → Authentication → reset password to:",
          ADMIN_PASSWORD,
        );
        process.exit(1);
      }
    }

    if (idToken) {
      await api("accounts:update", {
        idToken,
        password: ADMIN_PASSWORD,
        returnSecureToken: false,
      });
      console.log("Updated admin password.");
    }
  }

  console.log(`\nAdmin login:\n  Email: ${ADMIN_EMAIL}\n  Password: ${ADMIN_PASSWORD}\n`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
