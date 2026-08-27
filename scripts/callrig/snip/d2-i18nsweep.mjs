export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});}, code);
  await setLang('uz-Cyrl');
  const routes=['account','profile','notifications','appearance','privacy','sessions','security',
                'about','company','workspace','roles?scope=company','admin/members','admin/invites',
                'admin/workspaces','admin/audit-log','admin/company'];
  const found={};
  for (const r of routes) {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${r}`, {waitUntil:'domcontentloaded'}).catch(()=>{});
    await page.waitForTimeout(1900);
    const hits = await page.evaluate(() => {
      const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
      const main=document.querySelector('main'); if(!main) return [];
      const skip=/Aloqa|QA |v0\.|API|CSV|JSON|http|@|\.test|Mozilla|Chrome|Mac OS|AppleWebKit|Safari|KHTML|Gecko|GB|B of|UTC|ID|URL/;
      const res=[];
      const walk=document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      let n;
      while((n=walk.nextNode())){
        const t=(n.textContent||'').trim();
        if(t.length<4) continue;
        const p=n.parentElement; if(!p||!vis(p)) continue;
        if(p.closest('nav,aside')) continue;
        if(/[Ѐ-ӿ]/.test(t)) continue;          // has Cyrillic -> translated
        if(!/[A-Za-z]{4,}/.test(t)) continue;             // no latin words -> skip
        if(skip.test(t)) continue;
        res.push(t.replace(/\s+/g,' ').slice(0,60));
      }
      return [...new Set(res)];
    });
    if (hits.length) found[r]=hits.slice(0,6);
  }
  out.untranslatedByRoute = found;
  out.routesWithHits = Object.keys(found).length;
  await setLang('en');
  out.lang = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  return out;
};
