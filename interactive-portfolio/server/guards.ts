import { z } from 'zod';

export function enforceScope(userText: string, allowedTopics: string[]) {
  const lower = userText.toLowerCase();
  const topics = allowedTopics.map(t => t.toLowerCase());
  const matched = topics.some(t => lower.includes(t));
  if (!matched) {
    return { ok: false, message: 'Bu konu portföy kapsamı dışında. Hizmet, ücret, süre, randevu, teklif gibi konularla ilgili sorabilirsiniz.' };
  }
  return { ok: true };
}

const profanityList = ['fuck', 'shit', 'siktir', 'orospu'];

export function minimalFilter(userText: string) {
  const text = userText.toLowerCase();
  if (profanityList.some(p => text.includes(p))) {
    return { ok: false, reason: 'Uygunsuz dil tespit edildi.' };
  }
  // Minimal PII leakage prevention: basic email or phone extraction
  if ((text.match(/[0-9]{10,}/) || []).length > 3) {
    return { ok: false, reason: 'Gizli bilgi paylaşımı tespit edildi.' };
  }
  return { ok: true };
}
