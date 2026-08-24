import { UI_STATE } from './lib.mjs';
export default async ({page}) => {
  const name = process.env.QA_NAME || 'QA-CALL';
  const access = process.env.QA_ACCESS || 'public';
  const entry = process.env.QA_ENTRY || 'open';
  const gv = process.env.QA_GUESTVIS || 'host_only';
  const pw = process.env.QA_CALLPW || '';
  const netlog = [];
  page.on('response', async r => { const u = r.url(); if (u.includes('/api/v1/')) { let b=''; try { b = (await r.text()).slice(0,300); } catch(e){} netlog.push(`${r.request().method()} ${r.status()} ${u.replace('https://airion-cargo.store','')} :: ${b}`); } });
  const open = await page.$('[role="dialog"] [data-testid="calls-start-submit"]');
  if (!open) { await page.click('[data-testid="calls-hub-start-now"]'); await page.waitForTimeout(1000); }
  await page.fill('#calls-hub-call-name', name);
  await page.click(`[data-testid="calls-start-access-${access}"]`);
  await page.click(`[data-testid="calls-start-entry-${entry.replace(/_/g,'-')}"]`);
  await page.waitForTimeout(400);
  const extra = {};
  if (entry === 'password') {
    extra.pwFields = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] input')].map(i=>`${i.type}|${i.id}|${i.placeholder||''}`));
    const f = await page.$('[role="dialog"] input[type=password], [role="dialog"] input[id*="password"]');
    if (f && pw) await f.fill(pw);
  }
  await page.click(`[data-testid="calls-start-guest-link-visibility-${gv.replace(/_/g,'-')}"]`);
  await page.click('[data-testid="calls-start-submit"]');
  await page.waitForTimeout(6000);
  const ui = await page.evaluate('('+UI_STATE+')()');
  const meeting = await page.evaluate(async () => (await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json()));
  return {extra, meeting: meeting && meeting.meeting ? {id:meeting.meeting.id,name:meeting.meeting.name,status:meeting.meeting.status} : meeting, net: netlog, ui};
};
