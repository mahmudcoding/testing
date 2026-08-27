import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
    const g=async u=>{const r=await fetch(u,{credentials:'include'});let j=null;try{j=await r.json();}catch(e){}
      return {st:r.status, m:j&&j.total_messages, f:j&&j.total_files, u:j&&j.total_users, c:j&&j.total_channels, key:(j&&j.key)||null}; };
    const base='/api/v1/search?q=unread&company_id=${CO}&workspace_id=${WS}';
    const out={};
    // every parameter the contract declares, exercised once
    const cases={
      'baseline':                    '&limit=25',
      'limit=1':                     '&limit=1',
      'limit=0':                     '&limit=0',
      'limit=101 (over cap)':        '&limit=101',
      'offset=1000 (past end)':      '&limit=25&offset=1000',
      'offset negative':             '&limit=25&offset=-5',
      'types=messages':              '&limit=25&types=messages',
      'types=garbage':               '&limit=25&types=zzz',
      'include_archived=true':       '&limit=25&include_archived=true',
      'include_archived=garbage':    '&limit=25&include_archived=notabool',
      'channel_ids=garbage':         '&limit=25&channel_ids=NOTANID',
      'dm_ids=garbage':              '&limit=25&dm_ids=NOTANID'
    };
    for(const k of Object.keys(cases)) out[k]=await g(base+cases[k]);
    return out; })()`);
};
