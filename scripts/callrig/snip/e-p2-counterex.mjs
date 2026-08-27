import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  const notif = `(async () => { const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
     const d=await r.json(); const a=d.notifications||[];
     return {n:a.length, total:d.total, unread:d.unread_count,
             rows:a.map(x=>({id:x.id.slice(-6), read:x.read, ev:x.event_type, body:(x.body||'').slice(0,30)}))}; })()`;
  await page.goto(BASE+'/w/'+WS+'/chat/mentions', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.notifBefore = await page.evaluate(notif);
  const mtabs = `(() => { ${VISFN}
     const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
     return {tabs:(t.match(/All \\(\\d+\\)\\s*Unread \\(\\d+\\)/)||['(none)'])[0],
             body:t.slice(0,190),
             ctls:[...new Set([...m.querySelectorAll('button')].filter(vis)
               .map(b=>(b.textContent||'').trim()).filter(x=>x&&x.length<24))].slice(0,8)}; })()`;
  out.mentionsBefore = await page.evaluate(mtabs);
  // mark the mention notification read via the product's own bell action path
  const id = await page.evaluate(`(async () => { const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
     const d=await r.json(); const a=(d.notifications||[]).find(x=>/mention/i.test(x.event_type||'')||/mention history probe/.test(x.body||''));
     return a? a.id:null; })()`);
  out.targetId = id? id.slice(-6):null;
  if(id){ await page.evaluate(`(async () => { await fetch('/api/v1/notifications/read',{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'}, body:JSON.stringify({notification_ids:['${id}']})}); })()`); }
  await page.waitForTimeout(3500);
  out.notifAfter = await page.evaluate(notif);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(8000);
  out.mentionsAfter = await page.evaluate(mtabs);
  return out;
};
