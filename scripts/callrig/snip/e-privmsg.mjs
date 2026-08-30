/* In the call chat: send one message to Everyone and one privately to a person. */
import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.evaluate(DOM);
  const pressed = await page.evaluate(()=>document.querySelector('[data-testid="call-controls-chat-toggle"]')?.getAttribute('aria-pressed'));
  if (pressed !== 'true') { await safeClick(page,'[data-testid="call-controls-chat-toggle"]').catch(()=>{}); await page.waitForTimeout(3000); }
  await page.evaluate(DOM);
  const send = async (text) => {
    const inp = await page.$('[role=textbox][contenteditable="true"], textarea');
    if(!inp) return 'no composer';
    await inp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete');
    await inp.type(text); await page.waitForTimeout(300); await page.keyboard.press('Enter');
    await page.waitForTimeout(2500); return 'ok';
  };
  out.pub = await send(process.env.QA_PUB || 'O-pub-1');
  // switch the recipient selector to the named person
  out.selectorBefore = await page.evaluate(()=>{
    const q=window.__qa;
    return [...document.querySelectorAll('button')].filter(q.vis).map(n=>q.nameOf(n).slice(0,45)).filter(s=>/To |Everyone|Message/i.test(s));
  });
  out.pick = await page.evaluate(()=>window.__qa.clickDeepest(/^To Everyone/i));
  await page.waitForTimeout(1800);
  await page.evaluate(DOM);
  out.menu = await page.evaluate(()=>{
    const q=window.__qa;
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper]')].filter(q.boxVis);
    return w.map(x=>(x.innerText||'').replace(/\s+/g,' ').slice(0,200));
  });
  out.pickPerson = await page.evaluate((n)=>window.__qa.popperPick(new RegExp(n,'i')), process.env.QA_TO||'QA Bob');
  await page.waitForTimeout(1500);
  await page.evaluate(DOM);
  out.priv = await send(process.env.QA_PRIV || 'O-priv-1');
  await page.evaluate(DOM);
  out.panel = await page.evaluate(()=>{
    const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    return (ov.innerText||'').replace(/\s+/g,' ').slice(-600);
  });
  return out;
};
