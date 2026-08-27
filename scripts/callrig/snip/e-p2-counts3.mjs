import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  await page.goto(`${BASE}/w/${WS}/c/C4QEGENERAL0001`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  let appUrl=null;
  const h=r=>{const u=r.url(); if(/\/api\/v1\/search\?/.test(u) && !appUrl) appUrl=u;};
  page.on('response',h);
  await page.locator('button[aria-label="Search QA Workspace E"]').click();
  await page.waitForTimeout(2000);
  const inp=page.locator('[role=dialog] input').first(); await inp.waitFor({timeout:15000});
  await inp.click(); await inp.type('probe',{delay:40});
  await page.waitForTimeout(4500);
  page.off('response',h);
  if(!appUrl) return {noRequest:true};
  const co=(appUrl.match(/company_id=([^&]*)/)||[])[1];
  const res = await page.evaluate(async ({co, ws})=>{
    const out=[]; let arch=0, seen=0;
    for(let off=0; off<200; off+=25){
      const r=await fetch(`/api/v1/search?q=probe&company_id=${co}&workspace_id=${ws}&limit=25&offset=${off}`,{credentials:'include'});
      const b=await r.json(); const m=b.messages||[];
      if(!m.length) break;
      const a=m.filter(x=>x.channel_archived===true).length;
      seen+=m.length; arch+=a;
      out.push({off, n:m.length, tm:b.total_messages, archived:a});
      if(m.length<25) break;
    }
    return {pages:out, totalSeen:seen, totalArchived:arch};
  }, {co, ws:WS});
  return {companyIdTakenFromAppRequest: !!co, ...res};
};
