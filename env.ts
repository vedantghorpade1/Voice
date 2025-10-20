function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    // This error will be caught during server startup or build, preventing runtime failures.
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  // MongoDB
  MONGODB_URI: getEnvVar('MONGODB_URI'),

  // ElevenLabs
  ELEVENLABS_API_KEY: getEnvVar('ELEVENLABS_API_KEY'),
  AGENT_ID: getEnvVar('AGENT_ID'),

  // Exotel
  EXOTEL_SID: getEnvVar('EXOTEL_SID'),
  EXOTEL_TOKEN: getEnvVar('EXOTEL_TOKEN'),
  EXOTEL_PHONE: getEnvVar('EXOTEL_PHONE'),

  // Auth
  JWT_SECRET: getEnvVar('JWT_SECRET'),

  // SMTP
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,

  // Base URL
  BASE_URL: getEnvVar('NEXT_PUBLIC_BASE_URL'),
};