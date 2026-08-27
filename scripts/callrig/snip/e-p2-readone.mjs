import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const list = `(async () => { const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
     const d=await r.json(); const a=d.notifications||[];
     return {n:a.length, total:d.total, unread_count:d.unread_count,
             rows:a.slice(0,3).map(x=>({id:x.id.slice(-6), read:x.read, body:(x.body||'').slice(0,34)}))}; })()`;
  out.before = await page.evaluate(list);
  const id = await page.evaluate(`(async () => { const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
     const d=await r.json(); return (d.notifications||[])[0]?.id||null; })()`);
  out.markedId = id? id.slice(-6):null;
  if(id){ out.mark = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/notifications/read',{method:'POST',credentials:'include',
       headers:{'Content-Type':'application/json'}, body:JSON.stringify({notification_ids:['${id}']})});
     return {st:r.status, body:(await r.text()).slice(0,80)}; })()`); }
  await page.waitForTimeout(3000);
  out.after = await page.evaluate(list);
  return out;
};
