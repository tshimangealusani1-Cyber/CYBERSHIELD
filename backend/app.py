from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import re
import sqlite3
import requests
from datetime import datetime

app = Flask(__name__)
CORS(app)

OLLAMA_MODEL = "qwen3:8b"


# --------------------------------------------------
# HONEYPOT EVENT STORAGE — SQLITE DATABASE
# --------------------------------------------------

DATABASE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "cybershield.db"
)


def get_db_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS honeypot_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event TEXT NOT NULL,
            source_ip TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            severity TEXT NOT NULL,
            details TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS phishing_simulation_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            learner_id TEXT NOT NULL,
            scenario_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            points INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            details TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS scam_progress (
            learner_id TEXT PRIMARY KEY,
            progress_json TEXT NOT NULL DEFAULT '{}',
            updated_at TEXT NOT NULL
        )
    """)

    existing_events = connection.execute(
        "SELECT COUNT(*) FROM honeypot_events"
    ).fetchone()[0]

    if existing_events == 0:
        demo_events = [
            (
                "SSH Login Attempt",
                "192.168.1.105",
                "16:04:12",
                "High",
                "Failed authentication attempt using username: admin",
                "Blocked",
            ),
            (
                "Brute Force Attempt",
                "192.168.1.105",
                "16:05:31",
                "Critical",
                "Multiple failed SSH authentication attempts detected",
                "Blocked",
            ),
            (
                "Port Scan",
                "10.0.0.24",
                "16:06:08",
                "Medium",
                "Multiple network ports were scanned",
                "Detected",
            ),
            (
                "Suspicious Command",
                "10.0.0.24",
                "16:07:44",
                "High",
                "Command detected: whoami",
                "Detected",
            ),
            (
                "Unauthorized Access",
                "172.16.0.44",
                "16:08:19",
                "Critical",
                "Attempted access to restricted honeypot resource",
                "Blocked",
            ),
        ]

        connection.executemany("""
            INSERT INTO honeypot_events
            (event, source_ip, timestamp, severity, details, status)
            VALUES (?, ?, ?, ?, ?, ?)
        """, demo_events)

    connection.commit()
    connection.close()


def get_honeypot_events():
    connection = get_db_connection()

    rows = connection.execute("""
        SELECT id, event, source_ip, timestamp,
               severity, details, status
        FROM honeypot_events
        ORDER BY id DESC
    """).fetchall()

    connection.close()

    return [dict(row) for row in rows]


initialize_database()



@app.get("/api/health")
def health():
    return jsonify({
        "status": "online",
        "application": "CYBERSHIELD",
        "message": "Backend is running"
    })


@app.get("/api/honeypot/events")
def fetch_honeypot_events():
    return jsonify({
        "success": True,
        "events": get_honeypot_events()
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
        "event": data["event"],
        "source_ip": data["source_ip"],
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "severity": data["severity"],
        "details": data["details"],
        "status": data.get("status", "Detected")
    }

    connection = get_db_connection()

    cursor = connection.execute("""
        INSERT INTO honeypot_events
        (event, source_ip, timestamp, severity, details, status)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        new_event["event"],
        new_event["source_ip"],
        new_event["timestamp"],
        new_event["severity"],
        new_event["details"],
        new_event["status"]
    ))

    new_event["id"] = cursor.lastrowid

    connection.commit()
    connection.close()

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

    if not choice:
        return jsonify({
            "error": "A choice is required"
        }), 400
    if not reason:
        reason = "No written explanation was requested. Evaluate the selected decision and scenario only."

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
2. The phishing indicators relevant to the scenario.
3. Their overall risk level.

IMPORTANT:
- Do not judge the user harshly.
- Evaluate the selected action primarily against the scenario's safety implications.
- Do not penalise the learner for not providing written reasoning.
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
    events = get_honeypot_events()

    return jsonify({
        "status": "active",
        "honeypot": "CYBERSHIELD Honeypot",
        "threats_detected": len(events),
        "attack_attempts": len(events),
        "suspicious_sources": len(
            set(event["source_ip"] for event in events)
        ),
        "critical_events": sum(
            1 for event in events
            if event["severity"] == "Critical"
        )
    })





# =========================
# ANONYMOUS SCAM CENTRE PROGRESS
# =========================

def clean_scam_progress(progress):
    if not isinstance(progress, dict):
        raise ValueError("Progress must be an object.")
    allowed_scenarios = {"email", "phone", "social", "website", "shopping", "recovery"}
    cleaned = {}
    for key, value in progress.items():
        if key not in allowed_scenarios or not isinstance(value, dict):
            continue
        cleaned[key] = {
            "answered": bool(value.get("answered", False)),
            "correct": bool(value.get("correct", False)),
            "choice": str(value.get("choice", ""))[:40],
        }
    return cleaned


