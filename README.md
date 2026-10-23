# 🐕 Borzoi Academic Hub

**Know exactly where you stand on attendance, before it costs you your exams.**

Borzoi Academic Hub is a personal attendance dashboard for college students. It does the percentage math for every subject, updates the moment you mark a class, tells you honestly how many classes you can still afford to miss, and picks up class cancellations and extra classes from the student group chats where they usually get lost.

> Built for the AWS Strands Decider 2B hackathon.

<!-- Add a screenshot or a 30-60 second demo GIF here. -->

---

## Why this exists

Most colleges set a hard minimum attendance percentage, often 75%, to be eligible for the end-semester exams. There are no exceptions and no partiality. Three things make that rule harder to live with than it sounds:

1. **The math is not intuitive.** A subject at 80% feels safe under a 75% rule, but it may be one missed class away from trouble. Doing this by hand for 6-8 subjects every week is tedious, so people guess.
2. **Official records are stale.** Professors update attendance whenever they get to it. Students cannot force that, so they plan against numbers that are already out of date.
3. **Announcements get buried.** "Tomorrow's class is cancelled" or "extra class on Saturday" arrives in a group chat with hundreds of messages, and half the class misses it.

Borzoi Academic Hub addresses all three.

## A worked example

Take a 75% threshold.

**The "80% feels safe" trap.** You have attended 16 of 20 classes (80%).

- Miss one more: 16 / 21 = 76.2% ✅
- Miss two more: 16 / 22 = 72.7% ❌

So 80% gives you exactly **one** class of margin. In general, the number of further classes you can miss is:

```
max_misses = floor(attended / threshold - total_held)
           = floor(16 / 0.75 - 20) = floor(1.33) = 1
```

**Already below the line.** You have attended 20 of 30 (66.7%). To get back to 75% by attending every upcoming class:

```
classes_needed = ceil((threshold * total_held - attended) / (1 - threshold))
               = ceil((0.75 * 30 - 20) / 0.25) = 10
```

Check: 30 / 40 = 75%. ✅

This is plain arithmetic, so the result is exact and explainable. No AI is involved in these numbers.

## Features

| Feature | What it does |
|---|---|
| **Profile** | Stores your name, semester, minimum attendance threshold, number of ODs this semester, college or university, and registration number. |
| **Academic Subject Dashboard** | Lists each subject with its credits, attended/total fraction (for example `28/32`) and live percentage, shown in red below your threshold. You can edit or delete subjects (wrong entry, dropped course), and mark a class **attended** or **bunked** instantly instead of waiting for the official record. |
| **"Can I Afford to Miss?" Counselor** | Pick a subject and get a red / yellow / green tag: cannot miss, borderline, or safe. The Borzoi mascot's snout grows or shrinks with your safety margin, and the "Can I bunk?" button plays a meme sound with a playful comment. |
| **OD Vault 🦴** | Your semester's On-Duty allowance as bone-shaped Bone Tokens. Each time you use one, it greys out. |
| **AI Leave / OD Letter Drafter** | Generates a formal draft letter from your profile (name, registration number, college, semester), your reason, any proof you attach, and the date. It is a starting template that you review and own. |
| **Comms Intel Feed** | Reads class-related chat messages (tested on Discord) and flags cancelled classes, extra classes and general banter, so the important messages do not drown in the noise. |

## Design principles

These are decisions, not slogans. Each one shapes how the code works.

1. **Deterministic math, AI only for text.** Percentages, margins and verdicts are computed arithmetically. Generative AI is used only to draft letters and write the playful comments.
2. **Honest verdicts.** The counselor never shows green for a subject at or below your threshold. It shows a margin, not just a color.
3. **You stay in control.** Detected announcements are suggestions. Your attendance changes only when you confirm.
4. **Privacy by default.** Your data lives in your browser (`localStorage`). There is no account and no central database. Chat messages are used for classification only, and raw message text is not stored.
5. **A planning aid, not a loophole.** It does not replace the official attendance record. It tells you where you stand and when to double-check with your professor. The letter drafter works from the reason and proof you provide and never invents either.

## The Strands Decider 2B decision pattern

The Comms Intel Feed is built around a single, narrow decision that is made quickly and before anything else happens.

- **Decision purpose:** decide whether an incoming chat message is an academic announcement worth acting on, before any state change or generative call.
- **Typed question:** "Does this message indicate a class cancellation, an extra class, or general chat?"
- **Output classes:** `CLASS_CANCELLED`, `EXTRA_CLASS`, `GENERAL_BANTER`
- **Pattern:** `#policy`, a fast classifier acting as the first gate (the "System 1" step) in front of slower, costlier generative steps.
- **Where it sits:** a FastAPI service in `decider_service/` that the Discord bot calls for each message. Only messages classified as a cancellation or extra class reach the dashboard, where the student confirms them.

Why gate first? A group chat produces far more banter than announcements. Classifying cheaply and early means the application, and any LLM, only runs when something actually matters.

## Architecture

```
Discord server ──► discord_bot ──► decider_service (FastAPI: classify)
                                          │
                                          ▼
                                  server ──► React dashboard (Vite + Tailwind)
                                                  │
                                           localStorage (your data stays here)
```

| Folder | Role |
|---|---|
| `src/` | React + TypeScript dashboard |
| `public/assets/` | Mascot images and audio |
| `decider_service/` | Python FastAPI classification service |
| `discord_bot/` | Discord bot that forwards messages for classification |
| `server/` | Backend glue between the bot, the decider and the dashboard |

## Run it locally (Windows)

**Prerequisites:** Node.js 18+, Python 3.10+, Git.

**1. Clone**

```powershell
git clone https://github.com/Shrinidhi-Vyairavi-NP/Borzoi-Academic-Hub-.git
cd Borzoi-Academic-Hub-
```

**2. Configure environment variables.** Create a `.env` file in the project root. Never commit it.

```
DISCORD_BOT_TOKEN=your_discord_bot_token
GEMINI_API_KEY=your_gemini_api_key
# Add AWS credentials and region if you use Amazon Bedrock
```

**3. Start the decider service**

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r decider_service\requirements.txt
uvicorn decider_service.app:app --reload --port 8000
```

**4. Start the backend server** (new terminal)

```powershell
cd server
npm install
npm start
```

**5. Start the Discord bot** (optional, new terminal; only the Comms Intel Feed needs it)

```powershell
cd discord_bot
pip install -r requirements.txt
python bot.py
```

**6. Start the dashboard** (new terminal, from the project root)

```powershell
npm install
npm run dev
```

Open the address Vite prints, usually `http://localhost:5173`.

> The dashboard, counselor, OD Vault and letter drafter work without steps 3-5. Those steps are only needed for the live chat feed.

## Roadmap

- Telegram and WhatsApp ingestion. Discord is the only source tested so far.
- Import the college academic calendar to account for holidays and the classes remaining.
- Mark mandatory sessions (CIAs, labs) so the counselor never suggests missing them.
- Mute control and reduced-motion option for the mascot and meme audio.

## Limitations

- Attendance is entered by the student, so accuracy depends on honest updates.
- Only Discord has been tested as a chat source.
- Informal chat is hard to classify perfectly, which is why detected announcements need confirmation.

## License

Add a license file (MIT is a common default) before sharing widely.
