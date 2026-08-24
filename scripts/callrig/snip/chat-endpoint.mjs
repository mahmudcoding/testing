export default async ({page}) => {
  const netlog=[];
  page.on('request', r=>{const u=r.url(); if(u.includes('/api/v1/')&&r.method()!=='GET') netlog.push(`${r.method()} ${u.replace('https://airion-cargo.store','')} :: ${(r.postData()||'').slice(0,200)}`);});
  const t = await page.$('button[aria-label="Call chat"]');
  if (t && (await t.getAttribute('aria-pressed'))!=='true') { await t.click(); await page.waitForTimeout(2500); }
  const ta = await page.$('[data-testid="in-call-chat-panel"] textarea');
  if (!ta) return {err:'no textarea'};
  await ta.fill(process.env.QA_MSG||'probe');
  await page.waitForTimeout(300);
  const send = await page.$('[data-testid*="chat-send"]') || await page.$('button[aria-label="Send"]');
  if (send) await send.click(); else await ta.press('Enter');
  await page.waitForTimeout(3500);
  return {net: netlog};
};
