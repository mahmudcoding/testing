import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  return await page.evaluate(async () => {
    const me = await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    const co = me.company_id || me.data?.company_id, ws = me.workspace_id || me.data?.workspace_id;
    const out = {};
    for (const q of ['probe','test','hello','qa','message','scope']) {
      const u = `/api/v1/search?q=${encodeURIComponent(q)}&company_id=${co}&workspace_id=${ws}&limit=25`;
      const r = await fetch(u,{credentials:'include'});
      const j = await r.json().catch(()=>({}));
      const msgs = (j.messages||j.data?.messages||[]);
      out[q] = { total: msgs.length,
        channels: [...new Set(msgs.map(m=>m.channel_name||m.channel_id||'?'))].slice(0,6) };
    }
    return out;
  });
};
