import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
const DM='C4OWQV2ZT4AAI6R';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
    const g=async extra=>{const r=await fetch('/api/v1/search?q=dm&company_id=${CO}&workspace_id=${WS}&limit=25'+extra,
      {credentials:'include'}); let j=null;try{j=await r.json();}catch(e){}
      return {st:r.status, total:j&&j.total_messages, got:(j&&j.messages||[]).length,
              first:(j&&j.messages||[])[0]?String((j.messages[0].highlight||j.messages[0].text||'')).slice(0,44):null}; };
    return {
      plain:            await g(''),
      viaChannelIds:    await g('&channel_ids=${DM}'),
      viaDmIds:         await g('&dm_ids=${DM}'),
      bothParams:       await g('&channel_ids=${DM}&dm_ids=${DM}')
    }; })()`);
};
