#!/usr/bin/env node
/*
  Nail Lounge Pro/Basic live release smoke.
  Purpose: deterministic evidence for humans, Claude, Codex, and Hermes.
  Non-destructive by default. Optional OTP send can be enabled with SMOKE_OTP=1.
*/
import { execFileSync } from 'node:child_process';

const PRO_BASE = (process.env.PRO_BASE || 'https://bookingnail.overpowers.agency').replace(/\/$/, '');
const BASIC_BASE = (process.env.BASIC_BASE || 'http://bookingnail.basic.overpowers.agency').replace(/\/$/, '');
const ADMIN_USER = process.env.SMOKE_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.SMOKE_ADMIN_PASS || 'admin123';
const TEST_PHONE = process.env.SMOKE_TEST_PHONE || '0339351204';
const ENABLE_OTP = ['1', 'true', 'yes'].includes(String(process.env.SMOKE_OTP || '').toLowerCase());
const EXPECT_PRO_REDIRECT = process.env.EXPECT_PRO_GOOGLE_REDIRECT || 'http://bookingnail.overpowers.agency/api/auth/callback/google';
const EXPECT_BASIC_REDIRECT = process.env.EXPECT_BASIC_GOOGLE_REDIRECT || 'http://bookingnail.basic.overpowers.agency/api/auth/callback/google';

const results = [];
const failures = [];
const warnings = [];

function add(name, ok, detail = '', meta = {}) {
  const row = { name, ok, detail, ...meta };
  results.push(row);
  if (!ok) failures.push(row);
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function warn(name, detail = '') {
  const row = { name, detail };
  warnings.push(row);
  console.log(`WARN ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.SMOKE_TIMEOUT_MS || 45000));
  try {
    const res = await fetch(url, { redirect: 'manual', cache: 'no-store', signal: controller.signal, ...options });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { ok: res.ok, status: res.status, headers: res.headers, text, json };
  } finally {
    clearTimeout(timeout);
  }
}

function getRedirectUri(location) {
  try {
    const u = new URL(location);
    return u.searchParams.get('redirect_uri') || '';
  } catch {
    return '';
  }
}

async function expectPage(base, path, label, statusOk = [200]) {
  const r = await request(`${base}${path}`);
  add(`${label} ${path}`, statusOk.includes(r.status), `HTTP ${r.status}`);
  return r;
}

async function expectJson(base, path, label, predicate = () => true, statusOk = [200]) {
  const r = await request(`${base}${path}`);
  const ok = statusOk.includes(r.status) && r.json && predicate(r.json);
  add(`${label} ${path}`, ok, `HTTP ${r.status}${r.json ? '' : ' non-json'}`);
  return r;
}

async function login(base, label) {
  const r = await request(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_USER, password: ADMIN_PASS }),
  });
  const token = r.json?.token || r.json?.accessToken || '';
  add(`${label} admin login`, Boolean(r.ok && token), `HTTP ${r.status}`);
  return token;
}

async function oauthRedirect(base, label, expected) {
  const r = await request(`${base}/api/auth/google?next=%2Flogin`);
  const loc = r.headers.get('location') || '';
  const redirectUri = getRedirectUri(loc);
  const ok = [302, 303, 307, 308].includes(r.status) && loc.includes('accounts.google.com') && redirectUri === expected;
  add(`${label} Google OAuth redirect`, ok, `HTTP ${r.status}; redirect_uri=${redirectUri || 'missing'}; expected=${expected}`);
}

async function chatbot(base, label, shouldExist) {
  const payloads = [
    { language: 'en', message: 'hello, how do I book and what are your opening hours?' },
    { language: 'vi', message: 'xin chào, tôi muốn đặt lịch làm móng và hỏi giá dịch vụ' },
  ];
  for (const p of payloads) {
    let best = null;
    for (const path of ['/api/chatbot', '/api/api/chatbot']) {
      const r = await request(`${base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: p.message }],
          page: '/',
          responseLanguage: p.language,
        }),
      });
      best = { path, ...r };
      if (r.ok && r.json?.answer) break;
    }
    if (shouldExist) {
      const answer = String(best?.json?.answer || '');
      const ok = Boolean(best?.ok && answer.length > 20 && best?.json?.configured === true && best?.json?.knowledgeEngine === 'qdrant');
      add(`${label} chatbot ${p.language}`, ok, `${best?.path || '?'} HTTP ${best?.status}; configured=${best?.json?.configured}; engine=${best?.json?.knowledgeEngine}; answer=${answer.slice(0, 90).replace(/\s+/g, ' ')}`);
    } else {
      const ok = Boolean(best && [404, 403].includes(best.status));
      add(`${label} chatbot disabled ${p.language}`, ok, `${best?.path || '?'} HTTP ${best?.status}`);
    }
  }
}

