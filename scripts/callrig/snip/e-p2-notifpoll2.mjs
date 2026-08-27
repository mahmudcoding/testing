import {WS, BASE} from './e-p2-helpers.mjs';
const SEC = Number(process.env.QA_SEC || 60);
export default async ({page}) => {
  // do NOT navigate — stay parked where the baseline left us
  const trace=[]; let last='';
  const n = Math.floor(SEC/3);
  for (let i=0;i<n;i++){
    const s = await page.evaluate(`(async()=>{
      const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
      const j=await r.json().catch(()=>({})); const a=j.notifications||[];
      return {total:j.total, cats:a.map(x=>String(x.category||'?')+'/'+String(x.event_type||'?')).join(',')}; })()`);
    const line='total='+s.total+' :: '+s.cats;
    if (line!==last){ trace.push('t+'+String(i*3).padStart(2,'0')+'s  '+line); last=line; }
    await page.waitForTimeout(3000);
  }
  return {parkedAt: page.url().replace(/^https:\/\/[^/]+/,''), transitions: trace};
};
