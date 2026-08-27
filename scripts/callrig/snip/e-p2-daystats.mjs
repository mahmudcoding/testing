import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, loc) => { try{ await loc.scrollIntoViewIfNeeded(); }catch(e){}
  await page.waitForTimeout(300); const b=await loc.boundingBox(); if(!b) return false;
  await page.mouse.move(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(180);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up();
  await page.waitForTimeout(2000); return true; };
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  await mc(page, page.locator('main button').filter({hasText:/^Day$/}).last());
  await page.waitForTimeout(3000);
  return await page.evaluate(`(async () => {
    const m=document.querySelector('main');
    const t=(m.innerText||'').replace(/\\s+/g,' ');
    const hdr=t.slice(0,200);
    // the day the view is showing
    const dm=t.match(/(\\d{1,2})\\s+(January|February|March|April|May|June|July|August|September|October|November|December)\\s+(\\d{4})/);
    const months={January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12};
    let from,to;
    if(dm){ const d=new Date(Date.UTC(+dm[3], months[dm[2]]-1, +dm[1]));
      // day boundaries in Asia/Tashkent = UTC+5
      from=new Date(d.getTime()-5*3600*1000).toISOString();
      to=new Date(d.getTime()+19*3600*1000).toISOString(); }
    const r=await fetch('/api/v1/calendar/meetings?workspace_id=${WS}&from='+encodeURIComponent(from)+'&to='+encodeURIComponent(to),{credentials:'include'});
    const j=await r.json(); const arr=j.meetings||j.data||j.items||[];
    let mins=0; const durs=[];
    for(const x of arr){ const s=new Date(x.starts_at), e=new Date(x.ends_at);
      const d=Math.round((e-s)/60000); durs.push(d); mins+=d; }
    return {header:hdr.slice(0,150), dayParsed:dm?dm[0]:null, from, to,
            uiMeetings:(t.match(/meetings\\s*(\\d+)/i)||[])[1],
            uiHours:(t.match(/h\\s*([\\d.]+)/i)||[])[1],
            uiParticipants:(t.match(/participants\\s*(\\d+)/i)||[])[1],
            apiCount:arr.length, apiTotalMinutes:mins, apiTotalHours:Math.round(mins/60*10)/10,
            durationsSeen:[...new Set(durs)].sort((a,b)=>a-b)}; })()`);
};
