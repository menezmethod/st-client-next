import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const IV_LENGTH = 16;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

const scryptAsync = promisify(scrypt);

console.log('[Timestamp] [encryption.ts] App started in environment:', process.env.NODE_ENV);

console.log('[Timestamp] [encryption.ts] Encryption key and IV length set');

export async function encrypt(text: string): Promise<string> {
  const iv = randomBytes(IV_LENGTH);
  const key = (await scryptAsync(ENCRYPTION_KEY, 'salt', 32)) as Buffer;
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + encrypted.toString('hex') + ':' + tag.toString('hex');
}

export async function decrypt(encryptedText: string): Promise<string> {
  const [ivHex, encryptedHex, tagHex] = encryptedText.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const key = (await scryptAsync(ENCRYPTION_KEY, 'salt', 32)) as Buffer;
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}
console.log('[Timestamp] [encryption.ts] Encryption module initialized');

