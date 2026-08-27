import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  for (const tab of ['people','channels']) {
    await page.goto(`${BASE}/w/${WS}/directories?tab=${tab}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4500);
    out[tab] = await page.evaluate(()=>{
      const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
      const m=document.querySelector('main')||document.body;
      // enumerate EVERYTHING interactive, no tag or text filter
      const els=[...m.querySelectorAll('button,a,input,select,[role=button],[role=tab],[role=combobox],[role=switch],[role=checkbox],[role=radio],label,summary')].filter(vis);
      return {controls: els.map(e=>({
          t:e.tagName.toLowerCase()+(e.type?`[${e.type}]`:''),
          l:(e.getAttribute('aria-label')||e.placeholder||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,40),
          exp:e.getAttribute('aria-expanded'), sel:e.getAttribute('aria-selected')
        })).slice(0,40),
        head: m.innerText.replace(/\s+/g,' ').slice(0,240)};
    });
  }
  return out;
};
