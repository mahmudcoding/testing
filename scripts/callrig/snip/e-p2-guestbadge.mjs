import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.api = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/workspaces/${WS}/members?limit=50',{credentials:'include'});
    const d=await r.json(); const a=d.members||[];
    return { n:a.length, guests:a.filter(m=>m.is_guest===true).map(m=>m.name),
             nonGuests:a.filter(m=>m.is_guest!==true).length }; })()`);
  out.ui = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\\s+/g,' ');
    // the row for the guest account
    const rows=[...m.querySelectorAll('div,li')].filter(e=>vis(e)&&/QA Guest/.test(e.innerText||'')&&(e.innerText||'').length<160);
    const inner=rows.filter(r=>!rows.some(o=>o!==r&&r.contains(o)));
    return { guestRow: inner[0]? (inner[0].innerText||'').replace(/\\s+/g,' ').trim().slice(0,90):null,
             pageMentionsGuest: /guest/i.test(t),
             occurrences:(t.match(/guest/ig)||[]).length,
             fullText:t.slice(0,260) }; })()`);
  // and the profile popup for the guest
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/Open QA Guest's profile/i.test(x.getAttribute('aria-label')||''));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){
    await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up();
    await page.waitForTimeout(4000);
    out.popup = await page.evaluate(`(() => { ${VISFN}
      const d=[...document.querySelectorAll('[role=dialog],aside,[class*=popover]')]
        .filter(e=>{const r=e.getBoundingClientRect(); return r.width>120&&r.height>80;}).pop();
      if(!d) return {none:true};
      const t=(d.innerText||'').replace(/\\s+/g,' ');
      return { text:t.slice(0,200), mentionsGuest:/guest/i.test(t.replace(/QA Guest/g,'')) }; })()`);
  }
  return out;
};
