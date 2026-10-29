from flask import Flask, jsonify, request
from flask_cors import CORS
from google import genai
import json
import os
import re
import sqlite3
import requests
from pathlib import Path


ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

if ENV_FILE.exists():
    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from functools import wraps
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import secrets

app = Flask(__name__)
CORS(app)

app.config["JWT_SECRET_KEY"] = os.environ.get("CYBERSHIELD_JWT_SECRET")
app.config["HONEYPOT_INGESTION_KEY"] = os.environ.get(
    "CYBERSHIELD_HONEYPOT_KEY"
)

if not app.config["JWT_SECRET_KEY"]:
    raise RuntimeError(
        "Set the CYBERSHIELD_JWT_SECRET environment variable before starting CYBERSHIELD."
    )

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

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

def write_audit_log(event_type, details=None, user_id=None):
    connection = get_db_connection()
    try:
        connection.execute(
            """
            INSERT INTO audit_logs
                (user_id, event_type, details, ip_address, timestamp)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                user_id,
                event_type,
                json.dumps(details or {}),
                request.remote_addr,
                datetime.utcnow().isoformat(),
            ),
        )
        connection.commit()
    finally:
        connection.close()

def token_required(required_role=None):
    def decorator(view_function):
        @wraps(view_function)
        def wrapped(*args, **kwargs):
            authorization = request.headers.get("Authorization", "")

            if not authorization.startswith("Bearer "):
                write_audit_log(
                    "authentication_missing_token",
                    {"path": request.path},
                )
                return jsonify({"error": "Authentication required"}), 401

            token = authorization.split(" ", 1)[1].strip()

            try:
                payload = jwt.decode(
                    token,
                    app.config["JWT_SECRET_KEY"],
                    algorithms=["HS256"],
                )
            except jwt.InvalidTokenError:
                write_audit_log(
                    "authentication_invalid_token",
                    {"path": request.path},
                )
                return jsonify({"error": "Invalid or expired token"}), 401

            user_id = payload.get("user_id")
            role = payload.get("role")

            if not user_id or role not in ("student", "admin"):
                return jsonify({"error": "Invalid token claims"}), 401

            if required_role and role != required_role:
                write_audit_log(
                    "authorization_denied",
                    {"path": request.path, "required_role": required_role},
                    user_id=user_id,
                )
                return jsonify({"error": "Forbidden"}), 403

            request.current_user_id = user_id
            request.current_user_role = role

            return view_function(*args, **kwargs)

        return wrapped
    return decorator

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


    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash BLOB NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
            created_at TEXT NOT NULL
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            event_type TEXT NOT NULL,
            details TEXT NOT NULL DEFAULT '{}',
            ip_address TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    connection.execute("""
        CREATE TABLE IF NOT EXISTS evaluation_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            scenario TEXT NOT NULL,
            choice TEXT,
            reasoning TEXT,
            evaluation TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
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


@app.post("/api/auth/login")
@limiter.limit("5 per minute")
def login():
    data = request.get_json(silent=True) or {}

    email = data.get("email", "")
    password = data.get("password", "")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Email and password are required"}), 400

    email = email.strip().lower()

    if not email or not password or len(password) > 72:
        write_audit_log(
            "login_failed",
            {"reason": "invalid_input", "email": email[:254]},
        )
        return jsonify({"error": "Invalid email or password"}), 401

    connection = get_db_connection()
    try:
        user = connection.execute(
            "SELECT id, email, password_hash, role FROM users WHERE email = ?",
            (email,),
        ).fetchone()
    finally:
        connection.close()

    password_matches = False

    if user:
        try:
            password_matches = bcrypt.checkpw(
                password.encode("utf-8"),
                bytes(user["password_hash"]),
            )
        except (ValueError, TypeError):
            password_matches = False

    if not user or not password_matches:
        write_audit_log(
            "login_failed",
            {"reason": "invalid_credentials", "email": email[:254]},
        )
        return jsonify({"error": "Invalid email or password"}), 401

    token = jwt.encode(
        {
            "user_id": str(user["id"]),
            "role": user["role"],
            "exp": int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp()),
        },
        app.config["JWT_SECRET_KEY"],
        algorithm="HS256",
    )

    write_audit_log(
        "login_success",
        {"email": user["email"], "role": user["role"]},
        user_id=user["id"],
    )

    return jsonify({
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"],
        },
    }), 200


