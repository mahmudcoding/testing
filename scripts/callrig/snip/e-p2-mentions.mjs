import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const errs=[]; page.on('pageerror',e=>errs.push((e.message||'').slice(0,80)));
  const bad=[]; page.on('response',r=>{const u=r.url(); if(/\/api\/v1\//.test(u)&&r.status()>=400) bad.push(r.status()+' '+u.replace(/https?:\/\/[^/]+/,'').slice(0,60));});
  await page.goto(`${BASE}/w/${WS}/chat/saved`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const ui = await page.evaluate(()=>{
    const vis=e=>{let x=e,o=1;while(x&&x!==document.documentElement){const s=getComputedStyle(x);if(s.display==='none'||s.visibility==='hidden')return false;o*=parseFloat(s.opacity||'1');x=x.parentElement;}const r=e.getBoundingClientRect();return o>0.01&&r.width>0&&r.height>0;};
    const m=document.querySelector('main');
    const rows=[...m.querySelectorAll('[data-message-id],[role=listitem],li,article')].filter(vis);
    const d=document.documentElement;
    return {head:m.innerText.replace(/\s+/g,' ').slice(0,200),
      rowCount:rows.length,
      controls:[...m.querySelectorAll('button,a')].filter(vis)
        .map(e=>(e.getAttribute('aria-label')||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,26)).filter(Boolean).slice(0,12),
      pageHScroll:d.scrollWidth-d.clientWidth,
      clipped:[...m.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0
        && e.scrollWidth>e.clientWidth+1 && e.clientWidth>1).length};
  });
  return {ui, pageErrors:errs, badApi:[...new Set(bad)]};
};
