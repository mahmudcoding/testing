import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, cx, cy) => { await page.mouse.move(cx,cy); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); await page.waitForTimeout(3000); };
export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', r=>{ const u=r.url(); if(/favorite/i.test(u))
    net.push(r.request().method()+' '+r.status()+' '+u.split('/api/v1/')[1]?.slice(0,50)); });
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const apiFavs = `(async () => { const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
     const j=await r.json(); return (j.files||[]).filter(f=>f.is_favorite).map(f=>f.filename); })()`;
  out.favsBefore = await page.evaluate(apiFavs);
  // find a favourite toggle on the video row
  const t = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const el=[...m.querySelectorAll('*')].filter(vis)
       .find(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                 return /e2video\\.mp4/.test(own);});
     if(!el) return {err:'row not found'};
     const row=el.closest('li,[role=row],div[class*=group]')||el.parentElement;
     const btns=[...row.querySelectorAll('button')].map(b=>({al:(b.getAttribute('aria-label')||'').slice(0,26),
        tx:(b.innerText||'').trim().slice(0,16), vis:vis(b)?1:0}));
     const fav=[...row.querySelectorAll('button')].find(b=>/favou?rite|star/i.test(b.getAttribute('aria-label')||''));
     if(!fav) return {err:'no favourite control', btns};
     const r=fav.getBoundingClientRect();
     return {label:fav.getAttribute('aria-label'), pressed:fav.getAttribute('aria-pressed'),
             cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.toggle = t;
  if(t && t.cx!==undefined){
    await mc(page, t.cx, t.cy);
    out.net = net.slice(0,2);
    out.favsAfterClick = await page.evaluate(apiFavs);
    await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9500);
    out.favsAfterReload = await page.evaluate(apiFavs);
    out.uiAfterReload = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main');
       const el=[...m.querySelectorAll('*')].filter(vis)
         .find(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                   return /e2video\\.mp4/.test(own);});
       if(!el) return null;
       const row=el.closest('li,[role=row],div[class*=group]')||el.parentElement;
       const fav=[...row.querySelectorAll('button')].find(b=>/favou?rite|star/i.test(b.getAttribute('aria-label')||''));
       return fav?{label:fav.getAttribute('aria-label'), pressed:fav.getAttribute('aria-pressed')}:null; })()`);
  }
  return out;
};
