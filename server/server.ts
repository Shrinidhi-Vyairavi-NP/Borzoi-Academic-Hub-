import express from 'express';
import cors from 'cors';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const app = express();

// Explicit CORS Configuration for Frontend Integration & External Webhooks
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Initialize AWS Bedrock Client
const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
});

// In-memory store for incoming webhooks
let liveMessages: any[] = [];

// Helper function to invoke Amazon Bedrock (System 2 Pairing)
async function invokeBedrock(prompt: string): Promise<string> {
  try {
    const payload = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    };

    const command = new InvokeModelCommand({
      // Active AWS Bedrock Cross-Region Inference ID for Claude 3 Haiku
      modelId: 'us.anthropic.claude-3-haiku-20240307-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error: any) {
    console.log(`[Bedrock Pipeline]: Using local fallback generator (${error.name || 'Offline Mode'})`);
    return '';
  }
}

// 1. Discord / Telegram / Custom Webhook Receiver
app.post('/api/discord-webhook', async (req, res) => {
  const { author, channel, content, guildName } = req.body;
  const rawText = (content || '').toLowerCase();

  let policyTag = 'GENERAL_BANTER';

  // Call System 1 Strands Decider 2B Microservice
  try {
    const deciderRes = await fetch('http://localhost:8000/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: content || '' }),
    });

    if (deciderRes.ok) {
      const deciderData = await deciderRes.json();
      policyTag = deciderData.decision || 'GENERAL_BANTER';
      console.log('Strands Decider 2B Decision:', deciderData);
    } else {
      throw new Error('Decider service returned non-200 response');
    }
  } catch (err) {
    console.log('[Decider Pipeline]: Python service offline or unreachable, applying local fallback rules.');
    if (['cancel', 'cancelled', 'canceled', 'postponed', 'no class', 'suspended', 'off today', 'off tomorrow'].some((k) => rawText.includes(k))) {
      policyTag = 'CLASS_CANCELLED';
    } else if (['extra', 'rescheduled', 'special class', 'compensation', 'additional class'].some((k) => rawText.includes(k))) {
      policyTag = 'EXTRA_CLASS';
    }
  }

  const newMessage = {
    id: `msg-${Date.now()}`,
    platform: 'discord',
    sender: author || 'Student',
    senderRole: 'Student',
    channelName: channel ? `#${channel} (${guildName || 'Server'})` : '#announcements',
    message: content || '',
    policy: policyTag,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  liveMessages.unshift(newMessage); // Unshift puts newest messages on top
  res.json({ success: true, queuedItems: liveMessages.length });
});

// 2. Live Bot Feed Endpoint
app.get('/api/live-bot-feed', (req, res) => {
  res.json({ messages: liveMessages });
});

// 3. AI Bunk Roast (Amazon Bedrock System 2 Pairing)
app.post('/api/borzoi-roast', async (req, res) => {
  const { subjectName, attended, total, minCriteria, canBunk, margin, consecutiveNeeded } = req.body;

  const prompt = `You are Lord Foog, the Borzoi Mascot for academic counseling. 
Subject: ${subjectName}. Attendance: ${attended}/${total} (${Math.round((attended / total) * 100)}%). Target Threshold: ${minCriteria}%.
Status: ${canBunk ? `Safe to bunk ${margin} classes` : `Cooked. Needs ${consecutiveNeeded} consecutive classes`}.
Write a humorous, 2-sentence mascot verdict using "Lord Foog" tone and "Didn't I do it for you" vibes.`;

  const bedrockResponse = await invokeBedrock(prompt);

  if (bedrockResponse) {
    res.json({
      roast: bedrockResponse,
      statusBadge: canBunk ? 'SNOOT APPROVED: SAFE TO BUNK' : 'RED ALERT: DEEPLY COOKED',
      cookedLevel: canBunk ? 'Crisp & Untouched (Safe)' : 'Critically Overcooked',
    });
  } else {
    // Local fallback if AWS credentials aren't loaded locally during testing
    res.json({
      roast: canBunk
        ? `Lord Foog extends his snoot over ${subjectName}! You have ${margin} buffer class(es). Didn't I do it for you? Go get rest!`
        : `BRO YOU ARE DEEP FRIED IN ${subjectName.toUpperCase()}! Current attendance is below ${minCriteria}%. You need ${consecutiveNeeded} consecutive classes RIGHT NOW!`,
      statusBadge: canBunk ? 'SNOOT APPROVED: SAFE TO BUNK' : 'RED ALERT: DEEPLY COOKED',
      cookedLevel: canBunk ? 'Crisp & Untouched (Safe)' : 'Critically Overcooked',
    });
  }
});

// 4. AI Leave Letter Generation (Amazon Bedrock System 2 Pairing)
app.post('/api/generate-leave-letter', async (req, res) => {
  const { studentName, regNo, degree, collegeName, semester, reason, leaveType, dates, facultyRecipient } = req.body;

  const prompt = `Write a formal academic application letter.
Recipient: ${facultyRecipient}, Department of ${degree}, ${collegeName}.
Student: ${studentName} (Reg No: ${regNo}, ${degree}, Semester ${semester}).
Type: ${leaveType === 'od' ? 'On-Duty (OD) Sanction' : 'Leave of Absence'}.
Dates: ${dates}.
Reason: ${reason}.
Return ONLY the formal letter text.`;

  const bedrockResponse = await invokeBedrock(prompt);

  if (bedrockResponse) {
    res.json({ letter: bedrockResponse });
  } else {
    res.json({
      letter: `To,\nThe ${facultyRecipient},\nDepartment of ${degree},\n${collegeName}.\n\nRespected Sir/Madam,\n\nSubject: Request for ${
        leaveType === 'od' ? 'On-Duty (OD) Sanction' : 'Leave of Absence'
      } - ${studentName} (${regNo})\n\nI am writing to request ${
        leaveType === 'od' ? 'On-Duty sanction' : 'a leave of absence'
      } for the duration of ${dates} due to ${reason}.\n\nKindly grant permission for the aforementioned period so my academic attendance record remains updated.\n\nThanking you.\n\nYours sincerely,\n${studentName}\nRegister No: ${regNo}\nBranch: ${degree} (Semester ${semester})`,
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});