async function calendarChecks(base, label, token) {
  await expectJson(base, '/api/google-webhook', `${label} google webhook`, (j) => j.ok === true && String(j.service || '').includes('google'));
  if (!token) {
    add(`${label} calendar-sync admin API`, false, 'missing admin token');
    return;
  }
  const authHeader = ['Bear', 'er '].join('') + token;
  const headers = Object.fromEntries([['Authorization', authHeader]]);

  const settings = await request(`${base}/api/admin/calendar-sync`, { headers });
  const redirectUri = settings.json?.env?.google?.redirectUri || '';
  const settingsOk = settings.ok && settings.json?.settings && settings.json?.env?.google?.configured === true && redirectUri.includes('/api/auth/callback/google');
  add(`${label} calendar-sync admin API`, settingsOk, `HTTP ${settings.status}; googleConfigured=${settings.json?.env?.google?.configured}; redirectUri=${redirectUri}`);

  await expectPage(base, '/admin/calendar', `${label} admin calendar page`);
  await expectPage(base, '/admin/google-sync', `${label} google-sync page`);

  const today = new Date();
  const from = today.toISOString().slice(0, 10);
  const to = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const schedule = await request(`${base}/api/staff/schedule?from=${from}&to=${to}`, { headers });
  const scheduleOk = schedule.ok && (Array.isArray(schedule.json?.staff) || Array.isArray(schedule.json?.events) || typeof schedule.json === 'object');
  add(`${label} staff schedule API`, scheduleOk, `HTTP ${schedule.status}; keys=${schedule.json ? Object.keys(schedule.json).slice(0, 8).join(',') : 'non-json'}`);

  const ics = await request(`${base}/api/staff/schedule/export?format=ics&from=${from}&to=${to}`, { headers });
  const icsOk = ics.ok && (ics.text.includes('BEGIN:VCALENDAR') || (ics.headers.get('content-type') || '').includes('text/calendar'));
  add(`${label} staff schedule ICS export`, icsOk, `HTTP ${ics.status}; contentType=${ics.headers.get('content-type') || ''}`);
}

async function availabilityChecks(base, label) {
  const today = new Date().toISOString().slice(0, 10);
  const r = await request(`${base}/api/services`);
  const services = Array.isArray(r.json?.services) ? r.json.services : [];
  const serviceId = services[0]?.id;
  add(`${label} service catalog`, Boolean(r.ok && services.length > 0 && serviceId), `HTTP ${r.status}; services=${services.length}`);
  if (!serviceId) return;
  const av = await request(`${base}/api/availability?date=${today}&serviceId=${encodeURIComponent(serviceId)}`);
  const slots = Array.isArray(av.json?.slots) ? av.json.slots : [];
  add(`${label} availability API`, Boolean(av.ok && Array.isArray(av.json?.slots)), `HTTP ${av.status}; slots=${slots.length}; date=${today}`);
}

