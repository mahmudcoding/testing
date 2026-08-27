import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(400); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(220);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up(); return true; };
export default async ({page}) => {
  const out={};
  // ---- ALK-2850: Storage block in Files ----
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.ALK2850 = await page.evaluate(`(() => { ${VISFN}
     const t=(document.querySelector('main').innerText||'').replace(/\\s+/g,' ');
     const bars=[...document.querySelectorAll('[role=progressbar],progress,[class*=progress],[class*=Progress]')].filter(vis).length;
     const seg=[...document.querySelectorAll('[class*=segment],[class*=Segment]')].filter(vis).length;
     const cats=['Voice Message','Photo','Video','Audio','Document'].filter(c=>new RegExp(c,'i').test(t));
     return {storageText:(t.match(/Storage[\\s\\S]{0,70}/)||['(none)'])[0].replace(/\\s+/g,' '),
             hasStorageUsageHeading:/Storage Usage/i.test(t),
             nProgressBars:bars, nSegments:seg, categoriesShown:cats}; })()`);
  // ---- ALK-2522: Day view participant count ----
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const day = page.locator('button').filter({hasText:/^Day$/}).last();
  out.dayFound = await day.count();
  if(out.dayFound) await mc(page, day);
  await page.waitForTimeout(4500);
  out.ALK2522 = await page.evaluate(`(async () => {
     const t=(document.querySelector('main').innerText||'').replace(/\\s+/g,' ');
     const grab=(re)=>{const m=t.match(re); return m?m[0]:null;};
     const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-26T00:00:00.000Z&to=2026-08-27T00:00:00.000Z',{credentials:'include'});
     const j=await r.json(); const arr=j.meetings||j.data||j.items||[];
     return {header:t.slice(0,150),
             meetings:grab(/Meetings?\\s*\\d+/i), hours:grab(/Hours?\\s*[\\d.]+/i),
             participants:grab(/Participants?\\s*\\d+/i),
             apiMeetingsToday:arr.length,
             apiHasAttendees:arr.slice(0,3).map(m=>({t:(m.title||'').slice(0,18),
               att:Array.isArray(m.attendees)?m.attendees.length:(m.attendees===null?'null':typeof m.attendees),
               pc:m.participant_count===undefined?'absent':m.participant_count}))}; })()`);
  return out;
};
