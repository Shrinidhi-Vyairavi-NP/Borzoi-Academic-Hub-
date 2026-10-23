# 🐕 Borzoi Academic Hub

An intelligent, gamified academic management dashboard built for the AWS Agent Experience Hackathon. It features real-time communication ingestion, attendance tracking with the interactive **Borzoi Snoot Safety Extension**, an **OD Vault (Bone Tokens 🦴)**, and an AI Leave Application Draft Writer.

---

## 🤖 Reusable Strands Decider 2B Decision Pattern (#policy)

This project demonstrates the **#policy** decision pattern using AWS Strands Decider 2B.

* **Decision Purpose:** Classifies incoming raw chat streams (Discord / Telegram / WhatsApp webhooks) in ultra-low latency (~115ms) to detect academic announcements before triggering application state actions or generative LLMs.
* **Typed Question:** `"Does this announcement indicate a class cancellation, an extra class, or general chat?"`
* **Output Classes:** `['CLASS_CANCELLED', 'EXTRA_CLASS', 'GENERAL_BANTER']`
* **Wiring Architecture:** Local FastAPI microservice (`decider_service/app.py`) serving as a System 1 classifier paired with Amazon Bedrock / Gemini for generative text synthesis and roasts.

---

## 🛠️ Features

* **Academic Subject Manager:** Real-time class fraction tracking (`28/32`), credit-weighted calculations, and customizable target criteria (e.g., 80%).
* **"Can I Bunk?" Counselor & Snoot Meter:** Automatically calculates safe bunks and extends the Borzoi mascot snout based on attendance safety margins.
* **Comms Intel Feed:** Automatically parses Discord/Telegram webhooks for scheduled extra classes or cancellations.
* **OD Vault & Bone Tokens 🦴:** Visual semester On-Duty token tracker.
* **AI Draft Writer:** Generates formal academic sanction letters formatted with student profile details and college information.
* **Zero-Database Persistence:** Full client-side `localStorage` sync so students pick up right where they left off.

---

## 🚀 How to Run Locally

### 1. Prerequisites & Environment Setup
Clone the repository and create a Python virtual environment:
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/borzoi-academic-hub.git](https://github.com/YOUR_GITHUB_USERNAME/borzoi-academic-hub.git)
cd borzoi-academic-hub

# Set up Python virtual environment
python -m venv venv
venv\Scripts\activate
pip install -r decider_service/requirements.txt