# Decision pattern: Class Announcement Policy (`#policy`)

A reusable Strands Decider 2B pattern that classifies an incoming chat message into a category **before** the agent acts on it. Put it in front of any agent that watches a noisy stream (group chats, support inboxes, email) where only a small fraction of messages matter.

## The decision

| | |
|---|---|
| **Pattern** | `#policy`: classify an incoming request into a category before the agent acts |
| **Decider model** | `StrandsAgents/strands-decider-2B-hobson-v19` |
| **State** | The raw message text |
| **Typed question** | `Is this a class cancellation, an extra class, or general chat?` |
| **Option set** | `CLASS_CANCELLED`, `EXTRA_CLASS`, `GENERAL_BANTER` |
| **Output** | One chosen option plus the model's confidence (0 to 1) |

## Why a decider here

A class group chat is mostly banter, and the decision repeats on every message. A decision model returns one choice with a confidence and generates no text, so it suits a repeated gate that runs before anything slower or more expensive (a state change, an LLM call).

## How it is wired in

```
chat message ──► server ──► decider service (/classify)
                                  │
                       Strands Decider 2B
                                  │
        ┌─────────────────────────┼──────────────────────┐
        ▼                         ▼                      ▼
  CLASS_CANCELLED            EXTRA_CLASS          GENERAL_BANTER
        │                         │                      │
        └──► shown in the         └──► shown in the      └──► ignored: no state
             Comms Intel Feed          Comms Intel Feed       change, no generative call
```

1. The bot forwards each message to the server, which sends it to the decider service.
2. The service runs the decider and returns the label, the model's confidence, the measured latency, and a `source` field (`strands`).
3. `GENERAL_BANTER` stops here. Nothing runs and nothing is stored.
4. If the decider cannot run, the service uses a simple keyword fallback and labels the result `"source": "keyword-fallback"` with confidence `0`, so a fallback is never passed off as the model.

## Calling it

The decider ships a command-line tool (`pip install strands-decider`). The model weights download from Hugging Face on first use.

```python
import re
import subprocess

MODEL = "StrandsAgents/strands-decider-2B-hobson-v19"
QUESTION = "Is this a class cancellation, an extra class, or general chat?"
OPTIONS = ["CLASS_CANCELLED", "EXTRA_CLASS", "GENERAL_BANTER"]
CHOSEN = re.compile(r"choice_0\s*->\s*([A-Z_]+)\s*\(confidence\s*([0-9.]+)\)")

def classify(message: str):
    cmd = [
        "strands-decider", "ask", MODEL,
        "--state", message,
        "--choice", f"{QUESTION}={','.join(OPTIONS)}",
    ]
    out = subprocess.run(cmd, capture_output=True, text=True, check=True).stdout
    match = CHOSEN.search(out)
    if not match or match.group(1) not in OPTIONS:
        raise ValueError(f"Unexpected decider output: {out!r}")
    return match.group(1), float(match.group(2))
```

**Parse the chosen line, not the whole output.** The tool prints a probability for *every* option, so searching the full text for an option name matches all of them. Read the `choice_0 -> LABEL (confidence N)` line instead.

Example output:

```
choice_0 -> CLASS_CANCELLED (confidence 0.984)
    CLASS_CANCELLED          0.989
    EXTRA_CLASS              0.007
    GENERAL_BANTER           0.004
```

**Performance note:** `ask` loads the model on every call, which takes seconds. For a live bot, run the decider as a long-lived server (`strands-decider serve ...`) so the model loads once.

## Using the confidence

Treat the confidence as a dial, not a verdict. A sensible starting rule (tune it on your own messages):

- High confidence on `CLASS_CANCELLED` or `EXTRA_CLASS`: surface it as an announcement.
- Low confidence: surface it as "maybe an announcement" or skip it.
- `GENERAL_BANTER`: ignore.

## Reusing the pattern

Swap the question and options, keep the wiring. For example:

| Use case | Typed question | Options |
|---|---|---|
| Assignment alerts | Does this message announce a deadline or an assignment? | `DEADLINE`, `NEW_ASSIGNMENT`, `NOT_RELEVANT` |
| Support inbox | Which team should handle this message? | `BILLING`, `TECHNICAL`, `GENERAL` |
| Team chat | Does this message need action? | `URGENT`, `FOLLOW_UP`, `FYI` |

## Tips

- Keep the question simple. The model leans heavily on the option names, so make them clear and distinct.
- Always keep a catch-all option (like `GENERAL_BANTER`) so ordinary messages have somewhere to go.
- For anything that changes a record, keep a human confirmation step. A classifier can be wrong on sarcasm, mixed-language messages and jokes.

## Limitations

- Tested on short English chat messages, so sarcasm, slang, hypotheticals and code-mixed text can be misread.
- The decider is an experimental model, so treat its output as a suggestion for anything that matters.
