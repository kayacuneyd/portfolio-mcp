import { z } from 'zod';

export const AskRequestSchema = z.object({
  text: z.string().min(1).max(2000),
  lang: z.enum(['tr', 'en', 'de']).optional(),
  model: z.enum(['gpt-4o-mini', 'gpt-4o']).optional(),
});

export type AskRequest = z.infer<typeof AskRequestSchema>;

export type AskResponse = {
  text: string;
  leadRequested?: boolean;
  lead?: { ok: boolean };
};

export type Lead = {
  name?: string;
  email: string;
  topic?: string;
  message?: string;
};

export type BootstrapResponse = {
  profile: any;
  prompts: string[];
  theme: any;
};
