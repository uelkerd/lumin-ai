// MongoDB initialization script for LUMIN.AI development environment
print('Started MongoDB initialization');

// Switch to the admin database
db = db.getSiblingDB('admin');

// Create the application user if not exists
try {
    db.createUser({
        user: 'lumin',
        pwd: process.env.MONGO_PASSWORD, // This will not work directly, see comment body for a better approach.
        roles: [
            { role: 'readWrite', db: 'governance_analysis' },
            { role: 'dbAdmin', db: 'governance_analysis' }
        ]
    });
    print('Created application user: lumin');
} catch (e) {
    print('User already exists or error occurred: ' + e);
}

// Switch to the application database
db = db.getSiblingDB('governance_analysis');

// Create collections
db.createCollection('governance_documents');
db.createCollection('analysis_results');
db.createCollection('users');
db.createCollection('logs');

print('Created initial collections');

// Insert some sample data for testing
db.governance_documents.insertOne({ 
    title: 'Sample Document',
    source: 'Test Data',
    createdAt: new Date(),
    content: 'This is a sample document for testing the database connection.'
});

print('Inserted sample data');
print('MongoDB initialization completed');
