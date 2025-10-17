import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
];
export async function askOpenAI(messages, { model } = {}) {
    const useModel = model || process.env.MODEL_DEFAULT || 'gpt-4o-mini';
    const response = await client.chat.completions.create({
        model: useModel,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        tools: tools,
        tool_choice: 'auto',
        temperature: 0.3,
    });
    const choice = response.choices[0];
    let answer = choice.message.content || '';
    let toolCall;
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const call = choice.message.tool_calls[0];
        if (call.type === 'function' && call.function?.name === 'create_lead') {
            try {
                const args = call.function.arguments ? JSON.parse(call.function.arguments) : {};
                toolCall = { name: 'create_lead', arguments: args };
            }
            catch {
                /* ignore */
            }
        }
    }
    return { answer, tool: toolCall };
}
