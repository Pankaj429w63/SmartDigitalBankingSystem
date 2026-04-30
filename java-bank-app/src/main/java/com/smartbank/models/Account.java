package com.smartbank.models;

import org.bson.Document;

public class Account {
    private String id;
    private String accountId;
    private String email;
    private String accountType;
    private double balance;

    public Account() {
    }

    public Account(String accountId, String email, String accountType, double balance) {
        this.accountId = accountId;
        this.email = email;
        this.accountType = accountType;
        this.balance = balance;
    }

    public static Account fromDocument(Document document) {
        if (document == null) {
            return null;
        }
        Account account = new Account();
        account.id = document.getObjectId("_id").toHexString();
        account.accountId = document.getString("accountId");
        account.email = document.getString("email");
        account.accountType = document.getString("accountType");
        account.balance = document.getDouble("balance");
        return account;
    }

    public Document toDocument() {
        Document document = new Document();
        document.append("accountId", accountId);
        document.append("email", email);
        document.append("accountType", accountType);
        document.append("balance", balance);
        return document;
    }

    public String getId() {
        return id;
    }

    public String getAccountId() {
        return accountId;
    }

    public String getEmail() {
        return email;
    }

    public String getAccountType() {
        return accountType;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }
}
