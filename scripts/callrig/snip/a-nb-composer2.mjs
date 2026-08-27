import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2200); }
  await page.mouse.move(1500,900); await page.waitForTimeout(400);
  return await page.evaluate((v)=>{ const vis=eval(v);
    const cls = e => String(e.className && e.className.baseVal!==undefined ? e.className.baseVal : (e.className||''));
    const p=document.querySelector('[data-testid="call-side-panel-slot"]'); if(!p) return {err:'no panel'};
    // the composer region = the last block containing an editable
    const ed=[...p.querySelectorAll('[contenteditable="true"],textarea,input')].filter(vis).pop();
    if(!ed) return {err:'no editable'};
    let box=ed; for(let i=0;i<4 && box.parentElement;i++) box=box.parentElement;
    const r=box.getBoundingClientRect();
    return {
      editable:{label:ed.getAttribute('aria-label'), ph:ed.getAttribute('data-placeholder')||ed.getAttribute('placeholder'), txt:(ed.innerText||ed.value||'').slice(0,40)},
      boxRect:`${Math.round(r.width)}x${Math.round(r.height)}`,
      nodes:[...box.querySelectorAll('*')].filter(vis).map(e=>({
        tag:e.tagName.toLowerCase(), tid:e.getAttribute('data-testid'), al:e.getAttribute('aria-label'),
        ph:e.getAttribute('data-placeholder')||e.getAttribute('placeholder'),
        cls:cls(e).slice(0,40),
        txt:(e.childElementCount===0?(e.textContent||'').trim().slice(0,40):'')})).filter(e=>e.tid||e.al||e.ph||e.txt).slice(0,20),
      boxText:(box.innerText||'').replace(/\s+/g,' ').slice(0,120)};}, VIS);
};
