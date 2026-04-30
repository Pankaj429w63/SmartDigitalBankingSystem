package com.smartbank.services;

import com.smartbank.database.DBConnection;
import com.smartbank.models.Account;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import org.bson.Document;

import java.util.logging.Level;
import java.util.logging.Logger;

public class AccountService {
    private static final Logger logger = Logger.getLogger(AccountService.class.getName());
    private final MongoCollection<Document> accountsCollection;

    public AccountService() {
        this.accountsCollection = DBConnection.getCollection("accounts");
    }

    public Account createAccount(Account account) {
        accountsCollection.insertOne(account.toDocument());
        logger.info("Created new account " + account.getAccountId());
        return account;
    }

    public Account getAccountById(String accountId) {
        Document document = accountsCollection.find(Filters.eq("accountId", accountId)).first();
        return Account.fromDocument(document);
    }

    public Account getAccountByEmail(String email) {
        Document document = accountsCollection.find(Filters.eq("email", email)).first();
        return Account.fromDocument(document);
    }

    public boolean updateBalance(String accountId, double newBalance) {
        try {
            accountsCollection.updateOne(Filters.eq("accountId", accountId), Updates.set("balance", newBalance));
            logger.info("Updated balance for account " + accountId + " to " + newBalance);
            return true;
        } catch (Exception ex) {
            logger.log(Level.SEVERE, "Failed to update account balance", ex);
            return false;
        }
    }
}
