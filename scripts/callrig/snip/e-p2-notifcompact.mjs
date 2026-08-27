import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.notifications||[];
    return {total:j.total,
      messaging: a.filter(n=>String(n.category||'')==='messaging')
        .map(n=>'type'+n.type+' '+n.event_type+' key='+n.title_key+' title="'+n.title+'" actor='+n.actor_name+' body="'+String(n.body||'').slice(0,44)+'"'),
      otherCats: [...new Set(a.map(n=>n.category))]}; })()`);
};
