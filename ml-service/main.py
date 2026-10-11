
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from sklearn.ensemble import IsolationForest

app = FastAPI(title="Cloud Anomaly Detection Service")

FEATURES = [
    "cpu",
    "memory",
    "request_count",
    "failed_logins",
    "network_traffic",
    "error_count",
]

# Demonstration baseline only. Replace with representative
# historical monitoring data for a meaningful evaluation.
training_data = [
    [20, 35, 100, 0, 120, 1],
    [25, 40, 110, 0, 130, 1],
    [30, 45, 120, 1, 140, 2],
    [22, 38, 105, 0, 125, 1],
    [28, 42, 115, 0, 135, 1],
    [24, 36, 108, 1, 128, 2],
]

model = IsolationForest(
    n_estimators=100,
    contamination=0.1,
    random_state=42
)
model.fit(training_data)


class Metrics(BaseModel):
    cpu: float = Field(ge=0, le=100)
    memory: float = Field(ge=0, le=100)
    request_count: int = Field(ge=0)
    failed_logins: int = Field(ge=0)
    network_traffic: float = Field(ge=0)
    error_count: int = Field(ge=0)


@app.get("/health")
def health():
    return {"status": "ok", "model": "IsolationForest"}


@app.post("/predict")
def predict(metrics: Metrics):
    try:
        row = [[getattr(metrics, key) for key in FEATURES]]
        label = int(model.predict(row)[0])
        score = float(model.decision_function(row)[0])

        anomaly = label == -1

        return {
            "label": "anomaly" if anomaly else "normal",
            "is_anomaly": anomaly,
            "score": score,
            "severity": (
                "high" if anomaly and metrics.failed_logins >= 5
                else "medium" if anomaly
                else "low"
            ),
            "recommendation": (
                "Investigate unusual metrics and related security logs."
                if anomaly else "Continue monitoring."
            )
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Prediction failed") from exc
