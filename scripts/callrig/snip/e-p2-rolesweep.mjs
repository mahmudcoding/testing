import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const snap = `(() => { ${VISFN}
  const m=document.querySelector('main')||document.body;
  return { main:(m.innerText||'').replace(/\\n+/g,' | ').slice(0,340),
    ctrls: interactives(m).map(x=>x.label.slice(0,22)).join(' | ').slice(0,300),
    sidebarChannels: [...document.querySelectorAll('a[href*="/c/"],a[href*="/d/"]')].filter(vis).map(a=>(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,20)),
    sidebarText: (()=>{const n=document.querySelector('nav'); return n? (n.innerText||'').replace(/\\n+/g,' | ').slice(0,200):null;})() }; })()`;
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  for (const [tag,path] of [['directories','/directories?tab=people'],['dirChannels','/directories?tab=channels'],
                             ['calendar','/calendar'],['files','/files'],['saved','/chat/saved'],['mentions','/chat/mentions']]) {
    await page.goto(BASE+'/w/'+WS+path, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    out[tag] = await page.evaluate(snap);
  }
  return out;
};
