import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, cx, cy) => { await page.mouse.move(cx,cy); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); await page.waitForTimeout(2800); };
export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', r=>{ const u=r.url(); if(/favorite/i.test(u))
    net.push(r.request().method()+' '+r.status()+' '+String(u.split('/api/v1/')[1]).slice(0,50)); });
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const apiFavs = `(async () => { const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
     const j=await r.json(); return (j.files||[]).filter(f=>f.is_favorite).map(f=>f.filename); })()`;
  out.favsBefore = await page.evaluate(apiFavs);
  // open the video file
  const t = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const el=[...m.querySelectorAll('*')].filter(vis)
       .find(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                 return /e2video\\.mp4/.test(own);});
     const r=el.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  await mc(page, t.cx, t.cy);
  await page.waitForTimeout(3500);
  // click More actions inside the viewer
  const more = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog],aside')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
     if(!d) return null;
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/More actions/i.test(x.getAttribute('aria-label')||x.innerText||''));
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.moreFound = !!more;
  if(more){ await mc(page, more.cx, more.cy);
    out.menu = await page.evaluate(`(() => { ${VISFN}
       return [...document.querySelectorAll('[role=menuitem],[role=option],[role=menu] button')].filter(vis)
         .map(e=>({tx:(e.innerText||'').trim().replace(/\\s+/g,' ').slice(0,26),
                   cx:Math.round(e.getBoundingClientRect().x+e.getBoundingClientRect().width/2),
                   cy:Math.round(e.getBoundingClientRect().y+e.getBoundingClientRect().height/2)})); })()`);
    const fav=(out.menu||[]).find(m=>/favou?rite/i.test(m.tx));
    out.favItem = fav||null;
    if(fav){ await mc(page, fav.cx, fav.cy); await page.waitForTimeout(3500);
      out.net = net.slice(0,2);
      out.favsAfter = await page.evaluate(apiFavs);
      await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000);
      out.favsAfterReload = await page.evaluate(apiFavs); } }
  return out;
};
