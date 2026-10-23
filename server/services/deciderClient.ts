import axios from 'axios';

const DECIDER_URL = process.env.DECIDER_URL || 'http://localhost:8000';

export async function classifyWithStrandsDecider(text: string): Promise<{ eventType: string; confidence: number }> {
  try {
    const choices = 'CLASS_CANCELLED,EXTRA_CLASS_SCHEDULED,EXAM_ANNOUNCEMENT,ASSIGNMENT_DEADLINE,GENERAL_CHAT';
    const response = await axios.post(`${DECIDER_URL}/api/decide`, {
      state: text,
      choices,
    });

    if (response.data.status === 'success') {
      const raw = response.data.raw_output || '';
      if (raw.includes('CLASS_CANCELLED')) return { eventType: 'CLASS_CANCELLED', confidence: 92 };
      if (raw.includes('EXTRA_CLASS')) return { eventType: 'EXTRA_CLASS_SCHEDULED', confidence: 88 };
      if (raw.includes('EXAM')) return { eventType: 'EXAM_ANNOUNCEMENT', confidence: 85 };
    }
  } catch (error) {
    console.warn('Strands Decider microservice offline, falling back to Gemini.');
  }

  return { eventType: 'UNKNOWN', confidence: 0 };
}