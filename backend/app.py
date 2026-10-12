from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

OLLAMA_MODEL = "qwen3:8b"

# --------------------------------------------------
# HONEYPOT EVENT STORAGE
# --------------------------------------------------

honeypot_events = [
    {
        "id": 1,
        "event": "SSH Login Attempt",
        "source_ip": "192.168.1.105",
        "timestamp": "16:04:12",
        "severity": "High",
        "details": "Failed authentication attempt using username: admin",
        "status": "Blocked",
    },
    {
        "id": 2,
        "event": "Brute Force Attempt",
        "source_ip": "192.168.1.105",
        "timestamp": "16:05:31",
        "severity": "Critical",
        "details": "Multiple failed SSH authentication attempts detected",
        "status": "Blocked",
    },
    {
        "id": 3,
        "event": "Port Scan",
        "source_ip": "10.0.0.24",
        "timestamp": "16:06:08",
        "severity": "Medium",
        "details": "Multiple network ports were scanned",
        "status": "Detected",
    },
    {
        "id": 4,
        "event": "Suspicious Command",
        "source_ip": "10.0.0.24",
        "timestamp": "16:07:44",
        "severity": "High",
        "details": "Command detected: whoami",
        "status": "Detected",
    },
    {
        "id": 5,
        "event": "Unauthorized Access",
        "source_ip": "172.16.0.44",
        "timestamp": "16:08:19",
        "severity": "Critical",
        "details": "Attempted access to restricted honeypot resource",
        "status": "Blocked",
    },
]


@app.get("/api/health")
def health():
    return jsonify({
        "status": "online",
        "application": "CYBERSHIELD",
        "message": "Backend is running"
    })

@app.get("/api/honeypot/events")
def get_honeypot_events():
    return jsonify({
        "success": True,
        "events": honeypot_events
    })

@app.post("/api/honeypot/events")
def create_honeypot_event():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "No honeypot event data received"
        }), 400

    required_fields = [
        "event",
        "source_ip",
        "severity",
        "details"
    ]

    missing_fields = [
        field for field in required_fields
        if not data.get(field)
    ]

    if missing_fields:
        return jsonify({
            "success": False,
            "error": "Missing required fields",
            "missing": missing_fields
        }), 400

    new_event = {
        "id": len(honeypot_events) + 1,
        "event": data["event"],
        "source_ip": data["source_ip"],
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "severity": data["severity"],
        "details": data["details"],
        "status": data.get("status", "Detected"),
    }

    honeypot_events.insert(0, new_event)

    return jsonify({
        "success": True,
        "message": "Honeypot event recorded",
        "event": new_event
    }), 201

@app.post("/api/evaluate")
def evaluate():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No evaluation data received"
        }), 400

    scenario = data.get("scenario", {})
    choice_data = data.get("choice", {})
    choice = choice_data.get("id", "")
    reason = data.get("reasoning", "").strip()

    if not choice or not reason:
        return jsonify({
            "error": "Choice and reasoning are required"
        }), 400

    sender = scenario.get("sender", "")
    email = scenario.get("email", "")
    subject = scenario.get("subject", "")
    message = scenario.get("message", "")

    prompt = f"""
You are CYBERSHIELD, a cybersecurity awareness assessment AI.

Evaluate a user's response to a phishing-awareness scenario.

SCENARIO:
Sender: {sender}
Email: {email}
Subject: {subject}
Message: {message}

USER'S DECISION:
{choice}

USER'S REASONING:
{reason}

Your job is to evaluate:
1. Whether the user's decision is appropriate.
2. The quality of their reasoning.
3. The phishing indicators they identified.
4. Their overall risk level.

IMPORTANT:
- Do not judge the user harshly.
- A correct decision with weak reasoning should not receive full marks.
- A wrong decision with good reasoning should still be considered risky.
- Focus on cybersecurity awareness.
- Keep the feedback concise and useful.
- Do not reveal hidden reasoning or chain-of-thought.
- Return ONLY valid JSON.

Return exactly this structure:

{{
  "decision_assessment": "Correct" or "Partially Correct" or "Risky",
  "reasoning_quality": "Strong" or "Moderate" or "Weak",
  "risk_level": "Low" or "Moderate" or "High",
  "score": number between 0 and 100,
  "summary": "short explanation",
  "indicators_identified": [
    "indicator 1",
    "indicator 2"
  ],
  "missing_indicators": [
    "indicator 1"
  ],
  "recommendation": "short practical recommendation"
}}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=120,
        )

        response.raise_for_status()

        ai_content = response.json()["response"]
        evaluation = json.loads(ai_content)

        return jsonify({
            "success": True,
            "evaluation": evaluation
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# =========================
# HONEYPOT API
# =========================

@app.get("/api/honeypot/status")
def honeypot_status():
    return jsonify({
        "status": "active",
        "honeypot": "CYBERSHIELD Honeypot",
        "threats_detected": len(honeypot_events),
        "attack_attempts": len(honeypot_events),
        "suspicious_sources": len(
            set(event["source_ip"] for event in honeypot_events)
        ),
        "critical_events": sum(
             1
            for event in honeypot_events
            if event["severity"] == "Critical"
        ),
    })


if __name__ == "__main__":
    app.run(debug=True)