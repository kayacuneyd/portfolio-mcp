import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'yaml';
import { Profile, Theme } from './schema';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const sixtyDaysInSeconds = 5184000;

export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: sixtyDaysInSeconds,
  },
});

// Cache for configuration files
interface ConfigCache {
  profile: Profile | null;
  faq: string | null;
  prompts: string[] | null;
  theme: Theme | null;
  lastUpdated: number;
}

const cache: ConfigCache = {
  profile: null,
  faq: null,
  prompts: null,
  theme: null,
  lastUpdated: 0
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function loadProfile(): Profile {
  if (isCacheValid() && cache.profile) {
    return cache.profile;
  }
  
  try {
    const profilePath = join(process.cwd(), 'data', 'profile.yaml');
    const fileContent = readFileSync(profilePath, 'utf8');
    const profile = parse(fileContent) as Profile;
    
    // Validate required fields
    if (!profile.name || !profile.title || !profile.contact?.email) {
      throw new Error('Profile is missing required fields');
    }
    
    cache.profile = profile;
    cache.lastUpdated = Date.now();
    
    console.log('Profile loaded successfully');
    return profile;
  } catch (error) {
    console.error('Error loading profile:', error);
    throw new Error('Profile konfigürasyonu yüklenemedi');
  }
}

export function loadFaq(): string {
  if (isCacheValid() && cache.faq) {
    return cache.faq;
  }
  
  try {
    const faqPath = join(process.cwd(), 'data', 'faq.md');
    const faq = readFileSync(faqPath, 'utf8');
    
    cache.faq = faq;
    cache.lastUpdated = Date.now();
    
    console.log('FAQ loaded successfully');
    return faq;
  } catch (error) {
    console.error('Error loading FAQ:', error);
    return 'SSS bilgileri yüklenemedi.';
  }
}

export function loadPrompts(): string[] {
  if (isCacheValid() && cache.prompts) {
    return cache.prompts;
  }
  
  try {
    const promptsPath = join(process.cwd(), 'config', 'prompts.json');
    const promptsContent = readFileSync(promptsPath, 'utf8');
    const prompts = JSON.parse(promptsContent) as string[];
    
    if (!Array.isArray(prompts)) {
      throw new Error('Prompts must be an array');
    }
    
    cache.prompts = prompts;
    cache.lastUpdated = Date.now();
    
    console.log('Prompts loaded successfully');
    return prompts;
  } catch (error) {
    console.error('Error loading prompts:', error);
    return [
      'Hangi hizmetleri veriyorsun?',
      'Son projelerinden örnek paylaşır mısın?',
      'Bütçem ~1500€ — neler yapabiliriz?',
      '1 haftada landing page mümkün mü?',
      'Randevu için uygun olduğun saatler?'
    ];
  }
}

export function loadTheme(): Theme {
  if (isCacheValid() && cache.theme) {
    return cache.theme;
  }
  
  try {
    const themePath = join(process.cwd(), 'config', 'theme.json');
    const themeContent = readFileSync(themePath, 'utf8');
    const theme = JSON.parse(themeContent) as Theme;
    
    cache.theme = theme;
    cache.lastUpdated = Date.now();
    
    console.log('Theme loaded successfully');
    return theme;
  } catch (error) {
    console.error('Error loading theme:', error);
    return {
      colors: {
        'accent-color': '#3b82f6',
        'accent-hover': '#2563eb',
        'success-color': '#10b981',
        'error-color': '#ef4444'
      }
    };
  }
}

function isCacheValid(): boolean {
  return Date.now() - cache.lastUpdated < CACHE_DURATION;
}

export function clearCache(): void {
  cache.profile = null;
  cache.faq = null;
  cache.prompts = null;
  cache.theme = null;
  cache.lastUpdated = 0;
  console.log('Configuration cache cleared');
}

// Load all configurations at startup
export function initializeConfig(): void {
  try {
    loadProfile();
    loadFaq();
    loadPrompts();
    loadTheme();
    console.log('All configurations loaded successfully');
  } catch (error) {
    console.error('Configuration initialization error:', error);
  }
}
