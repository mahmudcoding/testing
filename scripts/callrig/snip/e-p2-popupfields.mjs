import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, cx, cy) => { await page.mouse.move(cx,cy); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); await page.waitForTimeout(3200); };
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  // who has department/position at all?
  out.api = await page.evaluate(`(async () => {
     const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}return {st:r.status,j};};
     const me=await g('/api/v1/auth/me'); const u=(me.j&&(me.j.user||me.j))||{};
     const ids=['U4QEALICE000001','U4QEBOB00000001','U4QEOWNER000001'];
     const per={};
     for(const id of ids){ const r=await g('/api/v1/users/'+id);
       const x=(r.j&&(r.j.user||r.j))||{};
       per[id.slice(4,9)]={st:r.st, dep:x.department===undefined?'absent':x.department,
                           pos:(x.position!==undefined?x.position:(x.jobTitle!==undefined?x.jobTitle:'absent')),
                           keys:Object.keys(x).slice(0,14)}; }
     return {meDept:u.department, meJob:u.jobTitle, perUser:per}; })()`);
  // open a popup for another person and dump the card
  const t = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const rows=[...m.querySelectorAll('*')].filter(vis)
       .filter(e=>{const own=[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');
                   return /^QA Bob$/.test(own.trim());});
     if(!rows.length) return null; const el=rows[rows.length-1];
     const r=el.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(t){ await mc(page, t.cx, t.cy);
    out.popup = await page.evaluate(`(() => { ${VISFN}
       const d=[...document.querySelectorAll('[role=dialog],[class*=popover],[class*=Popover]')]
         .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>120;}).pop();
       if(!d) return {open:false};
       const t=(d.innerText||'').replace(/\\s+/g,' ');
       return {open:true, text:t.slice(0,220),
               hasDept:/department|отдел/i.test(t), hasTitle:/title|position|должност/i.test(t)}; })()`); }
  return out;
};
