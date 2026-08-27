const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await page.evaluate(`(() => ({
    aloqaKeys: Object.keys(localStorage).filter(k=>/aloqa/i.test(k)).length,
    total: localStorage.length }))()`);
  // clear only aloqa.* keys; the session lives in cookies, not here
  const cleared = await page.evaluate(`(() => {
    const ks=Object.keys(localStorage).filter(k=>/aloqa/i.test(k));
    ks.forEach(k=>localStorage.removeItem(k)); return ks.length; })()`);
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForTimeout(3200);
  const after = await page.evaluate(`(async () => { const vis=(${VIS});
    const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' ');
    const me=await fetch('/api/v1/auth/me',{credentials:'include'});
    return { stillSignedIn: me.status===200,
             screenRenders: /Appearance|Theme|Density/i.test(t),
             controls: [...main.querySelectorAll('button,input,[role=radio],[role=switch]')].filter(vis).length,
             errorShown: /went wrong|error/i.test(t),
             aloqaKeysNow: Object.keys(localStorage).filter(k=>/aloqa/i.test(k)).length,
             appearanceRestored: (()=>{try{return JSON.parse(localStorage.getItem('aloqa.appearance')||'null')}catch{return null}})() }; })()`);
  return { before, clearedKeys: cleared, after };
};
