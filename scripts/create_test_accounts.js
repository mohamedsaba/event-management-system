
async function register(user, endpoint) {
  try {
    console.log(`Registering ${user.username} (${user.email}) via ${endpoint}...`);
    const res = await fetch(`http://localhost:8089/api${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`✅ Success: ${user.email} registered. Role: ${data.role}`);
      return data.token;
    } else {
      console.error(`❌ Failed: ${user.email}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error(`❌ Error: ${user.email}: ${err.message}`);
  }
  return null;
}

async function main() {
  const users = {
    attendee: { username: "test_user", email: "user@test.com", password: "password123" },
    organizer: { username: "test_organizer", email: "organizer@test.com", password: "password123" },
    admin: { username: "test_admin", email: "admin@test.com", password: "password123" }
  };

  // 1. Register Attendee
  await register(users.attendee, "/auth/register");

  // 2. Register Organizer (Note: This might fail without an Admin token if the backend enforces it)
  // But we'll try /auth/register first if it exists as public (unlikely based on docs)
  await register(users.organizer, "/auth/register/organizer");

  // 3. Register Admin (Backend usually doesn't allow public admin registration)
  await register(users.admin, "/auth/register");
  
  console.log("\nNote: If registration failed, ensure the backend is running at http://localhost:8089.");
  console.log("If Roles are incorrect, they must be updated in the database.");
}

main();
