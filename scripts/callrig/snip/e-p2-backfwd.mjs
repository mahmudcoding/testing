import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const trail=[];
  const snap = async (tag) => {
    await page.waitForTimeout(4500);
    const s = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main')||document.body;
       return ((m.innerText||'').replace(/\\s+/g,' ').trim().slice(0,52)); })()`);
    return {tag, url:page.url().replace(/^https:\/\/[^/]+/,'').replace('/w/'+'${WS}',''), head:s};
  };
  const steps = [['directories','/w/'+WS+'/directories?tab=people'],
                 ['calendar','/w/'+WS+'/calendar'],
                 ['files','/w/'+WS+'/files'],
                 ['channel','/w/'+WS+'/c/C4QEGENERAL0001']];
  for (const [tag,path] of steps){ await page.goto(BASE+path,{waitUntil:'domcontentloaded'}); trail.push(await snap('go '+tag)); }
  out.forward = trail;
  const back=[]; for(let i=0;i<3;i++){ await page.goBack({waitUntil:'domcontentloaded'}); back.push(await snap('back'+(i+1))); }
  out.back = back;
  const fwd=[]; for(let i=0;i<3;i++){ await page.goForward({waitUntil:'domcontentloaded'}); fwd.push(await snap('fwd'+(i+1))); }
  out.fwd = fwd;
  return out;
};
