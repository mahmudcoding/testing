import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01', GEN='C4QEGENERAL0001', PRIV='C4QEPRIVATE0001';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/${GEN}`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(async ({CO,WS,PRIV,GEN}) => {
    const TOKEN = 'zarqonverif';
    const post = await fetch('/api/v1/messaging/messages', {method:'POST',credentials:'include',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({channel_id: PRIV, body: `final reverify ${TOKEN}`})});
    const pj = await post.json().catch(()=>({}));
    const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
    const search = async (extra) => {
      const u = `/api/v1/search?q=${TOKEN}&company_id=${CO}&workspace_id=${WS}${extra}&limit=25`;
      const r = await fetch(u,{credentials:'include'});
      const j = await r.json().catch(()=>({}));
      return {url_channel_ids: extra||'(none)', status:r.status,
              total_messages: j.total_messages,
              hits: (j.messages||[]).map(m=>({channel: m.channel_name||m.channel_id, hl:(m.highlight||'').slice(0,60)}))};
    };
    const tries=[];
    for (let i=0;i<8;i++){ await sleep(2000); const s=await search(''); tries.push({after_s:(i+1)*2, total:s.total_messages});
      if (s.total_messages>0) break; }
    return { posted: post.status, msg_id: (pj.id||pj.data?.id||'?'), indexing: tries,
             unfiltered: await search(''),
             filtered_to_general: await search(`&channel_ids=${GEN}`),
             filtered_to_private: await search(`&channel_ids=${PRIV}`) };
  }, {CO,WS,PRIV,GEN});
};
