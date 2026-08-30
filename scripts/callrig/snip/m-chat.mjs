import { DOM } from './lib.mjs';
// QA_TEXT='...' send an in-call chat message; without QA_TEXT just read the panel.
export default async ({page}) => {
  await page.evaluate(DOM);
  const out = {};
  const t = await page.$('button[data-testid="call-controls-chat-toggle"]');
  out.toggle = !!t;
  if (t) { out.pressedBefore = await t.getAttribute('aria-pressed');
    if (out.pressedBefore !== 'true') { const bb=await t.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2500); } }
  const sel = '[data-testid="call-side-panel-slot"] textarea';
  if (process.env.QA_TEXT) {
    const el = await page.$(sel);
    out.composer = !!el;
    if (el) {
      await el.click(); await page.waitForTimeout(200);
      await el.fill('');
      await el.type(process.env.QA_TEXT, {delay:20});
      out.typed = await page.evaluate((s)=>{const e=document.querySelector(s); return e?e.value:null;}, sel);
      out.sendEpoch = Date.now();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3500);
    }
  }
  out.panel = await page.evaluate(()=>{const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return p?(p.innerText||'').replace(/\s+/g,' ').trim():null;});
  return out;
};
