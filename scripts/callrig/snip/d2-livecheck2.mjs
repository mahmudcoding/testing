export default async ({ page }) => {
  const WS='W4QDF1XTURESO01'; const out={};
  const read = () => page.evaluate(() => {
    const t=(document.querySelector('main')?.innerText||'').replace(/\s+/g,' ');
    const i=t.indexOf('QA Carol');
    return { carol: i>=0? t.slice(i,i+62):'(none)', probe:/LiveProbe/.test(t) };
  });
  // step 4: navigate away via the in-app nav, then back — no reload
  await page.evaluate(()=>{const a=document.querySelector('a[href$="/settings/appearance"]'); if(a) a.click();});
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{const a=document.querySelector('a[href$="/settings/admin/members"]'); if(a) a.click();});
  await page.waitForTimeout(3500);
  out.afterNavAway = await read();
  // now a real reload
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  out.afterReload = await read();
  // and what the server says
  out.server = await page.evaluate(async()=>{
    const r=await fetch('/api/v1/companies/O4QDF1XTURESO01/members?limit=50',{credentials:'include'});
    if(r.status!==200) return 'status '+r.status;
    const p=await r.json();
    const c=(p.members||p.data||[]).find(u=>/carol/.test(JSON.stringify(u)));
    return c? (c.roles||[]).map(x=>x.name||x) : 'carol not found';
  });
  return out;
};
