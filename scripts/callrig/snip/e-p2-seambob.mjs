import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  out.notif = await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/notifications?limit=5',{credentials:'include'});
    const d=await r.json(); const n=(d.notifications||[])[0]||{};
    return {title:n.title, body:n.body, payload:(n.payload||'').slice(0,140), event:n.event_type, created:n.created_at}; })()`);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3500);
  const t = await page.evaluate(`(() => { ${VISFN}
    const btns=[...document.querySelectorAll('button')].filter(vis)
      .filter(b=>/New channel message/.test((b.getAttribute('aria-label')||'')+(b.textContent||'')));
    const inner=btns.filter(b=>!btns.some(o=>o!==b&&b.contains(o)));
    const el=inner[0]; if(!el) return {none:true};
    const r=el.getBoundingClientRect();
    return {name:(el.getAttribute('aria-label')||'').replace(/\\s+/g,' ').slice(0,90),
            cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.bellButton = t;
  if(t.none) return out;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(400);
  await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
  await page.waitForTimeout(7000);
  out.landedOn = page.url().replace(/^https:\/\/[^/]+/,'').slice(0,90);
  out.dest = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const msgs=[...m.querySelectorAll('[data-message-id]')].filter(vis);
     const target=msgs.find(n=>/seam-probe/.test(n.innerText||''));
     return { msgCount:msgs.length, found:!!target,
              text: target? (target.innerText||'').replace(/\\s+/g,' ').slice(0,120):null,
              controls: target? [...new Set([...target.querySelectorAll('button,a[href]')].filter(vis)
                .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim().slice(0,24)).filter(Boolean))].slice(0,10):null }; })()`);
  return out;
};
