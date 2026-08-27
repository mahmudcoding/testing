import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  // pick one of my own files that has never been shared
  out.candidates = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
     const d=await r.json(); const a=d.files||[];
     return a.filter(f=>!(f.shared_with||[]).length).map(f=>f.filename).slice(0,5); })()`);
  if(!out.candidates.length){ out.err='no unshared own file'; return out; }
  const name=out.candidates[0];
  out.chosen=name;
  const tile = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button,[role=button],a')].filter(vis)
       .find(x=>(x.getAttribute('aria-label')||x.textContent||'').includes(${JSON.stringify(name)}));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(tile.none){ out.err='tile not found for '+name; return out; }
  await page.mouse.click(tile.cx,tile.cy,{button:'right'}); await page.waitForTimeout(2200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST}
     clickDeepest(document.querySelector('[role=menu]')||document.body, /View details/i); })()`);
  await page.waitForTimeout(5000);
  out.details = await page.evaluate(`(() => {
     const strictVis = el => { const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
       let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
         if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;}
       return op>0.01; };
     const c=[...document.querySelectorAll('[role=dialog],aside,[data-state=open]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;});
     const d=c.pop(); if(!d) return '(no panel)';
     const t=(d.innerText||'').replace(/\\s+/g,' ');
     const i=t.indexOf('SHARED WITH');
     const leaves=[...d.querySelectorAll('*')].filter(e=>e.children.length===0 && strictVis(e))
       .map(e=>(e.textContent||'').trim()).filter(x=>/Not shared|SHARED WITH|Uploaded by|Shared by/.test(x));
     return {section: i>=0? t.slice(i,i+56):'(absent)', visibleLines:[...new Set(leaves)].slice(0,4)}; })()`);
  return out;
};
