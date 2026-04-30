from flask import Flask, request, jsonify
import os
import joblib
from fraud_model import train_and_save

app = Flask(__name__)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "fraud_model.joblib")

if not os.path.exists(MODEL_PATH):
    train_and_save(MODEL_PATH)

model = joblib.load(MODEL_PATH)

@app.route("/predict", methods=["POST"])
def predict():
    payload = request.get_json(force=True)
    amount = float(payload.get("amount", 0))
    frequency = int(payload.get("frequency", 0))
    balance = float(payload.get("balance", 0))

    feature_vector = [[amount, frequency, balance]]
    prediction = int(model.predict(feature_vector)[0])
    probability = float(model.predict_proba(feature_vector)[0][prediction])

    return jsonify({
        "prediction": prediction,
        "probability": probability,
        "fraud": bool(prediction),
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
