from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import urllib.request
import urllib.error

app = Flask(__name__)
CORS(app)

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen3:8b"


@app.get("/api/health")
def health():
    return jsonify({
        "status": "online",
        "application": "CYBERSHIELD",
        "message": "Backend is running"
    })


@app.post("/api/evaluate")
def evaluate():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "No evaluation data received"
        }), 400

    scenario = data.get("scenario", {})
    choice = data.get("choice", "")
    reason = data.get("reason", "").strip()

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

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "format": "json",
        "stream": False,
        "think": False
    }

    try:
        encoded_data = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(
            OLLAMA_URL,
            data=encoded_data,
            headers={
                "Content-Type": "application/json"
            },
            method="POST"
        )

        with urllib.request.urlopen(req, timeout=120) as response:
            result = json.loads(response.read().decode("utf-8"))

        ai_content = result["message"]["content"]

        evaluation = json.loads(ai_content)

        return jsonify({
            "success": True,
            "evaluation": evaluation
        })

    except urllib.error.URLError:
        return jsonify({
            "success": False,
            "error": "CYBERSHIELD could not connect to the local AI engine. Make sure Ollama is running."
        }), 503

    except json.JSONDecodeError:
        return jsonify({
            "success": False,
            "error": "The AI returned an invalid evaluation format.",
            "raw_response": ai_content if "ai_content" in locals() else None
        }), 500

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)