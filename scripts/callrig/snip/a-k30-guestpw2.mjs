/* Read the guest landing of a PASSWORD-protected call completely, without clicking. */
import { DOM } from './lib.mjs';
export default async ({ page, browser }) => {
  const link = process.env.K30_LINK;
  const out = {};
  const gctx = await browser.newContext();
  const gp = await gctx.newPage();
  await gp.goto(link, { waitUntil: 'domcontentloaded' });
  await gp.waitForTimeout(8000);
  await gp.evaluate(DOM);
  const read = () => gp.evaluate(() => {
    const q = window.__qa;
    return {
      docText: document.body.innerText.replace(/\n{2,}/g,'\n'),
      fields: [...document.querySelectorAll('input,textarea')].filter(e=>q.vis(e))
        .map(e=>({ type:e.getAttribute('type'), ph:e.getAttribute('placeholder'),
                   aria:e.getAttribute('aria-label'), val:String(e.value).slice(0,20), req:e.required })),
      submit: (()=>{ const b=[...document.querySelectorAll('button[type=submit]')].find(q.vis);
                     return b?{t:b.textContent.trim(),dis:b.disabled}:null; })(),
    };
  });
  out.initial = await read();
  // fill only the name
  const texts = gp.locator('input[type=text]');
  out.textCount = await texts.count();
  await texts.first().fill('Guest PW');
  await gp.waitForTimeout(900);
  out.afterName = await read();
  // now fill the password
  const pw = gp.locator('input[type=password]');
  out.pwCount = await pw.count();
  if (out.pwCount) { await pw.first().fill('Secret123'); await gp.waitForTimeout(900); }
  out.afterPassword = await read();
  await gctx.close();
  return out;
};
