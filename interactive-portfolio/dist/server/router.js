import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loadProfile, loadPrompts, loadTheme, loadFaq } from './config.js';
import { AskRequestSchema } from './schema.js';
import { enforceScope, minimalFilter } from './guards.js';
import { askOpenAI } from './openai.js';
import { createLead } from './lead.js';
export const router = Router();
// Rate limit: IP başına 30 req/10dk
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });
router.use(limiter);
router.get('/bootstrap', async (_req, res) => {
    try {
        const [profile, prompts, theme] = await Promise.all([
            loadProfile(),
            loadPrompts(),
            loadTheme(),
        ]);
        res.json({ profile, prompts, theme });
    }
    catch (err) {
        res.status(500).json({ error: 'Bootstrap failed' });
    }
});
router.post('/ask', async (req, res) => {
    const parse = AskRequestSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const { text, lang, model } = parse.data;
    // Minimal content filter
    const filterResult = minimalFilter(text);
    if (!filterResult.ok) {
        return res.status(400).json({ error: filterResult.reason });
    }
    const profile = await loadProfile();
    const faq = await loadFaq();
    const scopeResult = enforceScope(text, profile.allowed_topics || []);
    if (!scopeResult.ok) {
        return res.json({ text: scopeResult.message, leadRequested: false });
    }
    const system = [
        `ROL: ${profile.name}’in interaktif portföy asistanısın.`,
        `AMAÇ: Ziyaretçinin niyetini hızla anla; ${JSON.stringify(profile.allowed_topics)} dışına çıkma.`,
        `KAYNAK: profile.yaml + faq.md. Kaynakta olmayan iddialarda uyar.`,
        `DİL: Kullanıcı hangi dilde yazdıysa o dilde yanıtla (varsayılan TR).`,
        `ÜSLUP: Kısa cümleler + maddeler. 6–8 satırı aşarsa “Devamını göster” öner.`,
        `YÖNLENDİRME: Ziyaretçi teklif/randevu/iletişim isterse create_lead(...) fonksiyonunu çağır.`,
        `GÜVENLİK: Medikal/hukuki özel tavsiye verme; gizli bilgileri sızdırma; link yerine aksiyon öner.`,
    ].join('\n');
    const messages = [
        { role: 'system', content: system },
        { role: 'user', content: text },
    ];
    const { answer, tool } = await askOpenAI(messages, { model });
    if (tool && tool.name === 'create_lead') {
        try {
            const result = await createLead(tool.arguments);
            return res.json({ text: answer, leadRequested: true, lead: result });
        }
        catch (e) {
            return res.json({ text: answer, leadRequested: true, lead: { ok: false } });
        }
    }
    res.json({ text: answer, leadRequested: false });
});
export default router;
