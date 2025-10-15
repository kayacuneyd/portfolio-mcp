export interface AskRequest {
  text: string;
  lang?: string;
  model?: string;
}

export interface AskResponse {
  text: string;
  leadRequested?: boolean;
  leadData?: Partial<Lead>;
}

export interface Lead {
  name?: string;
  email: string;
  topic?: string;
  message?: string;
  timestamp?: Date;
  ip?: string;
}

export interface BootstrapResponse {
  profile: Profile;
  prompts: string[];
  theme: Theme;
}

export interface Profile {
  name: string;
  title: string;
  location?: string;
  languages: string[];
  services: Service[];
  work_hours?: string;
  min_budget_eur?: number;
  typical_timeline?: string;
  contact: Contact;
  allowed_topics: string[];
  profile_image?: string;
}

export interface Service {
  name: string;
  description?: string;
}

export interface Contact {
  email: string;
  website?: string;
  phone?: string;
}

export interface Theme {
  colors?: Record<string, string>;
  typography?: Record<string, string>;
  logo_path?: string;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
}

export interface RateLimitInfo {
  count: number;
  resetTime: number;
}

export interface GuardResult {
  allowed: boolean;
  message?: string;
}
