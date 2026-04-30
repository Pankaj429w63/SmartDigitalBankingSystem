package com.smartbank.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartbank.database.DBConnection;
import com.smartbank.models.Account;
import com.smartbank.models.BankTransaction;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import org.bson.Document;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.logging.Level;
import java.util.logging.Logger;

public class TransactionService {
    private static final Logger logger = Logger.getLogger(TransactionService.class.getName());
    private static final String FRAUD_API_URL = "http://localhost:5001/predict";
    private static final double MINIMUM_BALANCE = 0d;

    private final MongoCollection<Document> transactionCollection;
    private final AccountService accountService;
    private final ObjectMapper objectMapper;

    public TransactionService() {
        this.transactionCollection = DBConnection.getCollection("transactions");
        this.accountService = new AccountService();
        this.objectMapper = new ObjectMapper();
    }

    public boolean processTransaction(String accountId, double amount, String type, String description) {
        Account account = accountService.getAccountById(accountId);
        if (account == null) {
            logger.warning("Transaction aborted: account not found " + accountId);
            return false;
        }

        int frequency = countRecentTransactions(accountId);
        boolean fraudDetected = checkFraud(amount, frequency, account.getBalance());
        if (fraudDetected) {
            logger.warning("Transaction blocked by fraud detection for account " + accountId);
            recordTransaction(accountId, amount, type, description, "blocked");
            return false;
        }

        double newBalance = type.equalsIgnoreCase("withdrawal") ? account.getBalance() - amount : account.getBalance() + amount;
        if (newBalance < MINIMUM_BALANCE) {
            logger.warning("Transaction aborted: insufficient funds for account " + accountId);
            return false;
        }

        recordTransaction(accountId, amount, type, description, "completed");
        accountService.updateBalance(accountId, newBalance);
        return true;
    }

    private int countRecentTransactions(String accountId) {
        return (int) transactionCollection.countDocuments(Filters.eq("accountId", accountId));
    }

    private boolean checkFraud(double amount, int frequency, double balance) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            Document payload = new Document();
            payload.put("amount", amount);
            payload.put("frequency", frequency);
            payload.put("balance", balance);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(FRAUD_API_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(payload.toJson()))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(response.body());
            int result = root.path("prediction").asInt(0);
            return result == 1;
        } catch (Exception ex) {
            logger.log(Level.WARNING, "Fraud API unavailable, defaulting to safe transaction", ex);
            return false;
        }
    }

    private void recordTransaction(String accountId, double amount, String type, String description, String status) {
        BankTransaction transaction = new BankTransaction(accountId, amount, type, description, status);
        transactionCollection.insertOne(transaction.toDocument());
        logger.info("Recorded transaction " + type + " for account " + accountId + " status=" + status);
    }
}
