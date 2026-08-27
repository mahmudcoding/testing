import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.me = await page.evaluate(`(async () => { const r=await fetch('/api/v1/auth/me',{credentials:'include'});
     const j=await r.json().catch(()=>({})); return j.email||null; })()`);
  out.rowControls = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const cands=[...m.querySelectorAll('*')].filter(e=>{
        const t=(e.textContent||'');
        return /QA Carol/.test(t) && [...e.querySelectorAll('button')].some(b=>/^Call$/.test((b.textContent||'').trim()));});
     if(!cands.length) return {none:true};
     cands.sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length);
     return [...cands[0].querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,22)); })()`);
  // profile popup controls
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/Open QA Carol's profile/i.test(x.getAttribute('aria-label')||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(4500);
    out.popupControls = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog],aside,[class*=popover]')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>120&&r.height>80;}).pop();
       if(!d) return {none:true};
       return [...new Set([...d.querySelectorAll('button')].filter(vis)
         .map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,20)))].slice(0,10); })()`);
  }
  return out;
};
