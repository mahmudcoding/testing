export default async ({ page }) => {
  const L = process.env.D2_LANG || 'en';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(1500);
  return await page.evaluate(`(async () => {
    const r=await fetch('/api/v1/auth/me/language',{method:'PATCH',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({language:${JSON.stringify(process.env.D2_LANG||'en')}})});
    const body=(await r.text()).slice(0,120);
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { patch:r.status, body, language:(me.settings||{}).language,
             cookie:(document.cookie.match(/NEXT_LOCALE=([^;]*)/)||[])[1]||null,
             ls:localStorage.getItem('aloqa.locale') };
  })()`);
};
