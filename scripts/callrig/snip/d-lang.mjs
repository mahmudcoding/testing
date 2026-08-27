export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  const res={};
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/account`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const lang = page.locator('main button', {hasText:/^English$/}).first();
  if(!(await lang.count())) return {note:'no language button'};
  await lang.click(); await page.waitForTimeout(1800);
  res.options = await page.evaluate(()=>{
    const o=[]; document.querySelectorAll('[role="option"],[role="menuitem"]').forEach(x=>{const r=x.getBoundingClientRect(); if(r.width>0&&r.height>0) o.push((x.innerText||'').trim().slice(0,30));});
    return o;
  });
  const ru = page.locator('[role="option"],[role="menuitem"]').filter({hasText:/Рус|Russian|Ру/i}).first();
  if (await ru.count()) {
    const [resp]=await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/v1/')&&r.request().method()!=='GET',{timeout:12000}).catch(()=>null),
      ru.click()
    ]);
    await page.waitForTimeout(4000);
    res.switched = resp?{s:resp.status(), m:resp.request().method(), u:resp.url().replace('https://airion-cargo.store','')}:'no non-GET';
    // now sweep settings pages for untranslated English strings
    const pages=['settings/account','settings/privacy','settings/security','settings/sessions','settings/notifications','settings/about'];
    res.sweep=[];
    for (const p of pages) {
      await page.goto(`https://airion-cargo.store/w/${WS}/${p}`, {waitUntil:'domcontentloaded'});
      await page.waitForTimeout(3200);
      const d = await page.evaluate(()=>{
        const m=document.querySelector('main');
        const t=(m.innerText||'').replace(/\s+/g,' ').trim();
        const cyr=(t.match(/[А-Яа-яЁё]/g)||[]).length;
        const lat=(t.match(/[A-Za-z]/g)||[]).length;
        return {len:t.length, cyr, lat, head:t.slice(120,520)};
      });
      res.sweep.push({page:p, ...d});
    }
  } else res.switched='no Russian option found';
  return res;
};
