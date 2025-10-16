import OpenAI from 'openai';
import { OpenAIMessage, OpenAIResponse, Profile } from './schema';

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export const tools = [
  {
    type: "function" as const,
    function: {
      name: "create_lead",
      description: "Ziyaretçi teklif/randevu/iletişim istiyor.",
      parameters: {
        type: "object",
        properties: {
          name: { 
            type: "string",
            description: "Ziyaretçinin adı (isteğe bağlı)"
          },
          email: { 
            type: "string",
            description: "Ziyaretçinin e-posta adresi"
          },
          topic: { 
            type: "string",
            description: "Konu veya proje türü"
          },
          message: { 
            type: "string",
            description: "Ziyaretçinin detaylı mesajı"
          }
        },
        required: ["email"]
      }
    }
  }
];

export async function askOpenAI(
  messages: OpenAIMessage[], 
  options: {
    model?: string;
    tools?: typeof tools;
    profile?: Profile;
    faq?: string;
  } = {}
): Promise<{
  text: string;
  toolCalls?: Array<{
    name: string;
    arguments: Record<string, any>;
  }>;
}> {
  const model = options.model || process.env.MODEL_DEFAULT || 'gpt-4o-mini';
  
  // Build system message
  const systemMessage = buildSystemMessage(options.profile, options.faq);
  
  const fullMessages: OpenAIMessage[] = [
    { role: 'system', content: systemMessage },
    ...messages
  ];

  try {
    const client = getOpenAIClient();
    const response = await client.chat.completions.create({
      model,
      messages: fullMessages,
      tools: options.tools,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 1000,
    });

    const choice = response.choices[0];
    if (!choice) {
      throw new Error('No response from OpenAI');
    }

    const message = choice.message;
    let text = message.content || '';
    let toolCalls: Array<{ name: string; arguments: Record<string, any> }> = [];

    // Handle tool calls
    if (message.tool_calls) {
      toolCalls = message.tool_calls.map(toolCall => ({
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments)
      }));
    }

    return { text, toolCalls };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('AI yanıtı alınamadı. Lütfen tekrar deneyin.');
  }
}

function buildSystemMessage(profile?: Profile, faq?: string): string {
  if (!profile) {
    return 'Sen bir portföy asistanısın. Ziyaretçilere yardımcı ol ve sorularını yanıtla.';
  }

  const allowedTopics = profile.allowed_topics.join(', ');
  const services = profile.services.map(s => s.name).join(', ');
  
  return `ROL: ${profile.name}'in interaktif portföy asistanısın.
AMAÇ: Ziyaretçinin niyetini hızla anla; ${allowedTopics} dışına çıkma.
KAYNAK: profile.yaml + faq.md. Kaynakta olmayan iddialarda uyar.
DİL: Kullanıcı hangi dilde yazdıysa o dilde yanıtla (varsayılan TR).
ÜSLUP: Kısa cümleler + maddeler. 6–8 satırı aşarsa "Devamını göster" öner.
YÖNLENDİRME: Ziyaretçi teklif/randevu/iletişim isterse create_lead(...) fonksiyonunu çağır.
GÜVENLİK: Medikal/hukuki özel tavsiye verme; gizli bilgileri sızdırma; link yerine aksiyon öner.

HİZMETLER: ${services}
ÇALIŞMA SAATLERİ: ${profile.work_hours || 'Belirtilmemiş'}
MİNİMUM BÜTÇE: ${profile.min_budget_eur ? `${profile.min_budget_eur}€` : 'Belirtilmemiş'}
TİPİK TESLİM SÜRESİ: ${profile.typical_timeline || 'Belirtilmemiş'}

${faq ? `SSS:\n${faq}` : ''}

Sadece belirtilen konularda yardımcı ol. Diğer konularda kısa bir uyarı ver ve portföy konularına yönlendir.`;
}
