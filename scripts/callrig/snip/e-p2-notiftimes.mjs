import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/directories', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async()=>{
    const r=await fetch('/api/v1/notifications?limit=50',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.notifications||[];
    return a.map(n=>({created:String(n.created_at||'').slice(11,19)+'Z',
      title:String(n.title||'').slice(0,26),
      body:String(n.body||'').slice(0,84)})); })()`);
};
