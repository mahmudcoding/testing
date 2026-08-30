/* Start a call from a channel header. */
import { DOM, safeClick } from './lib.mjs';
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QEF1XTURESO01/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  await page.evaluate(DOM);
  out.click = await page.evaluate(()=>window.__qa.clickDeepest(/^Start call$/i));
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.dialog = await page.evaluate(()=>{
    const q=window.__qa;
    const ds=[...document.querySelectorAll('[role=dialog]')].filter(q.boxVis).filter(d=>[...d.querySelectorAll('button')].length<=12);
    const d=ds.pop(); if(!d) return null;
    return {text:(d.innerText||'').replace(/\s+/g,' ').slice(0,700),
      btns:[...d.querySelectorAll('button')].filter(q.vis).map(n=>({n:q.nameOf(n).slice(0,40),t:n.getAttribute('data-testid')})),
      inputs:[...d.querySelectorAll('input')].map(n=>({type:n.type,v:n.value,ph:n.placeholder,checked:n.checked}))};
  });
  const name=process.env.QA_CALLNAME;
  if (name) {
    const inp = await page.$('[role=dialog] input[type=text]');
    if (inp) { await inp.click(); await page.keyboard.press('Meta+A'); await page.keyboard.press('Delete'); await inp.type(name); }
    // pick "open" access so no admit step
    const open = await page.$('[role=dialog] input[value="open"]');
    if (open) { await open.click(); out.pickedOpen=true; }
    await page.waitForTimeout(500);
    const sub = await page.$('[data-testid="calls-start-submit"]');
    if (sub) { await sub.click(); out.submitted=true; }
    await page.waitForTimeout(7000);
  }
  out.url=page.url();
  return out;
};
