import { NextApiResponse } from 'next';

interface RateLimitOptions {
  interval: number;
  uniqueTokenPerInterval: number;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitInfo>();

export function rateLimit(options: RateLimitOptions) {
  return {
    check: (res: NextApiResponse, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = token + ':' + Math.floor(Date.now() / options.interval);
        const tokenInfo = rateLimitMap.get(tokenCount) || { count: 0, resetTime: Date.now() + options.interval };
        
        if (tokenInfo.count >= limit) {
          res.setHeader('X-RateLimit-Limit', limit.toString());
          res.setHeader('X-RateLimit-Remaining', '0');
          res.setHeader('X-RateLimit-Reset', new Date(tokenInfo.resetTime).toUTCString());
          reject(new Error('Rate limit exceeded'));
        } else {
          tokenInfo.count++;
          rateLimitMap.set(tokenCount, tokenInfo);
          
          // Clean up old entries
          if (rateLimitMap.size > options.uniqueTokenPerInterval) {
            const oldestToken = Array.from(rateLimitMap.keys()).sort()[0];
            rateLimitMap.delete(oldestToken);
          }
          
          res.setHeader('X-RateLimit-Limit', limit.toString());
          res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - tokenInfo.count).toString());
          res.setHeader('X-RateLimit-Reset', new Date(tokenInfo.resetTime).toUTCString());
          resolve();
        }
      }),
  };
}