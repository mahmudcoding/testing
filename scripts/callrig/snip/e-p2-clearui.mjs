import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/status')&&m!=='GET') api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,30)+' | '+(r.request().postData()||'(no body)').slice(0,80)); });
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const openMenu = async () => {
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelectorAll('button')].filter(vis)
         .find(x=>/^Profile$/.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
       const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(3200);
  };
  await openMenu();
  out.menuWithStatusSet = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=menu],[data-state=open],[role=dialog]')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>140&&r.height>60;});
     const d=c.pop(); if(!d) return {none:true};
     return { text:(d.innerText||'').replace(/\\s+/g,' ').slice(0,300),
              items:[...new Set([...d.querySelectorAll('button,[role=menuitem]')].filter(vis)
                .map(n=>(n.getAttribute('aria-label')||n.textContent||'').replace(/\\s+/g,' ').trim()).filter(Boolean))].slice(0,16),
              pressedStates:[...d.querySelectorAll('button,[role=menuitem]')].filter(vis)
                .map(n=>((n.textContent||'').trim().slice(0,16))+'/p='+n.getAttribute('aria-pressed')+'/c='+n.getAttribute('aria-checked')).slice(0,10) }; })()`);
  // click the already-selected preset — does it toggle off?
  api.length=0;
  const t2 = await page.evaluate(`(() => { ${VISFN}
     const cands=[...document.querySelectorAll('[role=menuitem],[role=menu] button,[data-state=open] button')].filter(vis)
       .filter(x=>/Vacation/.test(x.textContent||''));
     const inner=cands.filter(c=>!cands.some(o=>o!==c&&c.contains(o)));
     const e=inner[0]; if(!e) return {none:true}; const r=e.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t2.none){ await page.mouse.move(t2.cx,t2.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); await page.waitForTimeout(5000); }
  out.afterToggle = { api:api.slice(0,3),
    status: await page.evaluate(`(async () => (await (await fetch('/api/v1/users/U4QEALICE000001/status',{credentials:'include'})).text()).slice(0,90))()`) };
  return out;
};
