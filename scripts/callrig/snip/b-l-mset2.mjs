/* sector L: open Meeting settings and find the guest link */
import { DOM } from './lib.mjs';
export default async ({ page }) => {
  await page.evaluate(DOM);
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  const out={};
  const before = await page.evaluate(()=>[...document.querySelectorAll('[data-testid]')].map(n=>n.getAttribute('data-testid')));
  await page.evaluate(()=>{const b=document.querySelector('[data-testid="call-controls-settings-toggle"]'); b&&b.click();});
  await page.waitForTimeout(3000);
  await page.evaluate(DOM);
  const after = await page.evaluate(()=>[...document.querySelectorAll('[data-testid]')].map(n=>n.getAttribute('data-testid')));
  out.newTestids=[...new Set(after)].filter(t=>!before.includes(t));
  out.panel = await page.evaluate(()=>{
    const q=window.__qa;
    // the settings surface: pick the visible container holding a known settings string
    const all=[...document.querySelectorAll('div,aside,section')].filter(q.boxVis)
      .filter(n=>/Who can join|Meeting settings|Guest link|Video quality|Reactions/i.test(n.innerText||''));
    all.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    const p=all[0];
    if(!p) return null;
    return {tag:p.tagName, testid:p.getAttribute('data-testid'),
      text:(p.innerText||'').replace(/\s+/g,' ').trim().slice(0,1400),
      controls:[...p.querySelectorAll('button,input,select,[role=switch],[role=slider],[role=combobox],[role=radio]')]
        .filter(q.boxVis).map(n=>({tag:n.tagName, role:n.getAttribute('role')||n.type||null,
          name:q.nameOf(n).replace(/\s+/g,' ').trim().slice(0,60), val:n.value||n.getAttribute('aria-valuenow')||null,
          checked:n.getAttribute('aria-checked'), testid:n.getAttribute('data-testid')||null}))};
  });
  out.linkish = await page.evaluate(()=>{
    const t=document.body.innerText||'';
    return {urls:(t.match(/https?:\/\/[^\s]+/g)||[]).slice(0,6),
      guestWords:(t.match(/[^\n]*[Gg]uest[^\n]*/g)||[]).slice(0,6)};
  });
  return out;
};
