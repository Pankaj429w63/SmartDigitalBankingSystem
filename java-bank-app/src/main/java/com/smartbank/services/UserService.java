package com.smartbank.services;

import com.smartbank.database.DBConnection;
import com.smartbank.models.Account;
import com.smartbank.models.User;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import org.bson.Document;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;
import java.util.logging.Level;
import java.util.logging.Logger;

public class UserService {
    private static final Logger logger = Logger.getLogger(UserService.class.getName());
    private final MongoCollection<Document> usersCollection;
    private final MongoCollection<Document> accountsCollection;
    private final AccountService accountService;

    public UserService() {
        this.usersCollection = DBConnection.getCollection("users");
        this.accountsCollection = DBConnection.getCollection("accounts");
        this.accountService = new AccountService();
    }

    public boolean registerUser(String firstName, String lastName, String email, String phone, String password, String accountType, double initialBalance) {
        try {
            if (email == null || email.isBlank() || password == null || password.isBlank()) {
                return false;
            }

            if (getUserByEmail(email) != null) {
                logger.warning("Registration failed: user already exists for email " + email);
                return false;
            }

            String accountId = UUID.randomUUID().toString();
            Account account = new Account(accountId, email, accountType, initialBalance);
            accountService.createAccount(account);

            String passwordHash = hashPassword(password);
            User user = new User(firstName, lastName, email, phone, passwordHash, accountId);
            usersCollection.insertOne(user.toDocument());
            logger.info("Registered new user " + email);
            return true;
        } catch (Exception ex) {
            logger.log(Level.SEVERE, "Failed to register user", ex);
            return false;
        }
    }

    public User authenticate(String email, String password) {
        try {
            User user = getUserByEmail(email);
            if (user == null) {
                return null;
            }
            String hash = hashPassword(password);
            if (hash.equals(user.getPasswordHash())) {
                return user;
            }
            logger.warning("Authentication failed for email " + email);
        } catch (Exception ex) {
            logger.log(Level.SEVERE, "Authentication error", ex);
        }
        return null;
    }

    public User getUserByEmail(String email) {
        Document document = usersCollection.find(Filters.eq("email", email)).first();
        return User.fromDocument(document);
    }

    private String hashPassword(String password) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] encodedHash = digest.digest(password.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder(2 * encodedHash.length);
        for (byte b : encodedHash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
