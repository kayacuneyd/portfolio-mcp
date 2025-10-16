import { Router, Request, Response } from 'express';
import { AskRequest, AskResponse, Lead, BootstrapResponse } from './schema';
import { askOpenAI, tools } from './openai';
import { createLead } from './lead';
import { 
  enforceScope, 
  checkRateLimit, 
  sanitizeInput 
} from './guards';
import { 
  loadProfile, 
  loadFaq, 
  loadPrompts, 
  loadTheme 
} from './config';

const router = Router();

// Bootstrap endpoint - loads initial configuration
router.get('/api/bootstrap', async (req: Request, res: Response) => {
  try {
    const profile = loadProfile();
    const faq = loadFaq();
    const prompts = loadPrompts();
    const theme = loadTheme();
    
    const response: BootstrapResponse = {
      profile,
      prompts,
      theme
    };
    
    res.json(response);
  } catch (error) {
    console.error('Bootstrap error:', error);
    res.status(500).json({ 
      error: 'Konfigürasyon yüklenemedi' 
    });
  }
});

// Ask endpoint - handles chat messages
router.post('/api/ask', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Rate limiting
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({ 
        error: rateLimitResult.message 
      });
    }
    
    const { text, lang, model }: AskRequest = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Geçerli bir mesaj gönderin' 
      });
    }
    
    // Sanitize input
    const sanitizedText = sanitizeInput(text);
    if (!sanitizedText) {
      return res.status(400).json({ 
        error: 'Mesaj çok kısa veya geçersiz' 
      });
    }
    
    // Load configuration
    const profile = loadProfile();
    const faq = loadFaq();
    
    // Scope enforcement
    const scopeResult = enforceScope(sanitizedText, profile.allowed_topics);
    if (!scopeResult.allowed) {
      return res.json({
        text: scopeResult.message || 'Bu konuda yardımcı olamam.',
        leadRequested: false
      });
    }
    
    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'user' as const,
        content: sanitizedText
      }
    ];
    
    // Call OpenAI
    const aiResponse = await askOpenAI(messages, {
      model,
      tools,
      profile,
      faq
    });
    
    // Prepare response
    const response: AskResponse = {
      text: aiResponse.text,
      leadRequested: false
    };
    
    // Handle tool calls (lead creation)
    if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
      const leadTool = aiResponse.toolCalls.find(tc => tc.name === 'create_lead');
      
      if (leadTool) {
        response.leadRequested = true;
        response.leadData = {
          topic: leadTool.arguments.topic,
          message: leadTool.arguments.message
        };
      }
    }
    
    return res.json(response);
    
  } catch (error) {
    console.error('Ask endpoint error:', error);
    return res.status(500).json({ 
      error: 'Bir hata oluştu. Lütfen tekrar deneyin.' 
    });
  }
});

// Lead creation endpoint
router.post('/api/lead', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Rate limiting for lead creation (more restrictive)
    const rateLimitResult = checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return res.status(429).json({ 
        error: rateLimitResult.message 
      });
    }
    
    const leadData: Partial<Lead> = req.body;
    
    // Create lead
    const result = await createLead(leadData, ip);
    
    if (!result.allowed) {
      return res.status(400).json({ 
        error: result.message 
      });
    }
    
    return res.json({ 
      success: true, 
      message: 'Mesajınız başarıyla gönderildi.' 
    });
    
  } catch (error) {
    console.error('Lead endpoint error:', error);
    return res.status(500).json({ 
      error: 'Mesaj gönderilirken bir hata oluştu.' 
    });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    nodeVersion: process.version
  });
});

// API Health check endpoint
router.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Clear cache endpoint (for development)
router.post('/api/cache/clear', (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ 
      error: 'Cache clearing not allowed in production' 
    });
  }
  
  try {
    const { clearCache } = require('./config');
    clearCache();
    return res.json({ 
      success: true, 
      message: 'Cache cleared successfully' 
    });
  } catch (error) {
    console.error('Cache clear error:', error);
    return res.status(500).json({ 
      error: 'Cache temizlenirken hata oluştu' 
    });
  }
});

export default router;
