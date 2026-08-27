import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  out.page = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main')||document.body;
    return {text:(m.innerText||'').replace(/\\n+/g,' | ').slice(0,450),
      ctrls: interactives(m).map(x=>x.label.slice(0,24)).join(' | ').slice(0,500)}; })()`);
  out.apiFiles = await page.evaluate(`(async()=>{ const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own',{credentials:'include'}); const t=await r.text();
    try{ const j=JSON.parse(t); const a=j.files||j.data||j.items||[];
      return {s:r.status, n:a.length, rows:a.map(f=>(f.name||f.file_name||'?')+' id='+(f.id||'?')+' fav='+(f.is_favorite??f.favorite??'?')).slice(0,6)};
    }catch(e){ return {s:r.status, raw:t.slice(0,200)}; } })()`);
  return out;
};
