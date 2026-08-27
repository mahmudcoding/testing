import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const msg = process.env.QA_MSG || 'hello';
  const out = {};
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed')) !== 'true') { await t.click(); await page.waitForTimeout(2200); }
  // find the composer inside the call side panel
  const found = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    if(!p) return {err:'no panel'};
    const eds=[...p.querySelectorAll('[contenteditable="true"],textarea,input[type=text]')].filter(vis);
    return {n:eds.length, labels:eds.map(e=>e.getAttribute('aria-label')||e.getAttribute('placeholder')||e.tagName),
      header:(p.innerText||'').replace(/\s+/g,' ').slice(0,200)}; }, VIS);
  out.composer = found;
  if (found.err || !found.n) return out;
  // clear then type
  await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const e=[...p.querySelectorAll('[contenteditable="true"],textarea,input[type=text]')].filter(vis)[0];
    e.focus();
    if (e.isContentEditable) { document.execCommand('selectAll',false,null); document.execCommand('delete',false,null); }
    else { const s=Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value')||Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value'); s.set.call(e,''); e.dispatchEvent(new Event('input',{bubbles:true})); }
  }, VIS);
  await page.waitForTimeout(400);
  await page.keyboard.type(msg, {delay:18});
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3500);
  out.after = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    return (p?p.innerText:'').replace(/\s+/g,' ').slice(0,400); }, VIS);
  return out;
}
