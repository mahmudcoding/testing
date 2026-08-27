import {WS, BASE} from './e-p2-helpers.mjs';
const MINUTES = Number(process.env.QA_MIN || 26);
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const trace=[]; let last='';
  const samples = Math.floor(MINUTES*60/20);
  for (let i=0;i<samples;i++){
    const s = await page.evaluate(`(async()=>{
      const r=await fetch('/api/v1/notifications?limit=30',{credentials:'include'});
      const j=await r.json().catch(()=>({})); const a=j?.notifications||[];
      const rel=a.filter(n=>/Rem control|Rem five|Reminder fire/i.test(String(n.body||'')+String(n.title||'')));
      return {n:a.length, rel: rel.map(x=>String(x.title||'')+' :: '+String(x.body||'').slice(0,72)).join('  ||  ')}; })()`);
    const stamp = new Date(Date.now()).toISOString().slice(11,19);
    const line = 'total='+s.n+' relevant=['+s.rel+']';
    if (line !== last) { trace.push(stamp+'Z  '+line); last = line; }
    await page.waitForTimeout(20000);
  }
  return {polledMinutes: MINUTES, transitions: trace};
};
