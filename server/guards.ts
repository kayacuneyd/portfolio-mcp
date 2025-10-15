import { GuardResult, RateLimitInfo, Profile } from './schema';

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, RateLimitInfo>();

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX_REQUESTS = 30;

// Profanity filter (basic Turkish/English)
const profanityWords = [
  'küfür', 'hakaret', 'aptal', 'salak', 'gerizekalı',
  'fuck', 'shit', 'damn', 'bitch', 'asshole'
];

export function enforceScope(userText: string, allowedTopics: string[]): GuardResult {
  const text = userText.toLowerCase().trim();
  
  // Check for medical/legal advice requests
  const medicalLegalPatterns = [
    'tıbbi', 'doktor', 'hasta', 'tedavi', 'ilaç',
    'hukuki', 'avukat', 'dava', 'mahkeme', 'yasal',
    'medical', 'doctor', 'treatment', 'legal', 'lawyer'
  ];
  
  const hasMedicalLegal = medicalLegalPatterns.some(pattern => 
    text.includes(pattern)
  );
  
  if (hasMedicalLegal) {
    return {
      allowed: false,
      message: 'Tıbbi veya hukuki konularda tavsiye veremem. Lütfen konuyu portföy hizmetleri ile ilgili tutun.'
    };
  }
  
  // Check for PII/sensitive information
  const piiPatterns = [
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
    /\b\d{11}\b/, // Turkish ID
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email (basic)
    /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/ // Phone number
  ];
  
  const hasPII = piiPatterns.some(pattern => pattern.test(text));
  
  if (hasPII) {
    return {
      allowed: false,
      message: 'Lütfen kişisel bilgilerinizi paylaşmayın. Güvenliğiniz için önemli.'
    };
  }
  
  // Check for profanity
  const hasProfanity = profanityWords.some(word => 
    text.includes(word.toLowerCase())
  );
  
  if (hasProfanity) {
    return {
      allowed: false,
      message: 'Lütfen saygılı bir dil kullanın. Size yardımcı olmaya hazırım.'
    };
  }
  
  // Allow all questions without warning about off-topic
  return { allowed: true };
}

export function checkRateLimit(ip: string): GuardResult {
  const now = Date.now();
  const clientInfo = rateLimitMap.get(ip);
  
  if (!clientInfo) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }
  
  // Check if window has expired
  if (now > clientInfo.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true };
  }
  
  // Check if limit exceeded
  if (clientInfo.count >= RATE_LIMIT_MAX_REQUESTS) {
    const remainingTime = Math.ceil((clientInfo.resetTime - now) / 60000);
    return {
      allowed: false,
      message: `Çok fazla istek gönderdiniz. Lütfen ${remainingTime} dakika bekleyin.`
    };
  }
  
  // Increment counter
  clientInfo.count++;
  return { allowed: true };
}

export function sanitizeInput(input: string): string {
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateLeadData(data: {
  name?: string;
  email: string;
  topic?: string;
  message?: string;
}): GuardResult {
  // Validate email
  if (!data.email || !validateEmail(data.email)) {
    return {
      allowed: false,
      message: 'Geçerli bir e-posta adresi giriniz.'
    };
  }
  
  // Validate name (if provided)
  if (data.name && (data.name.length < 2 || data.name.length > 50)) {
    return {
      allowed: false,
      message: 'İsim 2-50 karakter arasında olmalıdır.'
    };
  }
  
  // Validate topic (if provided)
  if (data.topic && data.topic.length > 100) {
    return {
      allowed: false,
      message: 'Konu 100 karakterden uzun olamaz.'
    };
  }
  
  // Validate message (if provided)
  if (data.message && data.message.length > 500) {
    return {
      allowed: false,
      message: 'Mesaj 500 karakterden uzun olamaz.'
    };
  }
  
  return { allowed: true };
}

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of rateLimitMap.entries()) {
    if (now > info.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes
