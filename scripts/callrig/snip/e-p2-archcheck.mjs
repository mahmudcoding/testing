import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const notifs = `(async () => { const r=await fetch('/api/v1/notifications?limit=20',{credentials:'include'});
     const j=await r.json(); const a=j.notifications||j.data||j.items||[];
     return a.slice(0,4).map(x=>({t:x.title, ev:x.event_type, res:String(x.resource_id||'').slice(-6),
       body:String(x.body||'').slice(0,44)})); })()`;
  out.beforeArchive = await page.evaluate(notifs);
  // archive the probe channel
  out.archive = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/channels/C4OX3463S8ECN8X/archive',
     {method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:'{}'});
     let j=null;try{j=await r.json();}catch(e){}
     return {st:r.status, body:JSON.stringify(j||{}).slice(0,100)};})()`);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.afterArchiveApi = await page.evaluate(notifs);
  // open the bell and read the rendered rows
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  const bb = await bell.boundingBox();
  await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await page.waitForTimeout(250);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(3500);
  out.panel = await page.evaluate(`(() => { ${VISFN}
     const p=[...document.querySelectorAll('[role=dialog],[role=menu],[class*=popover],[class*=Popover]')]
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     if(!p) return {err:'no panel'};
     const rows=[...p.querySelectorAll('[role=option],[role=menuitem],li')].filter(vis)
       .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim().slice(0,64));
     return {n:rows.length, rows:rows.slice(0,5),
             hasUnknown:/Unknown channel/i.test(p.innerText||'')}; })()`);
  return out;
};
