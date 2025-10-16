import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { initializeConfig } from './config';
import { testEmailConfig } from './lead';
import router from './router';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Trust proxy for Railway
app.set('trust proxy', 1);

console.log('🚀 Starting Portfolio MCP server...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 Port:', PORT);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Çok fazla istek gönderdiniz. Lütfen 15 dakika bekleyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Static files serving (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(process.cwd(), 'public')));
}

// API routes
app.use('/', router);

// Serve static files in development
if (process.env.NODE_ENV !== 'production') {
  app.use(express.static(path.join(process.cwd(), 'public')));
}

// Catch-all handler for SPA (in production)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Sunucu hatası oluştu.' 
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ 
    error: 'Sayfa bulunamadı.' 
  });
});

// Startup function
async function startServer() {
  try {
    // Validate required environment variables
    const requiredEnvVars = ['OPENAI_API_KEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars);
      process.exit(1);
    }
    
    // Initialize configuration
    console.log('Initializing configuration...');
    initializeConfig();
    
    // Test email configuration if provided
    if (process.env.SMTP_HOST) {
      console.log('Testing email configuration...');
      const emailValid = await testEmailConfig();
      if (!emailValid) {
        console.warn('Email configuration is invalid. Lead notifications will not work.');
      }
    } else {
      console.log('Email configuration not provided. Lead notifications disabled.');
    }
    
    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Interactive Portfolio server running on port ${PORT}`);
      console.log(`📱 Mobile-first AI portfolio assistant ready`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔗 Local URL: http://localhost:${PORT}`);
      }
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
