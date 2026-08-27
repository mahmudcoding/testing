import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const yesno = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return 'NO CARD';
  const b=[...d.querySelectorAll('button')].filter(vis).filter(x=>/^(Yes|No)$/.test((x.textContent||'').trim()));
  return b.length? b.map(x=>(x.textContent||'').trim()+(x.disabled?':DIS':':en')).join(',') : 'no Yes/No'; })()`;
export default async ({page}) => {
  const out={};
  out.me = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});const j=await r.json().catch(()=>({}));return j?.email||'?';})()`);
  // find a meeting where this user is pending
  const list = await page.evaluate(`(async()=>{
    const from=new Date(Date.now()-2*864e5).toISOString(), to=new Date(Date.now()+3*864e5).toISOString();
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from='+from+'&to='+to,{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.meetings||[];
    return a.filter(m=>m.my_status==='pending').map(m=>({id:m.id,title:m.title,my:m.my_status})); })()`);
  out.pendingMeetings = list.map(m=>m.title+' ('+m.my+')');
  if(!list.length) return out;
  const target = list[0];
  out.target = target.title;
  // A: deep link
  await page.goto(BASE+'/w/'+WS+'/calendar/'+target.id, {waitUntil:'domcontentloaded'});
  const a=[]; for(let i=0;i<12;i++){ await page.waitForTimeout(1000); a.push(await page.evaluate(yesno)); }
  out.A_deepLink=[...new Set(a)].join(' -> ');
  out.A_byIdPayloadHasMyStatus = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/calendar/meetings/${''}'+'${target.id}',{credentials:'include'});
    const t=await r.text(); return {has_my_status: /"my_status"/.test(t), keys: (JSON.parse(t).meeting? Object.keys(JSON.parse(t).meeting).length : -1)}; })()`);
  // B: chip
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const chip=page.locator('[data-testid="calendar-event-chip"]').filter({hasText:target.title}).first();
  await chip.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); await chip.click();
  const b=[]; for(let i=0;i<8;i++){ await page.waitForTimeout(800); b.push(await page.evaluate(yesno)); }
  out.B_chipClick=[...new Set(b)].join(' -> ');
  return out;
};
