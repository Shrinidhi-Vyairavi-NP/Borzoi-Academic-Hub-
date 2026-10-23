import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { classifyWithStrandsDecider } from './services/deciderClient.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

const botBroadcastQueue: Array<any> = [];

// 1. Webhook endpoint for Discord Bot
app.post('/api/discord-webhook', (req, res) => {
  try {
    const { author, channel, content, guildName } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required' });

    const payload = {
      id: `discord-${Date.now()}`,
      platform: 'discord',
      sender: author || 'Discord User',
      senderRole: 'Class Representative',
      channelName: `#${channel || 'announcements'} (${guildName || 'Campus Server'})`,
      message: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    botBroadcastQueue.push(payload);
    if (botBroadcastQueue.length > 50) botBroadcastQueue.shift();

    return res.json({ success: true, queuedItems: botBroadcastQueue.length });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Webhook failed' });
  }
});

// 2. Poll Ingested Live Feeds
app.get('/api/live-bot-feed', (_req, res) => {
  return res.json({ messages: botBroadcastQueue });
});

// 3. Borzoi Meme Bunk Counselor Endpoint
app.post('/api/borzoi-roast', async (req, res) => {
  try {
    const { subjectName, attended, total, minCriteria, canBunk, margin, consecutiveNeeded } = req.body;
    const currentPct = total > 0 ? ((attended / total) * 100).toFixed(1) : '100.0';

    if (!ai) {
      if (canBunk) {
        return res.json({
          roast: `Lord Foog extends his long snoot: You have ${margin} buffer class(es) to spare in ${subjectName}! Didn't I do it for you? Go get rest, but don't overdo it!`,
          statusBadge: 'SNOOT APPROVED: SAFE TO SLEEP IN',
          cookedLevel: 'Crisp & Untouched (Safe)',
        });
      } else {
        return res.json({
          roast: `BRO YOU ARE DEEP FRIED IN ${subjectName.toUpperCase()}! Your current attendance is ${currentPct}% against ${minCriteria}%. You need ${consecutiveNeeded} consecutive classes right now. SPRINT TO THE LECTURE HALL!`,
          statusBadge: 'RED ALERT: DEEPLY COOKED',
          cookedLevel: 'Critically Cooked',
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Borzoi, the iconic long-snout dog mascot whose motto is "To cook or be cooked • Let me do it for you". 
Subject: ${subjectName}
Attended: ${attended}/${total} (${currentPct}%)
Required Minimum: ${minCriteria}%
Can Bunk Right Now?: ${canBunk ? 'YES' : 'NO'}
Buffer margin: ${margin}
Consecutive needed: ${consecutiveNeeded}

Instructions: Speak as the Borzoi dog. Use funny, relatable student meme terms ("Didn't I do it for you?", "cooked vs cooking", "HOD speedrun"). Keep it to 3 sentences.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            roast: { type: Type.STRING },
            statusBadge: { type: Type.STRING },
            cookedLevel: { type: Type.STRING },
          },
          required: ['roast', 'statusBadge', 'cookedLevel'],
        },
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Roast error' });
  }
});

// 4. Official Leave / OD Draft Generator
app.post('/api/generate-leave-letter', async (req, res) => {
  try {
    const { studentName, regNo, degree, semester, reason, leaveType, dates, facultyRecipient, proofDocName } = req.body;

    if (!ai) {
      const letter = `To,\nThe ${facultyRecipient || 'Head of Department'},\n${degree || 'Department of Engineering'}\n\nRespected Sir/Madam,\n\nSubject: Request for ${leaveType === 'od' ? 'On-Duty (OD) Sanction' : 'Leave of Absence'} - ${studentName || 'Student'} (${regNo || 'N/A'})\n\nI request ${leaveType === 'od' ? 'On-Duty sanction' : 'leave of absence'} for ${dates} due to ${reason}.\n\n${proofDocName ? `Attached Proof: ${proofDocName}\n\n` : ''}Thanking you,\n\nYours sincerely,\n${studentName || 'Student'}\nRoll No: ${regNo || 'N/A'}`;
      return res.json({ letter, success: true });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Draft a formal academic ${leaveType === 'od' ? 'On-Duty (OD)' : 'Leave of Absence'} application email and official letter for ${studentName} (${regNo}), ${degree}, Sem ${semester}. Recipient: ${facultyRecipient}. Reason: ${reason}. Dates: ${dates}. Document attached: ${proofDocName || 'None'}.`,
    });

    return res.json({ letter: response.text, success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Leave generation error' });
  }
});

// 5. Chat & Announcement Parser (Hybrid System-1 Decider + System-2 Gemini)
app.post('/api/analyze-chat-message', async (req, res) => {
  try {
    const { messageText, sender, channelName } = req.body;
    if (!messageText) return res.status(400).json({ error: 'Message text required' });

    const deciderResult = await classifyWithStrandsDecider(messageText);

    if (!ai) {
      return res.json({
        eventType: deciderResult.eventType !== 'UNKNOWN' ? deciderResult.eventType : 'CLASS_CANCELLED',
        confidence: deciderResult.confidence || 85,
        summary: 'Schedule update detected in chat channel.',
        suggestedAction: 'Update timetable schedule',
        reasoning: 'Evaluated locally by Strands Decider 2B.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze class message from ${sender} in ${channelName}: "${messageText}". Pre-classified type: ${deciderResult.eventType}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            eventType: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          },
          required: ['eventType', 'confidence', 'summary', 'suggestedAction', 'reasoning'],
        },
      },
    });

    return res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Analysis failed' });
  }
});

app.listen(port, () => {
  console.log(`Borzoi Express Server running on http://localhost:${port}`);
});