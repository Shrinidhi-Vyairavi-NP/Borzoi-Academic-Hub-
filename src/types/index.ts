export interface Subject {
  id: string;
  name: string;
  code: string;
  attended: number;
  total: number;
  credits: number;
}

export interface StudentProfile {
  name: string;
  regNo: string;
  semester: number;
  degree: string;
  collegeName: string;
  minCriteria: number; // Minimum attendance criteria % (e.g. 75)
  maxOdAllowed: number; // Max OD allowance per semester (e.g. 5)
  isLoggedIn: boolean;
}

export interface ChatMessage {
  id: string;
  platform: 'discord' | 'telegram' | 'whatsapp';
  sender: string;
  senderRole: string;
  channelName: string;
  message: string;
  timestamp: string;
  isCancelledEvent?: boolean;
  isExtraClassEvent?: boolean;
  subjectHint?: string;
}