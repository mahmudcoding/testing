import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const clickLabel = async (page, label) => {
  const t = await page.evaluate(`(() => { ${VISFN}
     const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
       .find(x=>(x.innerText||'').trim()===${JSON.stringify(label)});
     if(!b) return null; const r=b.getBoundingClientRect();
     return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  if(!t) return false;
  await page.mouse.move(t.cx,t.cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(2800); return true;
};
export default async ({page}) => {
  const out={};
  out.clock = await page.evaluate(`(() => { const n=new Date();
     return {local:n.toString().slice(0,24), utcDate:n.toISOString().slice(0,10)}; })()`).catch(()=>null);
  // 1. Files list date column
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.files = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
     const j=await r.json(); const arr=j.files||[];
     const t=(document.querySelector('main').innerText||'').replace(/\\s+/g,' ');
     const newest=arr.map(f=>f.created_at).sort().pop();
     const n=new Date(); const nd=new Date(newest);
     const sameLocalDay = nd.toDateString()===n.toDateString();
     return {newestCreatedAt:newest, newestIsTodayLocal:sameLocalDay,
             labelsOnScreen:[...new Set((t.match(/\\b(Today|Yesterday|Сегодня|Вчера)\\b/g)||[]))],
             screenSample:t.slice(t.indexOf('Sort:'), t.indexOf('Sort:')+180)}; })()`);
  // 2. month view today marker
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await clickLabel(page,'Month');
  await page.waitForTimeout(2500);
  out.monthToday = await page.evaluate(`(() => { ${VISFN}
     const m=document.querySelector('main');
     const marked=[...m.querySelectorAll('[aria-current],[data-today="true"]')]
       .map(e=>{const n=e.querySelector('[data-testid^="month-day-num-"]')||e.closest('[data-testid="calendar-month-cell"]')?.querySelector('[data-testid^="month-day-num-"]');
                return n?n.getAttribute('data-testid').replace('month-day-num-',''):(e.getAttribute('data-testid')||e.tagName);});
     const n=new Date();
     const localToday=n.getFullYear()+'-'+String(n.getMonth()+1).padStart(2,'0')+'-'+String(n.getDate()).padStart(2,'0');
     return {markedCells:[...new Set(marked)].slice(0,4), localToday, utcToday:n.toISOString().slice(0,10)}; })()`);
  return out;
};
