const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const WANT = process.env.D2_LANG || 'Russian';
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/account', { waitUntil:'networkidle' });
  await page.waitForTimeout(3000);
  const btn = page.locator('main button').filter({ hasText: /^(English|Russian|Русский|Uzbek|O'zbek|Ўзбек)/ }).first();
  if (!(await btn.count())) return { err:'language button not found' };
  const labelBefore = (await btn.innerText()).trim();
  await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(1800);
  const click = await page.evaluate(`(() => { const vis=(${VIS}); const T=${JSON.stringify(WANT)};
    const w=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=listbox]')].filter(vis)[0];
    if(!w) return 'no popper';
    const leaves=[...w.querySelectorAll('*')].filter(vis).filter(e=>e.children.length===0);
    const el=leaves.find(e=>(e.innerText||'').trim()===T);
    if(!el) return 'not found among: '+leaves.map(e=>(e.innerText||'').trim()).join('/');
    el.click(); return 'clicked'; })()`);
  await page.waitForTimeout(3000);
  const labelAfterClick = await btn.innerText().catch(()=>'(gone)');
  // the account page uses a save bar
  const save = page.locator('button').filter({hasText:/^Save/}).first();
  let saved=null;
  if (await save.count()) { saved=(await save.innerText()).trim(); await save.scrollIntoViewIfNeeded(); await save.click(); await page.waitForTimeout(4000); }
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(3000);
  const server = await page.evaluate(async () => {
    const x=await fetch('/api/v1/auth/me',{credentials:'include'}); const j=await x.json(); const u=j.user||j;
    return (u.settings||{}).language; });
  const heading = await page.evaluate(`(() => { const vis=(${VIS});
    const m=document.querySelector('main'); const t=(m.innerText||''); const i=t.lastIndexOf('\\u203a');
    return (i>=0?t.slice(i+1):t).replace(/\\s+/g,' ').trim().slice(0,110); })()`);
  return { labelBefore, click, labelAfterClick: String(labelAfterClick).trim(), savedVia: saved,
           languageOnServer: server, pageHeadingNow: heading };
};
