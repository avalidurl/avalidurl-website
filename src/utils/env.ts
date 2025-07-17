/**
 * 🔐 Type-safe environment variable configuration
 * This file provides secure access to environment variables with proper validation
 */

interface EnvConfig {
  readonly CONTACT_EMAIL: string;
  readonly SITE_URL: string;
  readonly ANALYTICS_ID?: string;
  readonly GITHUB_USERNAME?: string;
  readonly LINKEDIN_URL?: string;
  readonly TWITTER_URL?: string;
  readonly CSP_REPORT_URI?: string;
  readonly HSTS_MAX_AGE?: string;
}

/**
 * Environment configuration with build-time validation
 */
export const env: EnvConfig = {
  CONTACT_EMAIL: import.meta.env.CONTACT_EMAIL || 'contact@example.com',
  SITE_URL: import.meta.env.SITE_URL || 'https://yoursite.dev',
  ANALYTICS_ID: import.meta.env.ANALYTICS_ID,
  GITHUB_USERNAME: import.meta.env.GITHUB_USERNAME,
  LINKEDIN_URL: import.meta.env.LINKEDIN_URL,
  TWITTER_URL: import.meta.env.TWITTER_URL,
  CSP_REPORT_URI: import.meta.env.CSP_REPORT_URI,
  HSTS_MAX_AGE: import.meta.env.HSTS_MAX_AGE || '31536000',
} as const;

/**
 * Build-time validation for required environment variables
 */
const requiredEnvVars = ['CONTACT_EMAIL', 'SITE_URL'] as const;

requiredEnvVars.forEach((key) => {
  const value = env[key];
  if (!value || value.includes('example.com') || value.includes('yoursite.dev')) {
    if (import.meta.env.NODE_ENV === 'production') {
      throw new Error(
        `❌ Missing or invalid required environment variable: ${key}. ` +
        `Please set this in your deployment environment.`
      );
    } else {
      console.warn(
        `⚠️  Environment variable ${key} is not set or using default value. ` +
        `This is okay for development but must be configured for production.`
      );
    }
  }
});

/**
 * Validate that the SITE_URL is properly formatted
 */
if (env.SITE_URL && !env.SITE_URL.startsWith('https://')) {
  if (import.meta.env.NODE_ENV === 'production') {
    throw new Error(
      `❌ SITE_URL must start with https:// in production. Got: ${env.SITE_URL}`
    );
  } else {
    console.warn(
      `⚠️  SITE_URL should start with https:// even in development. Got: ${env.SITE_URL}`
    );
  }
}

/**
 * Validate email format
 */
if (env.CONTACT_EMAIL && !env.CONTACT_EMAIL.includes('@')) {
  throw new Error(`❌ CONTACT_EMAIL must be a valid email address. Got: ${env.CONTACT_EMAIL}`);
}

/**
 * Development mode helpers
 */
export const isDevelopment = import.meta.env.NODE_ENV === 'development';
export const isProduction = import.meta.env.NODE_ENV === 'production';

/**
 * Security-focused environment access
 * This function ensures no secrets are accidentally exposed in client-side code
 */
export function getPublicEnv() {
  return {
    CONTACT_EMAIL: env.CONTACT_EMAIL,
    SITE_URL: env.SITE_URL,
    GITHUB_USERNAME: env.GITHUB_USERNAME,
    LINKEDIN_URL: env.LINKEDIN_URL,
    TWITTER_URL: env.TWITTER_URL,
    isDevelopment,
    isProduction,
  } as const;
}

/**
 * Server-side only environment access
 * This should only be used in server-side code (API routes, middleware, etc.)
 */
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('❌ getServerEnv() can only be used in server-side code');
  }
  
  return {
    ...getPublicEnv(),
    CSP_REPORT_URI: env.CSP_REPORT_URI,
    HSTS_MAX_AGE: env.HSTS_MAX_AGE,
    ANALYTICS_ID: env.ANALYTICS_ID,
  } as const;
}

/**
 * Type guard to check if we're in a secure context
 */
export function isSecureContext(): boolean {
  return typeof window !== 'undefined' 
    ? window.location.protocol === 'https:' 
    : true; // Server-side is always considered secure
}

/**
 * Get canonical URL for the site
 */
export function getCanonicalUrl(path: string = ''): string {
  const baseUrl = env.SITE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Export the configuration for use in other files
export default env;