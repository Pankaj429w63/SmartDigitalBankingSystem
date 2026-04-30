package com.smartbank.ui;

import com.smartbank.models.Account;
import com.smartbank.models.User;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;

public class CustomerDetails extends JFrame {
    private final User user;
    private final Account account;

    public CustomerDetails(User user, Account account) {
        this.user = user;
        this.account = account;
        setTitle("Customer Details - " + user.getEmail());
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(520, 360);
        setLocationRelativeTo(null);
        initialize();
    }

    private void initialize() {
        JPanel details = new JPanel(new GridLayout(7, 1, 10, 10));
        details.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));
        details.add(createInfoLabel("First Name:", user.getFirstName()));
        details.add(createInfoLabel("Last Name:", user.getLastName()));
        details.add(createInfoLabel("Email:", user.getEmail()));
        details.add(createInfoLabel("Phone:", user.getPhone()));
        details.add(createInfoLabel("Account ID:", account.getAccountId()));
        details.add(createInfoLabel("Account Type:", account.getAccountType()));
        details.add(createInfoLabel("Balance:", String.format("$%.2f", account.getBalance())));

        JButton transactButton = new JButton("Make Transaction");
        transactButton.addActionListener(this::openTransactionPanel);

        JPanel buttonPanel = new JPanel();
        buttonPanel.add(transactButton);

        add(details, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);
    }

    private JPanel createInfoLabel(String title, String value) {
        JPanel panel = new JPanel(new BorderLayout(8, 8));
        panel.add(new JLabel(title), BorderLayout.WEST);
        panel.add(new JLabel(value), BorderLayout.CENTER);
        return panel;
    }

    private void openTransactionPanel(ActionEvent event) {
        Transaction transaction = new Transaction(user, account);
        transaction.setVisible(true);
        dispose();
    }
}
