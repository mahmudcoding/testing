import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for (const sec of ['about','account','security']) {
    await page.goto(`${BASE}/w/${WS}/settings/${sec}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    out[sec] = await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const m=document.querySelector('main')||document.body;
      const t=m.innerText.replace(/\s+/g,' ');
      return {text:t.slice(0,420),
        versionish:(t.match(/v?\d+\.\d+\.\d+[\w.-]*/g)||[]).slice(0,6),
        controls:[...m.querySelectorAll('button,a,input')].filter(vis)
          .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26))
          .filter(Boolean).slice(0,14)};
    });
  }
  return out;
};
