import { encrypt, decrypt } from '@/lib/encryption';

test('Encryption and Decryption', async () => {
  const originalText = 'SensitiveAccessToken123!';
  const encryptedText = await encrypt(originalText);
  expect(encryptedText).not.toBe(originalText);

  const decryptedText = await decrypt(encryptedText);
  expect(decryptedText).toBe(originalText);
});