import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const COUNT = `(async () => { const r=await fetch('/api/v1/notifications?limit=100',{credentials:'include'});
   const j=await r.json(); const a=j.notifications||j.data||j.items||[];
   return {total:a.length, unread:a.filter(x=>!x.read).length}; })()`;
export default async ({page}) => {
  const out={}; const net=[];
  page.on('response', r=>{ const u=r.url(); if(/notification/i.test(u)&&r.request().method()!=='GET')
    net.push(r.request().method()+' '+r.status()+' '+u.split('/api/v1/')[1].slice(0,50)); });
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.before = await page.evaluate(COUNT);
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  out.bellBefore = await bell.getAttribute('aria-label');
  const bb = await bell.boundingBox();
  await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await page.waitForTimeout(250);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(3000);
  const mk = page.locator('button').filter({hasText:/^Mark all as read$/}).last();
  const mb = await mk.boundingBox();
  await page.mouse.move(mb.x+mb.width/2, mb.y+mb.height/2); await page.waitForTimeout(300);
  await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
  await page.waitForTimeout(5000);
  out.net = net.slice(0,3);
  out.afterClick = await page.evaluate(COUNT);
  out.panelNow = await page.evaluate(`(() => { ${VISFN}
     const p=[...document.querySelectorAll('[role=dialog],[role=menu],[class*=popover],[class*=Popover]')]
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     return p?(p.innerText||'').replace(/\\s+/g,' ').slice(0,120):'(panel gone)'; })()`);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1200);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9000);
  out.afterReload = await page.evaluate(COUNT);
  out.bellAfter = await page.locator('button[aria-label^="Notifications"]').first().getAttribute('aria-label');
  return out;
};
