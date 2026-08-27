export default async ({page}) => {
  const tok = process.env.QA_TOKEN || 'bogus123';
  await page.goto('https://airion-cargo.store/reset-password?token='+tok,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(5000);
  const out={};
  const f = page.locator('input[type=password]');
  out.fields = await f.count();
  const btn = page.locator('button').filter({hasText:/^Reset password$/}).first();
  const cases = [
    ['mismatch', 'LongEnough1', 'Different99'],
    ['too short', 'Short1a', 'Short1a'],
    ['valid pair, bogus token', 'BrandNewPw123', 'BrandNewPw123'],
  ];
  out.results=[];
  for (const [n,a,b] of cases) {
    await f.nth(0).fill(''); await f.nth(1).fill('');
    await page.waitForTimeout(200);
    await f.nth(0).fill(a); await f.nth(1).fill(b);
    await page.waitForTimeout(600);
    const dis = await btn.isDisabled();
    const reqs=[]; const on=r=>{try{const u=new URL(r.url()); const m=r.request().method();
      if(m!=='GET'||u.pathname.startsWith('/api/')) reqs.push(`${m} ${u.pathname} -> ${r.status()}`);}catch{}};
    page.on('response', on);
    if(!dis) await btn.click();
    await page.waitForTimeout(6000);
    page.off('response', on);
    const s = await page.evaluate(()=>{
      const inline=[...document.querySelectorAll('p,span,div')].map(e=>(e.innerText||'').trim())
        .filter(t=>t && t.length<130 && /(match|least|charact|invalid|expired|error|token|success|updated|sign)/i.test(t));
      return {url:location.pathname+location.search, inline:[...new Set(inline)].slice(0,3),
              body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,260)};
    });
    out.results.push({case:n, submitDisabled:dis, reqs, ...s});
  }
  return out;
};
