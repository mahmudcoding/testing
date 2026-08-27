const VIS = `el => { const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
  let n = el, o = 1; while (n && n !== document.documentElement) { const s = getComputedStyle(n);
    if (s.display === 'none' || s.visibility === 'hidden') return false; o *= parseFloat(s.opacity); n = n.parentElement; } return o > 0.05; }`;
export default async ({ page, browser }) => {
  const W='W4QDF1XTURESO01';
  const readSessions = async pg => pg.evaluate(`(() => { const vis=(${VIS}); const main=document.querySelector('main')||document.body;
    const t=(main.innerText||'').replace(/\\s+/g,' '); const i=t.lastIndexOf('›');
    const body=(i>=0?t.slice(i+1):t).trim();
    const ctl=[...main.querySelectorAll('button')].filter(vis).filter(e=>e.getBoundingClientRect().left>300)
      .map(e=>({t:((e.innerText||'').trim()||e.getAttribute('aria-label')||'').slice(0,34),
                dis:e.disabled===true||e.getAttribute('aria-disabled')==='true'}));
    const deviceRows=(body.match(/Mozilla\\/5\\.0/g)||[]).length;
    return { chars:body.length, deviceRows, controls:ctl, head:body.slice(0,220) }; })()`);
  // 1. baseline in the lane browser (one session)
  await page.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
  await page.waitForTimeout(2600);
  const before = await readSessions(page);
  // 2. open a second session for the same account
  const ctx = await browser.newContext();
  const p2 = await ctx.newPage();
  await p2.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p2.waitForTimeout(1500);
  await p2.fill('input[name="email"]', 'qa.d.alice@aloqa.test');
  await p2.fill('input[name="password"]', 'QaPass123!');
  await p2.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p2.waitForTimeout(6500);
  const who2 = await p2.evaluate(async () => (await (await fetch('/api/v1/auth/me',{credentials:'include'})).json()).email);
  // 3. sessions page in BOTH
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2600);
  const afterInFirst = await readSessions(page);
  await p2.goto(`https://airion-cargo.store/w/${W}/settings/sessions`, { waitUntil:'networkidle' });
  await p2.waitForTimeout(2600);
  const afterInSecond = await readSessions(p2);
  await ctx.close();
  // 4. after the second session's browser context is gone
  await page.reload({ waitUntil:'networkidle' }); await page.waitForTimeout(2600);
  const afterClose = await readSessions(page);
  return { who2, before:{rows:before.deviceRows, controls:before.controls, head:before.head.slice(0,120)},
           afterInFirst:{rows:afterInFirst.deviceRows, controls:afterInFirst.controls},
           afterInSecond:{rows:afterInSecond.deviceRows, controls:afterInSecond.controls},
           afterClose:{rows:afterClose.deviceRows, controls:afterClose.controls} };
};
