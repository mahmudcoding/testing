import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
// Watch the sidebar unread badge for #qa-general WITHOUT reloading, from before the trigger.
// Poll at 300 ms for QA_SEC seconds (default 90).
const SEC = Number(process.env.QA_SEC || 90);
export default async ({page}) => {
  // park somewhere that is NOT the channel under test, so nothing marks it read
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const probe = `(() => { ${VISFN}
    const a=[...document.querySelectorAll('a[href*="/c/C4QEGENERAL0001"]')].filter(vis)[0];
    const rail=[...document.querySelectorAll('button')].find(b=>vis(b)&&(b.getAttribute('aria-label')||'')==='Chat');
    return {sidebar: a? (a.getAttribute('aria-label')||a.innerText||'').replace(/\\s+/g,' ').trim().slice(0,44) : '(no link)',
      railChat: rail? (rail.getAttribute('aria-label')||'')+'|'+(rail.innerText||'').replace(/\\s+/g,'') : '(no rail)'}; })()`;
  const trace=[]; let last='';
  const n = Math.floor(SEC*1000/300);
  for (let i=0;i<n;i++){
    const s = await page.evaluate(probe);
    const line = s.sidebar+' || rail='+s.railChat;
    if (line!==last){ trace.push('t+'+String(Math.round(i*0.3)).padStart(3,'0')+'s  '+line); last=line; }
    await page.waitForTimeout(300);
  }
  // now check the API and a reload, to separate "never updates" from "updates late"
  const api = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/workspaces/${WS}/unread',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.unread_counts||[];
    return a.filter(c=>c.channel_id==='C4QEGENERAL0001').map(c=>'unread='+c.unread_count+' lastMsg='+c.last_message_seq+' lastRead='+c.last_read_seq)[0]; })()`);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const afterReload = await page.evaluate(probe);
  return {transitions: trace, apiAtEnd: api, afterReload};
};
