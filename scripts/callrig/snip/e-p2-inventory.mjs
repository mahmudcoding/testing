import {WS, BASE} from './e-p2-helpers.mjs';
const W2='W4OWJSPNXQJYZ5R';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  return await page.evaluate(`(async()=>{
    const g=async u=>{const r=await fetch(u,{credentials:'include'});const t=await r.text();
      try{return JSON.parse(t);}catch(e){return {raw:t.slice(0,80)};}};
    const m=await g('/api/v1/calendar/meetings?workspace_id=${WS}&from=2026-08-20T00:00:00.000Z&to=2026-12-01T00:00:00.000Z');
    const meetings=(m.meetings||[]).map(x=>x.title);
    const counts={}; meetings.forEach(t=>counts[t]=(counts[t]||0)+1);
    const ws=await g('/api/v1/users/me/workspaces');
    const wsl=(ws.workspaces||ws.data||[]);
    const ch1=await g('/api/v1/workspaces/${WS}/channels');
    const ch2=await g('/api/v1/workspaces/${W2}/channels');
    const pick=o=>{const d=o.channels||o.data||[];return d.map(c=>c.name);};
    return {meetingTitles:counts, totalMeetings:meetings.length,
      workspaces:(Array.isArray(wsl)?wsl:[]).map(w=>w.name+':'+w.id),
      ws1Channels:pick(ch1), ws2Channels:pick(ch2)}; })()`);
};
