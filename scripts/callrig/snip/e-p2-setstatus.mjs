import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET') api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,40)+' | '+(r.request().postData()||'').slice(0,110)); });
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const openMenu = async () => {
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelectorAll('button')].filter(vis)
         .find(x=>/^Profile$/.test((x.getAttribute('aria-label')||x.textContent||'').trim()));
       const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(3000);
  };
  await openMenu();
  api.length=0;
  const pick = await page.evaluate(`(() => { ${VISFN}
     const cands=[...document.querySelectorAll('[role=menuitem],[role=menu] button,[data-state=open] button')].filter(vis)
       .filter(x=>/Vacation/.test(x.textContent||''));
     const inner=cands.filter(c=>!cands.some(o=>o!==c&&c.contains(o)));
     const e=inner[0]||cands[0]; if(!e) return {none:true};
     const r=e.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.pick=pick;
  if(!pick.none){ await page.mouse.move(pick.cx,pick.cy); await page.waitForTimeout(280);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); }
  await page.waitForTimeout(6000);
  out.api = api.slice(0,3);
  out.myStatus = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/users/U4QEALICE000001/status',{credentials:'include'});
     const t=await r.text(); return {st:r.status, body:t.slice(0,180)}; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  out.ownRow = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     return t.slice(0,220); })()`);
  return out;
};
