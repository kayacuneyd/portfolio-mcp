import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export const tools = [
  {
    type: 'function',
    function: {
      name: 'create_lead',
      description: 'Ziyaretçi teklif/randevu/iletişim istiyor.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          topic: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['email'],
      },
    },
  },
] as const;

export async function askOpenAI(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  { model }: { model?: 'gpt-4o-mini' | 'gpt-4o' } = {}
): Promise<{ answer: string; tool?: { name: 'create_lead'; arguments: any } }> {
  const useModel = model || process.env.MODEL_DEFAULT || 'gpt-4o-mini';
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { answer: 'OpenAI yapılandırılmadı. Lütfen daha sonra tekrar deneyin.', tool: undefined };
  }

  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: useModel,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    tools: tools as any,
    tool_choice: 'auto',
    temperature: 0.3,
  });

  const choice = response.choices[0];
  let answer = choice.message.content || '';
  let toolCall: { name: 'create_lead'; arguments: any } | undefined;

  if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
    const call = choice.message.tool_calls[0];
    if (call.type === 'function' && call.function?.name === 'create_lead') {
      try {
        const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
        toolCall = { name: 'create_lead', arguments: args };
      } catch {
        /* ignore */
      }
    }
  }

  return { answer, tool: toolCall };
}
