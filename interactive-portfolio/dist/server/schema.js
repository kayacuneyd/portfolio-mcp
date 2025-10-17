import { z } from 'zod';
export const AskRequestSchema = z.object({
    text: z.string().min(1).max(2000),
    lang: z.enum(['tr', 'en', 'de']).optional(),
    model: z.enum(['gpt-4o-mini', 'gpt-4o']).optional(),
});
