import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const count = `(async () => { const r=await fetch('/api/v1/notifications?limit=100',{credentials:'include'});
     const j=await r.json(); const a=j.notifications||j.data||j.items||[];
     return {n:a.length, unread:a.filter(x=>!x.read_at&&!x.is_read).length,
             keys:a[0]?Object.keys(a[0]):[], firstTitle:a[0]?String(a[0].title||a[0].body||'').slice(0,40):'-'}; })()`;
  const out={};
  out.before = await page.evaluate(count);
  // open the bell
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  out.bellLabel = await bell.getAttribute('aria-label');
  const bb = await bell.boundingBox();
  await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await page.waitForTimeout(250);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(3500);
  out.panelRows = await page.evaluate(`(() => { ${VISFN}
     const p=[...document.querySelectorAll('[role=dialog],[role=menu],[class*=popover],[class*=Popover]')]
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     if(!p) return {err:'no panel'};
     const rows=[...p.querySelectorAll('[role=option],[role=menuitem],li,button')].filter(vis)
       .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,46)).filter(Boolean);
     return {head:(p.innerText||'').replace(/\\s+/g,' ').slice(0,120), n:rows.length, rows:rows.slice(0,6)}; })()`);
  // click the first notification row via real mouse
  const tgt = await page.evaluate(`(() => { ${VISFN}
     const p=[...document.querySelectorAll('[role=dialog],[role=menu],[class*=popover],[class*=Popover]')]
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     const skip=/^(Mark all as read|Notifications|All|Unread|Settings)$/;
     const c=[...p.querySelectorAll('[role=option],[role=menuitem],li,button')].filter(vis)
       .filter(e=>{const t=(e.innerText||'').replace(/\\s+/g,' ').trim(); return t.length>12 && !skip.test(t);});
     if(!c.length) return null; const r=c[0].getBoundingClientRect();
     return {tx:(c[0].innerText||'').replace(/\\s+/g,' ').trim().slice(0,44), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.clickTarget = tgt;
  if(tgt){
    await page.mouse.move(tgt.cx,tgt.cy); await page.waitForTimeout(600);
    out.pointerOn = await page.evaluate(`(() => { const e=document.elementFromPoint(${tgt.cx},${tgt.cy});
       return {hit:!!e, txt:e?(e.innerText||e.textContent||'').replace(/\\s+/g,' ').slice(0,40):''}; })()`);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    await page.waitForTimeout(5000);
  }
  out.after = await page.evaluate(count);
  out.delta = out.before.n - out.after.n;
  return out;
};
