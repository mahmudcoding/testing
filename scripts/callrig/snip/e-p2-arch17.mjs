import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const out={};
  for (const q of ['qa-archived','e-arch-probe','qa-general']) {
    await page.locator('button[aria-label="Search QA Workspace E"]').click();
    await page.waitForTimeout(1500);
    await page.locator('input[placeholder*="Type :in"]').fill(q);
    await page.waitForTimeout(3800);
    out[q] = await page.evaluate(()=>{
      const vis = e => { let x=e,o=1; while(x&&x!==document.documentElement){const s=getComputedStyle(x); if(s.display==='none'||s.visibility==='hidden')return false; o*=parseFloat(s.opacity||'1'); x=x.parentElement;} const r=e.getBoundingClientRect(); return o>0.01&&r.width>0&&r.height>0; };
      const dlg=[...document.querySelectorAll('[role=dialog]')].filter(vis)[0];
      if(!dlg) return {noDialog:true};
      const t=dlg.innerText.replace(/\s+/g,' ');
      const tabs=[...dlg.querySelectorAll('button,[role=tab]')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim())
        .filter(s=>/^(All|Messages|Channels|People|Files)\d+$/.test(s));
      const chanRows=[...dlg.querySelectorAll('button,a,[role=option]')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||'').trim()).filter(s=>/^Channel/i.test(s));
      return {tabs, chanRows, snippet: t.slice(t.indexOf('All'), t.indexOf('All')+260)};
    });
    await page.keyboard.press('Escape'); await page.waitForTimeout(900);
  }
  return out;
};
