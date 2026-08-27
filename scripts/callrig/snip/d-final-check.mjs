export default async ({page}) => {
  const WS='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${WS}/settings/appearance`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4000);
  const appearance = await page.evaluate(()=>{
    const o={}; document.querySelectorAll('main [role="radio"],main button[aria-pressed]').forEach(b=>{
      const t=(b.innerText||'').trim().slice(0,14); const st=b.getAttribute('aria-checked')||b.getAttribute('aria-pressed');
      if(t && st==='true'){ const g=(b.closest('[role="radiogroup"]')?.getAttribute('aria-label'))||''; o[(g?g+':':'')+t]=st; }
    });
    return {selected:Object.keys(o), theme:document.documentElement.getAttribute('data-theme')};
  });
  const rest = await page.evaluate(async()=>({
    notifications: await (await fetch('/api/v1/notifications/settings',{credentials:'include'})).json(),
    me: (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email,
  }));
  const lang = await page.evaluate(()=>{const m=document.querySelector('main');return (m.innerText||'').match(/[А-Яа-я]/g)?'RU':'EN';});
  return {appearance, ...rest, uiLanguage:lang};
};
