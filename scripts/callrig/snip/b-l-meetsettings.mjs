/* sector L: open Meeting settings in-call and enumerate, looking for guest link + video quality */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const out={};
  out.open = await page.evaluate(()=>{
    const b=document.querySelector('[data-testid="call-controls-settings-toggle"]');
    if(!b) return {ok:false}; b.click(); return {ok:true};
  });
  await page.waitForTimeout(2500);
  await page.evaluate(DOM);
  out.panel = await page.evaluate(()=>{
    const q=window.__qa;
    // the settings panel is likely an aside/dialog
    const cands=[...document.querySelectorAll('[role=dialog],aside,[data-testid*="settings" i],[data-testid*="panel" i]')].filter(q.boxVis);
    const p=cands.sort((a,b)=>(b.innerText||'').length-(a.innerText||'').length)[0];
    if(!p) return null;
    return {testid:p.getAttribute('data-testid'), tag:p.tagName,
      text:(p.innerText||'').replace(/\s+/g,' ').trim().slice(0,1200),
      controls:[...p.querySelectorAll('button,input,select,[role=switch],[role=slider],[role=combobox],[role=radio]')]
        .filter(q.boxVis).map(n=>({tag:n.tagName, role:n.getAttribute('role')||n.type||null,
          name:q.nameOf(n).replace(/\s+/g,' ').trim().slice(0,55), val:n.value||n.getAttribute('aria-valuenow')||null,
          checked:n.getAttribute('aria-checked'), testid:n.getAttribute('data-testid')||null, hit:q.vis(n)}))};
  });
  out.guestLinkish = await page.evaluate(()=>{
    const q=window.__qa;
    const txt=(document.body.innerText||'');
    const m=txt.match(/https?:\/\/[^\s]+/g);
    return {urls:(m||[]).slice(0,5),
      copyButtons:[...document.querySelectorAll('button')].filter(q.vis).map(q.nameOf).filter(n=>/copy|link|guest/i.test(n)).slice(0,8)};
  });
  return out;
};
