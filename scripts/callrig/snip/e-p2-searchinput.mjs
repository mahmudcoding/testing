import {WS, BASE} from './e-p2-helpers.mjs';
const CO='O4QEF1XTURESO01';
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  return await page.evaluate(`(async () => {
    const cases={
      'long 500 chars': 'Q'.repeat(500),
      'regex metachars': '.*+?[](){}|^$',
      'sql-ish': "' OR 1=1 --",
      'html-ish': '<script>alert(1)</script>',
      'cyrillic': 'сообщение',
      'emoji': '📎',
      'punctuation only': '!!!',
      'leading spaces': '   probe   ',
      'percent': '100%',
      'unicode nfd': 'e\\u0301clair'
    };
    const out={};
    for(const [k,v] of Object.entries(cases)){
      try{
        const r=await fetch('/api/v1/search?q='+encodeURIComponent(v)+'&company_id=${CO}&workspace_id=${WS}&limit=10',{credentials:'include'});
        const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){}
        out[k]= d? {st:r.status, tm:d.total_messages, tf:d.total_files, tu:d.total_users, tc:d.total_channels}
                 : {st:r.status, body:t.slice(0,90)};
      }catch(e){ out[k]='threw '+String(e).slice(0,60); }
    }
    return out; })()`);
};
