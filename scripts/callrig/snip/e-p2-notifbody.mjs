import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/notifications?limit=20',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.notifications||[];
    return a.map(n=>({type:n.type, title:n.title, actor:n.actor_name, titleKey:n.title_key,
      category:n.category, eventType:n.event_type, bodyLen:String(n.body||'').length,
      body:String(n.body||'').slice(0,180)})); })()`);
};
