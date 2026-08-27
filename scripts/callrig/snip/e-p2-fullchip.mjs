import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001/search?q=probe`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const m=document.querySelector('main')||document.body;
    const hits=[...m.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0 && /in #/.test(e.textContent||''))
      .map(e=>({tag:e.tagName, txt:(e.textContent||'').replace(/\s+/g,' ').trim().slice(0,60),
        isPlaceholder: e.tagName==='INPUT'}));
    const inputs=[...m.querySelectorAll('input')].filter(vis).map(e=>({ph:e.placeholder, v:e.value}));
    const removable=[...m.querySelectorAll('button')].filter(vis)
      .map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim())
      .filter(x=>/remove|снять|×|✕/i.test(x));
    return {leafHitsForInHash:hits, inputs, removableControls:removable,
      scopedRequestVisibleInUrl: location.pathname.includes('/c/')};
  });
};
