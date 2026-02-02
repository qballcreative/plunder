/**
 * Security utilities for input validation and sanitization
 */

// Cryptographically secure random number generator
export const secureRandom = (): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] / (0xFFFFFFFF + 1);
};

// Cryptographically secure ID generator
export const generateSecureId = (): string => {
  const array = new Uint32Array(3);
  crypto.getRandomValues(array);
  return Array.from(array, x => x.toString(36)).join('');
};

// Cryptographically secure shuffle (Fisher-Yates with crypto)
export const secureShuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  const randomValues = new Uint32Array(shuffled.length);
  crypto.getRandomValues(randomValues);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randomValues[i] % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate a secure short code for multiplayer game rooms (8 characters for better security)
export const generateSecureShortCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude I, O, 0, 1 for clarity
  const randomValues = new Uint8Array(8);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues, (v) => chars[v % chars.length]).join('');
};

// Secure random integer in range [0, max)
export const secureRandomInt = (max: number): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};

// Chat message validation constants
export const CHAT_MESSAGE_MAX_LENGTH = 500;
export const PLAYER_NAME_MAX_LENGTH = 30;
const ALLOWED_NAME_PATTERN = /^[a-zA-Z0-9\s\-_'.]+$/;

/**
 * Sanitize chat message - trims, limits length, and removes potentially dangerous patterns
 */
export const sanitizeChatMessage = (message: string): string => {
  if (typeof message !== 'string') return '';
  
  // Trim and limit length
  let sanitized = message.trim().slice(0, CHAT_MESSAGE_MAX_LENGTH);
  
  // Remove any HTML-like patterns as defense-in-depth (React escapes, but be extra safe)
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove potential script injection patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized;
};

/**
 * Validate and sanitize player/opponent name
 */
export const sanitizePlayerName = (name: string): string => {
  if (typeof name !== 'string') return 'Player';
  
  // Trim and limit length
  let sanitized = name.trim().slice(0, PLAYER_NAME_MAX_LENGTH);
  
  // Only allow safe characters for names
  if (!ALLOWED_NAME_PATTERN.test(sanitized)) {
    // Filter out disallowed characters
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_'.]/g, '');
  }
  
  // Remove any HTML-like patterns
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  return sanitized || 'Player';
};

/**
 * Validate that a message object has the expected structure
 */
export const isValidChatPayload = (payload: unknown): payload is { text: string; sender: string } => {
  if (!payload || typeof payload !== 'object') return false;
  const p = payload as Record<string, unknown>;
  return typeof p.text === 'string' && typeof p.sender === 'string';
};
