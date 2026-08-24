export default async ({page}) => {
  const msg = process.env.QA_MSG || 'hello';
  const steps = [];
  const t = await page.$('button[aria-label="Call chat"]');
  steps.push('toggle pressed before: ' + (t ? await t.getAttribute('aria-pressed') : 'MISSING'));
  if (t && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2500); }
  steps.push('toggle after: ' + (await page.$eval('button[aria-label="Call chat"]', e=>e.getAttribute('aria-pressed')).catch(()=>'?')));
  steps.push('panel present: ' + await page.evaluate(()=>!!document.querySelector('[data-testid="in-call-chat-panel"]')));
  steps.push('fields: ' + JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('textarea,input,[contenteditable="true"]')].map(e=>e.tagName+'|'+(e.getAttribute('aria-label')||e.placeholder||'')))));
  const ta = await page.$('[data-testid="in-call-chat-panel"] textarea') || await page.$('textarea');
  if (!ta) return {steps};
  await ta.click(); await ta.fill(msg); await page.waitForTimeout(400);
  const send = await page.$('[data-testid*="chat-send"]') || await page.$('button[aria-label="Send"]');
  steps.push('send btn: ' + !!send);
  if (send) await send.click(); else await ta.press('Enter');
  await page.waitForTimeout(3000);
  const panel = await page.evaluate(() => { const p = document.querySelector('[data-testid="in-call-chat-panel"]'); return p ? p.innerText.replace(/\n+/g,' | ').slice(0,600) : 'no panel'; });
  return {steps, panel};
};
