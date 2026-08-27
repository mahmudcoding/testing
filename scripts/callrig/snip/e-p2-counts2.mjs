import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  return await page.evaluate(async (ws)=>{
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    // use the app's own company id by reading a request the app makes is hard here;
    // instead page through with the same params the app uses, taken from a live call
    const co = me?.company_id || me?.user?.company_id;
    const base = (off)=>`/api/v1/search?q=probe&company_id=${co}&workspace_id=${ws}&limit=25&offset=${off}`;
    const pages=[]; let arch=0, seen=0;
    for(let off=0; off<200; off+=25){
      const r=await fetch(base(off),{credentials:'include'});
      const b=await r.json();
      const m=b.messages||[];
      if(!m.length) break;
      seen+=m.length; arch+=m.filter(x=>x.channel_archived===true).length;
      pages.push({off, n:m.length, tm:b.total_messages, arch:m.filter(x=>x.channel_archived===true).length});
      if(m.length<25) break;
    }
    return {companyResolved:!!co, pages, totalSeen:seen, totalArchived:arch};
  }, WS);
};
