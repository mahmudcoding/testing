// Password-change form validation. Only submits when QA_SUBMIT=1.
export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/security',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  const f = page.locator('main input[type=password]');
  const n = await f.count();
  const btn = page.locator('main button').filter({hasText:/^Update password$/}).first();
  const state = async () => await page.evaluate(()=>{
    const m=document.querySelector('main');
    const b=[...m.querySelectorAll('button')].find(x=>/^Update password$/.test(x.innerText.trim()));
    const msgs=[...m.querySelectorAll('p,span,div')].map(e=>(e.innerText||'').trim())
      .filter(t=>t && t.length<120 && /(charact|match|incorrect|invalid|required|must|least|wrong|error|same)/i.test(t));
    return {disabled: b?b.disabled:'no-btn', notes:[...new Set(msgs)].slice(0,4)};
  });
  const cases = JSON.parse(process.env.QA_CASES || '[]');
  const out=[{fields:n, initial: await state()}];
  for (const c of cases) {
    for (let i=0;i<n;i++){ await f.nth(i).fill(''); }
    await page.waitForTimeout(200);
    for (let i=0;i<Math.min(n,c.v.length);i++){ if(c.v[i]) await f.nth(i).fill(c.v[i]); }
    await page.waitForTimeout(900);
    const s = await state();
    let submitted=null;
    if (process.env.QA_SUBMIT==='1' && c.submit && s.disabled===false) {
      const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(u.pathname.startsWith('/api/v1/')) reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
      page.on('response', on);
      await btn.click(); await page.waitForTimeout(4000); page.off('response', on);
      submitted={reqs: reqs.filter(r=>/password|auth|security/i.test(r)), after: await state(),
        notices: await page.evaluate(()=>[...document.querySelectorAll('[role=status],[role=alert],[data-sonner-toast]')]
          .filter(e=>{const r=e.getBoundingClientRect(); return r.width>2&&r.height>2;})
          .map(e=>(e.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean).slice(0,3))};
    }
    out.push({case:c.n, ...s, submitted});
  }
  return out;
};
