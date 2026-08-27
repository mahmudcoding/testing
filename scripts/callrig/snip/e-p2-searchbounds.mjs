import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  return await page.evaluate(`(async () => {
    const g=async q=>{const r=await fetch('/api/v1/search?q='+encodeURIComponent(q)+
      '&company_id=${CO}&workspace_id=${WS}&limit=25',{credentials:'include'});
      let j=null;try{j=await r.json();}catch(e){}
      return {st:r.status, m:j&&j.total_messages, f:j&&j.total_files, key:j&&j.key}; };
    const out={};
    // boundaries a user can actually type
    const cases={
      'e2video':'exact name', 'E2VIDEO':'uppercase', 'e2VIDEO':'mixed case',
      'video':'substring after hyphen/dot split', 'mp4':'extension only',
      'e2video.mp4':'name with extension', 'e2 video':'space inside',
      '  e2video  ':'surrounding whitespace'
    };
    for(const q of Object.keys(cases)){ out[q]={desc:cases[q], ...(await g(q))}; }
    return out; })()`);
};
