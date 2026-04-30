import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), "fraud_model.joblib")


def build_dataset():
    rng = np.random.default_rng(seed=42)
    size = 1200
    amounts = rng.normal(loc=420, scale=220, size=size).clip(1, 5000)
    frequency = rng.integers(0, 15, size=size)
    balance = rng.normal(loc=3200, scale=1700, size=size).clip(0, 25000)

    is_fraud = (amounts > 3000).astype(int)
    is_fraud = np.where((frequency > 10) & (balance < 2000), 1, is_fraud)
    is_fraud = np.where((amounts > 1500) & (frequency > 9), 1, is_fraud)

    data = pd.DataFrame({
        "amount": amounts,
        "frequency": frequency,
        "balance": balance,
        "fraud": is_fraud,
    })
    return data


def train_and_save(model_path=MODEL_PATH):
    data = build_dataset()
    X = data[["amount", "frequency", "balance"]]
    y = data["fraud"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.22, random_state=42)
    model = RandomForestClassifier(n_estimators=120, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    print("Fraud model training complete")
    print(classification_report(y_test, y_pred, zero_division=0))

    joblib.dump(model, model_path)
    print(f"Saved fraud detection model to {model_path}")
    return model


if __name__ == "__main__":
    train_and_save()
