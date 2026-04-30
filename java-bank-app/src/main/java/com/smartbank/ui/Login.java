package com.smartbank.ui;

import com.smartbank.models.Account;
import com.smartbank.models.User;
import com.smartbank.services.AccountService;
import com.smartbank.services.UserService;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.util.logging.Logger;

public class Login extends JFrame {
    private static final Logger logger = Logger.getLogger(Login.class.getName());
    private final JTextField emailField = new JTextField(24);
    private final JPasswordField passwordField = new JPasswordField(24);
    private final UserService userService = new UserService();
    private final AccountService accountService = new AccountService();

    public Login() {
        setTitle("SmartBank Login");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(420, 280);
        setLocationRelativeTo(null);
        setLayout(new BorderLayout(10, 10));

        JPanel formPanel = new JPanel(new GridLayout(4, 1, 10, 10));
        formPanel.setBorder(BorderFactory.createEmptyBorder(20, 20, 10, 20));

        formPanel.add(createLabeledPanel("Email:", emailField));
        formPanel.add(createLabeledPanel("Password:", passwordField));

        JButton loginButton = new JButton("Login");
        loginButton.addActionListener(this::onLogin);
        JButton registerButton = new JButton("Register New Account");
        registerButton.addActionListener(this::onRegister);

        JPanel buttonPanel = new JPanel();
        buttonPanel.add(loginButton);
        buttonPanel.add(registerButton);

        add(formPanel, BorderLayout.CENTER);
        add(buttonPanel, BorderLayout.SOUTH);
    }

    private JPanel createLabeledPanel(String label, Component component) {
        JPanel panel = new JPanel(new BorderLayout(5, 5));
        panel.add(new JLabel(label), BorderLayout.WEST);
        panel.add(component, BorderLayout.CENTER);
        return panel;
    }

    private void onLogin(ActionEvent event) {
        String email = emailField.getText().trim();
        String password = new String(passwordField.getPassword()).trim();
        if (email.isEmpty() || password.isEmpty()) {
            JOptionPane.showMessageDialog(this, "Please enter both email and password.", "Validation", JOptionPane.WARNING_MESSAGE);
            return;
        }

        User user = userService.authenticate(email, password);
        if (user == null) {
            JOptionPane.showMessageDialog(this, "Invalid email or password.", "Login Failed", JOptionPane.ERROR_MESSAGE);
            return;
        }

        Account account = accountService.getAccountById(user.getAccountId());
        new CustomerDetails(user, account).setVisible(true);
        dispose();
    }

    private void onRegister(ActionEvent event) {
        RegistrationForm form = new RegistrationForm(this);
        form.setVisible(true);
    }

    private class RegistrationForm extends JDialog {
        private final JTextField firstNameField = new JTextField(16);
        private final JTextField lastNameField = new JTextField(16);
        private final JTextField emailField = new JTextField(16);
        private final JPasswordField passwordField = new JPasswordField(16);
        private final JTextField phoneField = new JTextField(16);
        private final JComboBox<String> accountTypeField = new JComboBox<>(new String[]{"savings", "checking"});
        private final JTextField initialBalanceField = new JTextField("1000.00", 16);

        public RegistrationForm(Window owner) {
            super(owner, "Register New Account", ModalityType.APPLICATION_MODAL);
            setSize(420, 380);
            setLocationRelativeTo(owner);
            setLayout(new BorderLayout(8, 8));

            JPanel panel = new JPanel(new GridLayout(7, 1, 10, 10));
            panel.setBorder(BorderFactory.createEmptyBorder(16, 16, 16, 16));
            panel.add(createLabeledPanel("First Name:", firstNameField));
            panel.add(createLabeledPanel("Last Name:", lastNameField));
            panel.add(createLabeledPanel("Email:", emailField));
            panel.add(createLabeledPanel("Password:", passwordField));
            panel.add(createLabeledPanel("Phone:", phoneField));
            panel.add(createLabeledPanel("Account Type:", accountTypeField));
            panel.add(createLabeledPanel("Initial Balance:", initialBalanceField));

            JButton submitButton = new JButton("Create Account");
            submitButton.addActionListener(this::onSubmit);
            add(panel, BorderLayout.CENTER);
            add(submitButton, BorderLayout.SOUTH);
        }

        private void onSubmit(ActionEvent e) {
            String firstName = firstNameField.getText().trim();
            String lastName = lastNameField.getText().trim();
            String email = emailField.getText().trim();
            String password = new String(passwordField.getPassword()).trim();
            String phone = phoneField.getText().trim();
            String accountType = (String) accountTypeField.getSelectedItem();
            double initialBalance;
            try {
                initialBalance = Double.parseDouble(initialBalanceField.getText().trim());
            } catch (NumberFormatException ex) {
                JOptionPane.showMessageDialog(this, "Initial balance must be a valid number.", "Validation", JOptionPane.WARNING_MESSAGE);
                return;
            }

            boolean result = userService.registerUser(firstName, lastName, email, phone, password, accountType, initialBalance);
            if (!result) {
                JOptionPane.showMessageDialog(this, "Registration failed. Email may already exist.", "Error", JOptionPane.ERROR_MESSAGE);
                return;
            }

            User user = userService.getUserByEmail(email);
            Account account = accountService.getAccountById(user.getAccountId());
            JOptionPane.showMessageDialog(this, "Account created successfully!", "Success", JOptionPane.INFORMATION_MESSAGE);
            new CustomerDetails(user, account).setVisible(true);
            dispose();
            Login.this.dispose();
        }
    }
}
