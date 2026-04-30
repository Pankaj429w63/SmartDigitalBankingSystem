package com.smartbank.models;

import org.bson.Document;

public class User {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String passwordHash;
    private String accountId;

    public User() {
    }

    public User(String firstName, String lastName, String email, String phone, String passwordHash, String accountId) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.accountId = accountId;
    }

    public static User fromDocument(Document document) {
        if (document == null) {
            return null;
        }
        User user = new User();
        user.id = document.getObjectId("_id").toHexString();
        user.firstName = document.getString("firstName");
        user.lastName = document.getString("lastName");
        user.email = document.getString("email");
        user.phone = document.getString("phone");
        user.passwordHash = document.getString("passwordHash");
        user.accountId = document.getString("accountId");
        return user;
    }

    public Document toDocument() {
        Document document = new Document();
        document.append("firstName", firstName);
        document.append("lastName", lastName);
        document.append("email", email);
        document.append("phone", phone);
        document.append("passwordHash", passwordHash);
        document.append("accountId", accountId);
        return document;
    }

    public String getId() {
        return id;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getAccountId() {
        return accountId;
    }
}
