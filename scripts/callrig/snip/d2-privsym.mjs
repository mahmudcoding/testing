const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
const READ = `(() => { const vis=(VISFN);
  const main=document.querySelector('main')||document.body;
  const t=(main.innerText||'').replace(/\\s+/g,' ');
  const sw=[...main.querySelectorAll('[role=switch]')].filter(vis).map(s=>{
    let n=s,l=''; for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n)break;
      const x=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(x&&x.length<130){l=x;break;} }
    return { checked:s.getAttribute('aria-checked'), label:l.slice(0,40) }; });
  // the Online status picker: the button right after the words "Online status"
  const idx=t.indexOf('Online status');
  const pickers=[...main.querySelectorAll('button[aria-haspopup]')].filter(vis)
    .map(b=>({ value:(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,20),
               y:Math.round(b.getBoundingClientRect().top) }));
  return { switches:sw, pickers, textHasOnlineStatus: idx>=0 }; })()`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const read = READ.replace('VISFN', VIS);
  const go=async()=>{ await page.goto(`https://airion-cargo.store/w/${W}/settings/privacy`,{waitUntil:'networkidle'});
                      await page.waitForTimeout(2600); };
  const out={};
  await go();
  out.before = await page.evaluate(read);
  out.apiBefore = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
     const p=await (await fetch('/api/v1/users/me/presence-settings',{credentials:'include'})).json();
     return { online_visibility:a.settings.privacy.online_visibility, hide_presence:p.hide_presence };})()`);
  // turn OFF "Show online status" through the UI
  const clicked = await page.evaluate(`(() => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const c=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(s=>{
      let n=s,l=''; for(let i=0;i<6&&n;i++){ n=n.parentElement; if(!n)break;
        const x=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(x&&x.length<130){l=x;break;} }
      return /Show online status/i.test(l); });
    if(c.length!==1) return {n:c.length}; c[0].click(); return {n:1}; })()`);
  await page.waitForTimeout(2000);
  await go();                                   // fresh load, not client state
  out.afterToggleOff = await page.evaluate(read);
  out.apiAfter = await page.evaluate(`(async()=>{const a=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
     const p=await (await fetch('/api/v1/users/me/presence-settings',{credentials:'include'})).json();
     return { online_visibility:a.settings.privacy.online_visibility, hide_presence:p.hide_presence };})()`);
  out.clicked=clicked;
  // restore
  await page.evaluate(`fetch('/api/v1/users/me/presence-settings/update',{method:'PUT',credentials:'include',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({hide_presence:false})})`);
  await page.waitForTimeout(1200);
  out.apiRestored = await page.evaluate(`(async()=>{const p=await (await fetch('/api/v1/users/me/presence-settings',{credentials:'include'})).json();
     return p;})()`);
  return out;
};
