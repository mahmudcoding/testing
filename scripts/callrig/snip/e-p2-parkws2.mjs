import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const W2='W4OWJSPNXQJYZ5R';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+W2+'/c/C4OWNDZ90KJ4RNM', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  const before = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/workspaces/${WS}/unread',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.unread_counts||[];
    return a.filter(c=>c.channel_id==='C4QEGENERAL0001').map(c=>'unread='+c.unread_count+' lastMsg='+c.last_message_seq+' lastRead='+c.last_read_seq)[0]; })()`);
  return {parkedAt: page.url().replace(/^https:\/\/[^/]+/,''), ws1GeneralUnreadBefore: before};
};
