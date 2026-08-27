import {WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  // CLAIM: browser back/forward across screens, URL and content agreeing
  const route=[`/w/${WS}/directories`,`/w/${WS}/calendar`,`/w/${WS}/files`,`/w/${WS}/c/C4QEGENERAL0001`];
  for(const r of route){ await page.goto(BASE+r,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(3500); }
  const seq=[];
  const snap = async tag => { const v=await page.evaluate(()=>{
      const m=document.querySelector('main')||document.body;
      return {url:location.pathname, head:m.innerText.replace(/\s+/g,' ').slice(0,45)}; });
    seq.push({tag, ...v}); };
  await snap('start');
  for(let i=0;i<3;i++){ await page.goBack({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000); await snap('back'+(i+1)); }
  for(let i=0;i<3;i++){ await page.goForward({waitUntil:'domcontentloaded'}); await page.waitForTimeout(3000); await snap('fwd'+(i+1)); }
  const agree = seq.every(x=>{
    if(x.url.includes('/directories')) return /Directories/.test(x.head);
    if(x.url.includes('/calendar'))    return /CALENDAR/i.test(x.head);
    if(x.url.includes('/files'))       return /Browse|Files/i.test(x.head);
    if(x.url.includes('/c/'))          return /qa-general|No topic|Members/i.test(x.head);
    return true; });
  out.history={steps:seq.map(x=>`${x.tag}: ${x.url.split('/').pop()} | ${x.head.slice(0,28)}`), urlContentAgree:agree};
  // CLAIM: the storage figure matches the API
  await page.goto(`${BASE}/w/${WS}/files`,{waitUntil:'domcontentloaded'}); await page.waitForTimeout(5000);
  out.storage = await page.evaluate(async (ws)=>{
    const m=document.querySelector('main');
    const shown=(m.innerText.replace(/\s+/g,' ').match(/([\d.]+\s?(?:B|KB|MB|GB))\s*(?:used|of|·)?/)||[''])[0];
    const r=await fetch(`/api/v1/users/me/files?workspace_id=${ws}`,{credentials:'include'});
    const b=await r.json(); const arr=b.files||b.data||[];
    const total=(Array.isArray(arr)?arr:[]).reduce((a,f)=>a+(f.size||0),0);
    return {shownOnScreen:shown.trim(), apiTotalBytes:total, apiKB:(total/1024).toFixed(1)};
  }, WS);
  return out;
};
