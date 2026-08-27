import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const routes=['/settings/account','/settings/profile','/settings/appearance','/settings/privacy',
                '/settings/sessions','/settings/security','/settings/notifications','/directories','/files','/calendar'];
  const out={};
  for (const r of routes) {
    await page.goto(`${BASE}/w/${WS}${r}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4200);
    out[r] = await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r2=e.getBoundingClientRect();return o>0.01&&r2.width>0&&r2.height>0;};
      const m=document.querySelector('main'); if(!m) return {noMain:true};
      // a heading followed by a short descriptive paragraph = a section subtitle
      const secs=[...m.querySelectorAll('h2,h3')].filter(vis).map(h=>{
        let sib=h.nextElementSibling, sub=null;
        for(let i=0;i<2&&sib;i++){ const t=(sib.textContent||'').trim();
          if(sib.tagName==='P' && t.length>15 && t.length<200){ sub=t; break; } sib=sib.nextElementSibling; }
        return sub? {h:(h.textContent||'').trim().slice(0,34), sub:sub.replace(/\s+/g,' ').slice(0,120)} : null;
      }).filter(Boolean);
      return {sections:secs.slice(0,10)};
    });
  }
  return out;
};
