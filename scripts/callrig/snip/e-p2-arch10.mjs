import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // control: a normal, busy channel
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  out.qaGeneral = await page.evaluate(()=>{
    const main=document.querySelector('main')||document.body;
    const t=main.innerText.replace(/\s+/g,' ');
    return {msgs:document.querySelectorAll('[data-message-id]').length,
            pinnedFragment: (t.match(/Pinned[^A-Z]{0,60}/)||['(none)'])[0],
            hasStartCTA: /Start this channel/.test(t), head:t.slice(0,180)};
  });
  // search for the archived channel's message, and a control string from qa-general
  out.search = await page.evaluate(async (ws)=>{
    const g = async q => { const x=await fetch(`/api/v1/search?q=${encodeURIComponent(q)}&workspace_id=${ws}`,{credentials:'include'}); let b=null; try{b=await x.json()}catch{} 
      const m=b?.messages||b?.results?.messages||[];
      return {q, s:x.status, total:b?.total_messages??null, n:Array.isArray(m)?m.length:null,
              chans:[...new Set((Array.isArray(m)?m:[]).map(r=>r.channel_id||r.channel?.id))]}; };
    return {archivedMsg: await g('archive notification probe'),
            control:    await g('unread badge probe')};
  }, WS);
  return out;
};
