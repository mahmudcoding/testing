export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  const snap = async (route) => {
    await page.goto(`https://airion-cargo.store/w/${WS}/${route}`, {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(3800);
    return await page.evaluate(()=>{
      const m=document.querySelector('main');
      const st=[];
      m.querySelectorAll('button[role="switch"],[role="switch"],button[aria-pressed],button[data-state]').forEach((x,i)=>{
        const r=x.getBoundingClientRect(); if(r.width<=0||r.height<=0) return;
        const d=x.getAttribute('aria-describedby'); const de=d?document.getElementById(d):null;
        st.push({i, checked:x.getAttribute('aria-checked')||x.getAttribute('aria-pressed')||x.getAttribute('data-state')||'?',
                 desc:(de?.innerText||x.getAttribute('aria-label')||'').replace(/\s+/g,' ').slice(0,60)});
      });
      return st;
    });
  };
  // --- notifications
  res.notifBefore = await snap('settings/notifications');
  const toggles = page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]');
  const n = await toggles.count();
  res.toggleCount = n;
  if (n>0) {
    const [resp] = await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:10000}).catch(()=>null),
      toggles.first().click()
    ]);
    await page.waitForTimeout(2500);
    res.toggleResp = resp?{s:resp.status(), m:resp.request().method(), u:resp.url().replace('https://airion-cargo.store','')}:'no non-GET request';
    res.notifAfterClick = await page.evaluate(()=>{const o=[];document.querySelectorAll('main [role="switch"],main button[aria-pressed],main button[data-state]').forEach((x,i)=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>0)o.push({i,checked:x.getAttribute('aria-checked')||x.getAttribute('aria-pressed')||x.getAttribute('data-state')||'?'});});return o;});
  }
  res.notifAfterReload = await snap('settings/notifications');
  // restore
  const t2 = page.locator('main [role="switch"], main button[aria-pressed], main button[data-state]');
  if (await t2.count()) { await t2.first().click(); await page.waitForTimeout(2500); }
  res.notifRestored = await snap('settings/notifications');
  return res;
};
