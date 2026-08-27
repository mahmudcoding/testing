import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/settings/profile`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const m=document.querySelector('main')||document.body;
    return {head:m.innerText.replace(/\s+/g,' ').slice(0,260),
      fields:[...m.querySelectorAll('input,textarea,select')].filter(vis)
        .map(e=>({t:e.tagName.toLowerCase()+(e.type?`[${e.type}]`:''),
          lbl:(e.getAttribute('aria-label')||e.placeholder||'').slice(0,32), v:(e.value||'').slice(0,28)})),
      buttons:[...m.querySelectorAll('button')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26)).slice(0,12)};
  });
};
