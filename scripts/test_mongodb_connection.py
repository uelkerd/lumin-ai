#!/usr/bin/env python3
"""
MongoDB connection test script for LUMIN.AI development environment.
Tests the connection to the MongoDB database and performs basic operations.
"""

import os
import sys
import logging
from pymongo import MongoClient
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


def test_mongodb_connection():
    """Test connection to MongoDB and perform basic operations."""
    # Get connection details from environment or use defaults
    mongo_host = os.environ.get('MONGODB_HOST', 'mongodb')
    mongo_port = int(os.environ.get('MONGODB_PORT', 27017))
    mongo_username = os.environ.get('MONGODB_USERNAME', 'dev')
    mongo_password = os.environ.get('MONGODB_PASSWORD', 'devpassword')
    mongo_database = os.environ.get('MONGODB_DATABASE', 'luminai')

    connection_string = f"mongodb://{mongo_username}:{mongo_password}@{mongo_host}:{mongo_port}/{mongo_database}"

    try:
        logger.info(f"Connecting to MongoDB at {mongo_host}:{mongo_port}...")
        client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)

        # Check server info - this will raise an exception if connection fails
        server_info = client.server_info()
        logger.info(
            f"Connected to MongoDB version: {server_info.get('version')}")

        # Access database
        db = client[mongo_database]
        logger.info(f"Accessed database: {mongo_database}")

        # Create test collection and insert a document
        collection_name = "connection_test"
        collection = db[collection_name]

        test_document = {
            "test_id": "mongodb_connection_test",
            "timestamp": datetime.now(),
            "status": "success"
        }

        result = collection.insert_one(test_document)
        logger.info(f"Inserted test document with ID: {result.inserted_id}")

        # Retrieve the document
        retrieved = collection.find_one({"test_id": "mongodb_connection_test"})
        if retrieved:
            logger.info("Successfully retrieved test document")

        # Clean up - delete the test document
        collection.delete_one({"test_id": "mongodb_connection_test"})
        logger.info("Successfully deleted test document")

        return True

    except Exception as e:
        logger.error(f"MongoDB connection failed: {e}")
        return False

    finally:
        if 'client' in locals():
            client.close()
            logger.info("MongoDB connection closed")


if __name__ == "__main__":
    logger.info("Starting MongoDB connection test")
    success = test_mongodb_connection()

    if success:
        logger.info("✅ MongoDB connection test completed successfully!")
        sys.exit(0)
    else:
        logger.error("❌ MongoDB connection test failed!")
        sys.exit(1)
