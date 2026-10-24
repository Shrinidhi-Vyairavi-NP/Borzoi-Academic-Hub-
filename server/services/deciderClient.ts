import axios from 'axios';

const DECIDER_URL = process.env.DECIDER_URL || 'http://localhost:8000';

const LABELS = [
  'CLASS_CANCELLED',
  'EXTRA_CLASS_SCHEDULED',
  'EXAM_ANNOUNCEMENT',
  'ASSIGNMENT_DEADLINE',
  'GENERAL_CHAT',
];

export async function classifyWithStrandsDecider(
  text: string
): Promise<{ eventType: string; confidence: number; source: 'strands' | 'unavailable' }> {
  try {
    const response = await axios.post(
      `${DECIDER_URL}/api/decide`,
      { state: text, choices: LABELS.join(',') },
      { timeout: 60000 }
    );

    if (response.data.status === 'success') {
      const raw: string = response.data.raw_output || '';
      // Read only the chosen line, e.g. "choice_0 -> CLASS_CANCELLED (confidence 0.984)"
      const match = raw.match(/choice_0\s*->\s*([A-Z_]+)\s*\(confidence\s*([0-9.]+)\)/);
      if (match && LABELS.includes(match[1])) {
        return {
          eventType: match[1],
          confidence: Math.round(parseFloat(match[2]) * 100),
          source: 'strands',
        };
      }
    }
  } catch (error) {
    console.warn('Strands Decider service unreachable; treating message as UNKNOWN.');
  }

  return { eventType: 'UNKNOWN', confidence: 0, source: 'unavailable' };
}