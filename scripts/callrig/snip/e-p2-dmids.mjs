import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01', DM='C4OWQV2ZT4AAI6R';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/d/'+DM, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7500);
  return await page.evaluate(`(async () => {
    const base='/api/v1/search?q=' + encodeURIComponent('dm notification probe') + '&company_id=${CO}&workspace_id=${WS}&limit=25';
    const go = async (suffix) => { const r=await fetch(base+suffix,{credentials:'include'});
      const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){return {st:r.status, raw:t.slice(0,80)};}
      return {st:r.status, tm:d.total_messages, ids:(d.messages||[]).slice(0,2).map(m=>({dm:m.is_dm, conv:(m.dm_conv_id||'').slice(-6)}))}; };
    return {
      unscoped:      await go(''),
      asChannelIds:  await go('&channel_ids=${DM}'),
      asDmIds:       await go('&dm_ids=${DM}'),
      bothParams:    await go('&channel_ids=${DM}&dm_ids=${DM}')
    }; })()`);
};
