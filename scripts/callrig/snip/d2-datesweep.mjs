export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const setLang = async (code) => page.evaluate(async (code)=>{
    const cur=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    await fetch('/api/v1/auth/me/settings',{method:'PUT',credentials:'include',
      headers:{'content-type':'application/json'},body:JSON.stringify({...cur.settings, language:code})});}, code);
  const grab = async (route) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/settings/${route}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(2800);
    return await page.evaluate(() => {
      const t=(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ');
      const m=[...new Set(t.match(/\b\d{4}\s*M\d{2}\s*\d{1,2}[^|]{0,10}|\b\d{1,2}\s+\p{L}{3,}\.?,?\s+\d{4}[^|]{0,10}|\b\p{L}{3,}\s+\d{1,2},\s*\d{4}[^|]{0,12}/gu)||[])];
      return m.slice(0,3);
    });
  };
  for (const code of ['uz','en']) {
    await setLang(code);
    out[code] = { auditLog: await grab('admin/audit-log'),
                  members:  await grab('admin/members'),
                  sessions: await grab('sessions'),
                  invites:  await grab('admin/invites') };
  }
  await setLang('en');
  out.final = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/auth/me',{credentials:'include'});return (await r.json()).settings?.language;});
  return out;
};
