import nodemailer from 'nodemailer';
import { Lead, GuardResult } from './schema';
import { sanitizeInput, validateLeadData } from './guards';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function createLead(payload: Partial<Lead>, ip?: string): Promise<GuardResult> {
  // Validate input data
  const validation = validateLeadData({
    name: payload.name,
    email: payload.email || '',
    topic: payload.topic,
    message: payload.message
  });
  
  if (!validation.allowed) {
    return validation;
  }
  
  // Sanitize inputs
  const sanitizedLead: Lead = {
    name: payload.name ? sanitizeInput(payload.name) : undefined,
    email: sanitizeInput(payload.email || ''),
    topic: payload.topic ? sanitizeInput(payload.topic) : undefined,
    message: payload.message ? sanitizeInput(payload.message) : undefined,
    timestamp: new Date(),
    ip: ip
  };
  
  try {
    // Send email notification
    await sendEmailNotification(sanitizedLead);
    
    // Send webhook if configured
    if (process.env.LEAD_WEBHOOK_URL) {
      await sendWebhook(sanitizedLead);
    }
    
    // Log the lead (in production, save to database)
    console.log('New lead created:', {
      email: sanitizedLead.email,
      topic: sanitizedLead.topic,
      timestamp: sanitizedLead.timestamp,
      ip: sanitizedLead.ip
    });
    
    return { allowed: true };
  } catch (error) {
    console.error('Lead creation error:', error);
    return {
      allowed: false,
      message: 'Lead kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.'
    };
  }
}

async function sendEmailNotification(lead: Lead): Promise<void> {
  const leadMailTo = process.env.LEAD_MAIL_TO;
  
  if (!leadMailTo) {
    console.warn('LEAD_MAIL_TO not configured, skipping email notification');
    return;
  }
  
  const mailOptions = {
    from: process.env.SMTP_USER || 'noreply@example.com',
    to: leadMailTo,
    subject: `Yeni Lead: ${lead.topic || 'Genel İletişim'}`,
    html: `
      <h2>Yeni Lead Bildirimi</h2>
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h3>İletişim Bilgileri:</h3>
        <ul>
          ${lead.name ? `<li><strong>Ad:</strong> ${lead.name}</li>` : ''}
          <li><strong>E-posta:</strong> ${lead.email}</li>
          ${lead.topic ? `<li><strong>Konu:</strong> ${lead.topic}</li>` : ''}
        </ul>
        
        ${lead.message ? `
          <h3>Mesaj:</h3>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
            ${lead.message.replace(/\n/g, '<br>')}
          </div>
        ` : ''}
        
        <h3>Teknik Bilgiler:</h3>
        <ul>
          <li><strong>Tarih:</strong> ${lead.timestamp?.toLocaleString('tr-TR')}</li>
          <li><strong>IP:</strong> ${lead.ip || 'Bilinmiyor'}</li>
        </ul>
        
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          Bu mesaj Interactive Portfolio sisteminden otomatik olarak gönderilmiştir.
        </p>
      </div>
    `,
    text: `
Yeni Lead Bildirimi

İletişim Bilgileri:
${lead.name ? `Ad: ${lead.name}` : ''}
E-posta: ${lead.email}
${lead.topic ? `Konu: ${lead.topic}` : ''}

${lead.message ? `Mesaj:\n${lead.message}\n` : ''}

Teknik Bilgiler:
Tarih: ${lead.timestamp?.toLocaleString('tr-TR')}
IP: ${lead.ip || 'Bilinmiyor'}

Bu mesaj Interactive Portfolio sisteminden otomatik olarak gönderilmiştir.
    `
  };
  
  await transporter.sendMail(mailOptions);
}

async function sendWebhook(lead: Lead): Promise<void> {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    return;
  }
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Interactive-Portfolio/1.0'
      },
      body: JSON.stringify({
        type: 'lead',
        data: {
          name: lead.name,
          email: lead.email,
          topic: lead.topic,
          message: lead.message,
          timestamp: lead.timestamp?.toISOString(),
          ip: lead.ip
        }
      })
    });
    
    if (!response.ok) {
      console.error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }
}

// Test email configuration
export async function testEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
}
