export interface PracticeMessage {
  role: 'user' | 'assistant';
  content: string;
  audio?: string;
}

export interface SavedPractice {
  id: string;
  expression: string;
  scenario: string;
  messages: PracticeMessage[];
  timestamp: number;
}

export interface QAMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Expression {
  id: string;
  expression: string;
  meaning: string;
  usage_tip: string;
  scenario?: string;
  dialogue?: string;
}
