import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.membersPayload = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/workspaces/${WS}/members?limit=50',{credentials:'include'});
     const d=await r.json(); const a=(d.members||[]).find(m=>m.name==='QA Alice')||{};
     return { keys:Object.keys(a).join(','), custom_status:JSON.stringify(a.custom_status??'(absent)'),
              presence:JSON.stringify(a.presence??'(absent)') }; })()`);
  out.row = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const rows=[...m.querySelectorAll('div,li')].filter(e=>vis(e)&&/QA Alice/.test(e.innerText||'')&&(e.innerText||'').length<170);
     const inner=rows.filter(r=>!rows.some(o=>o!==r&&r.contains(o)));
     const t=inner[0]?(inner[0].innerText||'').replace(/\\s+/g,' ').trim():null;
     return { text:t, hasStatus:/Vacation|🌴/.test(t||'') }; })()`);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/Open QA Alice's profile/i.test(x.getAttribute('aria-label')||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(4500);
    out.popup = await page.evaluate(`(() => { ${VISFN}
      const d=[...document.querySelectorAll('[role=dialog],aside,[class*=popover]')]
        .filter(e=>{const r=e.getBoundingClientRect(); return r.width>120&&r.height>80;}).pop();
      if(!d) return {none:true};
      const x=(d.innerText||'').replace(/\\s+/g,' ');
      return {text:x.slice(0,180), hasStatus:/Vacation|🌴/.test(x)}; })()`);
  }
  return out;
};