@app.get("/api/scam-progress/<learner_id>")
def get_scam_progress(learner_id):
    if not re.fullmatch(r"[0-9a-fA-F-]{36}", learner_id):
        return jsonify({"success": False, "error": "Invalid anonymous learner ID"}), 400
    connection = get_db_connection()
    row = connection.execute(
        "SELECT progress_json FROM scam_progress WHERE learner_id = ?",
        (learner_id,)
    ).fetchone()
    connection.close()
    progress = json.loads(row["progress_json"]) if row else {}
    return jsonify({"success": True, "progress": progress})


@app.put("/api/scam-progress/<learner_id>")
def save_scam_progress(learner_id):
    if not re.fullmatch(r"[0-9a-fA-F-]{36}", learner_id):
        return jsonify({"success": False, "error": "Invalid anonymous learner ID"}), 400
    data = request.get_json(silent=True) or {}
    try:
        progress = clean_scam_progress(data.get("progress", {}))
    except ValueError as error:
        return jsonify({"success": False, "error": str(error)}), 400
    updated_at = datetime.utcnow().isoformat(timespec="seconds") + "Z"
    connection = get_db_connection()
    connection.execute("""
        INSERT INTO scam_progress (learner_id, progress_json, updated_at)
        VALUES (?, ?, ?)
        ON CONFLICT(learner_id) DO UPDATE SET
            progress_json = excluded.progress_json,
            updated_at = excluded.updated_at
    """, (learner_id, json.dumps(progress), updated_at))
    connection.commit()
    connection.close()
    return jsonify({"success": True, "progress": progress, "updated_at": updated_at})


# =========================
# SAFE PHISHING SIMULATION
# Events only; never collect credentials or open external links.
# =========================

@app.post("/api/phishing-simulation/events")
def record_phishing_simulation_event():
    data = request.get_json(silent=True) or {}
    learner_id = str(data.get("learner_id", ""))
    scenario_id = str(data.get("scenario_id", ""))
    event_type = str(data.get("event_type", ""))

    if not re.fullmatch(r"[0-9a-fA-F-]{36}", learner_id):
        return jsonify({"success": False, "error": "Invalid anonymous learner ID"}), 400

    allowed_scenarios = {f"{name}-001" for name in ("email", "phone", "social", "website", "shopping", "recovery")}
    allowed_events = {
        "inbox_message_opened": (0, "Learner opened a fictional message in the simulated device."),
        "suspicious_link_clicked": (-10, "Learner clicked an internal simulated suspicious link; no external website was opened."),
        "qr_link_opened": (-10, "Learner opened a simulated QR/link destination inside CYBERSHIELD; no external site was contacted."),
        "marketplace_checkout_clicked": (-10, "Learner selected a simulated risky marketplace payment action; no payment was made."),
        "social_payment_clicked": (-10, "Learner selected a simulated money-transfer action; no money was sent."),
        "mock_action_attempted": (-15, "Learner selected a risky action on a mock site; no personal data was collected or transmitted."),
        "mock_signin_attempted": (-15, "Learner selected a simulated sign-in action; no credentials were requested or stored."),
        "email_reported": (10, "Learner chose to report a suspicious fictional message."),
        "phone_answered": (-2, "Learner answered a simulated call; no call was placed."),
        "phone_shared_code_attempted": (-15, "Learner selected the simulated option to share a one-time code; no real code was requested."),
        "social_profile_opened": (0, "Learner inspected a fictional social profile."),
        "recovery_action_selected": (2, "Learner selected a recommended account-recovery safety step."),
        "safe_exit_selected": (5, "Learner selected a safe exit or declined to proceed."),
    }

    if scenario_id not in allowed_scenarios or event_type not in allowed_events:
        return jsonify({"success": False, "error": "Unknown simulation scenario or event"}), 400

    points, details = allowed_events[event_type]
    timestamp = datetime.utcnow().isoformat(timespec="seconds") + "Z"

    connection = get_db_connection()
    cursor = connection.execute("""
        INSERT INTO phishing_simulation_events
        (learner_id, scenario_id, event_type, points, timestamp, details)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (learner_id, scenario_id, event_type, points, timestamp, details))
    connection.commit()
    event_id = cursor.lastrowid
    connection.close()

    return jsonify({
        "success": True,
        "event": {
            "id": event_id,
            "scenario_id": scenario_id,
            "event_type": event_type,
            "points": points,
            "timestamp": timestamp,
            "details": details
        }
    }), 201


@app.get("/api/phishing-simulation/events/<learner_id>")
def get_phishing_simulation_events(learner_id):
    if not re.fullmatch(r"[0-9a-fA-F-]{36}", learner_id):
        return jsonify({"success": False, "error": "Invalid anonymous learner ID"}), 400

    connection = get_db_connection()
    rows = connection.execute("""
        SELECT id, scenario_id, event_type, points, timestamp, details
        FROM phishing_simulation_events
        WHERE learner_id = ?
        ORDER BY id ASC
    """, (learner_id,)).fetchall()
    connection.close()

    return jsonify({"success": True, "events": [dict(row) for row in rows]})


if __name__ == "__main__":
    app.run(debug=True)