package com.smartbank.models;

import org.bson.Document;

import java.time.Instant;
import java.time.format.DateTimeFormatter;

public class BankTransaction {
    private String id;
    private String accountId;
    private double amount;
    private String type;
    private String description;
    private String timestamp;
    private String status;

    public BankTransaction() {
    }

    public BankTransaction(String accountId, double amount, String type, String description, String status) {
        this.accountId = accountId;
        this.amount = amount;
        this.type = type;
        this.description = description;
        this.timestamp = DateTimeFormatter.ISO_INSTANT.format(Instant.now());
        this.status = status;
    }

    public static BankTransaction fromDocument(Document document) {
        if (document == null) {
            return null;
        }
        BankTransaction transaction = new BankTransaction();
        transaction.id = document.getObjectId("_id").toHexString();
        transaction.accountId = document.getString("accountId");
        transaction.amount = document.getDouble("amount");
        transaction.type = document.getString("type");
        transaction.description = document.getString("description");
        transaction.timestamp = document.getString("timestamp");
        transaction.status = document.getString("status");
        return transaction;
    }

    public Document toDocument() {
        Document document = new Document();
        document.append("accountId", accountId);
        document.append("amount", amount);
        document.append("type", type);
        document.append("description", description);
        document.append("timestamp", timestamp);
        document.append("status", status);
        return document;
    }

    public String getId() {
        return id;
    }

    public String getAccountId() {
        return accountId;
    }

    public double getAmount() {
        return amount;
    }

    public String getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getStatus() {
        return status;
    }
}
