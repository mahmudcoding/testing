import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/chat/mentions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const mtabs = `(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     return {tabs:(t.match(/All \\(\\d+\\)\\s*Unread \\(\\d+\\)/)||['(none)'])[0],
             rowVisible:/mention history probe/.test(t)}; })()`;
  out.before = await page.evaluate(mtabs);
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>/^Mark all read$/i.test((x.textContent||'').trim()));
     if(!b) return {none:true}; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t.none){ await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(300);
    await page.mouse.down(); await page.waitForTimeout(130); await page.mouse.up(); await page.waitForTimeout(6000); }
  out.afterMarkRead = await page.evaluate(mtabs);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  out.afterReload = await page.evaluate(mtabs);
  out.notifNow = await page.evaluate(`(async () => { const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
     const d=await r.json(); const a=d.notifications||[];
     return {n:a.length, total:d.total, anyRead:a.filter(x=>x.read).length,
             hasMentionOne:a.some(x=>/mention history probe/.test(x.body||''))}; })()`);
  return out;
};
