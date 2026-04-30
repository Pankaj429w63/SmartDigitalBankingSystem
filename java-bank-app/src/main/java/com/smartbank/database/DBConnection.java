package com.smartbank.database;

import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.util.logging.Level;
import java.util.logging.Logger;

public class DBConnection {
    private static final Logger logger = Logger.getLogger(DBConnection.class.getName());
    private static final String CONNECTION_STRING = "mongodb://localhost:27017";
    private static final String DATABASE_NAME = "bankDB";
    private static MongoClient client;
    private static MongoDatabase database;

    static {
        Logger mongoLogger = Logger.getLogger("org.mongodb.driver");
        mongoLogger.setLevel(Level.SEVERE);
        try {
            client = MongoClients.create(MongoClientSettings.builder().applyConnectionString(new com.mongodb.ConnectionString(CONNECTION_STRING)).build());
            database = client.getDatabase(DATABASE_NAME);
            logger.info("Connected to MongoDB database: " + DATABASE_NAME);
        } catch (Exception exception) {
            logger.log(Level.SEVERE, "Unable to connect to MongoDB", exception);
            throw new RuntimeException("MongoDB connection failed", exception);
        }
    }

    public static MongoDatabase getDatabase() {
        return database;
    }

    public static MongoCollection<Document> getCollection(String name) {
        return getDatabase().getCollection(name);
    }
}
