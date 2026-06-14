export interface SarkariNotification {
  id: string;
  title: string;
  authority: string; // e.g., Staff Selection Commission (SSC)
  type: 'job' | 'admit-card' | 'result' | 'answer-key' | 'syllabus' | 'admission' | 'important';
  postName?: string;
  totalPosts?: number | string;
  qualification: string; // Eligibility qualification
  ageLimit?: string;
  applicationStart?: string;
  lastDate?: string;
  fee?: string;
  status: 'active' | 'closed' | 'declared' | 'released' | 'upcoming';
  admitCardStatus?: 'available' | 'soon' | 'not-applicable';
  resultStatus?: 'declared' | 'soon' | 'not-applicable';
  examDate?: string;
  salary?: string;
  officialLink: string;
  details?: string; // Rich markdown or description of vacancy breakdown
  trending?: boolean; // Whether it is a highly searched / hot vacancy
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface EligibilityProfile {
  qualification: string;
  stream: string;
  percentage: string;
  age: string;
  gender: string;
  category: string; // General, OBC, SC, ST, EWS
}
