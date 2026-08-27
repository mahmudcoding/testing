export default async ({ page }) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance', { waitUntil:'networkidle' });
  await page.waitForTimeout(2400);
  return await page.evaluate(() => {
    const raw = localStorage.getItem('aloqa.appearance');
    let keys=null, parsed=null;
    try { parsed=JSON.parse(raw); keys=Object.keys(parsed); } catch(e){}
    const ck={}; for(const c of document.cookie.split(';')){ const [k,...v]=c.trim().split('='); if(k.startsWith('aloqa.')) ck[k]=decodeURIComponent(v.join('=')).slice(0,24); }
    return { raw, keys, parsed, appearanceCookies:ck };
  });
};
