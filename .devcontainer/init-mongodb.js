// MongoDB initialization script for LUMIN.AI development environment
print("Started MongoDB initialization");

// Switch to the admin database
db = db.getSiblingDB("admin");

// Use environment variables if available, otherwise use defaults
// These variables should be set in the container environment
const username = "lumin"; // Default username for development
const password = "devpassword"; // Default password for development  // pragma: allowlist secret
const dbName = "governance_analysis"; // Default database name

// Create the application user if not exists
try {
  // Check if user already exists
  const existingUser = db.getUser(username);
  if (existingUser) {
    print("User " + username + " already exists, skipping creation");
  } else {
    db.createUser({
      user: username,
      pwd: password,
      roles: [
        { role: "readWrite", db: dbName },
        { role: "dbAdmin", db: dbName },
      ],
    });
    print("Created application user: " + username);
  }
} catch (e) {
  if (e.code === 11000) {
    print("User " + username + " already exists");
  } else {
    print("Error creating user: " + e.message);
    throw e; // Re-throw unexpected errors
  }
}

// Switch to the application database
db = db.getSiblingDB("governance_analysis");

// Create collections
db.createCollection("governance_documents");
db.createCollection("analysis_results");
db.createCollection("users");
db.createCollection("logs");

print("Created initial collections");

// Insert some sample data for testing
db.governance_documents.insertOne({
  title: "Sample Document",
  source: "Test Data",
  createdAt: new Date(),
  content: "This is a sample document for testing the database connection.",
});

print("Inserted sample data");
print("MongoDB initialization completed");
