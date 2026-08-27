import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  // park AWAY from the channel under test so nothing marks it read
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.notifications||[];
    return {parkedAt:location.pathname, total:j.total, unread:j.unread_count,
      rows:a.map(n=>'type'+n.type+' '+String(n.category||'?')+' '+String(n.event_type||'?')+' :: '+String(n.title||'').slice(0,26))}; })()`);
};