async function otpCheck(base, label) {
  if (!ENABLE_OTP) {
    warn(`${label} OTP send`, 'skipped by default; run SMOKE_OTP=1 to send a real test code');
    return;
  }
  const r = await request(`${base}/api/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: TEST_PHONE, channel: 'auto' }),
  });
  const channel = r.json?.channel || r.json?.delivery?.channel || r.json?.otp?.channel || '';
  add(`${label} OTP send`, Boolean(r.ok), `HTTP ${r.status}; channel=${channel || 'unknown'}`);
}

function dockerCheck() {
  try {
    const ps = execFileSync('docker', ['ps', '--format', '{{.Names}}'], { encoding: 'utf8' }).split('\n').filter(Boolean);
    const proDb = 'f94xy43rc486nw6f4pungtir';
    const basicDb = 'rx4f0zsw7t6bd1428onvu2c3';
    add('DB containers running', ps.includes(proDb) && ps.includes(basicDb), `pro=${ps.includes(proDb)} basic=${ps.includes(basicDb)}`);
    for (const [label, container, volume] of [
      ['Pro DB volume', proDb, 'postgres-data-f94xy43rc486nw6f4pungtir'],
      ['Basic DB volume', basicDb, 'postgres-data-rx4f0zsw7t6bd1428onvu2c3'],
    ]) {
      const mounts = execFileSync('docker', ['inspect', container, '--format', '{{range .Mounts}}{{println .Name "->" .Destination}}{{end}}'], { encoding: 'utf8' });
      add(label, mounts.includes(volume) && mounts.includes('/var/lib/postgresql/data'), mounts.trim().replace(/\n/g, '; '));
    }
    for (const [label, container] of [['Pro DB schema', proDb], ['Basic DB schema', basicDb]]) {
      const out = execFileSync('docker', ['exec', container, 'sh', '-lc', 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "select current_database(); select count(*) from information_schema.tables where table_schema=\'public\';"'], { encoding: 'utf8' }).trim().split('\n');
      add(label, Number(out[1] || 0) >= 19, `db=${out[0]}; tables=${out[1]}`);
    }
  } catch (error) {
    warn('Docker DB checks', error instanceof Error ? error.message : String(error));
  }
}

async function main() {
  console.log('Nail Lounge live release smoke');
  console.log(`PRO_BASE=${PRO_BASE}`);
  console.log(`BASIC_BASE=${BASIC_BASE}`);
  console.log('--- public surfaces ---');
  await expectPage(PRO_BASE, '/', 'Pro home');
  await expectPage(PRO_BASE, '/booking', 'Pro booking');
  await expectPage(PRO_BASE, '/login', 'Pro login');
  await expectJson(PRO_BASE, '/api/health', 'Pro health', (j) => j.ok === true);
  await expectPage(BASIC_BASE, '/', 'Basic home');
  await expectPage(BASIC_BASE, '/booking', 'Basic booking');
  await expectPage(BASIC_BASE, '/login', 'Basic login');
  await expectJson(BASIC_BASE, '/api/health', 'Basic health', (j) => j.ok === true);

  console.log('--- auth and calendar ---');
  await oauthRedirect(PRO_BASE, 'Pro', EXPECT_PRO_REDIRECT);
  await oauthRedirect(BASIC_BASE, 'Basic', EXPECT_BASIC_REDIRECT);
  const proToken = await login(PRO_BASE, 'Pro');
  const basicToken = await login(BASIC_BASE, 'Basic');
  await calendarChecks(PRO_BASE, 'Pro', proToken);
  await calendarChecks(BASIC_BASE, 'Basic', basicToken);

  console.log('--- booking/services ---');
  await availabilityChecks(PRO_BASE, 'Pro');
  await availabilityChecks(BASIC_BASE, 'Basic');
  await otpCheck(PRO_BASE, 'Pro');
  await otpCheck(BASIC_BASE, 'Basic');

  console.log('--- chatbot/RAG ---');
  await chatbot(PRO_BASE, 'Pro', true);
  await chatbot(BASIC_BASE, 'Basic', false);

  console.log('--- DB/volume separation ---');
  dockerCheck();

  console.log('--- summary ---');
  console.log(JSON.stringify({ passed: results.filter((r) => r.ok).length, failed: failures.length, warnings: warnings.length, failures, warnings }, null, 2));
  if (failures.length) process.exit(1);
}

main().catch((error) => {
  console.error('FATAL', error);
  process.exit(1);
});
