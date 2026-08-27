import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const NAME=process.env.QA_CHIP||'QA-E Delete probe';
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  out.chips = await page.evaluate(`(() => [...document.querySelectorAll('[data-testid="calendar-event-chip"]')].map(c=>(c.innerText||'').replace(/\\s+/g,' ').slice(0,36)))()`);
  out.hasTarget = out.chips.some(c=>c.includes(NAME));
  out.apiHas = await page.evaluate(`(async()=>{
    const from=new Date(Date.now()-2*864e5).toISOString(), to=new Date(Date.now()+3*864e5).toISOString();
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from='+from+'&to='+to,{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.meetings||j.events||j.data||[];
    return {n:a.length, titles:a.map(m=>m.title+'/'+(m.status||'?')).slice(0,10)}; })()`);
  out.notifs = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/notifications?limit=10',{credentials:'include'});const j=await r.json().catch(()=>({}));
    const a=j?.notifications||[]; return a.map(n=>String(n.title||'').slice(0,30)+' | '+String(n.body||'').slice(0,50)); })()`);
  return out;
};