@app.get("/api/health")
def health():
    return jsonify({
        "status": "online",
        "application": "CYBERSHIELD",
        "message": "Backend is running"
    })


@app.get("/api/honeypot/events")
@token_required("admin")
def fetch_honeypot_events():
    return jsonify({
        "success": True,
        "events": get_honeypot_events()
    })



@app.post("/api/honeypot/events")
@limiter.limit("30 per minute")
def create_honeypot_event():
    authorization = request.headers.get("Authorization", "")
    ingestion_key = request.headers.get("X-Honeypot-Key", "")
    configured_key = app.config.get("HONEYPOT_INGESTION_KEY")

    # Authenticate with an admin JWT or the trusted ingestion key.
    authenticated = False

    if authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            payload = jwt.decode(
                token,
                app.config["JWT_SECRET_KEY"],
                algorithms=["HS256"],
            )
            authenticated = (
                payload.get("role") == "admin"
                and bool(payload.get("user_id"))
            )
        except jwt.InvalidTokenError:
            authenticated = False

    if not authenticated and configured_key and ingestion_key:
        authenticated = secrets.compare_digest(
            ingestion_key, configured_key
        )

    if not authenticated:
        write_audit_log(
            "honeypot_ingestion_denied",
            {"path": request.path},
        )
        return jsonify({"error": "Authentication required"}), 401

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "success": False,
            "error": "No honeypot event data received"
        }), 400

    required_fields = ["event", "source_ip", "severity", "details"]
    missing_fields = [field for field in required_fields if not data.get(field)]

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
    try:
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
    finally:
        connection.close()

    write_audit_log(
        "honeypot_event_ingested",
        {"event_id": new_event["id"]},
    )

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
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            return jsonify({
                "success": False,
                "error": "Gemini API key is not configured on the backend."
            }), 503

        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "temperature": 0.2,
                "max_output_tokens": 1000,
            },
        )

        if not response.text:
            raise ValueError("Gemini returned an empty response.")

        evaluation = json.loads(response.text)

        # Keep your existing database-saving code below this line.

        # Persist the evaluation. Anonymous evaluations use NULL for user_id;
        # never trust a user_id supplied by the client.
        connection = get_db_connection()
        try:
            connection.execute(
                """
                INSERT INTO evaluation_records
                    (user_id, scenario, choice, reasoning, evaluation, timestamp)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    None,
                    json.dumps(scenario),
                    str(choice),
                    reason,
                    json.dumps(evaluation),
                    datetime.now(timezone.utc).isoformat(),
                ),
            )
            connection.commit()
        finally:
            connection.close()

        write_audit_log(
            "evaluation_saved",
            {"choice": str(choice), "score": evaluation.get("score")},
        )

        return jsonify({
            "success": True,
            "evaluation": evaluation
        })

    except requests.RequestException:
        app.logger.exception("Ollama evaluation request failed")
        return jsonify({
            "success": False,
            "error": "The evaluation service is currently unavailable."
        }), 503
    except (ValueError, KeyError, TypeError):
        app.logger.exception("Invalid evaluation response or input")
        return jsonify({
            "success": False,
            "error": "Could not process the evaluation response."
        }), 500

# =========================
# HONEYPOT API
# =========================


@app.get("/api/honeypot/status")
@token_required("admin")
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


@app.get("/api/audit/logs")
@token_required("admin")
def fetch_audit_logs():
    """Return recent audit records to authenticated administrators only."""
    raw_limit = request.args.get("limit", "50")
    try:
        limit = int(raw_limit)
    except (TypeError, ValueError):
        return jsonify({"success": False, "error": "limit must be an integer"}), 400

    if limit < 1 or limit > 100:
        return jsonify({"success": False, "error": "limit must be between 1 and 100"}), 400

    connection = get_db_connection()
    try:
        rows = connection.execute(
            """
            SELECT id, user_id, event_type, details, ip_address, timestamp
            FROM audit_logs
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    finally:
        connection.close()

    logs = []
    for row in rows:
        entry = dict(row)
        try:
            entry["details"] = json.loads(entry["details"] or "{}")
        except (TypeError, json.JSONDecodeError):
            entry["details"] = {}
        logs.append(entry)

    return jsonify({"success": True, "count": len(logs), "logs": logs}), 200





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
    app.run(debug=False)