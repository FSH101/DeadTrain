import { Buffer } from 'buffer';
import crypto from 'crypto';
import process from 'process';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? '';

const buildDataCheckString = (initData) => {
  const params = new URLSearchParams(initData);
  const entries = [];
  params.sort();
  params.forEach((value, key) => {
    if (key === 'hash') {
      return;
    }
    entries.push(`${key}=${value}`);
  });
  return entries.join('\n');
};

const verify = (initData) => {
  if (!BOT_TOKEN) {
    return false;
  }
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) {
    return false;
  }
  const secret = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
  const dataCheckString = buildDataCheckString(initData);
  const computed = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
};

const parseBody = async (req) => {
  if (req.body) {
    if (typeof req.body === 'string') {
      return JSON.parse(req.body);
    }
    if (typeof req.body === 'object') {
      return req.body;
    }
  }
  const chunks = [];
  for await (const chunk of req) {
    if (typeof chunk === 'string') {
      chunks.push(Buffer.from(chunk));
    } else if (Buffer.isBuffer(chunk)) {
      chunks.push(chunk);
    } else {
      chunks.push(Buffer.from(chunk));
    }
  }
  if (chunks.length === 0) {
    return {};
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    return {};
  }
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 200;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }
  const body = await parseBody(req);
  const { initData } = body ?? {};
  if (!initData) {
    res.statusCode = 400;
    res.end('Missing initData');
    return;
  }
  const ok = verify(initData);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  if (!ok) {
    res.statusCode = 403;
    res.end(JSON.stringify({ ok: false }));
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true }));
}
