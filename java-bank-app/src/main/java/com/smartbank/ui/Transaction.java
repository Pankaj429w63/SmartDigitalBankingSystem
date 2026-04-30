package com.smartbank.ui;

import com.smartbank.models.Account;
import com.smartbank.models.User;
import com.smartbank.services.AccountService;
import com.smartbank.services.TransactionService;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;

public class Transaction extends JFrame {
    private final User user;
    private Account account;
    private final TransactionService transactionService = new TransactionService();
    private final AccountService accountService = new AccountService();

    private final JTextField amountField = new JTextField(14);
    private final JComboBox<String> typeCombo = new JComboBox<>(new String[]{"deposit", "withdrawal"});
    private final JTextField descriptionField = new JTextField(20);

    public Transaction(User user, Account account) {
        this.user = user;
        this.account = account;
        setTitle("Transaction Manager");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(460, 300);
        setLocationRelativeTo(null);
        initialize();
    }

    private void initialize() {
        JPanel panel = new JPanel(new GridLayout(5, 1, 10, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));
        panel.add(createLabeledPanel("Account ID:", new JLabel(account.getAccountId())));
        panel.add(createLabeledPanel("Current Balance:", new JLabel(String.format("$%.2f", account.getBalance()))));
        panel.add(createLabeledPanel("Amount:", amountField));
        panel.add(createLabeledPanel("Type:", typeCombo));
        panel.add(createLabeledPanel("Description:", descriptionField));

        JButton submitButton = new JButton("Submit Transaction");
        submitButton.addActionListener(this::submitTransaction);

        JPanel buttonPanel = new JPanel();
        buttonPanel.add(submitButton);

        add(panel, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);
    }

    private JPanel createLabeledPanel(String labelText, Component input) {
        JPanel panel = new JPanel(new BorderLayout(8, 8));
        panel.add(new JLabel(labelText), BorderLayout.WEST);
        panel.add(input, BorderLayout.CENTER);
        return panel;
    }

    private void submitTransaction(ActionEvent event) {
        try {
            double amount = Double.parseDouble(amountField.getText().trim());
            String type = (String) typeCombo.getSelectedItem();
            String description = descriptionField.getText().trim();

            if (amount <= 0) {
                JOptionPane.showMessageDialog(this, "Amount must be greater than zero.", "Validation", JOptionPane.WARNING_MESSAGE);
                return;
            }
            if (type == null) {
                JOptionPane.showMessageDialog(this, "Please choose a transaction type.", "Validation", JOptionPane.WARNING_MESSAGE);
                return;
            }

            boolean success = transactionService.processTransaction(account.getAccountId(), amount, type, description);
            if (!success) {
                JOptionPane.showMessageDialog(this, "Transaction failed or was blocked by fraud detection.", "Transaction Status", JOptionPane.ERROR_MESSAGE);
                return;
            }

            account = accountService.getAccountById(account.getAccountId());
            JOptionPane.showMessageDialog(this, "Transaction completed successfully! New balance: $" + String.format("%.2f", account.getBalance()), "Success", JOptionPane.INFORMATION_MESSAGE);
            new CustomerDetails(user, account).setVisible(true);
            dispose();
        } catch (NumberFormatException ex) {
            JOptionPane.showMessageDialog(this, "Please enter a valid numeric amount.", "Validation", JOptionPane.WARNING_MESSAGE);
        }
    }
}
