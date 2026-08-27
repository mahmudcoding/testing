export default async ({browser}) => {
  const link = process.env.QA_LINK;
  const name = process.env.QA_GUESTNAME || 'Night Guest';
  const c = await browser.newContext();
  const p = await c.newPage();
  await p.goto(link, {waitUntil:'domcontentloaded'});
  await p.waitForTimeout(7000);
  const inp = p.locator('input').first();
  const out={};
  out.hasInput = await inp.count();
  if (out.hasInput) { await inp.fill(name); await p.waitForTimeout(600); }
  const b = p.locator('button', {hasText:/Ask to join|Join/i}).first();
  out.hasBtn = await b.count();
  if (out.hasBtn) { await b.click(); await p.waitForTimeout(9000); }
  out.after = await p.evaluate(()=>({path:location.pathname.slice(0,60),
    txt:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,200)}));
  return out;
};
