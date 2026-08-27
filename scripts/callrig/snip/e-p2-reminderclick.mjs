import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.notifs = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/notifications?limit=10',{credentials:'include'});
     const d=await r.json();
     return (d.notifications||[]).map(n=>({ev:n.event_type, title:n.title, res:(n.resource_id||'').slice(-6)})); })()`);
  await page.locator('button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3500);
  const t = await page.evaluate(`(() => { ${VISFN}
     const btns=[...document.querySelectorAll('button')].filter(vis)
       .filter(b=>/starts soon/i.test((b.getAttribute('aria-label')||'')+(b.textContent||'')));
     const inner=btns.filter(b=>!btns.some(o=>o!==b&&b.contains(o)));
     const el=inner[0]; if(!el) return {none:true};
     const r=el.getBoundingClientRect();
     return {name:(el.getAttribute('aria-label')||'').replace(/\\s+/g,' ').slice(0,70),
             cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.target=t; if(t.none) return out;
  out.urlBefore = page.url().replace(/^https:\/\/[^/]+/,'');
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(350);
  await page.mouse.down(); await page.waitForTimeout(140); await page.mouse.up();
  await page.waitForTimeout(7000);
  out.urlAfter = page.url().replace(/^https:\/\/[^/]+/,'').slice(0,70);
  out.landed = await page.evaluate(`(() => { ${VISFN}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     const root=d||document.querySelector('main');
     return {isDialog:!!d, text:(root.innerText||'').replace(/\\s+/g,' ').slice(0,150)}; })()`);
  return out;
};
