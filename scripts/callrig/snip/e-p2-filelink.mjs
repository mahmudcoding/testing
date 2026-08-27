import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const LINK='https://airion-cargo.store/w/W4QEF1XTURESO01/files?file=F4OWBD79HC09BRJ';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(LINK, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.url = page.url().replace(/^https:\/\/[^/]+/,'');
  out.screen = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const panels=[...document.querySelectorAll('aside,[role=dialog],[class*=detail]')].filter(boxVis).filter(e=>/Details|qa-e-image/i.test(e.innerText||''));
    const p=panels[panels.length-1];
    return { mainText:(document.querySelector('main')?.innerText||'').replace(/\\n+/g,' | ').slice(0,300),
      panelOpen: !!p, panelText: p? (p.innerText||'').replace(/\\n+/g,' | ').slice(0,260):null,
      imgs:[...document.querySelectorAll('img')].filter(vis).map(i=>i.naturalWidth+'x'+i.naturalHeight+' '+String(i.getAttribute('src')||'').slice(0,50)).slice(0,3) }; })()`);
  out.apiDirect = await page.evaluate(`(async()=>{ const r=await fetch('/api/v1/files/F4OWBD79HC09BRJ/content',{credentials:'include'});
    return {s:r.status, ct:r.headers.get('content-type'), len:r.headers.get('content-length')}; })()`);
  return out;
};
