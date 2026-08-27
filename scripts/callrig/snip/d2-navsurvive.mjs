const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page }) => {
  const W='W4QDF1XTURESO01';
  const LBL='Animations';
  const sw = `(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const l=[...main.querySelectorAll('[role=switch]')].filter(vis).filter(e=>e.getBoundingClientRect().left>300);
    return l.filter(e=>{ let n=e,b=''; for(let i=0;i<5&&n;i++){n=n.parentElement; if(!n)break;
      const t=(n.innerText||'').replace(/\\s+/g,' ').trim(); if(t.length>4&&t.length<120){b=t;break;} }
      return b.startsWith(${JSON.stringify(LBL)}); })[0]; })`;
  await page.goto(`https://airion-cargo.store/w/${W}/settings/appearance`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  const before = await page.evaluate(`(() => ${sw}().getAttribute('aria-checked'))()`);
  await page.evaluate(`(() => { ${sw}().click(); })()`);
  await page.waitForTimeout(1200);
  const afterClick = await page.evaluate(`(() => ${sw}().getAttribute('aria-checked'))()`);
  const stored1 = await page.evaluate(`(() => { try{return JSON.parse(localStorage.getItem('aloqa.appearance')).animations;}catch{return null;} })()`);
  // CLIENT-SIDE navigation away and back (click nav links, no reload)
  await page.evaluate(`(() => { const vis=(${VIS});
    const a=[...document.querySelectorAll('a[href*="/settings/profile"]')].filter(vis)[0]; if(a) a.click(); })()`);
  await page.waitForTimeout(2500);
  const urlMid = page.url();
  await page.evaluate(`(() => { const vis=(${VIS});
    const a=[...document.querySelectorAll('a[href*="/settings/appearance"]')].filter(vis)[0]; if(a) a.click(); })()`);
  await page.waitForTimeout(2500);
  const afterNav = await page.evaluate(`(() => { const e=${sw}(); return e?e.getAttribute('aria-checked'):'(gone)'; })()`);
  // now a hard reload
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForTimeout(2700);
  const afterReload = await page.evaluate(`(() => { const e=${sw}(); return e?e.getAttribute('aria-checked'):'(gone)'; })()`);
  const stored2 = await page.evaluate(`(() => { try{return JSON.parse(localStorage.getItem('aloqa.appearance')).animations;}catch{return null;} })()`);
  return { label:LBL, before, afterClick, storedAfterClick:stored1,
           urlMidNav:urlMid.replace(/^https?:\/\/[^/]+/,''), afterClientNav:afterNav,
           afterReload, storedAfterReload:stored2,
           survivesClientNav: afterNav===afterClick, survivesReload: afterReload===afterClick };
};
