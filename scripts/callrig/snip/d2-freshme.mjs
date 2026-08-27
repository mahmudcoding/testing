export default async ({ browser }) => {
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  await p.goto('https://airion-cargo.store/login', { waitUntil:'networkidle' });
  await p.waitForTimeout(1500);
  await p.fill('input[name="email"]', 'qa.d.alice@aloqa.test');
  await p.fill('input[name="password"]', 'QaPass123!');
  await p.evaluate(() => { const b=[...document.querySelectorAll('button[type=submit]')]; if(b.length) b[0].click(); });
  await p.waitForTimeout(6000);
  const r = await p.evaluate(async () => {
    const me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();
    return { status:'ok', name:me.name, email:me.email, len:(me.name||'').length };
  });
  await ctx.close();
  return r;
};
