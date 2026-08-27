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
const read = `(() => {
   const m=document.querySelector('main');
   const t=(m.innerText||'').replace(/\\s+/g,' ');
   const now=new Date();
   return {
     dayHeading:(t.match(/(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\\s+\\d{1,2}\\s+\\w+\\s+\\d{4}/i)||[''])[0],
     tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
     localDate: now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0'),
     utcDate: now.toISOString().slice(0,10),
     localTime: now.toTimeString().slice(0,5) }; })()`;
export default async ({page, ctx}) => {
  const out={};
  const cdp = await ctx.newCDPSession(page);
  for(const tz of ['Asia/Tashkent','Europe/London','America/New_York']){
    try{ await cdp.send('Emulation.setTimezoneOverride', {timezoneId: tz}); }catch(e){ out[tz]={err:String(e).slice(0,60)}; continue; }
    await page.goto('about:blank'); await page.waitForTimeout(1000);
    await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(10000);
    await clickLabel(page,'Day');
    const r = await page.evaluate(read);
    out[tz] = {...r, dayViewMatchesLocal: r.dayHeading.includes(String(parseInt(r.localDate.slice(8),10))),
                     dayViewMatchesUTC: r.dayHeading.includes(String(parseInt(r.utcDate.slice(8),10)))};
  }
  try{ await cdp.send('Emulation.setTimezoneOverride', {timezoneId:'Asia/Tashkent'}); }catch(e){}
  return out;
};
